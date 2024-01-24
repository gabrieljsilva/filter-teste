import { GraphQLTimestamp, ID, Int } from '@nestjs/graphql';
import { FilterableField } from '../../decorators';
import { FilterTypeMetadataStorage } from '../../storage/filter-type-metadata-storage';
import {
  BooleanFilter,
  DateTimeFilter,
  FloatFilter,
  IdFilter,
  IntFilter,
  StringFilter,
  TimestampFilter,
} from '../../filters';

describe('filterable field decorator tests', () => {
  it('should map Boolean type to BooleanFilter type', () => {
    class Cat {
      @FilterableField()
      isVaccinated: boolean;
    }

    const [field] = FilterTypeMetadataStorage.getFieldMetadataByTarget(Cat);
    const fieldType = field.type();

    expect(fieldType).toBe(BooleanFilter);
  });

  it('should map String type to StringFilter type', () => {
    class Cat {
      @FilterableField()
      name: string;
    }

    const [field] = FilterTypeMetadataStorage.getFieldMetadataByTarget(Cat);
    const fieldType = field.type();
    expect(fieldType).toBe(StringFilter);
  });

  it('should map Number type to FloatFilter type', () => {
    class Cat {
      @FilterableField()
      weight: number;
    }

    const [field] = FilterTypeMetadataStorage.getFieldMetadataByTarget(Cat);
    const fieldType = field.type();

    expect(fieldType).toBe(FloatFilter);
  });

  it('should map Date type to DateTimeFilter type', () => {
    class Cat {
      @FilterableField()
      birthDay: Date;
    }

    const [field] = FilterTypeMetadataStorage.getFieldMetadataByTarget(Cat);
    const fieldType = field.type();

    expect(fieldType).toBe(DateTimeFilter);
  });

  it('should map Id GraphQL type to IdFilter type', () => {
    class Cat {
      @FilterableField(() => ID)
      id: string;
    }

    const [field] = FilterTypeMetadataStorage.getFieldMetadataByTarget(Cat);
    const fieldType = field.type();

    expect(fieldType).toBe(IdFilter);
  });

  it('should map Int GraphQL type to IntFilter type', () => {
    class Cat {
      @FilterableField(() => Int)
      age: string;
    }

    const [field] = FilterTypeMetadataStorage.getFieldMetadataByTarget(Cat);
    const fieldType = field.type();

    expect(fieldType).toBe(IntFilter);
  });

  it('should map Timestamp GraphQL type to TimestampFilter type', () => {
    class Cat {
      @FilterableField(() => GraphQLTimestamp)
      birthDay: Date;
    }

    const [field] = FilterTypeMetadataStorage.getFieldMetadataByTarget(Cat);
    const fieldType = field.type();

    expect(fieldType).toBe(TimestampFilter);
  });

  it('should add relationship between two entities', () => {
    class Ower {
      name: string;
    }

    class Cat {
      @FilterableField(() => [Ower])
      owner: Ower;
    }

    const [field] = FilterTypeMetadataStorage.getFieldMetadataByTarget(Cat);
    const fieldType = field.type();

    expect(fieldType).toBe(Ower);
  });

  it('should add array metadata when property is array', () => {
    class Cat {
      owner: Ower;
    }

    class Ower {
      @FilterableField(() => [Cat])
      cats: Cat;
    }

    const [field] = FilterTypeMetadataStorage.getFieldMetadataByTarget(Ower);
    const fieldType = field.type();

    expect(fieldType).toBe(Cat);
    expect(field.options.isArray).toBe(true);
  });

  it('should add type and field options', () => {
    const name = 'awesomeOwner';
    const description = 'My Awesome Owner';

    class Ower {
      name: string;
    }

    class Cat {
      @FilterableField(() => Ower, { name, description })
      owner: Ower;
    }

    const [field] = FilterTypeMetadataStorage.getFieldMetadataByTarget(Cat);
    const fieldType = field.type();

    expect(fieldType).toBe(Ower);
    expect(field.name).toBe(name);
    expect(field.originalName).toBe('owner');
    expect(field.options.description).toBe(description);
  });
});
