import React, { useState, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  RotateCcw, 
  Car as CarIcon, 
  ArrowLeft, 
  X, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight,
  Filter,
  Check,
  ArrowUpDown,
  Gauge,
  Calendar,
  Fuel,
  DollarSign
} from 'lucide-react';
import { Car, FilterState } from '../types';
import { POPULAR_BRANDS, BODY_CATEGORIES } from '../data/cars';
import { CarCard } from './CarCard';
import { formatBRL, formatKM } from '../utils/formatters';

interface InventoryPageProps {
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
  onBackToHome: () => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({
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
  onBackToHome,
}) => {
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Calculate brand counts across all available cars
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    cars.forEach(car => {
      counts[car.brand] = (counts[car.brand] || 0) + 1;
    });
    return counts;
  }, [cars]);

  // Check if any filter is active
  const hasActiveFilters = Boolean(
    filters.searchQuery ||
    filters.brand ||
    filters.category ||
    filters.minPrice > 0 ||
    filters.maxPrice < 1000000 ||
    filters.minYear > 1900 ||
    filters.maxYear < 2035 ||
    filters.transmission ||
    filters.fuel ||
    filters.maxMileage < 150000 ||
    filters.onlyUniqueOwner ||
    filters.onlyArmor
  );

  return (
    <main className="min-h-screen bg-[#070707] text-white pt-6 pb-20 border-b border-white/10" id="estoque-completo-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Breadcrumb & Return to Home */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <button 
              onClick={onBackToHome}
              className="hover:text-white transition-colors flex items-center gap-1 font-medium"
              id="breadcrumb-home-btn"
            >
              Início
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-white font-bold">Estoque de Veículos</span>
          </div>

          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#121212] hover:bg-[#1a1a1a] border border-white/10 hover:border-white/30 text-white font-bold uppercase tracking-wider text-xs transition-all active:scale-95"
            id="back-to-home-btn"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#e50914]" />
            <span>Voltar para o Início</span>
          </button>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-2 h-8 sm:h-10 bg-[#e50914] rounded-full shrink-0 shadow-[0_0_14px_rgba(229,9,20,0.85)]" />
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase italic">
                ESTOQUE COMPLETO
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 font-normal pl-5">
              Explore nossos veículos revisados, periciados com laudo 100% e garantia de procedência.
            </p>
          </div>

          {/* Mobile Filter Toggle & Quick Count */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#e50914] text-white font-bold uppercase tracking-wider text-xs shadow-lg"
              id="mobile-open-filter-btn"
            >
              <Filter className="w-4 h-4" />
              <span>Filtrar ({cars.length})</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg bg-[#111] border border-white/10 text-xs font-mono text-gray-300">
              <span className="text-[#e50914] font-black text-sm">{cars.length}</span>
              <span>veículos encontrados</span>
            </div>
          </div>
        </div>

        {/* Main 2-Column Layout: Left (Filter Engine) | Right (Cars Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================================= */}
          {/* LEFT COLUMN: MOTOR DE FILTRO E PESQUISA (Desktop Sticky Sidebar) */}
          {/* ========================================================================= */}
          <aside className="hidden lg:block lg:col-span-3.5 xl:col-span-3 sticky top-24 space-y-6 bg-[#0f0f0f] border border-white/10 rounded-2xl p-5 shadow-2xl">
            
            {/* Filter Engine Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#e50914]" />
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-white">
                  Motor de Filtro
                </h2>
              </div>
              {hasActiveFilters && (
                <button
                  onClick={onResetFilters}
                  className="text-[11px] text-red-500 hover:text-red-400 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                  id="desktop-reset-filters-btn"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Limpar</span>
                </button>
              )}
            </div>

            {/* 1. Busca por Texto */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Pesquisa Rápida
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Modelo, versão ou marca..."
                  value={filters.searchQuery}
                  onChange={(e) => onUpdateFilters({ searchQuery: e.target.value })}
                  className="w-full bg-[#161616] border border-white/10 rounded-lg pl-9 pr-8 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914] transition-colors"
                  id="sidebar-search-input"
                />
                {filters.searchQuery && (
                  <button
                    onClick={() => onUpdateFilters({ searchQuery: '' })}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 2. Marca */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Marca
              </label>
              <select
                value={filters.brand}
                onChange={(e) => onUpdateFilters({ brand: e.target.value === 'Todas as Marcas' ? '' : e.target.value })}
                className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#e50914] cursor-pointer"
                id="sidebar-brand-select"
              >
                {POPULAR_BRANDS.map(brand => (
                  <option key={brand} value={brand === 'Todas as Marcas' ? '' : brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Carroceria / Categoria */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Carroceria
              </label>
              <select
                value={filters.category}
                onChange={(e) => onUpdateFilters({ category: e.target.value === 'Todas as Categorias' ? '' : e.target.value })}
                className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#e50914] cursor-pointer"
                id="sidebar-category-select"
              >
                {BODY_CATEGORIES.map(cat => (
                  <option key={cat} value={cat === 'Todas as Categorias' ? '' : cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Faixa de Preço */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Preço Máximo
                </label>
                <span className="text-xs font-mono font-bold text-[#e50914]">
                  {filters.maxPrice >= 1000000 ? 'Sem limite' : formatBRL(filters.maxPrice)}
                </span>
              </div>
              <input
                type="range"
                min="100000"
                max="1000000"
                step="25000"
                value={filters.maxPrice}
                onChange={(e) => onUpdateFilters({ maxPrice: Number(e.target.value) })}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#e50914]"
                id="sidebar-price-range"
              />
              <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1">
                <span>R$ 100k</span>
                <span>R$ 500k</span>
                <span>R$ 1M+</span>
              </div>
            </div>

            {/* 5. Câmbio (Pills) */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Câmbio
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: 'Todos', value: '' },
                  { label: 'Automático', value: 'Automático' },
                  { label: 'Manual', value: 'Manual' }
                ].map((item) => {
                  const isSelected = filters.transmission === item.value;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => onUpdateFilters({ transmission: item.value })}
                      className={`py-2 px-1 text-[10px] font-bold uppercase tracking-wider rounded-md border transition-all text-center ${
                        isSelected 
                          ? 'bg-[#e50914] border-[#e50914] text-white' 
                          : 'bg-[#161616] border-white/5 text-gray-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Combustível */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Combustível
              </label>
              <select
                value={filters.fuel}
                onChange={(e) => onUpdateFilters({ fuel: e.target.value })}
                className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#e50914] cursor-pointer"
                id="sidebar-fuel-select"
              >
                <option value="">Todos os Combustíveis</option>
                <option value="Flex">Flex (Gasolina/Etanol)</option>
                <option value="Gasolina">Gasolina</option>
                <option value="Híbrido">Híbrido</option>
                <option value="Elétrico">Elétrico</option>
                <option value="Diesel">Diesel</option>
              </select>
            </div>

            {/* 7. Quilometragem Máxima */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  KM Máximo
                </label>
                <span className="text-xs font-mono font-bold text-gray-300">
                  {filters.maxMileage >= 150000 ? 'Qualquer KM' : formatKM(filters.maxMileage)}
                </span>
              </div>
              <input
                type="range"
                min="10000"
                max="150000"
                step="10000"
                value={filters.maxMileage}
                onChange={(e) => onUpdateFilters({ maxMileage: Number(e.target.value) })}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#e50914]"
                id="sidebar-mileage-range"
              />
            </div>

            {/* 8. Diferenciais / Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="flex items-center gap-2.5 cursor-pointer group text-xs text-gray-300">
                <input
                  type="checkbox"
                  checked={filters.onlyUniqueOwner}
                  onChange={(e) => onUpdateFilters({ onlyUniqueOwner: e.target.checked })}
                  className="rounded border-zinc-700 text-[#e50914] focus:ring-[#e50914] bg-zinc-900 w-4 h-4"
                />
                <span className="group-hover:text-white transition-colors">Apenas Único Dono</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer group text-xs text-gray-300">
                <input
                  type="checkbox"
                  checked={filters.onlyArmor}
                  onChange={(e) => onUpdateFilters({ onlyArmor: e.target.checked })}
                  className="rounded border-zinc-700 text-[#e50914] focus:ring-[#e50914] bg-zinc-900 w-4 h-4"
                />
                <span className="group-hover:text-white transition-colors">Veículos Blindados</span>
              </label>
            </div>

          </aside>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: LISTAGEM DE CARROS SEGUINDO O MESMO PADRÃO DE QUADRO */}
          {/* ========================================================================= */}
          <div className="lg:col-span-8.5 xl:col-span-9 space-y-6">
            
            {/* Top Toolbar: Sorting & Active Filters Tags */}
            <div className="bg-[#0f0f0f] p-4 rounded-xl border border-white/10 flex flex-wrap items-center justify-between gap-4">
              
              {/* Active Filter Tags */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  Filtros Ativos:
                </span>
                
                {filters.brand && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1a1a1a] border border-white/10 text-white text-xs font-semibold">
                    {filters.brand}
                    <button onClick={() => onUpdateFilters({ brand: '' })} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.category && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1a1a1a] border border-white/10 text-white text-xs font-semibold">
                    {filters.category}
                    <button onClick={() => onUpdateFilters({ category: '' })} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.transmission && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1a1a1a] border border-white/10 text-white text-xs font-semibold">
                    {filters.transmission}
                    <button onClick={() => onUpdateFilters({ transmission: '' })} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.fuel && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1a1a1a] border border-white/10 text-white text-xs font-semibold">
                    {filters.fuel}
                    <button onClick={() => onUpdateFilters({ fuel: '' })} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {filters.searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#1a1a1a] border border-white/10 text-white text-xs font-semibold">
                    "{filters.searchQuery}"
                    <button onClick={() => onUpdateFilters({ searchQuery: '' })} className="hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {!hasActiveFilters && (
                  <span className="text-xs text-gray-400 font-normal">Todos os veículos disponíveis</span>
                )}
              </div>

              {/* Sorting Dropdown */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#e50914]" />
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                  Ordenar:
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => onUpdateFilters({ sortBy: e.target.value as any })}
                  className="bg-[#161616] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#e50914] cursor-pointer"
                  id="stock-sort-select"
                >
                  <option value="featured">Destaques</option>
                  <option value="price-asc">Menor Preço</option>
                  <option value="price-desc">Maior Preço</option>
                  <option value="year-desc">Mais Novos</option>
                  <option value="km-asc">Menor KM</option>
                </select>
              </div>

            </div>

            {/* Grid de Quadros de Carros (Seguindo o mesmo padrão de quadro) */}
            {cars.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" id="stock-cars-grid">
                {cars.map((car) => (
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
            ) : (
              <div className="text-center py-20 px-6 bg-[#0f0f0f] rounded-2xl border border-white/10">
                <div className="w-16 h-16 rounded-2xl bg-[#161616] flex items-center justify-center mx-auto text-gray-500 mb-4 border border-white/5">
                  <CarIcon className="w-8 h-8 text-[#e50914]" />
                </div>
                <h3 className="text-lg font-black uppercase italic text-white mb-1">
                  {hasActiveFilters ? 'Nenhum veículo encontrado' : 'Estoque em Atualização'}
                </h3>
                <p className="text-xs text-gray-400 max-w-md mx-auto mb-6">
                  {hasActiveFilters 
                    ? 'Não encontramos nenhum veículo correspondente aos filtros selecionados. Tente ajustar os filtros ou redefinir a busca.'
                    : 'Nenhum veículo cadastrado no momento. Cadastre novos veículos pelo Portal Administrativo com o Supabase para que eles apareçam aqui.'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={onResetFilters}
                    className="px-6 py-3 rounded-lg bg-[#e50914] hover:bg-red-700 text-white font-black uppercase tracking-wider text-xs transition-all shadow-lg active:scale-95"
                    id="stock-empty-reset-btn"
                  >
                    Limpar Todos os Filtros
                  </button>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Mobile Filters Slide-Over Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div 
            onClick={() => setMobileFilterOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Drawer Content */}
          <div className="relative ml-auto w-full max-w-md bg-[#0f0f0f] h-full overflow-y-auto p-6 flex flex-col justify-between shadow-2xl border-l border-white/10 z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#e50914]" />
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">
                    Filtros de Pesquisa
                  </h3>
                </div>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Pesquisa
                </label>
                <input
                  type="text"
                  placeholder="Modelo, versão..."
                  value={filters.searchQuery}
                  onChange={(e) => onUpdateFilters({ searchQuery: e.target.value })}
                  className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914]"
                />
              </div>

              {/* Brand */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Marca
                </label>
                <select
                  value={filters.brand}
                  onChange={(e) => onUpdateFilters({ brand: e.target.value === 'Todas as Marcas' ? '' : e.target.value })}
                  className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#e50914]"
                >
                  {POPULAR_BRANDS.map(b => (
                    <option key={b} value={b === 'Todas as Marcas' ? '' : b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Carroceria
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => onUpdateFilters({ category: e.target.value === 'Todas as Categorias' ? '' : e.target.value })}
                  className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#e50914]"
                >
                  {BODY_CATEGORIES.map(c => (
                    <option key={c} value={c === 'Todas as Categorias' ? '' : c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Transmission */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Câmbio
                </label>
                <select
                  value={filters.transmission}
                  onChange={(e) => onUpdateFilters({ transmission: e.target.value })}
                  className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#e50914]"
                >
                  <option value="">Todos os Câmbios</option>
                  <option value="Automático">Automático</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              {/* Fuel */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Combustível
                </label>
                <select
                  value={filters.fuel}
                  onChange={(e) => onUpdateFilters({ fuel: e.target.value })}
                  className="w-full bg-[#161616] border border-white/10 rounded-lg px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#e50914]"
                >
                  <option value="">Todos</option>
                  <option value="Flex">Flex</option>
                  <option value="Gasolina">Gasolina</option>
                  <option value="Híbrido">Híbrido</option>
                  <option value="Elétrico">Elétrico</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-white/10 space-y-3">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-[#e50914] text-white font-black uppercase tracking-wider text-xs rounded-lg shadow-lg"
              >
                Ver Resultados ({cars.length})
              </button>

              {hasActiveFilters && (
                <button
                  onClick={onResetFilters}
                  className="w-full py-2.5 bg-transparent border border-white/20 text-gray-300 font-bold uppercase tracking-wider text-xs rounded-lg"
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </main>
  );
};
