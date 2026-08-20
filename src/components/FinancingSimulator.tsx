import React, { useState, useEffect } from 'react';
import { 
  BadgePercent, 
  CheckCircle2, 
  Send, 
  Sparkles, 
  Building2, 
  ShieldCheck, 
  Info,
  Car as CarIcon,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Car } from '../types';
import { CARS_INVENTORY } from '../data/cars';
import { calculateFinancing, formatBRL, getWhatsAppLink } from '../utils/formatters';

interface FinancingSimulatorProps {
  initialCar?: Car | null;
  cars?: Car[];
  onSelectCarToView?: (car: Car) => void;
}

export const FinancingSimulator: React.FC<FinancingSimulatorProps> = ({
  initialCar,
  cars = [],
  onSelectCarToView
}) => {
  const sourceCars = cars && cars.length > 0 ? cars : CARS_INVENTORY;
  const [selectedCarId, setSelectedCarId] = useState<string>(initialCar?.id || (sourceCars[0]?.id ?? 'custom'));
  const [customPrice, setCustomPrice] = useState<number>(initialCar?.price || (sourceCars[0]?.price ?? 150000));
  const [isCustomMode, setIsCustomMode] = useState<boolean>(!initialCar && sourceCars.length === 0);
  
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(30);
  const [installments, setInstallments] = useState<number>(48);
  const [interestRate, setInterestRate] = useState<number>(1.39);

  // Form states for pre-approval proposal
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (initialCar) {
      setSelectedCarId(initialCar.id);
      setCustomPrice(initialCar.price);
      setIsCustomMode(false);
    } else if (sourceCars.length > 0 && (!selectedCarId || selectedCarId === 'custom') && !isCustomMode) {
      setSelectedCarId(sourceCars[0].id);
      setCustomPrice(sourceCars[0].price);
    }
  }, [initialCar, sourceCars]);

  const currentCar = sourceCars.find(c => c.id === selectedCarId);
  const activePrice = (isCustomMode || !currentCar) ? customPrice : currentCar.price;

  const simulation = calculateFinancing(activePrice, downPaymentPercent, installments, interestRate);

  const handleCarSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'custom') {
      setIsCustomMode(true);
    } else {
      setIsCustomMode(false);
      setSelectedCarId(val);
      const found = sourceCars.find(c => c.id === val);
      if (found) setCustomPrice(found.price);
    }
  };

  const handleProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 }
    });

    setIsSubmitted(true);

    const carName = isCustomMode ? 'Valor Personalizado' : `${currentCar?.brand} ${currentCar?.model} (${currentCar?.version})`;
    const text = `*Simulação de Financiamento F2K*\n\n` +
      `🚗 *Veículo:* ${carName}\n` +
      `💰 *Valor do Carro:* ${formatBRL(activePrice)}\n` +
      `💵 *Entrada (${downPaymentPercent}%):* ${formatBRL(simulation.downPayment)}\n` +
      `📅 *Prazo:* ${installments}x de ${formatBRL(simulation.monthlyInstallment)}\n\n` +
      `👤 *Cliente:* ${fullName}\n` +
      `📱 *Telefone:* ${phone}\n` +
      (cpf ? `📄 *CPF:* ${cpf}\n` : '') +
      (monthlyIncome ? `💼 *Renda Aprox:* R$ ${monthlyIncome}\n` : '') +
      `\n_Gostaria de dar continuidade na análise bancária e aprovação cadastral._`;

    setTimeout(() => {
      window.open(getWhatsAppLink(text), '_blank');
    }, 800);
  };

  const bankRates = [
    { bank: 'Santander Auto', rate: '1.29% a.m.', bestFor: 'Melhor taxa para Score Alto' },
    { bank: 'Itaú Financiamentos', rate: '1.35% a.m.', bestFor: 'Aprovação Rápida Digital' },
    { bank: 'BV Financeira', rate: '1.39% a.m.', bestFor: 'Flexibilidade de Entrada' },
    { bank: 'Bradesco Auto', rate: '1.42% a.m.', bestFor: 'Taxas para Correntistas' }
  ];

  return (
    <section id="simulador" className="py-16 bg-[#050505] text-white relative border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-red-600/10 border border-red-600/20 text-xs font-bold text-red-500 uppercase tracking-[0.2em] mb-3">
            <BadgePercent className="w-3.5 h-3.5" />
            <span>Condições Especiais F2K</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter italic">
            SIMULADOR DE FINANCIAMENTO
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 font-normal">
            Calcule sua parcela em tempo real com as melhores taxas do mercado. Trabalhamos com mais de 8 instituições financeiras para garantir sua aprovação rápida.
          </p>
        </div>

        {/* Simulator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Controls Column */}
          <div className="lg:col-span-7 bg-[#0d0d0d] p-6 sm:p-8 rounded-sm border border-white/10 space-y-6 shadow-2xl">
            
            {/* Vehicle Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Escolha o Veículo do Estoque
              </label>
              <select
                value={isCustomMode ? 'custom' : selectedCarId}
                onChange={handleCarSelect}
                className="w-full bg-[#151515] border border-white/10 rounded-sm px-4 py-3 text-xs text-white focus:outline-none focus:border-red-600 uppercase font-medium"
                id="financing-car-select"
              >
                {sourceCars.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.brand} {c.model} - {formatBRL(c.price)} ({c.yearFabrication}/{c.yearModel})
                  </option>
                ))}
                <option value="custom">Outro Valor Personalizado...</option>
              </select>
            </div>

            {/* Custom Price Input if selected */}
            {isCustomMode && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Valor do Veículo (R$)
                </label>
                <input
                  type="number"
                  step="5000"
                  min="30000"
                  max="2000000"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(Number(e.target.value))}
                  className="w-full bg-[#151515] border border-white/10 rounded-sm px-4 py-3 text-xs text-white focus:outline-none focus:border-red-600"
                  id="financing-custom-price-input"
                />
              </div>
            )}

            {/* Down Payment % Slider + Buttons */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-gray-400 mb-2">
                <span className="uppercase tracking-wider">Valor de Entrada</span>
                <span className="text-red-500 text-sm font-black font-mono">
                  {downPaymentPercent}% ({formatBRL(simulation.downPayment)})
                </span>
              </div>

              <input
                type="range"
                min="10"
                max="80"
                step="5"
                value={downPaymentPercent}
                onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                className="w-full accent-red-600 bg-[#151515] h-1.5 rounded-sm cursor-pointer"
                id="financing-downpayment-slider"
              />

              {/* Quick % preset buttons */}
              <div className="grid grid-cols-5 gap-2 mt-3">
                {[10, 20, 30, 40, 50].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => setDownPaymentPercent(pct)}
                    className={`py-1.5 text-xs font-bold uppercase rounded-sm border transition-all ${
                      downPaymentPercent === pct 
                        ? 'bg-red-600 text-white border-red-600' 
                        : 'bg-[#151515] text-gray-400 border-white/10 hover:text-white'
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>

            {/* Installments Selector */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                Prazo de Financiamento
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[12, 24, 36, 48, 60].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setInstallments(num)}
                    className={`py-2.5 text-xs font-bold uppercase italic rounded-sm border transition-all ${
                      installments === num 
                        ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-950/40' 
                        : 'bg-[#151515] text-gray-300 border-white/10 hover:bg-[#202020]'
                    }`}
                    id={`installment-btn-${num}`}
                  >
                    {num}x
                  </button>
                ))}
              </div>
            </div>

            {/* Partner Banks Info */}
            <div className="pt-4 border-t border-white/10">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-red-500" />
                <span>Bancos Parceiros Oficiais F2K</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {bankRates.map((bank, i) => (
                  <div key={i} className="p-2.5 rounded-sm bg-[#151515] border border-white/5 text-center">
                    <span className="font-bold text-white block truncate text-[11px] uppercase">{bank.bank}</span>
                    <span className="text-[10px] text-red-500 font-mono block mt-0.5">{bank.rate}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Result & Proposal Lead Card */}
          <div className="lg:col-span-5 bg-[#0d0d0d] p-6 sm:p-8 rounded-sm border border-white/10 shadow-2xl space-y-6">
            
            {/* Calculation Result */}
            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 block">
                Resultado da Simulação
              </span>
              
              <div className="mt-3 p-5 rounded-sm bg-[#151515] border border-red-600/30 text-center">
                <span className="text-xs text-gray-300 uppercase tracking-wider">Parcela mensal estimada em {installments}x</span>
                <div className="text-3xl sm:text-4xl font-black text-white italic tracking-tight mt-1">
                  {formatBRL(simulation.monthlyInstallment)}
                </div>
                <span className="text-[11px] text-red-500 font-medium mt-1 block">
                  Com entrada de {formatBRL(simulation.downPayment)} ({downPaymentPercent}%)
                </span>
              </div>

              {/* Financial Breakdown Table */}
              <div className="space-y-2 mt-4 text-xs divide-y divide-white/5 font-mono">
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-400 font-sans">Valor Total do Carro:</span>
                  <span className="font-semibold text-white">{formatBRL(activePrice)}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-400 font-sans">Saldo Financiado:</span>
                  <span className="font-semibold text-white">{formatBRL(activePrice - simulation.downPayment)}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-400 font-sans">Taxa Média Estimada:</span>
                  <span className="font-semibold text-red-500">{interestRate}% a.m.</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-gray-400 font-sans">Estimativa IOF:</span>
                  <span className="font-semibold text-gray-300">{formatBRL(simulation.estimatedIOF)}</span>
                </div>
              </div>
            </div>

            {/* Proposal Lead Form */}
            <form onSubmit={handleProposalSubmit} className="pt-4 border-t border-white/10 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-red-500" />
                <span>Solicitar Pré-Aprovação Sem Compromisso</span>
              </h4>

              <div>
                <input
                  type="text"
                  placeholder="Seu Nome Completo *"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#151515] border border-white/10 rounded-sm px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
                  id="financing-name-input"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="tel"
                  placeholder="WhatsApp / Celular *"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#151515] border border-white/10 rounded-sm px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
                  id="financing-phone-input"
                />
                <input
                  type="text"
                  placeholder="CPF (para score)"
                  value={cpf}
                  onChange={(e) => setCpf(e.target.value)}
                  className="w-full bg-[#151515] border border-white/10 rounded-sm px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-600"
                  id="financing-cpf-input"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-sm bg-red-600 hover:bg-red-700 text-white font-bold uppercase italic text-xs tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-950/50 active:scale-95 mt-2"
                id="financing-submit-proposal-btn"
              >
                <Send className="w-4 h-4" />
                <span>Enviar Simulação para Análise Imediata</span>
              </button>

              <p className="text-[10px] text-gray-500 text-center">
                Seus dados estão protegidos pela LGPD. Não cobramos taxas antecipadas.
              </p>
            </form>

          </div>

        </div>

      </div>
    </section>
  );
};

