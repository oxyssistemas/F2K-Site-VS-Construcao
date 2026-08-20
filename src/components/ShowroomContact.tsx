import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  MessageCircle, 
  Send, 
  Navigation, 
  Sparkles,
  Building,
  Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { STORE_INFO } from '../data/reviews';
import { getWhatsAppLink } from '../utils/formatters';
import { submitLeadForm } from '../lib/supabase';
import { sanitizeTextInput, sanitizePhone, safeOpenUrl, checkActionRateLimit } from '../utils/security';

export const ShowroomContact: React.FC = () => {
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorInterest, setVisitorInterest] = useState('Comprar um veículo do estoque');
  const [visitorDate, setVisitorDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSent, setIsSent] = useState(false);
  const [rateLimitWarning, setRateLimitWarning] = useState<string | null>(null);

  const handleVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Verificação de Rate Limit (prevenção contra spam bots)
    const rateCheck = checkActionRateLimit('showroom_contact', 3, 60);
    if (!rateCheck.allowed) {
      setRateLimitWarning(`Por segurança, aguarde ${rateCheck.retryAfterSeconds}s antes de enviar outra solicitação.`);
      return;
    }
    setRateLimitWarning(null);

    // Sanitização de entradas do usuário
    const cleanName = sanitizeTextInput(visitorName, 80);
    const cleanPhone = sanitizePhone(visitorPhone);
    const cleanInterest = sanitizeTextInput(visitorInterest, 120);
    const cleanDate = sanitizeTextInput(visitorDate, 20);

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 }
    });
    setIsSent(true);

    // Salvar contato/visita no Supabase com dados sanitizados
    submitLeadForm({
      form_type: 'contato_direto',
      customer_name: cleanName,
      customer_phone: cleanPhone,
      data: {
        interest: cleanInterest,
        preferredDate: cleanDate
      }
    }).catch(console.error);

    const msg = `*Agendamento de Visita ao Showroom F2K*\n\n` +
      `👤 *Nome:* ${cleanName}\n` +
      `📱 *Telefone:* ${cleanPhone}\n` +
      `🎯 *Interesse:* ${cleanInterest}\n` +
      `📅 *Data Prevista:* ${cleanDate}\n` +
      `📍 *Local:* ${STORE_INFO.address}\n\n` +
      `_Gostaria de ser recebido por um consultor técnico F2K._`;

    setTimeout(() => {
      safeOpenUrl(getWhatsAppLink(msg));
      setIsSent(false);
    }, 800);
  };

  const openGoogleMaps = () => {
    safeOpenUrl(STORE_INFO.googleMapsUrl);
  };

  return (
    <section id="contato" className="py-16 lg:py-24 bg-[#050505] text-white border-b border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-red-600/10 border border-red-600/20 text-xs font-bold text-red-500 uppercase tracking-[0.2em] mb-3">
            <Building className="w-3.5 h-3.5" />
            <span>Showroom F2K</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter italic">
            VENHA CONHECER NOSSA ESTRUTURA
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 font-normal">
            Desfrute de uma experiência exclusiva em nosso showroom climatizado com café barista, espaço lounge e manobrista cortesia.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Info Card & Hours */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0d0d0d] p-6 sm:p-8 rounded-sm border border-white/10 space-y-6">
              
              {/* Address item */}
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-sm bg-[#151515] text-red-500 border border-white/10 shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Endereço do Showroom</h4>
                  <p className="text-sm font-bold text-white mt-1 leading-snug">{STORE_INFO.address}</p>
                  <p className="text-xs text-gray-400 mt-0.5 font-mono">Londrina - PR • Estacionamento no local</p>
                  
                  <button
                    onClick={openGoogleMaps}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 hover:text-red-400 mt-2.5 uppercase tracking-wider"
                    id="open-map-btn"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Como chegar pelo Waze / Maps</span>
                  </button>
                </div>
              </div>

              {/* Phone & WhatsApp */}
              <div className="flex items-start gap-4 pt-4 border-t border-white/5">
                <div className="p-3 rounded-sm bg-[#151515] text-red-500 border border-white/10 shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Central Telefônica</h4>
                  <p className="text-sm font-bold text-white mt-1 font-mono">{STORE_INFO.phone}</p>
                  <p className="text-xs text-emerald-400 mt-0.5 font-semibold font-mono">WhatsApp: {STORE_INFO.displayWhatsapp}</p>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="flex items-start gap-4 pt-4 border-t border-white/5">
                <div className="p-3 rounded-sm bg-[#151515] text-red-500 border border-white/10 shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="space-y-1 text-xs">
                  <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Horário de Funcionamento</h4>
                  <p className="text-gray-300 font-mono">{STORE_INFO.openingHours.weekdays}</p>
                  <p className="text-gray-300 font-mono">{STORE_INFO.openingHours.saturdays}</p>
                  <p className="text-red-500 font-semibold font-mono">{STORE_INFO.openingHours.sundays}</p>
                </div>
              </div>

            </div>

            {/* Direct WhatsApp Box */}
            <div className="p-6 rounded-sm bg-[#0d0d0d] border border-emerald-500/30 flex items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-white uppercase tracking-tight">Atendimento Online Imediato</h4>
                <p className="text-xs text-gray-400 mt-0.5">Tire dúvidas técnicas ou consulte propostas em tempo real</p>
              </div>
              <a
                href={getWhatsAppLink('Olá! Gostaria de falar com um consultor da F2K MOTORS.')}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-4 rounded-sm bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 flex items-center gap-1.5 active:scale-95 transition-all uppercase tracking-wider"
                id="contact-whatsapp-direct"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Conversar</span>
              </a>
            </div>
          </div>

          {/* Schedule Showroom Visit Form */}
          <div className="lg:col-span-7 bg-[#0d0d0d] p-6 sm:p-8 rounded-sm border border-white/10">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2 uppercase tracking-tight">
              <Calendar className="w-5 h-5 text-red-500" />
              <span>Avise sua Visita com Antecedência</span>
            </h3>
            <p className="text-xs text-gray-400 mb-6 font-normal">
              Ao agendar sua visita, preparamos o veículo de seu interesse com antecedência no nosso showroom VIP.
            </p>

            <form onSubmit={handleVisitSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Seu Nome *</label>
                  <input
                    type="text"
                    required
                    placeholder="Seu nome completo"
                    value={visitorName}
                    onChange={(e) => setVisitorName(e.target.value)}
                    className="w-full bg-[#151515] border border-white/10 rounded-sm px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                    id="visit-name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">WhatsApp / Celular *</label>
                  <input
                    type="tel"
                    required
                    placeholder="(43) 99999-9999"
                    value={visitorPhone}
                    onChange={(e) => setVisitorPhone(e.target.value)}
                    className="w-full bg-[#151515] border border-white/10 rounded-sm px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                    id="visit-phone"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Objetivo Principal</label>
                  <select
                    value={visitorInterest}
                    onChange={(e) => setVisitorInterest(e.target.value)}
                    className="w-full bg-[#151515] border border-white/10 rounded-sm px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                  >
                    <option value="Comprar um veículo do estoque">Comprar um veículo do estoque</option>
                    <option value="Trocar meu usado por um do estoque">Trocar meu usado por um do estoque</option>
                    <option value="Vender meu carro à vista">Vender meu carro à vista</option>
                    <option value="Simular Financiamento e Taxas">Simular Financiamento e Taxas</option>
                    <option value="Conhecer o showroom">Conhecer o showroom e café</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">Data Desejada</label>
                  <input
                    type="date"
                    required
                    value={visitorDate}
                    onChange={(e) => setVisitorDate(e.target.value)}
                    className="w-full bg-[#151515] border border-white/10 rounded-sm px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                  />
                </div>
              </div>

              {rateLimitWarning && (
                <div className="p-2.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs">
                  {rateLimitWarning}
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-sm bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 active:scale-95 mt-4"
                id="submit-visit-btn"
              >
                <Send className="w-4 h-4" />
                <span>Confirmar Visita no WhatsApp</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </section>
  );
};

