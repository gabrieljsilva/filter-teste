import { Args } from '@nestjs/graphql';
import {
  FilterableEntity,
  FilterableField,
  FilterArgs,
} from '../../decorators';
import { FilterOf } from '../../types/filter-of.type';
import { getFilterOf } from '../../utils';
import { PipeTransform } from '@nestjs/common';

jest.mock('@nestjs/graphql', () => {
  return {
    Args: jest.fn(() => () => null),
    Field: jest.fn(() => () => null),
    InputType: jest.fn(() => () => null),
  };
});

jest.mock('../../utils/get-filter-of', () => {
  return {
    getFilterOf: jest.fn(),
  };
});

describe('Filter args decorator tests', () => {
  const defaultFilterName = 'filters';
  const defaultFilterParams = {
    description: undefined,
    name: 'filters',
    nullable: true,
    type: expect.any(Function),
  };

  it('should call Args decorator with default params', () => {
    @FilterableEntity()
    class Cat {
      @FilterableField()
      name: string;
    }

    class CatResolver {
      async findCats(@FilterArgs(Cat) cat: FilterOf<Cat>) {}
    }

    expect(Args).toHaveBeenCalledWith(defaultFilterName, defaultFilterParams);
    expect(getFilterOf).toHaveBeenCalledWith(Cat);
  });

  it('should call Args decorator with correct custom name and description', () => {
    const customFilterName = 'MyCustomFilterName';
    const customDescription = 'Custom Input Type Description';

    @FilterableEntity()
    class Cat {
      @FilterableField()
      name: string;
    }

    class CatResolver {
      async findCats(
        @FilterArgs(Cat, {
          name: customFilterName,
          description: customDescription,
        })
        cat: FilterOf<Cat>,
      ) {}
    }

    expect(Args).toHaveBeenCalledWith(customFilterName, {
      ...defaultFilterParams,
      description: customDescription,
      name: customFilterName,
    });
  });

  it('should call Args decorator with pipes', () => {
    class CustomPipe implements PipeTransform {
      transform(value: FilterOf<unknown>): any {
        return value;
      }
    }

    @FilterableEntity()
    class Cat {
      @FilterableField()
      name: string;
    }

    class CatResolver {
      async findCats(
        @FilterArgs(Cat, CustomPipe)
        cat: FilterOf<Cat>,
      ) {}
    }

    expect(Args).toHaveBeenCalledWith(
      defaultFilterName,
      defaultFilterParams,
      CustomPipe,
    );
  });

  it('should call Args decorator with correct custom name and description and pipes', () => {
    const customFilterName = 'MyCustomFilterName';
    const customDescription = 'Custom Input Type Description';

    class CustomPipe implements PipeTransform {
      transform(value: FilterOf<unknown>): any {
        return value;
      }
    }

    @FilterableEntity()
    class Cat {
      @FilterableField()
      name: string;
    }

    class CatResolver {
      async findCats(
        @FilterArgs(
          Cat,
          {
            name: customFilterName,
            description: customDescription,
          },
          CustomPipe,
        )
        cat: FilterOf<Cat>,
      ) {}
    }

    expect(Args).toHaveBeenCalledWith(
      customFilterName,
      {
        ...defaultFilterParams,
        description: customDescription,
        name: customFilterName,
      },
      CustomPipe,
    );
  });
});
