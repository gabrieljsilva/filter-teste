import { FilterTypeMetadataStorage } from '../types/filter-type-metadata-storage';
import { FieldType } from '../types/field-metadata';
import { Type } from '@nestjs/common';
import { GraphQLScalarType } from 'graphql/type';

export function getOriginalTypeByFilter(type: FieldType) {
  return FilterTypeMetadataStorage.getTypeByFilterType(type) as
    | Type
    | GraphQLScalarType;
}
