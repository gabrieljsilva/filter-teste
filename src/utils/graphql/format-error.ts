import { GraphQLError } from 'graphql';

export function formatError(error: Required<GraphQLError>) {
  return {
    message: error.message,
    code: error.extensions.code,
    keys: {},
  };
}
