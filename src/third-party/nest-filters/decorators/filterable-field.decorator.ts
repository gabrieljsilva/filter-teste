import { Type } from '@nestjs/common';
import {
  GqlTypeReference,
  ReturnTypeFunc,
  ReturnTypeFuncValue,
} from '@nestjs/graphql';

import { isFunction } from '@nestjs/common/utils/shared.utils';
import { reflectTypeFromMetadata } from '@nestjs/graphql/dist/utils/reflection.utilts';
import { LazyMetadataStorage } from '@nestjs/graphql/dist/schema-builder/storages/lazy-metadata.storage';

import { FilterTypeMetadataStorage } from '../storage/filter-type-metadata-storage';
import { FieldMetadata } from '../types/field-metadata';

export type FieldOptions = {
  name?: string;
  description?: string;
  nullable?: boolean;
};

export type FieldOptionsExtractor<T> = T extends [GqlTypeReference]
  ? FieldOptions
  : T extends GqlTypeReference
    ? FieldOptions
    : never;
export function FilterableField(): PropertyDecorator & MethodDecorator;
export function FilterableField<T extends ReturnTypeFuncValue>(
  options: FieldOptionsExtractor<T>,
): PropertyDecorator & MethodDecorator;
export function FilterableField<T extends ReturnTypeFuncValue>(
  returnTypeFunction?: ReturnTypeFunc<T>,
  options?: FieldOptionsExtractor<T>,
): PropertyDecorator & MethodDecorator;
export function FilterableField<T extends ReturnTypeFuncValue>(
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

    const filterInputType =
      FilterTypeMetadataStorage.getOrCreateFilterType(target);

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

      fieldMetadata.addFieldMetadata(filterInputType);
    };

    LazyMetadataStorage.store(filterInputType, applyField, {
      isField: true,
    });
  };
}
