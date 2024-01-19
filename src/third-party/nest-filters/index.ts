export { FilterableEntity, FilterableField, FilterArgs } from './decorators';
export { FilterOf } from './types/filter-of.type';
export { COMPARISON_OPERATOR } from './types/comparison-operators';
export { getFilterOf } from './utils';

// ToDo -> Ao iniciar o modulo do filtro, indexar todos os campos por nome;
// ToDo -> Mapear os tipos primitivos para os tipos de filtro no processo de "build";
// ToDo -> Lidar com null e undefined;
// ToDo -> Revisar inconsistências de tipagens;
// ToDo -> Refatorar o ToPrismaQueryPipe;
// ToDo -> Cobrir mais testes automatizados;
// ToDo -> Fazer testes de performance;
