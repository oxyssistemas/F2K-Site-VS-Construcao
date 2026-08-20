import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  MessageCircle, 
  Heart, 
  Scale, 
  Menu, 
  X, 
  ShieldCheck, 
  Clock, 
  MapPin,
  Car,
  ArrowRight
} from 'lucide-react';
import { STORE_INFO } from '../data/reviews';
import { getWhatsAppLink } from '../utils/formatters';
import { F2KLogo } from './F2KLogo';

interface NavbarProps {
  favoritesCount: number;
  comparisonCount: number;
  onOpenFavorites: () => void;
  onOpenComparison: () => void;
  onNavigate: (sectionId: string) => void;
  activeSection?: string;
  currentView?: 'home' | 'stock';
}

interface NavItem {
  id: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'hero', label: 'Início' },
  { id: 'estoque', label: 'Veículos' },
  { id: 'sobre', label: 'Sobre Nós' },
  { id: 'simulador', label: 'Financiamento' },
  { id: 'contato', label: 'Contato' },
];

export const Navbar: React.FC<NavbarProps> = ({
  favoritesCount,
  comparisonCount,
  onOpenFavorites,
  onOpenComparison,
  onNavigate,
  activeSection: initialActiveSection = 'hero',
  currentView = 'home'
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(
    currentView === 'stock' ? 'estoque' : initialActiveSection
  );

  useEffect(() => {
    if (currentView === 'stock') {
      setActiveTab('estoque');
    }
  }, [currentView]);

  // Track active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      if (currentView === 'stock') {
        setActiveTab('estoque');
        return;
      }

      const sectionIds = NAV_ITEMS.map(item => item.id);
      const scrollPosition = window.scrollY + 200;

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const section = document.getElementById(sectionIds[i]);
        if (section) {
          const sectionTop = section.offsetTop;
          if (scrollPosition >= sectionTop) {
            setActiveTab(sectionIds[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-200">
      {/* Top utility bar */}
      <div className="bg-[#050505] text-zinc-400 text-xs py-2 px-4 border-b border-white/10 font-mono">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-zinc-300 text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-red-600" />
              <span>{STORE_INFO.address}</span>
            </span>
            <span className="hidden md:flex items-center gap-1.5 text-[11px] text-zinc-400">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span>Seg a Sex 08:30 às 18h | Sáb 08:30 às 13h</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:flex items-center gap-1 text-red-500 font-bold uppercase tracking-widest text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Periciado & Laudo Aprovado</span>
            </span>
            <a 
              href={`tel:${STORE_INFO.phone.replace(/\D/g, '')}`}
              className="flex items-center gap-1 hover:text-white transition-colors text-xs text-zinc-300 font-mono"
            >
              <Phone className="w-3 h-3 text-red-600" />
              <span className="font-semibold">{STORE_INFO.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main navigation bar */}
      <nav className={`w-full transition-all duration-200 ${
        isScrolled 
          ? 'bg-[#0a0a0a]/95 backdrop-blur-md shadow-2xl border-b border-white/10 py-2' 
          : 'bg-[#0a0a0a] border-b border-white/10 py-2.5 sm:py-3.5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* 1. LOGO À ESQUERDA - TAMANHO EQUILIBRADO E SEM FUNDO */}
          <div className="flex items-center shrink-0">
            <button 
              onClick={() => handleNavClick('hero')} 
              className="flex items-center group focus:outline-none transition-transform hover:scale-105"
              id="f2k-brand-logo-btn"
              title="F2K MOTORS - Início"
            >
              <F2KLogo size="lg" />
            </button>
          </div>

          {/* 2. CENTRO: OPÇÕES COM LINHA VERMELHA NA ABA ATIVA */}
          <div className="hidden lg:flex items-center justify-center gap-8 text-xs uppercase tracking-widest">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  id={`nav-link-${item.id}`}
                  className={`relative py-2 font-bold transition-all duration-200 focus:outline-none ${
                    isActive 
                      ? 'text-white' 
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <span>{item.label}</span>
                  {/* Linha vermelha na aba aberta/ativa */}
                  <span 
                    className={`absolute bottom-0 left-0 w-full h-[3px] bg-red-600 transition-all duration-300 ${
                      isActive ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* 3. DIREITA: BOTÃO COM BORDAS ONDULADAS (ÍCONE DE CARRO) VER VEÍCULOS (SETA PARA DIREITA) */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Quick Compare Button (if any car is compared) */}
            {comparisonCount > 0 && (
              <button
                onClick={onOpenComparison}
                className="hidden xl:flex relative p-2 rounded-sm bg-[#151515] text-zinc-200 hover:border-red-600 transition-colors border border-white/10 text-xs items-center gap-1.5"
                title="Comparar Veículos"
                id="header-compare-btn"
              >
                <Scale className="w-4 h-4 text-red-600" />
                <span className="font-bold uppercase tracking-wider text-[11px]">Comparar</span>
                <span className="w-4 h-4 rounded-full bg-red-600 text-white font-bold text-[10px] flex items-center justify-center">
                  {comparisonCount}
                </span>
              </button>
            )}

            {/* Favorites Icon Button */}
            <button
              onClick={onOpenFavorites}
              className="relative p-2 rounded-full bg-[#151515] text-zinc-200 hover:border-red-600 transition-colors border border-white/10 hover:text-white"
              title="Veículos Favoritos"
              id="header-favorites-btn"
            >
              <Heart className={`w-4 h-4 ${favoritesCount > 0 ? 'fill-red-600 text-red-600' : 'text-zinc-400'}`} />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white font-bold text-[10px] flex items-center justify-center shadow-md">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Botão com Bordas Onduladas: (ícone de carro) Ver Veículos (seta para direita) em Vermelho Vivo */}
            <button
              onClick={() => handleNavClick('estoque')}
              className="hidden sm:flex items-center gap-2.5 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold uppercase tracking-wider text-xs shadow-lg shadow-red-600/30 hover:shadow-red-600/50 hover:scale-105 active:scale-95 transition-all duration-300 rounded-[28px] border border-red-400/40"
              style={{
                borderRadius: '24px 10px 24px 10px'
              }}
              id="header-cta-ver-veiculos"
              title="Ver todo o estoque de veículos"
            >
              <Car className="w-4 h-4 text-white shrink-0" />
              <span className="whitespace-nowrap font-black">Ver Veículos</span>
              <ArrowRight className="w-4 h-4 text-white shrink-0 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-sm bg-[#151515] text-zinc-300 hover:text-white border border-white/10"
              aria-label="Abrir menu"
              id="mobile-menu-toggle-btn"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0d0d0d] border-t border-white/10 px-4 pt-3 pb-6 space-y-2 mt-2 shadow-2xl uppercase tracking-widest text-xs font-bold animate-fadeIn">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left py-3 px-3 rounded-sm flex items-center justify-between transition-colors ${
                    isActive 
                      ? 'bg-[#1a1a1a] text-white border-l-4 border-red-600' 
                      : 'text-zinc-300 hover:bg-[#151515] hover:text-white'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-red-600" />}
                </button>
              );
            })}

            {/* Mobile CTA Button with wavy corners */}
            <button
              onClick={() => handleNavClick('estoque')}
              className="w-full mt-3 py-3.5 px-4 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg shadow-red-600/30 transition-all border border-red-400/40"
              style={{
                borderRadius: '24px 10px 24px 10px'
              }}
            >
              <Car className="w-4 h-4 text-white" />
              <span>Ver Veículos</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        )}
      </nav>
    </header>
  );
};

