import { LOGICAL_OPERATORS } from '@gabrieljsilva/nest-graphql-filters';

export const clientToPrismaLogicalOperators: Record<LOGICAL_OPERATORS, string> =
  {
    [LOGICAL_OPERATORS._AND]: 'AND',
    [LOGICAL_OPERATORS._OR]: 'OR',
    [LOGICAL_OPERATORS._NOT]: 'NOT',
  };
