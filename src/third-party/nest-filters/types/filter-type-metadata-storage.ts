import { Type } from '@nestjs/common';
import { GqlTypeReference } from '@nestjs/graphql';

import { FILTER_FIELD_TYPE, filterTypeMap } from '../constants';
import { applyField } from '../utils';

import { BidirectionalMap } from './bidirectional-map';
import { FieldMetadata, FieldType } from './field-metadata';
import { DependencyStorage } from './dependency-storage';

export class FilterTypeMetadataStorage {
  private static dependencyStorage = new DependencyStorage();
  private static filterTypesByScalar = new BidirectionalMap<
    GqlTypeReference,
    Type
  >(filterTypeMap);

  public static setFilterType(target: Type, filterType: Type) {
    this.filterTypesByScalar.set(target, filterType);
  }

  public static addDependency(target: Type, field: FieldMetadata) {
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
    const fields = this.getFieldMetadataByTarget(target) || [];
    fields.push(field);
    Reflect.defineMetadata(FILTER_FIELD_TYPE, fields, target);
  }

  public static getFieldMetadataByTarget(
    target: Type | Function,
  ): Array<FieldMetadata> {
    return Reflect.getMetadata(FILTER_FIELD_TYPE, target);
  }

  public static onEntityLoaded(target: Type) {
    this.resolveForwardedDependents(target);
    this.resolveForwardedDependencies(target);
  }

  private static resolveForwardedDependents(target: Type) {
    const dependents = this.dependencyStorage.getDependentsByType(target);

    dependents.forEach((fields, dependent) => {
      for (const field of fields) {
        const fieldFilterType = this.getFilterTypeByTarget(field.type());
        applyField(
          dependent,
          new FieldMetadata({
            name: field.name,
            originalName: field.originalName,
            type: () => fieldFilterType,
            options: field.options,
          }),
        );
        this.dependencyStorage.deleteByValue(field);
      }
    });
  }

  private static resolveForwardedDependencies(target: Type) {
    const targetFilterType = this.getFilterTypeByTarget(target);

    const dependencies = this.dependencyStorage.getValuesByKey(
      targetFilterType as Type,
    );

    dependencies?.forEach((field) => {
      const type = field.getTypeIfForwardRef();
      const filterType = this.getFilterTypeByTarget(type);

      if (filterType) {
        applyField(
          targetFilterType as Type,
          new FieldMetadata({
            name: field.name,
            originalName: field.originalName,
            type: () => filterType,
            options: field.options,
          }),
        );

        this.dependencyStorage.deleteByValue(field);
        this.onEntityLoaded(type);
      }
    });
  }
}
