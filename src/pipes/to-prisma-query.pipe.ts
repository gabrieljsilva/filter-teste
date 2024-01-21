import { BadRequestException, PipeTransform, Type } from '@nestjs/common';

import { COMPARISON_OPERATOR } from '../third-party/nest-filters';
import { FilterOf } from '../third-party/nest-filters';
import { FieldMetadata } from '../third-party/nest-filters/types/field-metadata';
import { FilterTypeMetadataStorage } from '../third-party/nest-filters/types/filter-type-metadata-storage';

export class ToPrismaQueryPipe implements PipeTransform {
  private readonly type: Type;

  constructor(type: Type) {
    if (!type) {
      throw new Error(
        `Cannot determine type for pipe ${ToPrismaQueryPipe.name}`,
      );
    }

    this.type = type;
  }

  async transform(value: FilterOf<unknown>) {
    if (!value) return {};

    const fieldMetadata = FilterTypeMetadataStorage.getIndexedFieldsByType(
      this.type,
    );

    return this.getWhereInputQuery(value, fieldMetadata);
  }

  private getWhereInputQuery(
    filter: FilterOf<unknown>,
    metadata: Map<string, FieldMetadata>,
    query = {},
  ) {
    for (const [property, fieldFilters] of Object.entries(filter)) {
      const propertyMetadata = metadata.get(property);

      if (!propertyMetadata.isPrimitiveType) {
        const fieldMetadata = FilterTypeMetadataStorage.getIndexedFieldsByType(
          propertyMetadata.originalType,
        );

        let queryProperty = property;

        if (property === '_not') {
          queryProperty = 'NOT';
        }

        if (property === '_and') {
          queryProperty = 'AND';
        }

        if (property === '_or') {
          queryProperty = 'OR';
        }

        if (Array.isArray(fieldFilters)) {
          const items = [];
          for (const fieldFilter of fieldFilters) {
            const parsed = this.getWhereInputQuery(
              fieldFilter,
              fieldMetadata,
              {},
            );
            items.push(parsed);
          }
          query[queryProperty] = items;

          continue;
        }

        query[queryProperty] = {};
        this.getWhereInputQuery(
          fieldFilters as FilterOf<any>,
          fieldMetadata,
          query[queryProperty],
        );
        continue;
      }

      this.getComparisonQuery(
        fieldFilters as FilterOf<unknown>,
        propertyMetadata,
        query,
      );
    }

    return query;
  }

  private getComparisonQuery(
    filters: FilterOf<unknown>,
    propertyMetadata: FieldMetadata,
    query = {},
  ) {
    const isFieldNullable = !!propertyMetadata.options.nullable;

    for (const [operation, value] of Object.entries(filters)) {
      if (!isFieldNullable && value === null) {
        throw new BadRequestException(
          `field ${propertyMetadata.name} cannot be null`,
        );
      }

      if (operation === COMPARISON_OPERATOR.is) {
        query[propertyMetadata.name] = value;
        continue;
      }

      if (operation === COMPARISON_OPERATOR.like) {
        query[propertyMetadata.name] = {
          contains: value,
          mode: 'insensitive',
        };
        continue;
      }

      if (operation === COMPARISON_OPERATOR.in) {
        query[propertyMetadata.name] = {
          in: value,
        };
        continue;
      }

      if (operation === COMPARISON_OPERATOR.gt) {
        query[propertyMetadata.name] = {
          gt: value,
        };
        continue;
      }

      if (operation === COMPARISON_OPERATOR.lt) {
        query[propertyMetadata.name] = {
          lt: value,
        };
        continue;
      }

      if (operation === COMPARISON_OPERATOR.gte) {
        query[propertyMetadata.name] = {
          gte: value,
        };
        continue;
      }

      if (operation === COMPARISON_OPERATOR.lte) {
        query[propertyMetadata.name] = {
          lte: value,
        };
      }
    }
  }
}
