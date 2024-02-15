import { BadRequestException, PipeTransform, Type, Inject } from '@nestjs/common';

import {
  FilterOf,
  FieldMetadata,
  FilterOptions,
  getIndexedFields,
  COMPARISON_OPERATOR,
  SORT_OPERATOR,
  LOGICAL_OPERATORS,
} from '@gabrieljsilva/nest-graphql-filters';

import { memoize } from '../../utils';
import {
  clientToPrismaArrayOperators,
  clientToPrismaLogicalOperators,
  clientToPrismaPrimitiveArrayOperators,
  clientToPrismaSortOperators,
} from './constants';
import { SortOperator } from '@gabrieljsilva/nest-graphql-filters/dist/types/filter-of.type';

type QueryBuilderByOperationsMap = Record<COMPARISON_OPERATOR, Function>;

function createToPrismaQueryPipe(type: Type): Type<PipeTransform> {
  class ToPrismaQueryPipe implements PipeTransform {
    private readonly queryBuilderByOperationMap: QueryBuilderByOperationsMap;

    constructor(@Inject(FilterOptions) private filterOptions: FilterOptions) {
      this.queryBuilderByOperationMap = {
        is: this.getIsOperator.bind(this),
        like: this.getLikeOperator.bind(this),
        in: this.getInOperator.bind(this),
        gt: this.getGtOperator.bind(this),
        lt: this.getLtOperator.bind(this),
        gte: this.getGteOperator.bind(this),
        lte: this.getLteOperator.bind(this),
      };
    }

    async transform<T = any>(value: FilterOf<T>) {
      console.time('QUERY');
      if (!value) return {};

      const query = {
        where: {},
        orderBy: {},
      };

      const indexedFieldsMetadata = getIndexedFields(type);
      await this.getQuery<T>(value, indexedFieldsMetadata, query.where, query);

      console.timeEnd('QUERY');
      return query;
    }

    async getQuery<T>(
      filter: FilterOf<any>,
      indexedFieldsMetadata: Map<string, FieldMetadata>,
      where: Object,
      rootQuery: Object,
    ) {
      for (const [property, fieldFilters] of Object.entries(filter)) {
        const whereQuery = where[property];
        const fieldFilterValue = fieldFilters as FilterOf<unknown>;
        const fieldMetadata = indexedFieldsMetadata.get(property);

        if (fieldMetadata.isPrimitiveType) {
          await this.handlePrimitiveType(fieldMetadata, fieldFilterValue, where);
          continue;
        }

        const isLogicalOperatorType = !!LOGICAL_OPERATORS[property];

        if (isLogicalOperatorType) {
          await this.handleLogicalType(fieldMetadata, fieldFilterValue, whereQuery, rootQuery);
          continue;
        }

        const isSortOperatorType = !!SORT_OPERATOR[property];

        if (isSortOperatorType) {
          await this.handleSortType(fieldMetadata, fieldFilterValue as Array<SortOperator<T>>, rootQuery);
          continue;
        }

        const isRelationship = !fieldMetadata.isPrimitiveType;
        if (isRelationship) {
          await this.handleRelationType(fieldMetadata, fieldFilters as FilterOf<T>, where, rootQuery);
        }
      }

      return where;
    }

    async handleRelationType<T>(fieldMetatada: FieldMetadata, filters: FilterOf<T>, where: Object, rootQuery: Object) {
      const indexedFieldsMetadata = getIndexedFields(fieldMetatada.type);
      where[fieldMetatada.name] = {};
      const whereQuery = where[fieldMetatada.name];

      // ### HANDLING ARRAY OF RELATIONSHIPS ### //
      if (fieldMetatada.isArray) {
        for (const [listProperty, listFilter] of Object.entries(filters)) {
          const prismaProperty = clientToPrismaArrayOperators[listProperty];
          whereQuery[prismaProperty] = {};
          await this.getQuery(
            listFilter as FilterOf<unknown>,
            indexedFieldsMetadata,
            whereQuery[prismaProperty],
            rootQuery,
          );
        }
        return;
      }

      // ### HANDLING SINGLE RELATIONSHIP OBJECT ### //
      await this.getQuery(filters, indexedFieldsMetadata, whereQuery, rootQuery);
    }

    async handlePrimitiveType<T>(fieldMetadata: FieldMetadata, filters: FilterOf<T>, where: Object) {
      const isFieldNullable = fieldMetadata.nullable;

      // ### HANDLING ARRAY OF PRIMITIVE TYPES ### //
      if (fieldMetadata.isArray) {
        for (const [operation, value] of Object.entries(filters)) {
          const prismaProperty = clientToPrismaPrimitiveArrayOperators[operation];
          where[fieldMetadata.name] = {};
          where[fieldMetadata.name][prismaProperty] = value;
        }
        return;
      }

      // ### HANDLING PRIMITIVE TYPES ### //
      for (const [operation, value] of Object.entries(filters)) {
        if (!isFieldNullable && value === null) {
          throw new BadRequestException(`field ${fieldMetadata.name} cannot be null`);
        }
        const comparisonQueryFN = this.getComparisonQueryFN(operation as COMPARISON_OPERATOR);

        Object.assign(where, comparisonQueryFN(fieldMetadata, value));
      }
    }

    async handleLogicalType<T>(fieldMetadata: FieldMetadata, value: FilterOf<T>, where: Object, rootQuery: Object) {
      const prismaProperty = clientToPrismaLogicalOperators[fieldMetadata.name];
      const indexedFields = getIndexedFields(fieldMetadata.type);
      if (Array.isArray(value)) {
        where[prismaProperty] = value.map((item) =>
          this.getQuery(item, indexedFields, where[prismaProperty], rootQuery),
        );
        return;
      }

      where[prismaProperty] = this.getQuery(value, indexedFields, where, rootQuery);
    }

    async handleSortType<T>(metadata: FieldMetadata, value: Array<SortOperator<T>>, query = {}) {
      const prismaProperty = clientToPrismaSortOperators[metadata.name];
      query[prismaProperty] = [];

      for (const field of value) {
        const orderByQuery = {};
        for (const [property, direction] of Object.entries(field)) {
          orderByQuery[property] = direction;
        }
        query[prismaProperty].push(orderByQuery);
      }
    }

    getComparisonQueryFN(operation: COMPARISON_OPERATOR) {
      return this.queryBuilderByOperationMap[operation];
    }

    getIsOperator(metadata: FieldMetadata, value: FilterOf<any>) {
      return { [metadata.name]: value };
    }

    getLikeOperator(metadata: FieldMetadata, value: FilterOf<any>) {
      const query = {
        contains: value,
      };

      if (this.filterOptions.provider !== 'mssql') {
        query['mode'] = 'insensitive';
      }

      return {
        [metadata.name]: query,
      };
    }

    getInOperator(metadata: FieldMetadata, value: FilterOf<any>) {
      return { [metadata.name]: { in: value } };
    }

    getGtOperator(metadata: FieldMetadata, value: FilterOf<any>) {
      return { [metadata.name]: { gt: value } };
    }

    getGteOperator(metadata: FieldMetadata, value: FilterOf<any>) {
      return { [metadata.name]: { gte: value } };
    }

    getLtOperator(metadata: FieldMetadata, value: FilterOf<any>) {
      return { [metadata.name]: { lt: value } };
    }

    getLteOperator(metadata: FieldMetadata, value: FilterOf<any>) {
      return { [metadata.name]: { lte: value } };
    }
  }

  return ToPrismaQueryPipe;
}

export const ToPrismaQueryPipe = memoize<(type: Type) => PipeTransform>(createToPrismaQueryPipe);
