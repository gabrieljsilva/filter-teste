import { Type } from '@nestjs/common';
import { FilterTypeMetadataStorage } from '../types/filter-type-metadata-storage';

export function createGetFilterOf(storage: FilterTypeMetadataStorage) {
  return <T = any>(classRef: Type<T>) =>
    storage.typesToFilterMap.getValueByKey(classRef);
}
