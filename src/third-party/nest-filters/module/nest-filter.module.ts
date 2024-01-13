import { DynamicModule, PipeTransform, Type } from '@nestjs/common';
import { addPipesMetadata } from '@nestjs/graphql/dist/decorators/param.utils';
import { GqlParamtype } from '@nestjs/graphql/dist/enums/gql-paramtype.enum';

import { FILTER_PIPES } from '../constants';
import { FilterPipeMetadata } from '../types/filter-pipe-metadata';

export class NestFilterModule {
  applyPipes(...pipes: Type<PipeTransform>[]) {
    const resolverTypesMetadata: FilterPipeMetadata[] = Reflect.getMetadata(
      FILTER_PIPES,
      NestFilterModule,
    );

    resolverTypesMetadata?.forEach(({ type, target, property, key, index }) => {
      addPipesMetadata(
        GqlParamtype.ARGS,
        property,
        pipes.map((pipe) => new pipe(type)),
        target,
        key,
        index,
      );
    });
  }

  static register(): DynamicModule {
    return {
      global: true,
      module: NestFilterModule,
      imports: [],
      providers: [],
      exports: [],
    };
  }
}
