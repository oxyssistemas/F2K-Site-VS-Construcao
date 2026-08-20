import React, { useState } from 'react';
import { MessageCircle, X, Sparkles } from 'lucide-react';
import { getWhatsAppLink } from '../utils/formatters';
import { STORE_INFO } from '../data/reviews';

export const FloatingWhatsApp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      
      {/* Floating Chat Popover */}
      {isOpen && (
        <div className="mb-3 w-72 sm:w-80 bg-[#0d0d0d] border border-white/15 rounded-sm shadow-2xl overflow-hidden text-white animate-fadeIn">
          <div className="bg-red-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Consultor Online F2K</h4>
                <p className="text-[10px] text-white/80 font-mono">Tempo de resposta: ~2 min</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 space-y-3 bg-[#050505]">
            <div className="bg-[#151515] p-3 rounded-sm border border-white/10 text-xs text-gray-300">
              Olá! 👋 Seja bem-vindo à <span className="text-red-500 font-bold">F2K MOTORS</span>. Em que posso te ajudar hoje?
            </div>

            <div className="space-y-1.5 pt-1">
              <a
                href={getWhatsAppLink('Olá! Gostaria de receber a lista atualizada de carros do estoque.')}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2 rounded-sm bg-[#151515] hover:bg-[#1a1a1a] text-xs text-gray-200 hover:text-white border border-white/5 transition-colors"
              >
                🚗 Ver opções de carros no estoque
              </a>
              <a
                href={getWhatsAppLink('Olá! Gostaria de simular as taxas de financiamento.')}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2 rounded-sm bg-[#151515] hover:bg-[#1a1a1a] text-xs text-gray-200 hover:text-white border border-white/5 transition-colors"
              >
                💰 Simular financiamento ou taxas
              </a>
              <a
                href={getWhatsAppLink('Olá! Quero saber quanto vocês pagam no meu carro usado.')}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-2 rounded-sm bg-[#151515] hover:bg-[#1a1a1a] text-xs text-gray-200 hover:text-white border border-white/5 transition-colors"
              >
                🔄 Avaliar meu carro usado na troca
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-2xl shadow-red-600/40 transition-all hover:scale-105 active:scale-95 border border-white/20"
        title="Falar no WhatsApp"
        id="floating-whatsapp-btn"
      >
        <MessageCircle className="w-7 h-7 fill-white" />
        
        {/* Ping status ring */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-red-400 border-2 border-zinc-950 animate-ping" />
        <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-red-400 border-2 border-zinc-950" />
      </button>

    </div>
  );
};

