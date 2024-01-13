import { Type } from '@nestjs/common';

export class FilterPipeMetadata {
  type: Type<any>;
  target: NonNullable<any>;
  property: string;
  key: string;
  index: number;

  constructor(metadata: FilterPipeMetadata) {
    this.type = metadata.type;
    this.target = metadata.target;
    this.property = metadata.property;
    this.key = metadata.key;
    this.index = metadata.index;
  }
}
