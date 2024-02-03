import { GqlTypeReference, TypeMetadataStorage } from '@nestjs/graphql';
import { Type } from '@nestjs/common';

import { primitiveTypes } from '../constants/primitive-types';
import { filterTypeMetadataStorage } from '../index';

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
}
