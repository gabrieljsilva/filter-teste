import { PipeTransform, Type } from '@nestjs/common';
import { Args } from '@nestjs/graphql';

import { FilterArgsOptions } from '../types';
import { getFilterOf, getOptionsOrPipes } from '../utils';

export function FilterArgs(type: Type, options?: FilterArgsOptions);
export function FilterArgs(
  type: Type,
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
);
export function FilterArgs(
  type: Type,
  options: FilterArgsOptions,
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
);

export function FilterArgs(
  type: Type,
  optionsOrPipe: FilterArgsOptions | Type<PipeTransform> | PipeTransform,
  ...pipes: (Type<PipeTransform> | PipeTransform)[]
) {
  const { options, pipes: extractedPipes } = getOptionsOrPipes(
    optionsOrPipe,
    pipes,
  );

  return (target: NonNullable<any>, key: string, index: number) => {
    Args(
      options.name,
      {
        type: () => getFilterOf(type),
        name: options.name,
        description: options?.description,
        nullable: true,
      },
      ...extractedPipes,
    )(target, key, index);
  };
}
