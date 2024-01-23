export { FilterableEntity, FilterableField, FilterArgs } from './decorators';
export { FilterOf } from './types/filter-of.type';
export { COMPARISON_OPERATOR } from './types/comparison-operators';
export { getFilterOf } from './utils';

// IMPEDITIVO
// ToDo -> Permitir a injeção de multiplos dados nos pipes;

// NÃO IMPEDITIVO
// ToDo -> Mapear os tipos primitivos para os tipos de filtro no processo de "build";
// ToDo -> Cobrir mais testes automatizados;
