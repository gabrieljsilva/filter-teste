import { PipeTransform, Type } from '@nestjs/common';
import { Args } from '@nestjs/graphql';

import { FilterArgsOptions } from '../types/filter-args-options';
import { getOptionsOrPipes } from '../utils/get-options-and-pipes';
import { getFilterOf } from '../utils/get-filter-of';

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
    const filterType = getFilterOf(type);

    Args(
      options.name,
      {
        type: () => filterType,
        name: options.name,
        description: options?.description,
        nullable: true,
      },
      ...extractedPipes,
    )(target, key, index);
  };
}
