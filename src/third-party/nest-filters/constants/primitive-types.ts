import { Float, GraphQLISODateTime, ID, Int } from '@nestjs/graphql';
import { TimestampFilter } from '../filters';

export const primitiveTypes = new Set([
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
