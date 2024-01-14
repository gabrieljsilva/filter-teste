import { FilterTypeMetadataStorage } from '../types/filter-type-metadata-storage';
import { Type } from '@nestjs/common';

export function getOriginalTypeByFilter(type: Type) {
  return FilterTypeMetadataStorage.getTypeByFilterType(type);
}
