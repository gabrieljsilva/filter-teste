import { Field, GqlTypeReference } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

import { BidirectionalMap } from '../types/bidirectional-map';
import { MultiMap } from '../types/multimap';
import { FieldMetadata } from '../types/field-metadata';
import { LOGICAL_OPERATORS } from '../types/logical-operations';
import { filterTypeMap } from '../constants/filter-type-map';
import { mapBy } from '../utils/map-by';

export class FilterTypeMetadataStorage {
  public static typesToFilterMap = new BidirectionalMap(filterTypeMap);

  public static fieldsByTarget = new MultiMap<
    GqlTypeReference,
    FieldMetadata
  >();

  public static typeFieldsMapIndexedByName = new Map<
    GqlTypeReference,
    Map<string, FieldMetadata>
  >();

  public static indexFieldsByName() {
    const typeFieldsMap = this.fieldsByTarget.entries();
    for (const [type, fields] of typeFieldsMap) {
      const mappedFields = mapBy(fields, 'name');
      this.typeFieldsMapIndexedByName.set(type, mappedFields);
    }
  }

  public static getOrCreateFilterType(target: Type<unknown>) {
    const filterType = this.typesToFilterMap.getValueByKey(target);

    if (filterType) {
      return filterType;
    }

    class FilterInputType {
      @Field(() => [FilterInputType], { nullable: true })
      _AND?: FilterInputType;

      @Field(() => [FilterInputType], { nullable: true })
      _OR?: FilterInputType;

      @Field(() => FilterInputType, { nullable: true })
      _NOT?: FilterInputType;
    }

    Object.defineProperty(FilterInputType, 'name', {
      value: `${target.name}Filter`,
    });

    this.typesToFilterMap.set(target, FilterInputType);

    this.fieldsByTarget.add(
      target,
      new FieldMetadata({
        name: LOGICAL_OPERATORS._AND,
        originalName: LOGICAL_OPERATORS._AND,
        type: target,
        isArray: true,
        nullable: true,
        description: `and operator for ${target.name} filter`,
      }),
    );

    this.fieldsByTarget.add(
      target,
      new FieldMetadata({
        name: LOGICAL_OPERATORS._OR,
        originalName: LOGICAL_OPERATORS._OR,
        type: target,
        isArray: true,
        nullable: true,
        description: `or operator for ${target.name} filter`,
      }),
    );

    this.fieldsByTarget.add(
      target,
      new FieldMetadata({
        name: LOGICAL_OPERATORS._NOT,
        originalName: LOGICAL_OPERATORS._NOT,
        type: target,
        isArray: false,
        nullable: true,
        description: `not operator for ${target.name} filter`,
      }),
    );

    return FilterInputType;
  }
}
