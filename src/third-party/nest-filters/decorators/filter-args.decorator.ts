import { PipeTransform, Type } from '@nestjs/common';
import { Args } from '@nestjs/graphql';
import { extendArrayMetadata } from '@nestjs/common/utils/extend-metadata.util';

import { FilterArgsOptions } from '../types/filter-args-options';

import { getFilterOf, getOptionsOrPipes } from '../utils';
import { NestFilterModule } from '../module';
import { FILTER_PIPES } from '../constants';
import { FilterPipeMetadata } from '../types/filter-pipe-metadata';

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

  const pipesToApply = extractedPipes.map((pipe) =>
    typeof pipe === 'function' ? new pipe(type) : pipe,
  );

  return (target: NonNullable<any>, key: string, index: number) => {
    const resolverTypeMetadata = new FilterPipeMetadata({
      property: options.name,
      type,
      target,
      key,
      index,
    });

    extendArrayMetadata(FILTER_PIPES, [resolverTypeMetadata], NestFilterModule);

    Args(
      options.name,
      {
        type: () => getFilterOf(type),
        name: options.name,
        description: options?.description,
        nullable: true,
      },
      ...pipesToApply,
    )(target, key, index);
  };
}
