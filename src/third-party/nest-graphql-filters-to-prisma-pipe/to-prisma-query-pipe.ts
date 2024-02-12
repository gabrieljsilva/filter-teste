import {
  BadRequestException,
  PipeTransform,
  Type,
  Inject,
} from '@nestjs/common';

import {
  COMPARISON_OPERATOR,
  FilterOf,
  FieldMetadata,
  FilterOptions,
  getIndexedFields,
} from '@gabrieljsilva/nest-graphql-filters';

import { memoize } from '../../utils';
import { clientToPrismaLogicalOperators } from './constants';

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

    async transform<T = unknown>(value: FilterOf<T>) {
      if (!value) return {};

      const fieldMetadata = getIndexedFields(type);
      return this.getWhereInputQuery(value, fieldMetadata);
    }

    getWhereInputQuery(
      filter: FilterOf<unknown>,
      metadata: Map<string, FieldMetadata>,
      query = {},
    ) {
      Object.entries(filter).forEach(([property, fieldFilters]) => {
        const propertyMetadata = metadata.get(property);

        if (propertyMetadata.isPrimitiveType) {
          this.getComparisonQuery(
            fieldFilters as FilterOf<unknown>,
            propertyMetadata,
            query,
          );
          return;
        }

        const logicalOperatorOrFilterProperty =
          clientToPrismaLogicalOperators[property] || property;

        const fieldMetadata = getIndexedFields(propertyMetadata.type);

        if (Array.isArray(fieldFilters)) {
          query[logicalOperatorOrFilterProperty] = fieldFilters.map((item) =>
            this.getWhereInputQuery(item, fieldMetadata),
          );
          return;
        }

        query[logicalOperatorOrFilterProperty] = this.getWhereInputQuery(
          fieldFilters,
          fieldMetadata,
        );
      });

      return query;
    }

    getComparisonQuery(
      filters: FilterOf<unknown>,
      metadata: FieldMetadata,
      query = {},
    ) {
      const isFieldNullable = metadata.nullable;

      Object.entries(filters).forEach(([operation, value]) => {
        if (!isFieldNullable && value === null) {
          throw new BadRequestException(
            `field ${metadata.name} cannot be null`,
          );
        }
        const queryFN = this.getQueryFN(operation as COMPARISON_OPERATOR);
        Object.assign(query, queryFN(metadata, value));
      });
    }

    getQueryFN(operation: COMPARISON_OPERATOR) {
      return this.queryBuilderByOperationMap[operation];
    }

    getIsOperator(metadata: FieldMetadata, value: FilterOf<unknown>) {
      return { [metadata.name]: value };
    }

    getLikeOperator(metadata: FieldMetadata, value: FilterOf<unknown>) {
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

    getInOperator(metadata: FieldMetadata, value: FilterOf<unknown>) {
      return { [metadata.name]: { in: value } };
    }

    getGtOperator(metadata: FieldMetadata, value: FilterOf<unknown>) {
      return { [metadata.name]: { gt: value } };
    }

    getGteOperator(metadata: FieldMetadata, value: FilterOf<unknown>) {
      return { [metadata.name]: { gte: value } };
    }

    getLtOperator(metadata: FieldMetadata, value: FilterOf<unknown>) {
      return { [metadata.name]: { lt: value } };
    }

    getLteOperator(metadata: FieldMetadata, value: FilterOf<unknown>) {
      return { [metadata.name]: { lte: value } };
    }
  }

  return ToPrismaQueryPipe;
}

export const ToPrismaQueryPipe = memoize<(type: Type) => PipeTransform>(
  createToPrismaQueryPipe,
);
