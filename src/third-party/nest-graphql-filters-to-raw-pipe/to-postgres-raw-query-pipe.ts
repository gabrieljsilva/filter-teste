import { PipeTransform, Type } from '@nestjs/common';
import {
  FieldMetadata,
  FilterOf,
  getIndexedFields,
} from '@gabrieljsilva/nest-graphql-filters';
import { memoize } from '../../utils';

export const ToPostgresRawQueryPipe = memoize<(type: Type) => PipeTransform>(
  createToPostgresRawQueryPipe,
);

export function createToPostgresRawQueryPipe(type: Type<unknown>) {
  class ToPostgresRawQueryPipe implements PipeTransform {
    transform(value: any) {
      if (!value) return {};

      const fieldMetadata = getIndexedFields(type);

      return this.getWhereInputQuery(value, fieldMetadata);
    }

    getWhereInputQuery(
      filter: FilterOf<unknown>,
      metadata: Map<string, FieldMetadata>,
      query = {},
    ) {
      return 'SQL PURO';
    }
  }

  return ToPostgresRawQueryPipe;
}
