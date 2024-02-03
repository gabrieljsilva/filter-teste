import { BidirectionalMap } from '../types/bidirectional-map';
import { filterTypeMap } from './filter-type-map';
import { MultiMap } from '../types/multimap';
import { GqlTypeReference } from '@nestjs/graphql';
import { FieldMetadata } from '../types/field-metadata';

export const typesToFilterMap = new BidirectionalMap(filterTypeMap);
export const fieldsByTarget = new MultiMap<GqlTypeReference, FieldMetadata>();
export const typeFieldsMapIndexedByName = new Map();
