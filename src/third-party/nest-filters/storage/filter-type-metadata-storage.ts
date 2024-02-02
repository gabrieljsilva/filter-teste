import { Field, GqlTypeReference } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

import { filterTypeMap } from '../constants';
import { BidirectionalMap } from '../types/bidirectional-map';
import { MultiMap } from '../types/multimap';
import { FieldMetadata } from '../types/field-metadata';
import { OmitType } from '@nestjs/mapped-types';

export class FilterTypeMetadataStorage {
  public static typesToFilterMap = new BidirectionalMap(filterTypeMap);

  public static fieldsByTarget = new MultiMap<
    GqlTypeReference,
    FieldMetadata
  >();

  public static getOrCreateFilterType(target: Type<unknown>) {
    const filterType = this.typesToFilterMap.getValueByKey(target);
    if (filterType) {
      return filterType;
    }

    class FilterInputType {}

    Object.defineProperty(FilterInputType, 'name', {
      value: `${target.name}Filter`,
    });

    this.typesToFilterMap.set(target, FilterInputType);
    return FilterInputType;
  }
}
