import { GqlTypeReference } from '@nestjs/graphql';
import { TypeOptions } from '@nestjs/graphql/dist/interfaces/type-options.interface';

export type FieldType = GqlTypeReference;

type FieldMetadataOptions = TypeOptions & { description?: string };

export class FieldMetadata {
  name: string;
  originalName: string;
  type: FieldType;
  originalType?: GqlTypeReference;
  isPrimitiveType: boolean;
  options?: FieldMetadataOptions;

  constructor(metadata: Omit<FieldMetadata, 'getType' | 'isFieldLoaded'>) {
    this.name = metadata.name;
    this.originalName = metadata.originalName;
    this.type = metadata.type;
    this.originalType = metadata.originalType;
    this.isPrimitiveType = metadata.isPrimitiveType;
    this.options = metadata.options;
  }

  getType() {
    const forwardRef = this.type?.['forwardRef'];

    if (forwardRef) {
      return forwardRef();
    }

    return this.type;
  }
}
