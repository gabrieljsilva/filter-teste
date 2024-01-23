import { DynamicModule, OnModuleInit } from '@nestjs/common';
import { FilterTypeMetadataStorage } from '../types/filter-type-metadata-storage';

export class NestFilterModule implements OnModuleInit {
  onModuleInit() {
    FilterTypeMetadataStorage.indexFieldsByName();
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
