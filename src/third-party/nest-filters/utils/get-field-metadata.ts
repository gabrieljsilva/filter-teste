import { Type } from '@nestjs/common';
import { FilterTypeMetadataStorage } from '../storage/filter-type-metadata-storage';

export function getFieldMetadataByTarget(target: Type) {
  return FilterTypeMetadataStorage.fieldsByTarget.getValuesByKey(target);
}
