import { Type } from '@nestjs/common';

import { MultiMap } from './multimap';
import { FieldMetadata } from './field-metadata';

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
