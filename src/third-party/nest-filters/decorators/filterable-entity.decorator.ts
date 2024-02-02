import { InputType } from '@nestjs/graphql';
import { FilterTypeMetadataStorage } from '../storage/filter-type-metadata-storage';

export function FilterableEntity(name?: string) {
  return (target: NonNullable<any>) => {
    const filterInputType =
      FilterTypeMetadataStorage.typesToFilterMap.getValueByKey(target);

    InputType(name || filterInputType.name)(filterInputType);
  };
}
