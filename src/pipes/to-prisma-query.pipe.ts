import {
  BadRequestException,
  mixin,
  PipeTransform,
  Type,
} from '@nestjs/common';

import { COMPARISON_OPERATOR, FilterOf } from '../third-party/nest-filters';
import { LOGICAL_OPERATORS } from '../third-party/nest-filters/types/logical-operations';
import { FieldMetadata } from '../third-party/nest-filters/types/field-metadata';
import { FilterTypeMetadataStorage } from '../third-party/nest-filters/types/filter-type-metadata-storage';
import { memoize } from '../utils';

const clientToPrismaLogicalOperators: Record<LOGICAL_OPERATORS, string> = {
  [LOGICAL_OPERATORS._and]: 'AND',
  [LOGICAL_OPERATORS._or]: 'OR',
  [LOGICAL_OPERATORS._not]: 'NOT',
};

type QueryBuilderByOperationsMap = Record<COMPARISON_OPERATOR, Function>;

export const ToPrismaQueryPipe = memoize<(type: Type) => PipeTransform>(
  createToPrismaQueryPipe,
);

function createToPrismaQueryPipe(type: Type): Type<PipeTransform> {
  class ToPrismaQueryPipe implements PipeTransform {
    queryBuilderByOperationMap: QueryBuilderByOperationsMap = {
      is: this.getIsOperator,
      like: this.getLikeOperator,
      in: this.getInOperator,
      gt: this.getGtOperator,
      lt: this.getLtOperator,
      gte: this.getGteOperator,
      lte: this.getLteOperator,
    };

    async transform<T = unknown>(value: FilterOf<T>) {
      if (!value) return {};

      const fieldMetadata =
        FilterTypeMetadataStorage.getIndexedFieldsByType(type);

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

        const queryProperty =
          clientToPrismaLogicalOperators[property] ?? property;

        const fieldMetadata = FilterTypeMetadataStorage.getIndexedFieldsByType(
          propertyMetadata.originalType,
        );

        if (Array.isArray(fieldFilters)) {
          query[queryProperty] = fieldFilters.map((item) =>
            this.getWhereInputQuery(item, fieldMetadata, {}),
          );
          return;
        }

        query[queryProperty] = this.getWhereInputQuery(
          fieldFilters as FilterOf<any>,
          fieldMetadata,
          {},
        );
      });

      return query;
    }

    getComparisonQuery(
      filters: FilterOf<unknown>,
      metadata: FieldMetadata,
      query = {},
    ) {
      const isFieldNullable = !!metadata.options.nullable;

      Object.entries(filters).forEach(([operation, value]) => {
        if (!isFieldNullable && value === null) {
          throw new BadRequestException(
            `field ${metadata.name} cannot be null`,
          );
        }
        const queryFN = this.getQueryFN(operation as COMPARISON_OPERATOR);
        Object.assign(query, queryFN(metadata, value as FilterOf<unknown>));
      });
    }

    getQueryFN(operation: COMPARISON_OPERATOR) {
      return this.queryBuilderByOperationMap[operation];
    }

    getIsOperator(metadata: FieldMetadata, value: FilterOf<unknown>) {
      return { [metadata.name]: value };
    }

    getLikeOperator(metadata: FieldMetadata, value: FilterOf<unknown>) {
      return { [metadata.name]: { contains: value, mode: 'insensitive' } };
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

  return mixin(ToPrismaQueryPipe);
}
