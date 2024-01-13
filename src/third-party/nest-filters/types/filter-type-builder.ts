import { InputType } from '@nestjs/graphql';
import { Type } from '@nestjs/common';
import { FieldMetadata } from './field-metadata';
import { applyField } from '../utils';

export class FilterTypeBuilder {
  private target: NonNullable<any>;
  private name: string;
  private fields: Array<FieldMetadata>;
  private dynamicFields: Set<(inputType: Type) => FieldMetadata>;

  constructor() {
    this.fields = [];
    this.dynamicFields = new Set();
  }

  setName(name: string) {
    this.name = name;
    return this;
  }

  setTarget(target: NonNullable<any>) {
    this.target = target;
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
    class FilterInputType {}
    Object.defineProperty(FilterInputType, 'name', {
      value: this.name,
    });

    this.fields?.forEach((field) => applyField(FilterInputType, field));

    this.dynamicFields.forEach((dynamicField) => {
      const field = dynamicField(FilterInputType);
      applyField(FilterInputType, field);
    });

    InputType()(FilterInputType);

    return FilterInputType;
  }
}
