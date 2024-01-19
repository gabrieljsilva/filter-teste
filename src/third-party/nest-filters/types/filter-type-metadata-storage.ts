import { Type } from '@nestjs/common';
import { GqlTypeReference } from '@nestjs/graphql';

import { filterTypeMap } from '../constants';
import { BidirectionalMap } from './bidirectional-map';
import { FieldMetadata } from './field-metadata';
import { DependencyStorage } from './dependency-storage';
import { MultiMap } from './multimap';
import { FilterTypeBuilder } from './filter-type-builder';

export class FilterTypeMetadataStorage {
  private static dependencyStorage = new DependencyStorage();
  private static filterTypesByScalar = new BidirectionalMap<
    GqlTypeReference,
    Type
  >(filterTypeMap);

  private static fieldMetadataStorage = new MultiMap<
    Type | Function,
    FieldMetadata
  >();

  public static setFilterType(target: Type, filterType: Type) {
    this.filterTypesByScalar.set(target, filterType);
  }

  public static addLazyLoadDependency(target: Type, field: FieldMetadata) {
    return this.dependencyStorage.set(target, field);
  }

  public static getFilterTypeByTarget(target: GqlTypeReference) {
    return this.filterTypesByScalar.getValueByKey(target);
  }

  public static getTypeByFilterType(filterType: Type) {
    return this.filterTypesByScalar.getKeyByValue(filterType);
  }

  public static addFieldMetadata(
    target: Type | Function,
    field: FieldMetadata,
  ) {
    const fields = this.getFieldMetadataByTarget(target);
    fields.push(field);
    this.fieldMetadataStorage.set(target, field);
  }

  public static getFieldMetadataByTarget(
    target: Type | Function,
  ): Array<FieldMetadata> {
    const values = this.fieldMetadataStorage.getValuesByKey(target);
    return values ? Array.from(values) : [];
  }

  public static onEntityLoaded(target: Type) {
    const dependents = this.dependencyStorage.getDependents(target);
    const filterType = FilterTypeMetadataStorage.getFilterTypeByTarget(target);

    for (const [dependent, fields] of dependents.entries()) {
      for (const field of fields) {
        field.type = () => filterType;
        field.originalType = target;
        FilterTypeBuilder.applyField(dependent, field);
        this.dependencyStorage.deleteByValue(field);
      }
    }
  }
}
