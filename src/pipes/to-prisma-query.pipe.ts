import { PipeTransform, Type } from '@nestjs/common';

import { COMPARISON_OPERATOR } from '../third-party/nest-filters';
import { FilterOf } from '../third-party/nest-filters';
import { FieldMetadata } from '../third-party/nest-filters/types/field-metadata';
import { getFieldMetadata } from '../third-party/nest-filters/utils';

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

  transform(value: FilterOf<unknown>): any {
    if (!value) {
      return {};
    }

    const fieldMetadata = getFieldMetadata(this.type);
    return this.getWhereInputQuery(value, fieldMetadata);
  }

  private getWhereInputQuery(
    filter: FilterOf<unknown>,
    metadata: Array<FieldMetadata>,
    query = {},
  ) {
    for (const [property, fieldFilters] of Object.entries(filter)) {
      const [propertyMetadata] = metadata.filter(
        (metadata) => metadata.name === property,
      );

      if (!propertyMetadata.isPrimitiveType) {
        const fieldMetadata = getFieldMetadata(propertyMetadata.originalType);

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

      for (const [operation, value] of Object.entries(fieldFilters)) {
        if (operation === COMPARISON_OPERATOR.is) {
          query[property] = value;
          continue;
        }

        if (operation === COMPARISON_OPERATOR.like) {
          query[property] = {
            contains: value,
            mode: 'insensitive',
          };
          continue;
        }

        if (operation === COMPARISON_OPERATOR.in) {
          query[property] = {
            in: value,
          };
          continue;
        }

        if (operation === COMPARISON_OPERATOR.gt) {
          query[property] = {
            gt: value,
          };
          continue;
        }

        if (operation === COMPARISON_OPERATOR.lt) {
          query[property] = {
            lt: value,
          };
          continue;
        }

        if (operation === COMPARISON_OPERATOR.gte) {
          query[property] = {
            gte: value,
          };
          continue;
        }

        if (operation === COMPARISON_OPERATOR.lte) {
          query[property] = {
            lte: value,
          };
        }
      }
    }

    return query;
  }
}
