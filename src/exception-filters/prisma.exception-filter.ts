import { BadRequestException, Catch } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';

@Catch(Prisma.PrismaClientValidationError)
export class PrismaClientValidationFilter extends BaseExceptionFilter {
  catch(exception: Prisma.PrismaClientValidationError) {
    const nullError = /Argument `[A-Za-z0-9]+` must not be null\./.exec(
      exception.message,
    );

    if (nullError) {
      const [message] = nullError;
      const field = message
        .replace('Argument `', '')
        .replace('` must not be null.', '')
        .trim();

      throw new BadRequestException(`field ${field} cannot be null`);
    }

    // Add aqui a validação
    return exception;
  }
}
