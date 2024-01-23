import {
  Float,
  GqlTypeReference,
  GraphQLISODateTime,
  ID,
  Int,
} from '@nestjs/graphql';
import { TimestampFilter } from '../filters';

export const primitiveTypes = new Set<GqlTypeReference>([
  Boolean,
  Number,
  String,
  Date,
  ID,
  Int,
  Float,
  GraphQLISODateTime,
  TimestampFilter,
]);
