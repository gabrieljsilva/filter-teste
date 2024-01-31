import { Field, InputType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';
import { inheritPropertyInitializers } from '@nestjs/mapped-types';
import { FieldMetadata } from './field-metadata';
import { FilterTypeMetadataStorage } from '../storage/filter-type-metadata-storage';

export class FilterTypeBuilder {
  private target: NonNullable<any>;
  private name: string;
  private fields: Array<FieldMetadata>;
  private dynamicFields: Set<(inputType: Type) => FieldMetadata>;

  constructor() {
    this.fields = [];
    this.dynamicFields = new Set();
  }

  static applyField(target: Type, field: FieldMetadata) {
    const forwardedRef = field.type?.['forwardRef'] as Function;

    if (forwardedRef) {
      FilterTypeMetadataStorage.addLazyLoadDependency(target, field);
      return;
    }

    Field(() => field.type, {
      nullable: true,
      defaultValue: undefined,
    })(target.prototype, field.name);
  }

  setName(name: string) {
    this.name = name;
    return this;
  }

  setTarget(target: NonNullable<any>) {
    this.target = target;
    return this;
  }

  addField(field: FieldMetadata) {
    this.fields.push(field);
    return this;
  }

  addDynamicField(dynamicField: (inputType) => FieldMetadata) {
    this.dynamicFields.add(dynamicField);
    return this;
  }

  setFields(fields: Array<FieldMetadata>) {
    this.fields = fields.slice();
    return this;
  }

  build() {
    const target = this.target;
    class FilterInputType {
      constructor() {
        inheritPropertyInitializers(this, target);
      }
    }

    Object.defineProperty(FilterInputType, 'name', {
      value: this.name,
    });

    this.fields?.forEach((field) => {
      FilterTypeMetadataStorage.addFieldMetadata(this.target, field);
      FilterTypeBuilder.applyField(FilterInputType, field);
    });

    this.dynamicFields.forEach((dynamicField) => {
      const field = dynamicField(FilterInputType);
      FilterTypeMetadataStorage.addFieldMetadata(this.target, field);
      FilterTypeBuilder.applyField(FilterInputType, field);
    });

    InputType()(FilterInputType);

    return FilterInputType;
  }
}
