import { Type } from '@nestjs/common';
import { GqlTypeReference, GraphQLTimestamp, ID, Int } from '@nestjs/graphql';

import {
  BooleanFilter,
  DateTimeFilter,
  FloatFilter,
  IdFilter,
  IntFilter,
  StringFilter,
  TimestampFilter,
} from '../filters';

export const filterTypeMap: Array<[GqlTypeReference, Type]> = [
  [Boolean, BooleanFilter],
  [String, StringFilter],
  [Number, FloatFilter],
  [Date, DateTimeFilter],
  [ID, IdFilter],
  [Int, IntFilter],
  [GraphQLTimestamp, TimestampFilter],
];
