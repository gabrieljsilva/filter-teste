import { FilterTypeMetadataStorage } from './types/filter-type-metadata-storage';

import { createGetFieldMetadata } from './factories/create-get-field-metadata';
import { createGetFilterOf } from './factories/create-get-filter-of';
import { createGetIndexedFields } from './factories/create-get-indexed-fields-by-target';
import { createFilterableFieldDecorator } from './factories/create-filterable-field-decorator';
import { createFilterArgsDecorator } from './factories/create-filter-args-decorator';
import { createFilterableEntityDecorator } from './factories/create-filterable-entity-decorator';
import {
  fieldsByTarget,
  typeFieldsMapIndexedByName,
  typesToFilterMap,
} from './constants/filter-type-metadata.singleton.storage';

import { createNestFilterModule } from './factories/create-nest-filter-module';

export const filterTypeMetadataStorage = new FilterTypeMetadataStorage({
  typesToFilterMap: typesToFilterMap,
  fieldsByTarget: fieldsByTarget,
  typeFieldsMapIndexedByName: typeFieldsMapIndexedByName,
});

export { FilterOf } from './types/filter-of.type';
export { COMPARISON_OPERATOR } from './enums/comparison-operators';

export const FilterableField = createFilterableFieldDecorator(
  filterTypeMetadataStorage,
);

export const FilterArgs = createFilterArgsDecorator(filterTypeMetadataStorage);

export const FilterableEntity = createFilterableEntityDecorator(
  filterTypeMetadataStorage,
);

export const getFieldMetadata = createGetFieldMetadata(
  filterTypeMetadataStorage,
);

export const getFilterOf = createGetFilterOf(filterTypeMetadataStorage);

export const getIndexedFields = createGetIndexedFields(
  filterTypeMetadataStorage,
);

export const NestFilterModule = createNestFilterModule(
  filterTypeMetadataStorage,
);
