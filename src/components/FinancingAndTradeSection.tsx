import React, { useState, useEffect } from 'react';
import { 
  BadgePercent, 
  Car as CarIcon, 
  Building2, 
  Send, 
  Sparkles, 
  ShieldCheck, 
  Info, 
  ChevronRight, 
  CheckCircle2, 
  DollarSign, 
  ArrowRight, 
  Check, 
  Clock, 
  RefreshCw,
  Camera,
  Coins
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Car, TradeInFormData } from '../types';
import { CARS_INVENTORY } from '../data/cars';
import { calculateFinancing, formatBRL, getWhatsAppLink } from '../utils/formatters';
import { submitLeadForm } from '../lib/supabase';
import { sanitizeTextInput, sanitizePhone, sanitizeCpf, sanitizeEmail, safeOpenUrl, checkActionRateLimit } from '../utils/security';

interface FinancingAndTradeSectionProps {
  cars?: Car[];
  initialCar?: Car | null;
  initialTab?: 'financing' | 'trade-in';
  onSelectCarToView?: (car: Car) => void;
}

export const FinancingAndTradeSection: React.FC<FinancingAndTradeSectionProps> = ({
  cars = [],
  initialCar,
  initialTab = 'financing',
  onSelectCarToView
}) => {
  const [activeTab, setActiveTab] = useState<'financing' | 'trade-in'>(initialTab);

  const availableCars = cars && cars.length > 0 ? cars : CARS_INVENTORY;

  // ==========================================
  // FINANCING SIMULATOR STATE
  // ==========================================
  const [selectedCarId, setSelectedCarId] = useState<string>(initialCar?.id || (availableCars[0]?.id ?? 'custom'));
  const [customPrice, setCustomPrice] = useState<number>(initialCar?.price || (availableCars[0]?.price ?? 150000));
  const [isCustomMode, setIsCustomMode] = useState<boolean>(!initialCar && availableCars.length === 0);
  
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(30);
  const [installments, setInstallments] = useState<number>(48);
  const [interestRate, setInterestRate] = useState<number>(1.39);

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [isFinancingSubmitted, setIsFinancingSubmitted] = useState(false);
  const [financingRateLimitWarn, setFinancingRateLimitWarn] = useState<string | null>(null);
  const [tradeRateLimitWarn, setTradeRateLimitWarn] = useState<string | null>(null);

  // Sync initialCar if changed
  useEffect(() => {
    if (initialCar) {
      setSelectedCarId(initialCar.id);
      setCustomPrice(initialCar.price);
      setIsCustomMode(false);
      setActiveTab('financing');
    } else if (availableCars.length > 0 && (!selectedCarId || selectedCarId === 'custom') && !isCustomMode) {
      setSelectedCarId(availableCars[0].id);
      setCustomPrice(availableCars[0].price);
    }
  }, [initialCar, cars]);

  // Sync initialTab if changed by parent navigation
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const currentCar = availableCars.find(c => c.id === selectedCarId);
  const activePrice = (isCustomMode || !currentCar) ? customPrice : currentCar.price;
  const simulation = calculateFinancing(activePrice, downPaymentPercent, installments, interestRate);

  const handleCarSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'custom') {
      setIsCustomMode(true);
    } else {
      setIsCustomMode(false);
      setSelectedCarId(val);
      const found = availableCars.find(c => c.id === val);
      if (found) setCustomPrice(found.price);
    }
  };

  const handleFinancingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;

    // Verificação de Rate Limit
    const rateCheck = checkActionRateLimit('financing_form', 3, 60);
    if (!rateCheck.allowed) {
      setFinancingRateLimitWarn(`Por segurança, aguarde ${rateCheck.retryAfterSeconds}s antes de enviar nova simulação.`);
      return;
    }
    setFinancingRateLimitWarn(null);

    // Sanitização de entradas do usuário
    const cleanFullName = sanitizeTextInput(fullName, 80);
    const cleanPhone = sanitizePhone(phone);
    const cleanCpf = sanitizeCpf(cpf);
    const cleanIncome = sanitizeTextInput(monthlyIncome, 30);

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.7 }
    });

    setIsFinancingSubmitted(true);

    const carName = isCustomMode 
      ? 'Valor Personalizado' 
      : `${currentCar?.brand} ${currentCar?.model} ${currentCar?.version ? `(${currentCar?.version})` : ''} [${currentCar?.yearFabrication}/${currentCar?.yearModel}]`;

    // Salvar proposta de financiamento no Supabase com dados higienizados
    submitLeadForm({
      form_type: 'financiamento',
      customer_name: cleanFullName,
      customer_phone: cleanPhone,
      car_id: isCustomMode ? undefined : currentCar?.id,
      car_name: carName,
      data: {
        carPrice: activePrice,
        downPayment: simulation.downPayment,
        downPaymentPercent,
        installmentsCount: installments,
        monthlyInstallment: simulation.monthlyInstallment,
        interestRate,
        cpf: cleanCpf || undefined,
        monthlyIncome: cleanIncome || undefined,
        carBrand: currentCar?.brand,
        carModel: currentCar?.model,
        carYear: currentCar?.yearFabrication
      }
    }).catch(console.error);

    const text = `*Simulação de Financiamento F2K Motors*\n\n` +
      `🚗 *Veículo Selecionado:* ${carName}\n` +
      `💰 *Valor do Carro:* ${formatBRL(activePrice)}\n` +
      `💵 *Entrada (${downPaymentPercent}%):* ${formatBRL(simulation.downPayment)}\n` +
      `📅 *Financiamento:* ${installments}x de ${formatBRL(simulation.monthlyInstallment)}\n\n` +
      `👤 *Cliente:* ${cleanFullName}\n` +
      `📱 *WhatsApp:* ${cleanPhone}\n` +
      (cleanCpf ? `📄 *CPF:* ${cleanCpf}\n` : '') +
      (cleanIncome ? `💼 *Renda Aprox:* R$ ${cleanIncome}\n` : '') +
      `\n_Gostaria de dar continuidade na análise cadastral e aprovação bancária imediata._`;

    setTimeout(() => {
      safeOpenUrl(getWhatsAppLink(text));
    }, 800);
  };

  const bankRates = [
    { bank: 'Santander Auto', rate: '1.29% a.m.', bestFor: 'Melhor taxa para Score Alto' },
    { bank: 'Itaú Financiamentos', rate: '1.35% a.m.', bestFor: 'Aprovação Rápida Digital' },
    { bank: 'BV Financeira', rate: '1.39% a.m.', bestFor: 'Flexibilidade de Entrada' },
    { bank: 'Bradesco Auto', rate: '1.42% a.m.', bestFor: 'Taxas para Correntistas' }
  ];

  // ==========================================
  // TRADE-IN / SELL VALUATION STATE
  // ==========================================
  const [tradeStep, setTradeStep] = useState<1 | 2 | 3>(1);
  const [tradeFormData, setTradeFormData] = useState<TradeInFormData>({
    brand: '',
    model: '',
    year: 2021,
    km: 45000,
    transmission: 'Automático',
    fuel: 'Flex',
    condition: 'Excelente',
    hasArmor: false,
    plateEnd: '8',
    ownerName: '',
    phone: '',
    email: '',
    city: 'São Paulo - SP',
    notes: ''
  });

  const [isTradeCompleted, setIsTradeCompleted] = useState(false);

  const handleTradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Verificação de Rate Limit
    const rateCheck = checkActionRateLimit('trade_in_form', 3, 60);
    if (!rateCheck.allowed) {
      setTradeRateLimitWarn(`Por segurança, aguarde ${rateCheck.retryAfterSeconds}s antes de enviar nova avaliação.`);
      return;
    }
    setTradeRateLimitWarn(null);

    // Sanitização dos dados
    const cleanOwnerName = sanitizeTextInput(tradeFormData.ownerName, 80);
    const cleanPhone = sanitizePhone(tradeFormData.phone);
    const cleanEmail = sanitizeEmail(tradeFormData.email || '');
    const cleanCity = sanitizeTextInput(tradeFormData.city, 60);
    const cleanBrand = sanitizeTextInput(tradeFormData.brand, 40);
    const cleanModel = sanitizeTextInput(tradeFormData.model, 40);
    const cleanNotes = sanitizeTextInput(tradeFormData.notes, 300);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    setIsTradeCompleted(true);

    // Salvar proposta de avaliação/troca no Supabase com dados sanitizados
    submitLeadForm({
      form_type: 'avaliacao_troca',
      customer_name: cleanOwnerName,
      customer_phone: cleanPhone,
      customer_email: cleanEmail || undefined,
      customer_city: cleanCity,
      data: {
        tradeInBrand: cleanBrand,
        tradeInModel: cleanModel,
        tradeInYear: tradeFormData.year,
        tradeInKm: tradeFormData.km,
        transmission: tradeFormData.transmission,
        fuel: tradeFormData.fuel,
        condition: tradeFormData.condition,
        hasArmor: tradeFormData.hasArmor,
        notes: cleanNotes
      }
    }).catch(console.error);

    const message = `*Avaliação de Veículo para Venda/Troca F2K*\n\n` +
      `🚗 *Carro:* ${cleanBrand} ${cleanModel} (${tradeFormData.year})\n` +
      `📊 *Quilometragem:* ${tradeFormData.km.toLocaleString('pt-BR')} km\n` +
      `⚙️ *Câmbio / Combustível:* ${tradeFormData.transmission} | ${tradeFormData.fuel}\n` +
      `🛡️ *Blindado:* ${tradeFormData.hasArmor ? 'Sim' : 'Não'}\n` +
      `✨ *Estado Geral:* ${tradeFormData.condition}\n\n` +
      `👤 *Proprietário:* ${cleanOwnerName}\n` +
      `📱 *Telefone:* ${cleanPhone}\n` +
      `📍 *Cidade:* ${cleanCity}\n` +
      (cleanNotes ? `📝 *Obs:* ${cleanNotes}\n` : '') +
      `\n_Gostaria de agendar uma vistoria ou receber a proposta formal da F2K._`;

    setTimeout(() => {
      safeOpenUrl(getWhatsAppLink(message));
    }, 800);
  };

  return (
    <section id="simulador" className="py-16 lg:py-24 bg-[#050505] text-white relative border-b border-white/10">
      
      {/* Background Accent Gradients */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/5 rounded-full filter blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/5 rounded-full filter blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-bold text-gray-300 uppercase tracking-widest mb-3 shadow-inner">
            <Coins className="w-3.5 h-3.5 text-[#e50914]" />
            <span>Condições Facilitadas F2K</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="w-1.5 sm:w-2 h-7 sm:h-9 bg-[#e50914] rounded-full shrink-0 shadow-[0_0_14px_rgba(229,9,20,0.85)]" />
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase italic">
              FINANCIAMENTO & AVALIAÇÃO DE VEÍCULOS
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-2 font-normal">
            Escolha o serviço desejado: simule parcelas com as menores taxas do mercado ou avalie seu usado para venda ou troca com PIX imediato.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* MENU SELETOR DE SEÇÃO (Tabs com troca instantânea de formulário) */}
        {/* ========================================================================= */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-[#0f0f0f] border border-white/10 rounded-2xl shadow-2xl" id="financial-service-menu">
            
            {/* Opção 1: Simular Financiamento */}
            <button
              type="button"
              onClick={() => setActiveTab('financing')}
              className={`flex items-center justify-center gap-2.5 py-4 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'financing'
                  ? 'bg-[#e50914] text-white shadow-lg shadow-red-950/60 scale-[1.02] border border-red-400/40'
                  : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/[0.03]'
              }`}
              id="tab-btn-financing"
            >
              <BadgePercent className={`w-4 h-4 ${activeTab === 'financing' ? 'text-white' : 'text-gray-400'}`} />
              <span className="truncate">1. Simular Financiamento</span>
            </button>

            {/* Opção 2: Vender ou Trocar Veículo */}
            <button
              type="button"
              onClick={() => setActiveTab('trade-in')}
              className={`flex items-center justify-center gap-2.5 py-4 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'trade-in'
                  ? 'bg-[#e50914] text-white shadow-lg shadow-red-950/60 scale-[1.02] border border-red-400/40'
                  : 'bg-transparent text-gray-400 hover:text-white hover:bg-white/[0.03]'
              }`}
              id="tab-btn-trade-in"
            >
              <RefreshCw className={`w-4 h-4 ${activeTab === 'trade-in' ? 'text-white' : 'text-gray-400'}`} />
              <span className="truncate">2. Vender / Trocar Meu Carro</span>
            </button>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* FORMULÁRIO 1: SIMULADOR DE FINANCIAMENTO */}
        {/* ========================================================================= */}
        {activeTab === 'financing' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn" id="financing-form-container">
            
            {/* Coluna Esquerda: Controles da Simulação */}
            <div className="lg:col-span-7 bg-[#0d0d0d] p-6 sm:p-8 rounded-2xl border border-white/10 space-y-6 shadow-2xl">
              
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <BadgePercent className="w-5 h-5 text-[#e50914]" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-white">
                    Parâmetros do Financiamento
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  Taxas a partir de 1,29% a.m.
                </span>
              </div>

              {/* 1. Selecionar Carro do Estoque ou Valor Personalizado */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-300">
                    Escolha o Veículo do Showroom
                  </label>
                  {availableCars.length > 0 && (
                    <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                      {availableCars.length} {availableCars.length === 1 ? 'veículo disponível' : 'veículos disponíveis'}
                    </span>
                  )}
                </div>

                <select
                  value={isCustomMode || !selectedCarId || availableCars.length === 0 ? 'custom' : selectedCarId}
                  onChange={handleCarSelect}
                  className="w-full bg-[#161616] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#e50914] cursor-pointer font-medium"
                  id="financing-car-selector"
                >
                  {availableCars.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.brand} {c.model} {c.version ? `(${c.version})` : ''} • {c.yearFabrication}/{c.yearModel} — {formatBRL(c.price)}
                    </option>
                  ))}
                  <option value="custom">✏️ Inserir Valor Personalizado</option>
                </select>

                {/* Live Selected Car Details Card */}
                {!isCustomMode && currentCar && (
                  <div className="mt-3.5 p-3.5 rounded-xl bg-[#111111] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-3.5 relative overflow-hidden group">
                    <div className="w-full sm:w-28 h-20 rounded-lg overflow-hidden bg-black/40 border border-white/10 shrink-0 relative">
                      {currentCar.images && currentCar.images.length > 0 ? (
                        <img 
                          src={currentCar.images[0]} 
                          alt={currentCar.model} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <CarIcon className="w-7 h-7" />
                        </div>
                      )}
                      <span className="absolute bottom-1 right-1 bg-black/80 backdrop-blur-sm text-[9px] font-mono text-gray-300 px-1 rounded">
                        {currentCar.yearFabrication}/{currentCar.yearModel}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-[#e50914]">
                          {currentCar.brand}
                        </span>
                        {currentCar.history?.unicoDono && (
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                            Único Dono
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-white uppercase tracking-tight truncate">
                        {currentCar.model} {currentCar.version && <span className="text-gray-400 font-normal">({currentCar.version})</span>}
                      </h4>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-gray-400 font-mono mt-1">
                        <span>🛣️ {currentCar.mileage.toLocaleString('pt-BR')} km</span>
                        <span>⚙️ {currentCar.transmission}</span>
                        <span>⛽ {currentCar.fuel}</span>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                        <span className="text-xs font-bold font-mono text-white">
                          {formatBRL(currentCar.price)}
                          {currentCar.fipePrice && (
                            <span className="text-[10px] text-gray-500 font-normal ml-1.5">
                              (FIPE: {formatBRL(currentCar.fipePrice)})
                            </span>
                          )}
                        </span>

                        {onSelectCarToView && (
                          <button
                            type="button"
                            onClick={() => onSelectCarToView(currentCar)}
                            className="text-[10px] font-bold text-[#e50914] hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>Ver Detalhes</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {isCustomMode && (
                  <div className="mt-3">
                    <label className="block text-[11px] font-bold text-gray-400 mb-1">
                      Valor Total do Veículo (R$)
                    </label>
                    <input
                      type="number"
                      value={customPrice}
                      onChange={(e) => setCustomPrice(Math.max(10000, Number(e.target.value)))}
                      className="w-full bg-[#161616] border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#e50914] font-mono"
                      step="5000"
                    />
                  </div>
                )}
              </div>

              {/* 2. Entrada (Down Payment) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-300">
                    Valor de Entrada ({downPaymentPercent}%)
                  </label>
                  <span className="text-sm font-mono font-black text-white">
                    {formatBRL(simulation.downPayment)}
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  step="5"
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#e50914]"
                  id="financing-downpayment-range"
                />
                <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1">
                  <span>Mínimo 10% ({formatBRL(activePrice * 0.1)})</span>
                  <span>50%</span>
                  <span>Máximo 80%</span>
                </div>
              </div>

              {/* 3. Prazo em Meses (Parcelas) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2.5">
                  Prazo de Financiamento
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {[12, 24, 36, 48, 60].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setInstallments(term)}
                      className={`py-3 rounded-xl text-xs font-black transition-all border ${
                        installments === term
                          ? 'bg-[#e50914] border-[#e50914] text-white shadow-lg shadow-red-950/50'
                          : 'bg-[#161616] border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                      }`}
                    >
                      {term}x
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Bancos Parceiros Homologados */}
              <div className="pt-4 border-t border-white/10">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Bancos Homologados na F2K:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {bankRates.map((bank) => (
                    <div key={bank.bank} className="p-2.5 rounded-lg bg-[#141414] border border-white/5 text-center">
                      <span className="block text-[11px] font-bold text-white truncate">{bank.bank}</span>
                      <span className="text-[10px] text-emerald-400 font-mono font-bold block">{bank.rate}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Coluna Direita: Resumo do Cálculo + Proposta Rápida */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Card de Resumo das Parcelas */}
              <div className="bg-gradient-to-b from-[#181818] to-[#0f0f0f] p-6 sm:p-7 rounded-2xl border-2 border-[#e50914]/40 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full filter blur-2xl pointer-events-none" />
                
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e50914] block">
                    Resultado da Simulação
                  </span>
                  {!isCustomMode && currentCar && (
                    <span className="text-[10px] font-mono text-gray-300 bg-white/5 px-2 py-0.5 rounded border border-white/10 truncate max-w-[180px]">
                      {currentCar.brand} {currentCar.model}
                    </span>
                  )}
                </div>
                
                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                    {installments}x de {formatBRL(simulation.monthlyInstallment)}
                  </span>
                </div>

                <p className="text-xs text-gray-400 font-medium">
                  Valor: <strong className="text-white">{formatBRL(activePrice)}</strong> • Entrada ({downPaymentPercent}%): <strong className="text-white">{formatBRL(simulation.downPayment)}</strong> • Financiado: <strong className="text-white">{formatBRL(activePrice - simulation.downPayment)}</strong>.
                </p>

                <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-2 gap-3 text-[11px] font-mono text-gray-400">
                  <div>
                    <span className="block text-gray-500">Taxa Estimada:</span>
                    <span className="text-white font-bold">{interestRate}% a.m.</span>
                  </div>
                  <div>
                    <span className="block text-gray-500">1ª Parcela:</span>
                    <span className="text-emerald-400 font-bold">Em até 60 dias</span>
                  </div>
                </div>
              </div>

              {/* Formulário de Pré-Aprovação */}
              <form onSubmit={handleFinancingSubmit} className="bg-[#0d0d0d] p-6 sm:p-7 rounded-2xl border border-white/10 space-y-4 shadow-2xl">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-white mb-1">
                    Solicitar Pré-Aprovação Sem Compromisso
                  </h4>
                  <p className="text-[11px] text-gray-400">
                    Preencha os dados abaixo para receber o retorno dos bancos em menos de 30 minutos via WhatsApp.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Seu nome completo"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#161616] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      WhatsApp / Celular *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#161616] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      CPF (Opcional p/ Score)
                    </label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      className="w-full bg-[#161616] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Renda Mensal Estimada (R$)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 8.500,00"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    className="w-full bg-[#161616] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914]"
                  />
                </div>

                {financingRateLimitWarn && (
                  <div className="p-2.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs">
                    {financingRateLimitWarn}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 bg-[#e50914] hover:bg-red-600 text-white font-black uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-red-950/60 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer mt-2"
                  id="submit-financing-proposal-btn"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar Proposta para o WhatsApp</span>
                </button>

                <p className="text-[10px] text-gray-500 text-center flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Seus dados são protegidos e tratados sob sigilo bancário.</span>
                </p>

              </form>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* FORMULÁRIO 2: AVALIAÇÃO / VENDA / TROCA DE VEÍCULO */}
        {/* ========================================================================= */}
        {activeTab === 'trade-in' && (
          <div className="max-w-4xl mx-auto bg-[#0d0d0d] p-6 sm:p-10 rounded-2xl border border-white/10 shadow-2xl animate-fadeIn" id="trade-in-form-container">
            
            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
              {[
                { num: 1, title: '1. Dados do Carro' },
                { num: 2, title: '2. Estado & Detalhes' },
                { num: 3, title: '3. Proposta & PIX' }
              ].map((s) => (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setTradeStep(s.num as any)}
                  className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                    tradeStep === s.num
                      ? 'text-[#e50914]'
                      : tradeStep > s.num
                      ? 'text-gray-300'
                      : 'text-gray-600'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono ${
                    tradeStep === s.num
                      ? 'bg-[#e50914] text-white font-black'
                      : tradeStep > s.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-800 text-gray-500'
                  }`}>
                    {tradeStep > s.num ? '✓' : s.num}
                  </span>
                  <span className="hidden sm:inline">{s.title}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleTradeSubmit} className="space-y-6">
              
              {/* ETAPA 1: DADOS BÁSICOS DO CARRO */}
              {tradeStep === 1 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                        Marca do Veículo *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: BMW, Toyota, Jeep, Audi..."
                        value={tradeFormData.brand}
                        onChange={(e) => setTradeFormData({ ...tradeFormData, brand: e.target.value })}
                        className="w-full bg-[#161616] border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                        Modelo e Versão *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: 320i M Sport 2.0 Turbo"
                        value={tradeFormData.model}
                        onChange={(e) => setTradeFormData({ ...tradeFormData, model: e.target.value })}
                        className="w-full bg-[#161616] border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                        Ano de Fabricação
                      </label>
                      <select
                        value={tradeFormData.year}
                        onChange={(e) => setTradeFormData({ ...tradeFormData, year: Number(e.target.value) })}
                        className="w-full bg-[#161616] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#e50914] cursor-pointer"
                      >
                        {Array.from({ length: 15 }, (_, i) => 2026 - i).map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                        Quilometragem (KM)
                      </label>
                      <input
                        type="number"
                        placeholder="Ex: 45000"
                        value={tradeFormData.km}
                        onChange={(e) => setTradeFormData({ ...tradeFormData, km: Number(e.target.value) })}
                        className="w-full bg-[#161616] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#e50914] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                        Final da Placa
                      </label>
                      <select
                        value={tradeFormData.plateEnd}
                        onChange={(e) => setTradeFormData({ ...tradeFormData, plateEnd: e.target.value })}
                        className="w-full bg-[#161616] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#e50914] cursor-pointer font-mono"
                      >
                        {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map(digit => (
                          <option key={digit} value={digit}>Final {digit}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setTradeStep(2)}
                      className="px-6 py-3 bg-[#e50914] hover:bg-red-600 text-white font-black uppercase tracking-wider text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer"
                    >
                      <span>Avançar para Etapa 2</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ETAPA 2: ESTADO GERAL & OPCIONAIS */}
              {tradeStep === 2 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                        Câmbio
                      </label>
                      <select
                        value={tradeFormData.transmission}
                        onChange={(e) => setTradeFormData({ ...tradeFormData, transmission: e.target.value })}
                        className="w-full bg-[#161616] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#e50914] cursor-pointer"
                      >
                        <option value="Automático">Automático</option>
                        <option value="Manual">Manual</option>
                        <option value="CVT / Dupla Embreagem">CVT / Dupla Embreagem</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                        Combustível
                      </label>
                      <select
                        value={tradeFormData.fuel}
                        onChange={(e) => setTradeFormData({ ...tradeFormData, fuel: e.target.value })}
                        className="w-full bg-[#161616] border border-white/15 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#e50914] cursor-pointer"
                      >
                        <option value="Flex">Flex (Gasolina/Etanol)</option>
                        <option value="Gasolina">Gasolina</option>
                        <option value="Híbrido">Híbrido</option>
                        <option value="Elétrico">Elétrico 100%</option>
                        <option value="Diesel">Diesel</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-2">
                      Estado de Conservação Geral
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { label: 'Excelente', desc: 'Sem retoques, revisões em dia' },
                        { label: 'Bom', desc: 'Pequenos detalhes normais de uso' },
                        { label: 'Regular', desc: 'Necessita pequenos reparos' }
                      ].map(item => (
                        <button
                          key={item.label}
                          type="button"
                          onClick={() => setTradeFormData({ ...tradeFormData, condition: item.label })}
                          className={`p-3 rounded-xl border text-left transition-all ${
                            tradeFormData.condition === item.label
                              ? 'bg-[#e50914] border-[#e50914] text-white shadow-lg'
                              : 'bg-[#161616] border-white/10 text-gray-400 hover:text-white'
                          }`}
                        >
                          <span className="block font-bold text-xs">{item.label}</span>
                          <span className="text-[10px] opacity-80 block mt-0.5">{item.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-3 p-3 rounded-xl bg-[#161616] border border-white/10 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={tradeFormData.hasArmor}
                        onChange={(e) => setTradeFormData({ ...tradeFormData, hasArmor: e.target.checked })}
                        className="w-4 h-4 rounded border-zinc-700 text-[#e50914] focus:ring-[#e50914]"
                      />
                      <div>
                        <span className="text-xs font-bold text-white block group-hover:text-red-400 transition-colors">
                          Veículo Blindado (Nível III-A)
                        </span>
                        <span className="text-[11px] text-gray-400">
                          Marque se o carro possui blindagem com documentação regularizada no Detran/Exército.
                        </span>
                      </div>
                    </label>
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setTradeStep(1)}
                      className="px-5 py-3 bg-transparent border border-white/20 text-gray-300 font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-white/5 transition-all"
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={() => setTradeStep(3)}
                      className="px-6 py-3 bg-[#e50914] hover:bg-red-600 text-white font-black uppercase tracking-wider text-xs rounded-xl flex items-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer"
                    >
                      <span>Avançar para Envio da Proposta</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ETAPA 3: DADOS DE CONTATO */}
              {tradeStep === 3 && (
                <div className="space-y-6">
                  
                  {/* Resumo do Veículo Informado */}
                  <div className="bg-gradient-to-r from-[#181818] via-[#141414] to-[#181818] p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#e50914] block mb-1">
                        Veículo a ser Avaliado
                      </span>
                      <h4 className="text-lg font-black text-white">
                        {tradeFormData.brand || 'Seu Veículo'} {tradeFormData.model || ''}
                      </h4>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Ano {tradeFormData.year} • {tradeFormData.km.toLocaleString()} km • Câmbio {tradeFormData.transmission} • Estado {tradeFormData.condition}
                      </p>
                    </div>

                    <div className="text-center sm:text-right bg-black/40 px-4 py-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-emerald-400 font-bold block">Vistoria & Laudo F2K</span>
                      <span className="text-xs text-gray-300 font-mono">
                        Avaliação individualizada
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                        Seu Nome Completo *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Nome do proprietário"
                        value={tradeFormData.ownerName}
                        onChange={(e) => setTradeFormData({ ...tradeFormData, ownerName: e.target.value })}
                        className="w-full bg-[#161616] border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                        WhatsApp / Telefone *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="(11) 99999-9999"
                        value={tradeFormData.phone}
                        onChange={(e) => setTradeFormData({ ...tradeFormData, phone: e.target.value })}
                        className="w-full bg-[#161616] border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                        Cidade / Estado
                      </label>
                      <input
                        type="text"
                        placeholder="Londrina - PR ou sua cidade"
                        value={tradeFormData.city}
                        onChange={(e) => setTradeFormData({ ...tradeFormData, city: e.target.value })}
                        className="w-full bg-[#161616] border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                        Observações Adicionais (Opcional)
                      </label>
                      <input
                        type="text"
                        placeholder="Manual, chave reserva, opcionais..."
                        value={tradeFormData.notes}
                        onChange={(e) => setTradeFormData({ ...tradeFormData, notes: e.target.value })}
                        className="w-full bg-[#161616] border border-white/15 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#e50914]"
                      />
                    </div>
                  </div>

                  {tradeRateLimitWarn && (
                    <div className="p-2.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs">
                      {tradeRateLimitWarn}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setTradeStep(2)}
                      className="w-full sm:w-auto px-5 py-3 bg-transparent border border-white/20 text-gray-300 font-bold uppercase tracking-wider text-xs rounded-xl hover:bg-white/5 transition-all"
                    >
                      Voltar
                    </button>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-8 py-3.5 bg-[#e50914] hover:bg-red-600 text-white font-black uppercase tracking-wider text-xs rounded-xl shadow-lg shadow-red-950/60 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                      id="submit-trade-valuation-btn"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Receber Proposta de Compra / PIX no WhatsApp</span>
                    </button>
                  </div>

                </div>
              )}

            </form>

            {/* Bottom Differentiators for Trade-In */}
            <div className="mt-10 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="p-3 rounded-xl bg-[#121212] border border-white/5">
                <span className="block font-black text-white text-xs uppercase">PIX Imediato</span>
                <span className="text-[11px] text-gray-400">Pagamento no mesmo dia na sua conta</span>
              </div>
              <div className="p-3 rounded-xl bg-[#121212] border border-white/5">
                <span className="block font-black text-white text-xs uppercase">Troca com Troco</span>
                <span className="text-[11px] text-gray-400">Pegue um carro mais barato e saia com dinheiro</span>
              </div>
              <div className="p-3 rounded-xl bg-[#121212] border border-white/5">
                <span className="block font-black text-white text-xs uppercase">Sem Burocracia</span>
                <span className="text-[11px] text-gray-400">Nós cuidamos da transferência e documentação</span>
              </div>
            </div>

          </div>
        )}

      </div>

    </section>
  );
};
