import { Type } from '@nestjs/common';
import { FilterTypeMetadataStorage } from '../storage/filter-type-metadata-storage';

export function getFieldMetadata(type: Type) {
  return FilterTypeMetadataStorage.getFieldMetadataByTarget(type);
}
