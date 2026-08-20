import React from 'react';
import { 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  Facebook, 
  Youtube, 
  ArrowUp,
  Car as CarIcon,
  CheckCircle2
} from 'lucide-react';
import { STORE_INFO } from '../data/reviews';
import { F2KLogo } from './F2KLogo';

interface FooterProps {
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#050505] text-gray-400 border-t border-white/10 text-xs">
      {/* Top badges bar */}
      <div className="border-b border-white/5 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-2">
            <span className="font-bold text-white uppercase tracking-wider block">Laudo Cautelar</span>
            <span className="text-[11px] text-gray-500 font-mono">100% dos carros periciados</span>
          </div>
          <div className="p-2 border-l border-white/10">
            <span className="font-bold text-white uppercase tracking-wider block">Garantia F2K</span>
            <span className="text-[11px] text-gray-500 font-mono">Até 24 meses de tranquilidade</span>
          </div>
          <div className="p-2 md:border-l border-white/10">
            <span className="font-bold text-white uppercase tracking-wider block">Entrega Segura</span>
            <span className="text-[11px] text-gray-500 font-mono">Em todo o território nacional</span>
          </div>
          <div className="p-2 border-l border-white/10">
            <span className="font-bold text-white uppercase tracking-wider block">Melhor Avaliação</span>
            <span className="text-[11px] text-gray-500 font-mono">Troca com troco e PIX na hora</span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        
        {/* Brand Col */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <F2KLogo size="lg" />
          </div>

          <p className="text-xs text-gray-400 max-w-sm leading-relaxed font-normal">
            A F2K MOTORS é referência em comercialização de seminovos de alto padrão, esportivos e utilitários selecionados com perícia minuciosa e garantia de procedência.
          </p>

          <div className="pt-2 text-gray-400 text-[11px] font-mono">
            <p className="text-white font-medium">{STORE_INFO.address}</p>
            <p className="mt-0.5 text-gray-500">{STORE_INFO.city} • Atendimento Presencial & Online</p>
          </div>
        </div>

        {/* Quick Nav */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-3">Navegação</h4>
          <ul className="space-y-2">
            <li>
              <button onClick={() => onNavigate('estoque')} className="hover:text-red-500 transition-colors uppercase tracking-wider text-[11px]">
                Estoque Completo
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('simulador')} className="hover:text-red-500 transition-colors uppercase tracking-wider text-[11px]">
                Simulador de Financiamento
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('avaliacao')} className="hover:text-red-500 transition-colors uppercase tracking-wider text-[11px]">
                Avaliação de Usado (Troca)
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('sobre')} className="hover:text-red-500 transition-colors uppercase tracking-wider text-[11px]">
                Diferenciais & Garantia
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('contato')} className="hover:text-red-500 transition-colors uppercase tracking-wider text-[11px]">
                Showroom & Endereço
              </button>
            </li>
          </ul>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-3">Categorias</h4>
          <ul className="space-y-2 text-gray-400">
            <li><button onClick={() => onNavigate('estoque')} className="hover:text-red-500 uppercase tracking-wider text-[11px]">SUVs Premium</button></li>
            <li><button onClick={() => onNavigate('estoque')} className="hover:text-red-500 uppercase tracking-wider text-[11px]">Sedans Executivos</button></li>
            <li><button onClick={() => onNavigate('estoque')} className="hover:text-red-500 uppercase tracking-wider text-[11px]">Superesportivos</button></li>
            <li><button onClick={() => onNavigate('estoque')} className="hover:text-red-500 uppercase tracking-wider text-[11px]">Híbridos e Elétricos</button></li>
            <li><button onClick={() => onNavigate('estoque')} className="hover:text-red-500 uppercase tracking-wider text-[11px]">Picapes 4x4 Diesel</button></li>
          </ul>
        </div>

        {/* Contacts */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-3">Atendimento</h4>
          <div className="space-y-2 text-gray-400">
            <p className="flex items-center gap-1.5 text-white font-semibold font-mono">
              <Phone className="w-3.5 h-3.5 text-red-500" />
              <span>{STORE_INFO.phone}</span>
            </p>
            <p className="flex items-center gap-1.5 text-emerald-400 font-semibold font-mono">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{STORE_INFO.displayWhatsapp}</span>
            </p>
            <p className="text-[11px] text-gray-500 pt-1 font-mono">{STORE_INFO.email}</p>
          </div>
        </div>

      </div>

      {/* Bottom copyright & Back to top */}
      <div className="border-t border-white/5 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-center sm:text-left text-xs font-mono">
            © {new Date().getFullYear()} F2K Veículos. Todos os direitos reservados.
          </p>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 font-semibold transition-colors uppercase tracking-wider"
            id="back-to-top-btn"
          >
            <span>Voltar ao Início</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};

