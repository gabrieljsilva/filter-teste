import { FieldMetadata } from '../types/field-metadata';
import { FilterTypeMetadataStorage } from '../types/filter-type-metadata-storage';
import { FilterTypeBuilder } from '../types/filter-type-builder';

export function FilterableEntity(name?: string) {
  return (target: NonNullable<any>) => {
    const fields = FilterTypeMetadataStorage.getFieldMetadataByTarget(target);

    // ===== CREATE NOT FILTER ===== //
    const notFilterTypeName = name ? `Not${name}` : `Not${target.name}Filter`;
    const notFilterTypeBuilder = new FilterTypeBuilder();

    const notFilterInputType = notFilterTypeBuilder
      .setName(notFilterTypeName)
      .setTarget(target)
      .setFields(fields)
      .build();

    // ===== CREATE FILTER ===== //
    const filterName = name ?? `${target.name}Filter`;
    const filterTypeBuilder = new FilterTypeBuilder();

    filterTypeBuilder
      .setName(filterName)
      .setTarget(target)
      .setFields(fields)
      .addField(
        new FieldMetadata({
          name: '_not',
          originalName: '_not',
          type: () => notFilterInputType,
        }),
      )
      .addDynamicField(
        (inputType) =>
          new FieldMetadata({
            name: '_and',
            originalName: '_and',
            type: () => [inputType],
          }),
      )
      .addDynamicField(
        (inputType) =>
          new FieldMetadata({
            name: '_or',
            originalName: '_and',
            type: () => [inputType],
          }),
      );

    const filterInputType = filterTypeBuilder.build();
    FilterTypeMetadataStorage.setFilterType(target, filterInputType);
    FilterTypeMetadataStorage.onEntityLoaded(target);
  };
}
