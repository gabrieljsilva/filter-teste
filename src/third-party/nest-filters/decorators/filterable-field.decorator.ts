import { Type } from '@nestjs/common';
import {
  GqlTypeReference,
  ReturnTypeFunc,
  ReturnTypeFuncValue,
} from '@nestjs/graphql';
import { isFunction } from '@nestjs/common/utils/shared.utils';
import { reflectTypeFromMetadata } from '@nestjs/graphql/dist/utils/reflection.utilts';

import { FieldMetadata } from '../types/field-metadata';
import { FilterTypeMetadataStorage } from '../types/filter-type-metadata-storage';
import { primitiveTypes } from '../constants';

export type FieldOptions = {
  name?: string;
  description?: string;
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
    target: NonNullable<unknown>,
    propertyKey?: string,
    descriptor?: TypedPropertyDescriptor<any>,
  ) => {
    const [returnTypeFunc, fieldTypeOptions = {}] = isFunction(typeOrOptions)
      ? [typeOrOptions, fieldOptions]
      : [undefined, typeOrOptions as any];

    const isResolverMethod = !!(descriptor && descriptor.value);

    const { typeFn, options } = reflectTypeFromMetadata({
      metadataKey: isResolverMethod ? 'design:returntype' : 'design:type',
      prototype: target,
      propertyKey: propertyKey,
      explicitTypeFn: returnTypeFunc,
      typeOptions: fieldTypeOptions,
      ignoreOnUndefinedType: false,
    });

    const fieldType = typeFn();
    const fieldFilterType =
      FilterTypeMetadataStorage.getFilterTypeByTarget(fieldType);

    FilterTypeMetadataStorage.addFieldMetadata(
      target.constructor,
      new FieldMetadata({
        name: fieldOptions?.name ?? propertyKey,
        originalName: propertyKey,
        type: fieldFilterType ? () => fieldFilterType : () => fieldType,
        originalType: fieldType as Type,
        options: options,
        isPrimitiveType: primitiveTypes.has(fieldType as Type),
      }),
    );
  };
}
