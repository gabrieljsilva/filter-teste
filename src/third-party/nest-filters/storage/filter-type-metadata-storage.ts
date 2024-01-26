import { Type } from '@nestjs/common';
import { GqlTypeReference } from '@nestjs/graphql';

import { filterTypeMap } from '../constants';
import { DependencyStorage } from './dependency-storage';
import { mapBy } from '../utils';
import { BidirectionalMap } from '../types/bidirectional-map';
import { MultiMap } from '../types/multimap';
import { FieldMetadata } from '../types/field-metadata';
import { FilterTypeBuilder } from '../types/filter-type-builder';

export class FilterTypeMetadataStorage {
  private static dependencyStorage = new DependencyStorage();
  private static filterTypesByScalar = new BidirectionalMap<
    GqlTypeReference,
    Type
  >(filterTypeMap);

  private static fieldMetadataStorage = new MultiMap<
    GqlTypeReference,
    FieldMetadata
  >();

  private static typeFieldsMapIndexedByName = new Map<
    GqlTypeReference,
    Map<string, FieldMetadata>
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

  public static addFieldMetadata(
    target: GqlTypeReference,
    field: FieldMetadata,
  ) {
    const fields = this.getFieldMetadataByTarget(target);
    fields.push(field);
    this.fieldMetadataStorage.set(target, field);
  }

  public static getFieldMetadataByTarget(
    target: GqlTypeReference,
  ): Array<FieldMetadata> {
    const values = this.fieldMetadataStorage.getValuesByKey(target);
    return values ? Array.from(values) : [];
  }

  public static getIndexedFieldsByType(type: GqlTypeReference) {
    return this.typeFieldsMapIndexedByName.get(type);
  }

  public static mapTypeFieldsByName() {
    const typeFieldsMap = this.fieldMetadataStorage.entries();
    for (const [type, fields] of typeFieldsMap) {
      const mappedFields = mapBy(fields, 'name');
      this.typeFieldsMapIndexedByName.set(type, mappedFields);
    }
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
