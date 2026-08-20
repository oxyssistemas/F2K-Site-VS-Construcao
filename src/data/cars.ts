import { Car } from '../types';

/**
 * Catálogo Inicial de Veículos
 * Definido como vazio para que todos os veículos sejam gerenciados e sincronizados
 * diretamente pelo painel administrativo com o Supabase.
 */
export const CARS_INVENTORY: Car[] = [];

export const POPULAR_BRANDS = [
  'Todas as Marcas',
  'BMW',
  'Porsche',
  'Audi',
  'Mercedes-Benz',
  'BYD',
  'Toyota',
  'Volvo',
  'Jeep',
  'Honda',
  'Volkswagen',
  'Ford',
  'Chevrolet',
  'Hyundai',
  'Land Rover'
];

export const BODY_CATEGORIES = [
  'Todas as Categorias',
  'SUV',
  'Sedan',
  'Hatchback',
  'Picape',
  'Esportivo',
  'Elétrico / Híbrido'
];
