import { GqlTypeReference, TypeMetadataStorage } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

import { FilterTypeMetadataStorage } from '../storage/filter-type-metadata-storage';
import { primitiveTypes } from '../constants/primitive-types';

interface IFieldMetadata {
  name: string;
  type: GqlTypeReference;
  description?: string;
  originalName: string;
  isArray: boolean;
  nullable: boolean;
  isPrimitiveType: boolean;
}

export class FieldMetadata implements IFieldMetadata {
  name: string;
  type: GqlTypeReference;
  description?: string;
  originalName: string;
  isArray: boolean;
  nullable: boolean;
  isPrimitiveType: boolean;

  constructor(metadata: Omit<IFieldMetadata, 'isPrimitiveType'>) {
    this.name = metadata.name;
    this.type = metadata.type;
    this.description = metadata.description;
    this.originalName = metadata.originalName;
    this.isArray = metadata.isArray;
    this.nullable = metadata.nullable;
    this.isPrimitiveType = primitiveTypes.has(metadata.type);
  }

  private addToStorage(target: Type) {
    const originalType =
      FilterTypeMetadataStorage.typesToFilterMap.getKeyByValue(target);

    FilterTypeMetadataStorage.fieldsByTarget.add(originalType, this);
  }

  addFieldMetadata(target: Type) {
    const fieldFilterType =
      FilterTypeMetadataStorage.typesToFilterMap.getValueByKey(this.type);

    this.addToStorage(target);

    TypeMetadataStorage.addClassFieldMetadata({
      name: this.name,
      schemaName: this.name,
      options: {
        isArray: false,
        nullable: true,
      },
      target: target,
      typeFn: () => fieldFilterType,
      description: this.description,
    });
  }
}
