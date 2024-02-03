import { GqlTypeReference } from '@nestjs/graphql';

export type { FilterOf } from './types/filter-of.type';
export type { COMPARISON_OPERATOR } from './enums/comparison-operators';

import { FilterTypeMetadataStorage } from './types/filter-type-metadata-storage';
import { BidirectionalMap } from './types/bidirectional-map';
import { MultiMap } from './types/multimap';
import { FieldMetadata } from './types/field-metadata';

import { createGetFieldMetadata } from './utils/create-get-field-metadata';
import { createGetFilterOf } from './utils/create-get-filter-of';
import { createGetIndexedFields } from './utils/create-get-indexed-fields-by-target';
import { createFilterableFieldDecorator } from './utils/create-filterable-field-decorator';
import { createFilterArgsDecorator } from './utils/create-filter-args-decorator';
import { createFilterableEntityDecorator } from './utils/create-filterable-entity-decorator';
import { createNestFilterModule } from './utils/create-nest-filter-module';

import { filterTypeMap } from './constants/filter-type-map';

const typesToFilterMap = new BidirectionalMap(filterTypeMap);
const fieldsByTarget = new MultiMap<GqlTypeReference, FieldMetadata>();
const typeFieldsMapIndexedByName = new Map();
const filterTypeMetadataStorage = new FilterTypeMetadataStorage({
  typesToFilterMap: typesToFilterMap,
  fieldsByTarget: fieldsByTarget,
  typeFieldsMapIndexedByName: typeFieldsMapIndexedByName,
});

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
