import { Type } from '@nestjs/common';
import { GqlTypeReference } from '@nestjs/graphql';
import { TypeOptions } from '@nestjs/graphql/dist/interfaces/type-options.interface';

export type FieldType = Type | GqlTypeReference;
export type FieldTypeFN = (() => FieldType) | (() => Array<FieldType>);

export class FieldMetadata {
  name: string;
  originalName: string;
  type: FieldTypeFN;
  options?: TypeOptions & { description?: string };

  constructor(metadata: Omit<FieldMetadata, 'getTypeIfForwardRef'>) {
    this.name = metadata.name;
    this.originalName = metadata.originalName;
    this.type = metadata.type;
    this.options = metadata.options;
  }

  getTypeIfForwardRef() {
    const forwardRef = this.type()?.['forwardRef'];

    if (forwardRef) {
      return forwardRef();
    }

    return this.type();
  }
}
