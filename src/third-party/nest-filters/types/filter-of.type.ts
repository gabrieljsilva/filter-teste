import {
  BooleanFilter,
  DateTimeFilter,
  FloatFilter,
  StringFilter,
} from '../filters';

type ArrayFilter<T> = T extends Array<infer U> ? FilterOf<U> : never;

type BaseFilter<T> = {
  [K in keyof T]: T[K] extends boolean
    ? BooleanFilter
    : T[K] extends number
      ? FloatFilter
      : T[K] extends string
        ? StringFilter
        : T[K] extends Date
          ? DateTimeFilter
          : ArrayFilter<T[K]> extends never
            ? FilterOf<T[K]>
            : ArrayFilter<T[K]>;
};

export type LogicalOperationsFilter<T> = {
  _and: Array<FilterOf<T>>;
  _or: Array<FilterOf<T>>;
  _not: Omit<FilterOf<T>, '_not' | '_or' | '_and'>;
};

export type FilterOf<T> = BaseFilter<T> & LogicalOperationsFilter<T>;
