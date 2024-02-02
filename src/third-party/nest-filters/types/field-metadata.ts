import { GqlTypeReference, TypeMetadataStorage } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

import { primitiveTypes } from '../constants';
import { FilterTypeMetadataStorage } from '../storage/filter-type-metadata-storage';

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

  addFieldMetadata(target: Type) {
    const filterType = FilterTypeMetadataStorage.typesToFilterMap.getValueByKey(
      this.type,
    );

    FilterTypeMetadataStorage.fieldsByTarget.set(target.constructor, this);

    TypeMetadataStorage.addClassFieldMetadata({
      name: this.name,
      schemaName: this.name,
      options: {
        isArray: false,
        nullable: true,
      },
      target: target,
      typeFn: () => filterType,
      description: this.description,
    });
  }
}
