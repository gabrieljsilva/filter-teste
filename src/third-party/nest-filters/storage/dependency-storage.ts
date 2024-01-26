import { Type } from '@nestjs/common';

import { MultiMap } from '../types/multimap';
import { FieldMetadata } from '../types/field-metadata';

export class DependencyStorage extends MultiMap<Type, FieldMetadata> {
  public getDependents(target: Type) {
    const dependents = new MultiMap<Type, FieldMetadata>();

    this.to.forEach((type, field) => {
      if (field.getType() === target) {
        dependents.set(type, field);
      }
    });

    return dependents;
  }
}
