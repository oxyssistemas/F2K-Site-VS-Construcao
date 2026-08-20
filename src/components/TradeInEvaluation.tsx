import React, { useState } from 'react';
import { 
  Car as CarIcon, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  DollarSign, 
  Clock, 
  Camera,
  Check,
  Send
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TradeInFormData } from '../types';
import { formatBRL, getWhatsAppLink } from '../utils/formatters';

export const TradeInEvaluation: React.FC = () => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<TradeInFormData>({
    brand: '',
    model: '',
    year: 2022,
    km: 35000,
    transmission: 'Automático',
    fuel: 'Flex',
    condition: 'Excelente',
    hasArmor: false,
    plateEnd: '0',
    ownerName: '',
    phone: '',
    email: '',
    city: 'Londrina - PR',
    notes: ''
  });

  const [isCompleted, setIsCompleted] = useState(false);

  // Estimation calculation helper
  const calculateEstimatedValue = () => {
    // Base heuristic for user preview
    const baseVal = 120000;
    const yearDiff = (2026 - formData.year) * 8000;
    const kmPenalty = (formData.km / 10000) * 2500;
    const conditionMultiplier = formData.condition === 'Excelente' ? 1.05 : formData.condition === 'Bom' ? 0.98 : 0.90;
    
    const calculated = Math.max(35000, (baseVal - yearDiff - kmPenalty) * conditionMultiplier);
    const minVal = Math.round(calculated * 0.94);
    const maxVal = Math.round(calculated * 1.06);

    return { minVal, maxVal };
  };

  const { minVal, maxVal } = calculateEstimatedValue();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    setIsCompleted(true);

    const message = `*Avaliação de Veículo para Venda/Troca F2K*\n\n` +
      `🚗 *Carro:* ${formData.brand} ${formData.model} (${formData.year})\n` +
      `📊 *Quilometragem:* ${formData.km.toLocaleString('pt-BR')} km\n` +
      `⚙️ *Câmbio / Combustível:* ${formData.transmission} | ${formData.fuel}\n` +
      `🛡️ *Blindado:* ${formData.hasArmor ? 'Sim' : 'Não'}\n` +
      `✨ *Estado Geral:* ${formData.condition}\n` +
      `🔢 *Final da Placa:* ${formData.plateEnd}\n\n` +
      `👤 *Proprietário:* ${formData.ownerName}\n` +
      `📱 *Telefone:* ${formData.phone}\n` +
      `📍 *Cidade:* ${formData.city}\n` +
      (formData.notes ? `📝 *Obs:* ${formData.notes}\n` : '') +
      `\n_Gostaria de agendar uma vistoria ou receber a proposta formal da F2K._`;

    setTimeout(() => {
      window.open(getWhatsAppLink(message), '_blank');
    }, 800);
  };

  return (
    <section id="avaliacao" className="py-16 bg-[#050505] text-white relative border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-red-600/10 border border-red-600/20 text-xs font-bold text-red-500 uppercase tracking-[0.2em] mb-3">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Avaliação Justa & Pagamento Imediato</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter italic">
            VENDA OU TROQUE SEU VEÍCULO
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 font-normal">
            Compramos o seu seminovo à vista via PIX no mesmo dia ou usamos como entrada no seu próximo carro com a melhor avaliação do mercado.
          </p>
        </div>

        {/* Wizard Container */}
        <div className="max-w-4xl mx-auto bg-[#0d0d0d] rounded-sm border border-white/10 p-6 sm:p-10 shadow-2xl">
          
          {/* Step Progress Bar */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${step >= 1 ? 'text-red-500' : 'text-gray-600'}`}>
              <span className={`w-6 h-6 rounded-sm flex items-center justify-center text-xs font-mono ${step >= 1 ? 'bg-red-600 text-white' : 'bg-[#151515] text-gray-500'}`}>
                1
              </span>
              <span className="hidden sm:inline">Dados do Veículo</span>
            </div>

            <div className="h-0.5 flex-1 mx-4 bg-[#151515]">
              <div className={`h-full bg-red-600 transition-all ${step === 1 ? 'w-0' : step === 2 ? 'w-1/2' : 'w-full'}`} />
            </div>

            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${step >= 2 ? 'text-red-500' : 'text-gray-600'}`}>
              <span className={`w-6 h-6 rounded-sm flex items-center justify-center text-xs font-mono ${step >= 2 ? 'bg-red-600 text-white' : 'bg-[#151515] text-gray-500'}`}>
                2
              </span>
              <span className="hidden sm:inline">Estado & Conservação</span>
            </div>

            <div className="h-0.5 flex-1 mx-4 bg-[#151515]">
              <div className={`h-full bg-red-600 transition-all ${step === 3 ? 'w-full' : 'w-0'}`} />
            </div>

            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${step === 3 ? 'text-red-500' : 'text-gray-600'}`}>
              <span className={`w-6 h-6 rounded-sm flex items-center justify-center text-xs font-mono ${step === 3 ? 'bg-red-600 text-white' : 'bg-[#151515] text-gray-500'}`}>
                3
              </span>
              <span className="hidden sm:inline">Contato & Proposta</span>
            </div>
          </div>

          {/* Form Steps */}
          <form onSubmit={handleSubmit}>
            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
                  <CarIcon className="w-4 h-4 text-red-500" />
                  <span>Informações Básicas do seu Carro</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Marca (ex: Toyota, BMW, Honda) *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Jeep"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full bg-[#151515] border border-white/10 rounded-sm px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600 uppercase"
                      id="trade-in-brand"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Modelo e Versão *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Compass Longitude 1.3 Turbo"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full bg-[#151515] border border-white/10 rounded-sm px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600 uppercase"
                      id="trade-in-model"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Ano de Fabricação</label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                      className="w-full bg-[#151515] border border-white/10 rounded-sm px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600 uppercase"
                      id="trade-in-year"
                    >
                      {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015].map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Quilometragem Atual (KM)</label>
                    <input
                      type="number"
                      step="1000"
                      value={formData.km}
                      onChange={(e) => setFormData({ ...formData, km: Number(e.target.value) })}
                      className="w-full bg-[#151515] border border-white/10 rounded-sm px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600 font-mono"
                      id="trade-in-km"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Câmbio</label>
                    <select
                      value={formData.transmission}
                      onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                      className="w-full bg-[#151515] border border-white/10 rounded-sm px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600 uppercase"
                      id="trade-in-transmission"
                    >
                      <option value="Automático">Automático</option>
                      <option value="Manual">Manual</option>
                      <option value="CVT">CVT</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.brand && formData.model) setStep(2);
                    }}
                    disabled={!formData.brand || !formData.model}
                    className="py-3 px-6 rounded-sm bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white font-bold uppercase italic text-xs tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-red-950/40"
                    id="tradein-next-1"
                  >
                    <span>Avançar para Conservação</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-red-500" />
                  <span>Estado Geral e Conservação</span>
                </h3>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">Como você avalia o estado geral do veículo?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(['Excelente', 'Bom', 'Regular'] as const).map((cond) => (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => setFormData({ ...formData, condition: cond })}
                        className={`p-4 rounded-sm border text-left transition-all ${
                          formData.condition === cond 
                            ? 'bg-[#151515] border-red-600 text-white shadow-lg' 
                            : 'bg-[#151515] border-white/5 text-gray-400 hover:border-white/20'
                        }`}
                      >
                        <div className="font-bold uppercase italic text-xs text-white flex items-center justify-between">
                          <span>{cond}</span>
                          {formData.condition === cond && <Check className="w-4 h-4 text-red-500" />}
                        </div>
                        <p className="text-[11px] text-gray-400 mt-1">
                          {cond === 'Excelente' && 'Sem detalhes na lataria, revisões em dia, pneus novos'}
                          {cond === 'Bom' && 'Pequenos detalhes de uso normal, mecânica 100%'}
                          {cond === 'Regular' && 'Necessita pequenos reparos estéticos ou revisão'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Possui Blindagem?</label>
                    <select
                      value={formData.hasArmor ? 'sim' : 'nao'}
                      onChange={(e) => setFormData({ ...formData, hasArmor: e.target.value === 'sim' })}
                      className="w-full bg-[#151515] border border-white/10 rounded-sm px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600 uppercase"
                    >
                      <option value="nao">Não é Blindado</option>
                      <option value="sim">Sim, possui Blindagem Nível III-A</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Final da Placa</label>
                    <input
                      type="text"
                      maxLength={1}
                      value={formData.plateEnd}
                      onChange={(e) => setFormData({ ...formData, plateEnd: e.target.value })}
                      placeholder="Ex: 5"
                      className="w-full bg-[#151515] border border-white/10 rounded-sm px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="py-2.5 px-5 rounded-sm bg-[#151515] hover:bg-[#202020] text-gray-300 font-bold uppercase text-xs transition-colors border border-white/10"
                  >
                    Voltar
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="py-3 px-6 rounded-sm bg-red-600 hover:bg-red-700 text-white font-bold uppercase italic text-xs tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-red-950/40"
                    id="tradein-next-2"
                  >
                    <span>Avançar para Contato</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-6 animate-fadeIn">
                {/* Resumo do Veículo Informado */}
                <div className="p-4 rounded-sm bg-[#151515] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500 block">
                      Veículo para Avaliação F2K
                    </span>
                    <div className="text-base font-bold text-white mt-0.5">
                      {formData.brand && formData.model ? `${formData.brand} ${formData.model} (${formData.year})` : 'Veículo Informado'}
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {formData.km.toLocaleString('pt-BR')} km • Câmbio {formData.transmission} • Estado {formData.condition}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-xs text-emerald-400 font-bold block">Laudo & Vistoria</span>
                    <span className="text-[10px] text-gray-400 font-mono">Avaliação individual</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">Seus Dados de Contato para Envio da Proposta</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Seu Nome Completo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Nome completo do proprietário"
                        value={formData.ownerName}
                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                        className="w-full bg-[#151515] border border-white/10 rounded-sm px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                        id="tradein-owner-name"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">WhatsApp / Telefone *</label>
                      <input
                        type="tel"
                        required
                        placeholder="(43) 99999-9999"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-[#151515] border border-white/10 rounded-sm px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                        id="tradein-phone"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">E-mail (Opcional)</label>
                      <input
                        type="email"
                        placeholder="seuemail@exemplo.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full bg-[#151515] border border-white/10 rounded-sm px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">Cidade / Estado</label>
                      <input
                        type="text"
                        placeholder="Londrina - PR ou sua cidade"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full bg-[#151515] border border-white/10 rounded-sm px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="py-2.5 px-5 rounded-sm bg-[#151515] hover:bg-[#202020] text-gray-300 font-bold uppercase text-xs transition-colors border border-white/10"
                  >
                    Voltar
                  </button>

                  <button
                    type="submit"
                    className="py-3.5 px-6 rounded-sm bg-red-600 hover:bg-red-700 text-white font-bold uppercase italic text-xs tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-red-950/50 active:scale-95"
                    id="tradein-submit-btn"
                  >
                    <Send className="w-4 h-4" />
                    <span>Enviar para Avaliador F2K (WhatsApp)</span>
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Differentiators */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10 text-xs text-gray-400 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
              <span>Pagamento no PIX no mesmo dia</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
              <span>Sem taxa de consignação oculta</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
              <span>Cuidamos de toda a transferência</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};

