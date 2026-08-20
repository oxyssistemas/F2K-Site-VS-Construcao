import React, { useState } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  Grid, 
  List, 
  RotateCcw, 
  Sparkles,
  Shield,
  Car as CarIcon,
  Check,
  ChevronRight
} from 'lucide-react';
import { Car, FilterState } from '../types';
import { POPULAR_BRANDS, BODY_CATEGORIES } from '../data/cars';
import { CarCard } from './CarCard';
import { formatBRL } from '../utils/formatters';

interface InventorySectionProps {
  cars: Car[];
  filters: FilterState;
  favorites: string[];
  comparedCars: string[];
  onUpdateFilters: (filters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  onToggleFavorite: (carId: string) => void;
  onToggleCompare: (carId: string) => void;
  onViewDetails: (car: Car) => void;
  onScheduleTestDrive: (car: Car) => void;
  onNavigateToStock?: () => void;
}

export const InventorySection: React.FC<InventorySectionProps> = ({
  cars,
  filters,
  favorites,
  comparedCars,
  onUpdateFilters,
  onResetFilters,
  onToggleFavorite,
  onToggleCompare,
  onViewDetails,
  onScheduleTestDrive,
  onNavigateToStock
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showAllVehicles, setShowAllVehicles] = useState(false);

  // Count active filters
  const hasActiveFilters = Boolean(
    filters.searchQuery ||
    filters.brand ||
    filters.category ||
    filters.minPrice > 0 ||
    filters.maxPrice < 1000000 ||
    filters.minYear > 1900 ||
    filters.transmission ||
    filters.fuel ||
    filters.maxMileage < 150000 ||
    filters.onlyUniqueOwner ||
    filters.onlyArmor
  );

  // Display top 4 main vehicles if not in "showAll" or if no active search filter
  const displayedCars = (showAllVehicles || hasActiveFilters) ? cars : cars.slice(0, 4);

  return (
    <section id="estoque" className="py-14 lg:py-20 bg-[#060606] text-white min-h-screen border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-white/10">
          <div>
            {/* Título com Traço Vermelho à Frente */}
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="w-1.5 sm:w-2 h-7 sm:h-9 bg-[#e50914] rounded-full shrink-0 shadow-[0_0_14px_rgba(229,9,20,0.85)]" 
                id="destaque-red-bar"
              />
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight uppercase italic">
                VEÍCULOS EM DESTAQUE
              </h2>
            </div>

            {/* Descrição Abaixo */}
            <p className="text-xs sm:text-sm text-gray-400 font-normal pl-4.5 sm:pl-5">
              Confira alguns dos nossos veículos disponíveis
            </p>
          </div>

          {/* Quick Stats & Controls */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-2 rounded-lg bg-[#111] border border-white/10 text-gray-300 font-mono">
              <span className="text-[#e50914] font-black">{cars.length}</span> veículos no estoque
            </span>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border text-xs font-bold uppercase tracking-wider transition-colors ${
                showFilters || hasActiveFilters
                  ? 'bg-[#e50914] text-white border-[#e50914]' 
                  : 'bg-[#111] border-white/10 text-gray-300 hover:bg-[#181818]'
              }`}
              id="toggle-filters-btn"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filtros</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Optional Expandable Filter Bar */}
        {showFilters && (
          <div className="bg-[#101010] p-5 rounded-xl border border-white/10 mb-8 space-y-4 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#e50914]" />
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white">Filtrar Veículos</h3>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={onResetFilters}
                  className="text-xs text-red-500 hover:text-red-400 font-bold uppercase tracking-wider flex items-center gap-1"
                  id="reset-filters-btn"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Limpar Filtros</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Busca Rápida</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ex: BMW, Porsche, Turbo..."
                    value={filters.searchQuery}
                    onChange={(e) => onUpdateFilters({ searchQuery: e.target.value })}
                    className="w-full bg-[#181818] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914]"
                    id="filter-search-input"
                  />
                </div>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Marca</label>
                <select
                  value={filters.brand}
                  onChange={(e) => onUpdateFilters({ brand: e.target.value === 'Todas as Marcas' ? '' : e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#e50914]"
                  id="filter-brand-select"
                >
                  {POPULAR_BRANDS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Carroceria</label>
                <select
                  value={filters.category}
                  onChange={(e) => onUpdateFilters({ category: e.target.value === 'Todas as Categorias' ? '' : e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#e50914]"
                  id="filter-category-select"
                >
                  {BODY_CATEGORIES.map(c => (
                    <option key={c} value={c === 'Todas as Categorias' ? '' : c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Transmission */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Câmbio</label>
                <select
                  value={filters.transmission}
                  onChange={(e) => onUpdateFilters({ transmission: e.target.value })}
                  className="w-full bg-[#181818] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#e50914]"
                  id="filter-transmission-select"
                >
                  <option value="">Todos os Câmbios</option>
                  <option value="Automático">Automático</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 4 Quadros com os Principais Veículos (4 Columns Grid) */}
        {displayedCars.length > 0 ? (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="destaque-cars-grid">
              {displayedCars.map((car) => (
                <CarCard
                  key={car.id}
                  car={car}
                  isFavorite={favorites.includes(car.id)}
                  isCompared={comparedCars.includes(car.id)}
                  onToggleFavorite={onToggleFavorite}
                  onToggleCompare={onToggleCompare}
                  onViewDetails={onViewDetails}
                  onScheduleTestDrive={onScheduleTestDrive}
                />
              ))}
            </div>

            {/* Ver Todo o Estoque Button */}
            {!hasActiveFilters && (
              <div className="mt-12 text-center">
                <button
                  onClick={() => {
                    if (onNavigateToStock) {
                      onNavigateToStock();
                    } else {
                      setShowAllVehicles(true);
                    }
                  }}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-[#111] hover:bg-[#181818] border border-white/15 hover:border-[#e50914] text-white font-extrabold uppercase tracking-wider text-xs transition-all shadow-lg hover:shadow-red-950/20 active:scale-95 group"
                  id="show-all-vehicles-btn"
                >
                  <span>VER TODO O ESTOQUE ({cars.length} VEÍCULOS)</span>
                  <ChevronRight className="w-4 h-4 text-[#e50914] group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-16 px-4 bg-[#101010] rounded-xl border border-white/10">
            <div className="w-16 h-16 rounded-xl bg-[#181818] flex items-center justify-center mx-auto text-gray-500 mb-4 border border-white/5">
              <CarIcon className="w-8 h-8 text-[#e50914]" />
            </div>
            <h3 className="text-base font-bold uppercase italic text-white">
              {hasActiveFilters ? 'Nenhum veículo encontrado com os filtros atuais' : 'Estoque em Atualização'}
            </h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto mt-1 mb-6">
              {hasActiveFilters 
                ? 'Tente alterar seus critérios de busca ou limpar os filtros para visualizar os outros carros.'
                : 'Nenhum veículo cadastrado no momento. Os veículos adicionados pelo Portal Administrativo aparecerão aqui em tempo real.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={onResetFilters}
                className="px-6 py-2.5 rounded-lg bg-[#e50914] hover:bg-red-700 text-white font-bold uppercase italic text-xs tracking-wider transition-all"
                id="empty-state-reset-btn"
              >
                Limpar Todos os Filtros
              </button>
            )}
          </div>
        )}

      </div>
    </section>
  );
};
