# GraphQL Nest Filter
Esse pacote tem como objetivo criar tipos de forma automatica e padronizada de filtros para o framework Nest.js.

## Instalação
Pacote não foi publicado ainda

## Uso
O pacote faz uso de Decorators para declarar o formato dos tipos.
Use o decorator ```FilterableField``` para marcar os campos que deseja que apareça no filtro.
Use o decorator ```FilterableEntity``` para marcar uma classe como um tipo de filtro e criar o filtro;

ex: 
```ts
import { ID } from '@nestjs/graphql';
import { FilterableEntity, FilterableField } from '../third-party/nest-filters';

@FilterableEntity()
export class User {
  @FilterableField(() => ID)
  id: string;
  
  @FilterableField()
  name: string;

  @FilterableField()
  email: string;
  
  password: string;
    
  @FilterableField()
  createdAt: Date;
  
  @FilterableField()
  deletedAt?: Date;
}
```

O resultado será o tipo:

````gql
input NotUserFilter {
  id: IdFilter
  name: StringFilter
  email: StringFilter
  createdAt: DateTimeFilter
  deletedAt: DateTimeFilter
}

input UserFilter {
  id: IdFilter
  name: StringFilter
  email: StringFilter
  createdAt: DateTimeFilter
  deletedAt: DateTimeFilter
  _and: [UserFilter!]
  _or: [UserFilter!]
  _not: NotUserFilter
}
````

note que cada que tipo primitivo tem um filtro associado com seus próprios operadores, ex:

**Boolean**
```gql
input BooleanFilter {
  is: Boolean
}
```

**Id**
```gql
input IdFilter {
  is: String
}
```

**Int**
```gql
input IntFilter {
  is: Int
  like: Int
  in: [Int]
  gt: Int
  lt: Int
  gte: Int
  lte: Int
}
```

**Float**
```gql
input FloatFilter {
  is: Float
  like: Float
  in: [Float]
  gt: Float
  lt: Float
  gte: Float
  lte: Float
}
```

**String**
```gql
input StringFilter {
  is: String
  like: String
  in: [String]
}
```

**Date**
```gql
input DateTimeFilter {
  is: DateTime
  in: [DateTime]
  gt: DateTime
  lt: DateTime
  gte: DateTime
  lte: DateTime
}
```

**Timestamp**
```gql
input TimestampFilter {
  is: Timestamp
  in: [Timestamp!]
  gt: Timestamp
  lt: Timestamp
  gte: Timestamp
  lte: Timestamp
}
```

Para poder utilizar o tipo filtro em seus resolvers basta utilizar o decorator ```FilterArgs``` e passar a classe como parâmetro.
Ex:

````ts
import { Query, Resolver } from '@nestjs/graphql';
import { FilterArgs, FilterOf } from '../../third-party/nest-filters';
import { UserService } from './user.service';
import { User } from '../../models';

@Resolver(User)
export class UserResolver {
    constructor(private readonly userService: UserService) {}
    
    @Query(() => [User])
    async findUsers(@FilterArgs(User) userFilter: FilterOf<User>) {
        return this.userService.findUsers(userFilter);
    }
}
````

Você pode inferir o tipo do filtro usando o tipo generico "FilterOf".

## Serialização
Você pode transformar os dados enviados do client para ser compativel com seu banco de dados usando pipes;
ex: 

````ts
import { ArgumentMetadata, PipeTransform, Type } from '@nestjs/common';
import { FilterOf } from '../third-party/nest-filters';
import { FieldMetadata } from '../third-party/nest-filters/types/field-metadata';
import { getFieldMetadata } from '../third-party/nest-filters/utils';

export class ToPrismaQueryPipe implements PipeTransform {
  private readonly type: Type;

  constructor(type: Type) {
    if (!type) {
      throw new Error(
        `Cannot determine type for pipe ${ToPrismaQueryPipe.name}`,
      );
    }
    this.type = type;
  }

  transform(value: FilterOf<unknown>, metadata: ArgumentMetadata): any {
    const fieldMetadata = getFieldMetadata(this.type);
    return this.getWhereInputQuery(value, fieldMetadata);
  }

  private getWhereInputQuery(
    filter: FilterOf<unknown>,
    metadata: Array<FieldMetadata>,
  ) {
      // Transform your data here
  }
}
````

Você pode utilizar o pipe passando ele diretamente para o decorator ```FilterArgs```
ex:

````ts
import { ToPrismaQueryPipe } from '../../pipes';

@Resolver(User)
export class UserResolver {
    constructor(private readonly userService: UserService) {}
    
    @Query(() => [User])
    async findUsers(@FilterArgs(User, ToPrismaQueryPipe) userFilter: FilterOf<User>) {
        return this.userService.findUsers(userFilter);
    }
}
````

Ou

````ts
import { ToPrismaQueryPipe } from '../../pipes';

@Resolver(User)
export class UserResolver {
    constructor(private readonly userService: UserService) {}
    
    @Query(() => [User])
    async findUsers(@FilterArgs(User, new ToPrismaQueryPipe(User)) userFilter: FilterOf<User>) {
        return this.userService.findUsers(userFilter);
    }
}
````

Não é produtivo injetar o pipe em cada query que formos utilizar, então é possível injetar pipes de forma global:
Importe o módulo NestFilter no seu app.module
ex:

````ts
@Module({
  imports: [
    PrismaModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      ...
    }),
    NestFilterModule.register(),
    UserModule,
  ],
})
export class AppModule {}
````

e em seu main.ts extraia a instancia do módulo e chame o método ```applyPipes``` e passe os seus pipes;
ex:
````ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestFilterModule } from './third-party/nest-filters/module';
import { ToPrismaQueryPipe } from './pipes';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const nestFilterModule = app.get(NestFilterModule);
  nestFilterModule.applyPipes(ToPrismaQueryPipe);
  await app.listen(3000);
}

bootstrap();
````