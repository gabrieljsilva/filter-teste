import { DynamicModule, OnModuleInit } from '@nestjs/common';
import { FilterTypeMetadataStorage } from '../storage/filter-type-metadata-storage';

export class NestFilterModule implements OnModuleInit {
  onModuleInit() {
    FilterTypeMetadataStorage.mapTypeFieldsByName();
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
