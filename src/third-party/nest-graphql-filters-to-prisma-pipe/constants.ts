import {
  LOGICAL_OPERATORS,
  SORT_OPERATOR,
} from '@gabrieljsilva/nest-graphql-filters';

export const clientToPrismaLogicalOperators: Record<LOGICAL_OPERATORS, string> =
  {
    [LOGICAL_OPERATORS._AND]: 'AND',
    [LOGICAL_OPERATORS._OR]: 'OR',
    [LOGICAL_OPERATORS._NOT]: 'NOT',
  };

export const clientToPrismaSortOperators = {
  [SORT_OPERATOR._SORT_BY]: 'orderBy',
};

export const clientToPrismaArrayOperators = {
  _EVERY: 'every',
  _SOME: 'some',
};

export const clientToPrismaPrimitiveArrayOperators = {
  _EVERY: 'hasEvery',
  _SOME: 'hasSome',
};
