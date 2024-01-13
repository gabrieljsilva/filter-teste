import { ArgumentMetadata, PipeTransform, Type } from '@nestjs/common';

import { FILTER_OPERATOR } from '../third-party/nest-filters';
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

  transform(value: FilterOf<unknown>, metadata: ArgumentMetadata): any {
    const fieldMetadata = getFieldMetadata(this.type);
    return this.getWhereInputQuery(value, fieldMetadata);
  }

  private getWhereInputQuery(
    filter: FilterOf<unknown>,
    metadata: Array<FieldMetadata>,
  ) {
    const query = {};

    for (const [property, fieldFilters] of Object.entries(filter)) {
      // get field metadata here
      for (const [operation, value] of Object.entries(fieldFilters)) {
        if (operation === FILTER_OPERATOR.is) {
          query[property] = value;
          continue;
        }

        if (operation === FILTER_OPERATOR.like) {
          query[property] = {
            contains: value,
            mode: 'insensitive',
          };
          continue;
        }

        if (operation === FILTER_OPERATOR.in) {
          query[property] = {
            in: value,
          };
          continue;
        }

        if (operation === FILTER_OPERATOR.gt) {
          query[property] = {
            gt: value,
          };
          continue;
        }

        if (operation === FILTER_OPERATOR.lt) {
          query[property] = {
            lt: value,
          };
          continue;
        }

        if (operation === FILTER_OPERATOR.gte) {
          query[property] = {
            gte: value,
          };
          continue;
        }

        if (operation === FILTER_OPERATOR.lte) {
          query[property] = {
            lte: value,
          };
          continue;
        }
      }
    }

    return query;
  }
}
