export { FilterableEntity, FilterableField, FilterArgs } from './decorators';
export { FilterOf } from './types/filter-of.type';
export { COMPARISON_OPERATOR } from './types/comparison-operators';
export { getFilterOf } from './utils';

// ToDo -> Refatorar o ToPrismaQueryPipe;
// ToDo -> Mapear os tipos primitivos para os tipos de filtro no processo de "build";
// ToDo -> Revisar inconsistências de tipagens;
// ToDo -> Permitir a injeção de multiplos dados nos pipes;
// ToDo -> Cobrir mais testes automatizados;
// ToDo -> Fazer testes de performance;
