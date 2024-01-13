import { Type } from '@nestjs/common';

import { MultiMap } from './multimap';
import { FieldMetadata } from './field-metadata';

export class DependencyStorage extends MultiMap<Type, FieldMetadata> {
  constructor() {
    super();
  }

  public getDependentsByType(type: Type) {
    const dependents: Map<Type, FieldMetadata[]> = new Map();

    const typesByField = this.getKeysByValue();

    if (typesByField) {
      for (const [field, dependent] of typesByField) {
        const addedFields = this.getValuesByKey(dependent);
        const fieldType = field.getTypeIfForwardRef();
        if (fieldType === type) {
          field.type = () => fieldType;
          dependents.set(dependent, [...addedFields, field]);
        }
      }
    }

    return dependents;
  }
}
