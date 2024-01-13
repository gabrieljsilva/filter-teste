import { Type } from '@nestjs/common';
import { FilterTypeMetadataStorage } from '../types/filter-type-metadata-storage';

export function getFilterOf<T = any>(classRef: Type<T>) {
  return FilterTypeMetadataStorage.getFilterTypeByTarget(classRef);
}
