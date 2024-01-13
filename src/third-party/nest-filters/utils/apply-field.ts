import { Type } from '@nestjs/common';
import { Field } from '@nestjs/graphql';
import { applyIsOptionalDecorator } from '@nestjs/mapped-types';

import { FieldMetadata } from '../types/field-metadata';
import { FilterTypeMetadataStorage } from '../types/filter-type-metadata-storage';

export function applyField(target: Type, field: FieldMetadata) {
  const type = field.type();
  const forwardedRef = type['forwardRef'] as Function;

  if (forwardedRef) {
    FilterTypeMetadataStorage.addDependency(target, field);
    return;
  }

  Field(field.type, {
    nullable: true,
    defaultValue: undefined,
  })(target.prototype, field.name);
  applyIsOptionalDecorator(target, field.name);
}
