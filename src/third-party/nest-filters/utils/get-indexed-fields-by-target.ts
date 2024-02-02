import { GqlTypeReference } from '@nestjs/graphql';
import { FilterTypeMetadataStorage } from '../storage/filter-type-metadata-storage';

export function getIndexedFieldsByType(type: GqlTypeReference) {
  return FilterTypeMetadataStorage.typeFieldsMapIndexedByName.get(type);
}
