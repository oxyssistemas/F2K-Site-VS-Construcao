import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  ShieldCheck, 
  BadgePercent, 
  Truck, 
  Award,
  Car as CarIcon,
  MessageCircle,
  Check,
  Sparkles,
  Star,
  ImageIcon
} from 'lucide-react';
import { Car } from '../types';
import { POPULAR_BRANDS, CARS_INVENTORY } from '../data/cars';
import { STORE_STATS } from '../data/reviews';
import { getWhatsAppLink } from '../utils/formatters';

// =========================================================================
// 🚗 CONFIGURAÇÃO DA IMAGEM DO CARRO DO BANNER (HERO)
// =========================================================================
// Para colocar sua imagem do carro em PNG sem fundo:
// 1. Coloque seu arquivo na pasta `/public/` (ex: `/public/meu-carro.png`) e defina:
//    const HERO_CAR_IMAGE_SRC: string = '/meu-carro.png';
// 2. Ou importe um arquivo de `src/assets/images/` e use aqui.
// (Deixando vazio '' exibe o slot visual com todas as animações ativas)
const HERO_CAR_IMAGE_SRC: string = '11452734.png';

interface HeroProps {
  cars?: Car[];
  onQuickSearch: (brand: string, category: string, maxPrice: number) => void;
  onExploreClick: () => void;
  onSimulateClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  cars = [],
  onQuickSearch,
  onExploreClick
}) => {
  const [selectedBrand, setSelectedBrand] = useState('Todas as marcas');
  const [selectedModel, setSelectedModel] = useState('Todos os modelos');
  const [selectedYear, setSelectedYear] = useState('Todos os anos');
  const [selectedPriceRange, setSelectedPriceRange] = useState('Todos os preços');

  const sourceCars = cars && cars.length > 0 ? cars : CARS_INVENTORY;

  // Filter available models based on selected brand
  const availableModels = useMemo(() => {
    if (!selectedBrand || selectedBrand === 'Todas as marcas') {
      return Array.from(new Set(sourceCars.map(c => c.model))).filter(Boolean);
    }
    return Array.from(new Set(sourceCars.filter(c => c.brand.toLowerCase() === selectedBrand.toLowerCase()).map(c => c.model))).filter(Boolean);
  }, [selectedBrand, sourceCars]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let maxPrice = 1000000;
    if (selectedPriceRange === 'Até R$ 150.000') maxPrice = 150000;
    else if (selectedPriceRange === 'Até R$ 250.000') maxPrice = 250000;
    else if (selectedPriceRange === 'Até R$ 350.000') maxPrice = 350000;
    else if (selectedPriceRange === 'Até R$ 500.000') maxPrice = 500000;
    else if (selectedPriceRange === 'Até R$ 800.000') maxPrice = 800000;

    onQuickSearch(
      selectedBrand === 'Todas as marcas' ? '' : selectedBrand,
      selectedModel === 'Todos os modelos' ? '' : selectedModel,
      maxPrice
    );
  };

  return (
    <section id="hero" className="relative bg-[#070707] text-white overflow-hidden">
      
      {/* Upper Dark Hero Section */}
      <div className="relative bg-[#070707] pt-6 pb-20 sm:pt-10 lg:pt-14 lg:pb-24 overflow-hidden border-b border-white/5">
        
        {/* Background with Ambient Dark Showroom & Lighting Reflections */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/70 z-10" />
          <img 
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=2200&q=80" 
            alt="Showroom F2K" 
            className="w-full h-full object-cover filter blur-[5px] scale-105 opacity-20"
          />
          {/* Subtle Ambient Red Glow Accent */}
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-red-600/15 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute -bottom-10 left-10 w-96 h-96 bg-red-950/20 rounded-full blur-[120px] pointer-events-none" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Main Banner Grid: On Mobile Image is First (order-1), Text is Second (order-2); on Desktop Text is Left (lg:order-1), Image is Right (lg:order-2) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-12 items-center min-h-[360px] lg:min-h-[420px]">
            
            {/* CAR IMAGE COLUMN: Above text on mobile (order-1), on the right on desktop (lg:order-2 lg:col-span-6) */}
            <div className="order-1 lg:order-2 lg:col-span-6 relative flex items-center justify-center pt-2 lg:pt-0">
              
              {/* Studio Car Showcase Stage with Entrance & Float Animations */}
              <motion.div 
                initial={{ opacity: 0, x: 60, scale: 0.94 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-lg lg:max-w-none flex flex-col items-center justify-center group"
              >
                {/* Ambient Radial Spotlight behind the car */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 lg:w-[460px] h-72 sm:h-96 lg:h-[460px] bg-gradient-to-br from-red-600/25 via-red-900/10 to-transparent rounded-full blur-3xl pointer-events-none" />

                {/* Floating Car Container with Micro Hover Animation */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="relative z-10 w-full flex items-center justify-center"
                >
                  {/* SLOT DA IMAGEM COM ANIMAÇÕES (Renderiza a imagem se configurada ou o slot reservado) */}
                  <div className="relative w-full min-h-[220px] sm:min-h-[300px] flex items-center justify-center">
                    {HERO_CAR_IMAGE_SRC ? (
                      <img 
                        src={HERO_CAR_IMAGE_SRC} 
                        alt="F2K Veículos - Estoque Premium Selecionado"
                        className="w-full h-auto max-h-[270px] sm:max-h-[350px] lg:max-h-[420px] object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.9)] filter contrast-105 hover:scale-[1.02] transition-transform duration-500 pointer-events-none select-none"
                      />
                    ) : (
                      <div className="w-full max-w-md h-52 sm:h-64 rounded-2xl border-2 border-dashed border-white/20 bg-white/[0.02] backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center group-hover:border-[#e50914]/50 transition-colors">
                        <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-500/20 text-[#e50914] flex items-center justify-center mb-3">
                          <ImageIcon className="w-6 h-6 animate-pulse" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-white mb-1">
                          Slot para Foto do Veículo (PNG)
                        </span>
                        <p className="text-[11px] text-gray-400 max-w-xs leading-relaxed">
                          Edite <code className="text-[#e50914] font-mono font-bold">src/components/Hero.tsx</code> na linha <code className="text-white font-mono font-bold">HERO_CAR_IMAGE_SRC</code>
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Floating Badges for Visual Depth */}
                  {/* Top-Right Badge: 100% Periciado */}
                  <motion.div 
                    initial={{ opacity: 0, y: -20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="absolute -top-2 right-2 sm:top-2 sm:right-6 bg-black/80 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1.5 shadow-xl pointer-events-none"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#e50914] animate-pulse" />
                    <span>Laudo Cautelar 100% Aprovado</span>
                  </motion.div>

                  {/* Bottom-Left Badge: Pronta Entrega */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.7, duration: 0.6 }}
                    className="hidden sm:flex absolute -bottom-2 left-4 bg-black/85 backdrop-blur-md border border-red-500/40 text-white px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold items-center gap-1.5 shadow-xl pointer-events-none"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span>Pronta Entrega • Financiamento Fácil</span>
                  </motion.div>
                </motion.div>

                {/* Dynamic Contact Floor Shadow that synchronizes with the float animation */}
                <motion.div 
                  animate={{ 
                    scaleX: [1, 0.88, 1],
                    opacity: [0.85, 0.5, 0.85]
                  }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  className="w-3/4 sm:w-4/5 h-6 sm:h-9 bg-black/90 blur-xl rounded-full -mt-3 sm:-mt-5 pointer-events-none z-0"
                />

              </motion.div>
            </div>

            {/* TEXT COLUMN: Below image on mobile (order-2), on the left on desktop (lg:order-1 lg:col-span-6) */}
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="order-2 lg:order-1 lg:col-span-6 z-20 flex flex-col justify-center text-center lg:text-left"
            >
              
              {/* Category Pill Tag */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 self-center lg:self-start px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-300 text-[11px] font-bold uppercase tracking-wider mb-3.5 backdrop-blur-sm"
              >
                <span className="w-2 h-2 rounded-full bg-[#e50914] animate-pulse" />
                Estoque Selecionado F2K
              </motion.div>

              {/* Main Headline */}
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-3xl sm:text-5xl lg:text-[3.35rem] font-black leading-[1.08] tracking-tight uppercase italic mb-3"
              >
                <span className="text-white block font-black">SEU PRÓXIMO CARRO</span>
                <span className="text-[#e50914] block font-black">ESTÁ AQUI.</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-gray-300 text-xs sm:text-sm lg:text-base leading-relaxed mb-6 max-w-md mx-auto lg:mx-0 font-normal"
              >
                Encontre veículos selecionados, revisados<br className="hidden sm:inline" /> e prontos para você.
              </motion.p>

              {/* Action Buttons Side by Side */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 mb-5"
              >
                {/* Botão Vermelho: VER VEÍCULOS */}
                <button
                  onClick={onExploreClick}
                  className="px-6 py-3 bg-[#c90a14] hover:bg-[#b00810] text-white font-extrabold uppercase tracking-wider text-xs rounded-md shadow-lg shadow-red-900/30 active:scale-95 transition-all flex items-center gap-2.5 hover:shadow-red-600/30 hover:shadow-xl"
                  id="hero-ver-veiculos-btn"
                >
                  <CarIcon className="w-4 h-4 text-white" />
                  <span className="font-black">VER VEÍCULOS</span>
                </button>

                {/* Botão Transparente: FALE CONOSCO */}
                <a
                  href={getWhatsAppLink('Olá! Gostaria de falar com a F2K Veículos sobre os modelos disponíveis.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-black/40 hover:bg-white hover:text-black border border-white/40 hover:border-white text-white font-extrabold uppercase tracking-wider text-xs rounded-md transition-all duration-200 flex items-center gap-2.5 active:scale-95 shadow-md"
                  id="hero-fale-conosco-btn"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span className="font-black">FALE CONOSCO</span>
                </a>
              </motion.div>

              {/* Small Checkpoint Bullet line */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex items-center justify-center lg:justify-start gap-2 text-[11px] sm:text-xs text-gray-400 font-medium"
              >
                <Check className="w-3.5 h-3.5 text-[#e50914] shrink-0 stroke-[3]" />
                <span>Veículos selecionados • Procedência • Atendimento especializado</span>
              </motion.div>

            </motion.div>

          </div>

        </div>

      </div>

      {/* Floating Filter Card overlapping the Dark Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 sm:-mt-20"
      >
        
        {/* Floating White Search Card */}
        <div className="bg-[#f4f4f5] text-zinc-900 rounded-2xl p-5 sm:p-7 shadow-2xl border border-zinc-200 hover:shadow-red-950/20 transition-shadow">
          
          <h3 className="text-base sm:text-lg font-bold text-zinc-900 mb-4 tracking-tight">
            Encontre o veículo ideal para você
          </h3>

          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-end">
            
            {/* 1. Marca */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Marca</label>
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  setSelectedModel('Todos os modelos');
                }}
                className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 font-medium"
                id="search-marca"
              >
                <option value="Todas as marcas">Todas as marcas</option>
                {POPULAR_BRANDS.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* 2. Modelo */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Modelo</label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 font-medium"
                id="search-modelo"
              >
                <option value="Todos os modelos">Todos os modelos</option>
                {availableModels.map(model => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>

            {/* 3. Ano */}
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Ano</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 font-medium"
                id="search-ano"
              >
                <option value="Todos os anos">Todos os anos</option>
                {Array.from({ length: 25 }, (_, i) => 2026 - i).map(y => (
                  <option key={y} value={String(y)}>{y}</option>
                ))}
                <option value="2000 ou anterior">2000 ou anterior</option>
              </select>
            </div>

            {/* 4. Faixa de Preço */}
            <div className="lg:col-span-2">
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1">Faixa de preço</label>
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2.5 text-xs text-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 font-medium"
                id="search-preco"
              >
                <option value="Todos os preços">Todos os preços</option>
                <option value="Até R$ 150.000">Até R$ 150.000</option>
                <option value="Até R$ 250.000">Até R$ 250.000</option>
                <option value="Até R$ 350.000">Até R$ 350.000</option>
                <option value="Até R$ 500.000">Até R$ 500.000</option>
                <option value="Até R$ 800.000">Até R$ 800.000</option>
              </select>
            </div>

            {/* 5. Botão BUSCAR */}
            <div className="lg:col-span-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#c90a14] hover:bg-[#b00810] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 hover:shadow-red-600/30 hover:shadow-lg cursor-pointer"
                id="search-submit-btn"
              >
                <Search className="w-4 h-4" />
                <span>BUSCAR</span>
              </button>
            </div>

          </form>

        </div>

      </motion.div>

      {/* Guarantees and Store Stats Section below the filter */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        {/* Key Guarantees Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
          <motion.div 
            whileHover={{ y: -4, borderColor: 'rgba(229, 9, 20, 0.4)' }}
            className="flex items-start gap-3 p-3.5 rounded-sm bg-[#0d0d0d] border border-white/5 transition-all shadow-sm"
          >
            <div className="p-2 rounded-sm bg-red-600/10 text-red-500">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Laudo 100% Aprovado</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Sem sinistros, sem leilão e com procedência periciada</p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4, borderColor: 'rgba(229, 9, 20, 0.4)' }}
            className="flex items-start gap-3 p-3.5 rounded-sm bg-[#0d0d0d] border border-white/5 transition-all shadow-sm"
          >
            <div className="p-2 rounded-sm bg-red-600/10 text-red-500">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Garantia Completa</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Cobertura mecânica e elétrica para sua tranquilidade</p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4, borderColor: 'rgba(229, 9, 20, 0.4)' }}
            className="flex items-start gap-3 p-3.5 rounded-sm bg-[#0d0d0d] border border-white/5 transition-all shadow-sm"
          >
            <div className="p-2 rounded-sm bg-red-600/10 text-red-500">
              <BadgePercent className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Melhores Taxas</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Parcerias com os principais bancos e financeiras</p>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4, borderColor: 'rgba(229, 9, 20, 0.4)' }}
            className="flex items-start gap-3 p-3.5 rounded-sm bg-[#0d0d0d] border border-white/5 transition-all shadow-sm"
          >
            <div className="p-2 rounded-sm bg-red-600/10 text-red-500">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Entrega Nacional</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Caminhão fechado com seguro total na sua porta</p>
            </div>
          </motion.div>
        </div>

        {/* Numbers Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/5 text-center">
          {STORE_STATS.map((stat, idx) => (
            <motion.div 
              key={idx} 
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
              className="p-2 cursor-default"
            >
              <span className="text-2xl sm:text-3xl font-black text-white italic tracking-tight font-mono">{stat.value}</span>
              <p className="text-xs font-bold uppercase tracking-wider text-red-500 mt-0.5">{stat.label}</p>
              <p className="text-[10px] text-gray-500">{stat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

