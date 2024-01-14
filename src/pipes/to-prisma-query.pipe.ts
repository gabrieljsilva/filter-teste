import { PipeTransform, Type } from '@nestjs/common';

import { FILTER_OPERATOR } from '../third-party/nest-filters';
import { FilterOf } from '../third-party/nest-filters';
import { FieldMetadata } from '../third-party/nest-filters/types/field-metadata';
import {
  getOriginalTypeByFilter,
  getFieldMetadata,
} from '../third-party/nest-filters/utils';
import { GraphType } from '@apollo/server/src/plugin/schemaReporting/generated/operations';
import { ID } from '@nestjs/graphql';

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
    const fieldMetadata = getFieldMetadata(this.type);
    return this.getWhereInputQuery(value, fieldMetadata);
  }

  private getWhereInputQuery(
    filter: FilterOf<unknown>,
    metadata: Array<FieldMetadata>,
  ) {
    const query = {};

    for (const [property, fieldFilters] of Object.entries(filter)) {
      const [propertyMetadata] = metadata.filter(
        (metadata) => metadata.originalName === property,
      );
      const propertyType = propertyMetadata.type();
      const originalType = getOriginalTypeByFilter(propertyType);

      // Melhorar o desempenho em runtime indexando os metadados pelo "originalName" = Aumentar o uso de RAM e diminuir o uso do processador
      // Consertar a tipagem dos métodos do FilterMetadataStorage
      // Talvez Adicionar o tipo original na classe FieldMetadata? = Aumentar o uso de RAM e diminuir o uso do processador

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
