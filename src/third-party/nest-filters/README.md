# GraphQL Nest Filter
Crie filtros de forma simples, automatica e padronizada no framework Nest.js e GraphQL usando decorators.

## Instalação

```shell
npm install @gabrieljsilva/nestjs-graphql-filter
```
ou
```shell
yarn add @gabrieljsilva/nestjs-graphql-filter
```

## Uso
Primeiro precisamos definir uma entidade, fazemos isso usando uma classe e os decorators: `FilterableEntity` e `FilterableField`.

- `FilterableEntity`: Marca uma classe como entidade;
- `FilterableField`: Marca uma propriedade de uma classe como campo "filtrável".

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

Para usar esse tipo em um resolver basta usar o decorator `FilterArgs` passando a entidade como parâmetro.
Além disso, é possivel inferir o tipo no typescript usando o genérico "FilterOf".
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

Cada tipo primitivo tem um filtro associado com os seus próprios operadores, ex:

|          | Boolean | ID  | Int | Float | String | Date | Timestamp |
|----------|---------|-----|-----|-------|--------|------|-----------|
| **Is**   | ✓       | ✓   | ✓   | ✓     | ✓      | ✓    | ✓         |
| **Like** | ✕       | ✕   | ✕   | ✕     | ✓      | ✕    | ✕         |
| **In**   | ✕       | ✕   | ✓   | ✓     | ✓      | ✓    | ✓         |
| **Gt**   | ✕       | ✕   | ✓   | ✓     | ✕      | ✓    | ✓         |
| **Lt**   | ✕       | ✕   | ✓   | ✓     | ✕      | ✓    | ✓         |
| **Gte**  | ✕       | ✕   | ✓   | ✓     | ✕      | ✓    | ✓         |
| **Lte**  | ✕       | ✕   | ✓   | ✓     | ✕      | ✓    | ✓         |

### Relacionamentos
Além dos tipos primitivos é possivel também criar relacionamentos, ex:


```ts
import { ID } from '@nestjs/graphql';
import { FilterableEntity, FilterableField } from '../third-party/nest-filters';

@FilterableEntity()
export class Photo {
    @FilterableField(() => ID)
    id: string;

    @FilterableField()
    url: string;
}

@FilterableEntity()
export class User {
  @FilterableField(() => ID)
  id: string;
  
  @FilterableField()
  name: string;

  @FilterableField()
  photo: Photo
}
```

O tipo resultante é:

````gql
input NotPhotoFilter {
  id: IdFilter
  url: StringFilter
}

input PhotoFilter {
  id: IdFilter
  url: StringFilter
  _and: [UserFilter!]
  _or: [UserFilter!]
  _not: NotUserFilter
}

input NotUserFilter {
  id: IdFilter
  name: StringFilter
  photo: PhotoFilter
}

input UserFilter {
  id: IdFilter
  name: StringFilter
  photo: PhotoFilter
  _and: [UserFilter!]
  _or: [UserFilter!]
  _not: NotUserFilter
}
````

### Dependencia Circular
Apesar de não recomendado ainda é possível criar tipos circulares (tipos que dependem um do outro simultanamente).

Para declarar um tipo com dependencia circular basta utilizar a função forwardRef para adiar o carregamento de um dos lados das entidades, ex:

```ts
import {ID} from '@nestjs/graphql';
import {FilterableEntity, FilterableField} from '../third-party/nest-filters';
import {forwardRef} from "@nestjs/common";

@FilterableEntity()
export class Credentials {
    @FilterableField(() => ID)
    id: string;

    @FilterableField()
    email: string;

    password: string;

    @FilterableField(() => forwardRef(() => User))
    user: User
}

@FilterableEntity()
export class User {
    @FilterableField(() => ID)
    id: string;

    @FilterableField()
    name: string;

    @FilterableField()
    Credentials: Credentials
}
```

## Serialização
É possivel utilizar pipes para serializar os dados recebidos, ex: 

```ts
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
```

É possível criar pipes mais assertivos usando os metadados extraidos da função `getFieldMetadata`, essa função retorna uma lista de instancias da classe FieldMetadata que contém as seguintes informações:

`FieldMetadata`

| property     | type                 | description                                |
|--------------|----------------------|--------------------------------------------|
| name         | string               | Nome da propriedade                        |
| originalName | string               | Referência do nome original da propriedade |
| type         | Function             | Função que retorna o tipo da propriedade   |
| options      | FieldMetadataOptions | Objeto com algumas opções customizadas     |

`FieldMetadataOptions`

| property    | type     | description                          |
|-------------|----------|--------------------------------------|
| isArray     | boolean? | Se a propriedade é um array          |
| arrayDepth  | number?  | Profundidade do array                |
| description | string?  | Descrição customizada da propriedade |
| name        | name?    | Nome customizado da propriedade      |


É possivel utilizar o pipe passando ele diretamente para o decorator `FilterArgs`
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

O decorator se encarrega de injetar o tipo como primeiro parâmetro do construtor do pipe, mas também é possível injetar manualmente da seguinte forma:

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
Para fazer isso é necessário importar o módulo `GraphQLFilterModule`, ex:

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

E no arquivo `main.ts` extraia a instancia do módulo e chame o método ```applyPipes``` e passe os seus pipes;
ex:
````ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestFilterModule } from './third-party/nest-filters/module';
import { ToPrismaQueryPipe } from './pipes';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const nestFilterModule = app.get(NestFilterModule, ...OtherPipes);
  nestFilterModule.applyPipes(ToPrismaQueryPipe);
  await app.listen(3000);
}

bootstrap();
````

## Customização
É possível fazer algumas customizações nos tipos gerados ou nos metadados através dos decorators:

```ts
// Define um nome customizado para o tipo que será exposto pela API
@FilterableEntity('CustomUserFilterName')
export class User {
  @FilterableField(() => ID)
  id: string;

  // Define um nome e descrição customizados para a propriedade que será exposta pela API
  @FilterableField({ name: 'customUserName', description: 'My Awesome Name' })
  name: string;

  // Define nos metadados que esse campo é um array de um tipo especifico
  @FilterableField(() => [Photo])
  photo: Photo[]
}
```
