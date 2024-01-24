import { FieldMetadata, LOGICAL_OPERATORS, FilterTypeBuilder } from '../types';
import { FilterTypeMetadataStorage } from '../storage/filter-type-metadata-storage';

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
          name: LOGICAL_OPERATORS._not,
          originalName: LOGICAL_OPERATORS._not,
          type: () => notFilterInputType,
          originalType: target,
          isPrimitiveType: false,
        }),
      )
      .addDynamicField(
        (inputType) =>
          new FieldMetadata({
            name: LOGICAL_OPERATORS._and,
            originalName: LOGICAL_OPERATORS._and,
            type: () => [inputType],
            originalType: target,
            isPrimitiveType: false,
          }),
      )
      .addDynamicField(
        (inputType) =>
          new FieldMetadata({
            name: LOGICAL_OPERATORS._or,
            originalName: LOGICAL_OPERATORS._or,
            type: () => [inputType],
            originalType: target,
            isPrimitiveType: false,
          }),
      );

    const filterInputType = filterTypeBuilder.build();
    FilterTypeMetadataStorage.setFilterType(target, filterInputType);
    FilterTypeMetadataStorage.onEntityLoaded(target);
  };
}
