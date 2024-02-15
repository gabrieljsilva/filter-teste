import { SORT_DIRECTION } from '@gabrieljsilva/nest-graphql-filters';

type PrimitiveTypes = boolean | number | string | Date;
type ArrayFilter<T> = T extends Array<infer U> ? FilterOf<U> : never;

interface BooleanFilter {
  equals?: boolean;
}

interface FloatFilter {
  equals?: number;
  // in?: Array<number>;
  // gt?: number;
  // lt?: number;
  // gte?: number;
  // lte?: number;
}

interface DateFilter {
  equals?: string;
  // in?: Array<number>;
  // gt?: number;
  // lt?: number;
  // gte?: number;
  // lte?: number;
}

interface StringFilter {
  equals?: string;
  // like?: string;
  // in?: Array<string>;
}

type BaseFilter<T> = {
  [K in keyof T]: T[K] extends boolean
    ? BooleanFilter
    : T[K] extends number
      ? FloatFilter
      : T[K] extends string
        ? StringFilter
        : T[K] extends Date
          ? DateFilter
          : ArrayFilter<T[K]> extends never
            ? FilterOf<T[K]>
            : ArrayFilter<T[K]>;
};

export type LogicalOperationsFilter<T> = {
  AND: Array<FilterOf<T>>;
  OR: Array<FilterOf<T>>;
  NOT: FilterOf<T>;
};

export type SortOperator<T> = {
  [K in keyof T]?: T[K] extends PrimitiveTypes ? SORT_DIRECTION : never;
};

export type FilterOf<T> = {
  where?: Partial<BaseFilter<T>>;
  orderBy?: ArrayFilter<SortOperator<T>>;
};
