import { FilterTypeMetadataStorage } from '../types/filter-type-metadata-storage';
import {
  GqlTypeReference,
  ReturnTypeFunc,
  ReturnTypeFuncValue,
} from '@nestjs/graphql';
import { Type } from '@nestjs/common';
import { isFunction } from '@nestjs/common/utils/shared.utils';
import { reflectTypeFromMetadata } from '@nestjs/graphql/dist/utils/reflection.utilts';
import { FieldMetadata } from '../types/field-metadata';
import { LazyMetadataStorage } from '@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage';

type FieldOptions = {
  name?: string;
  description?: string;
  nullable?: boolean;
};

type FieldOptionsExtractor<T> = T extends [GqlTypeReference]
  ? FieldOptions
  : T extends GqlTypeReference
    ? FieldOptions
    : never;

export const createFilterableFieldDecorator = (
  storage: FilterTypeMetadataStorage,
) => {
  return function FilterableField<T extends ReturnTypeFuncValue>(
    typeOrOptions?: ReturnTypeFunc<T> | FieldOptionsExtractor<T>,
    fieldOptions?: FieldOptionsExtractor<T>,
  ) {
    return (
      prototype: NonNullable<unknown>,
      propertyKey?: string,
      descriptor?: TypedPropertyDescriptor<any>,
    ) => {
      const target = prototype.constructor as Type;

      const [returnTypeFunc, fieldTypeOptions = {}] = isFunction(typeOrOptions)
        ? [typeOrOptions, fieldOptions]
        : [undefined, typeOrOptions as any];

      const filterInputType = storage.getOrCreateFilterType(target);

      const applyField = () => {
        const isResolverMethod = !!(descriptor && descriptor.value);

        const {
          typeFn,
          options: { isArray = false, nullable = false },
        } = reflectTypeFromMetadata({
          metadataKey: isResolverMethod ? 'design:returntype' : 'design:type',
          prototype: prototype,
          propertyKey: propertyKey,
          explicitTypeFn: returnTypeFunc,
          typeOptions: fieldTypeOptions,
          ignoreOnUndefinedType: false,
        });

        const fieldMetadata = new FieldMetadata({
          name: fieldOptions?.name || propertyKey,
          type: typeFn(),
          isArray: isArray,
          nullable: nullable as boolean,
          description: fieldOptions?.description,
          originalName: propertyKey,
        });

        storage.addFieldMetadata(filterInputType, fieldMetadata);
      };

      LazyMetadataStorage.store(filterInputType, applyField, {
        isField: true,
      });
    };
  };
};
