import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Car as CarIcon,
  Send,
  Coffee
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Car, TestDriveFormData } from '../types';
import { CARS_INVENTORY } from '../data/cars';
import { formatBRL, getWhatsAppLink } from '../utils/formatters';
import { STORE_INFO } from '../data/reviews';
import { submitLeadForm } from '../lib/supabase';
import { sanitizeTextInput, sanitizePhone, sanitizeEmail, safeOpenUrl, checkActionRateLimit } from '../utils/security';

interface TestDriveModalProps {
  isOpen: boolean;
  car: Car | null;
  cars?: Car[];
  onClose: () => void;
}

export const TestDriveModal: React.FC<TestDriveModalProps> = ({
  isOpen,
  car,
  cars = [],
  onClose
}) => {
  const sourceCars = cars && cars.length > 0 ? cars : CARS_INVENTORY;
  const [selectedCarId, setSelectedCarId] = useState<string>(car?.id || (sourceCars[0]?.id ?? ''));
  const [rateLimitWarning, setRateLimitWarning] = useState<string | null>(null);
  const [formData, setFormData] = useState<TestDriveFormData>({
    carId: car?.id || (sourceCars[0]?.id ?? ''),
    fullName: '',
    phone: '',
    email: '',
    cnhNumber: '',
    preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    preferredTime: '14:30',
    notes: ''
  });

  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (car) {
      setSelectedCarId(car.id);
      setFormData(prev => ({ ...prev, carId: car.id }));
    } else if (sourceCars.length > 0 && !selectedCarId) {
      setSelectedCarId(sourceCars[0].id);
      setFormData(prev => ({ ...prev, carId: sourceCars[0].id }));
    }
  }, [car, sourceCars]);

  if (!isOpen) return null;

  const currentCar = car || sourceCars.find(c => c.id === selectedCarId) || null;

  const timeSlots = ['10:00', '11:30', '14:00', '15:30', '17:00', '18:00'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Verificação de Rate Limit
    const rateCheck = checkActionRateLimit('test_drive_modal', 3, 60);
    if (!rateCheck.allowed) {
      setRateLimitWarning(`Por segurança, aguarde ${rateCheck.retryAfterSeconds}s antes de enviar novo agendamento.`);
      return;
    }
    setRateLimitWarning(null);

    // Sanitização de entradas
    const cleanName = sanitizeTextInput(formData.fullName, 80);
    const cleanPhone = sanitizePhone(formData.phone);
    const cleanEmail = sanitizeEmail(formData.email || '');
    const cleanCnh = sanitizeTextInput(formData.cnhNumber, 20);
    const cleanNotes = sanitizeTextInput(formData.notes, 200);

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    setIsSuccess(true);

    const carTitle = currentCar ? `${currentCar.brand} ${currentCar.model} (${currentCar.version})` : 'Veículo do Showroom';

    // Salvar proposta no Supabase com dados sanitizados
    submitLeadForm({
      form_type: 'test_drive',
      customer_name: cleanName,
      customer_phone: cleanPhone,
      customer_email: cleanEmail || undefined,
      car_id: currentCar?.id,
      car_name: carTitle,
      data: {
        preferredDate: formData.preferredDate,
        preferredTime: formData.preferredTime,
        cnhNumber: cleanCnh,
        notes: cleanNotes
      }
    }).catch(console.error);

    const message = `*Agendamento de Test-Drive Exclusivo F2K*\n\n` +
      `🚗 *Veículo:* ${carTitle}\n` +
      `📅 *Data Escolhida:* ${formData.preferredDate}\n` +
      `⏰ *Horário:* ${formData.preferredTime}\n` +
      `📍 *Showroom:* ${STORE_INFO.address}\n\n` +
      `👤 *Motorista:* ${cleanName}\n` +
      `📱 *Telefone:* ${cleanPhone}\n` +
      (cleanEmail ? `✉️ *E-mail:* ${cleanEmail}\n` : '') +
      (cleanNotes ? `📝 *Obs:* ${cleanNotes}\n` : '') +
      `\n_Por favor, confirmem a disponibilidade do consultor e a reserva do veículo._`;

    setTimeout(() => {
      safeOpenUrl(getWhatsAppLink(message));
      onClose();
      setIsSuccess(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 lg:p-6 animate-fadeIn">
      <div className="bg-[#0d0d0d] border border-white/15 rounded-sm w-full max-w-2xl overflow-hidden shadow-2xl text-white relative">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#0d0d0d] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-sm bg-[#151515] border border-white/10 text-red-500">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-tight italic">Agende sua Experiência de Test-Drive</h3>
              <p className="text-xs text-gray-400 font-mono">Atendimento personalizado com consultor técnico F2K</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-sm bg-[#151515] hover:bg-[#202020] text-gray-400 hover:text-white border border-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Selected Car Highlight */}
          {currentCar ? (
            <div className="p-4 rounded-sm bg-[#050505] border border-white/10 flex items-center gap-4">
              {currentCar.images && currentCar.images.length > 0 ? (
                <img 
                  src={currentCar.images[0]} 
                  alt={currentCar.model} 
                  className="w-20 h-14 rounded-sm object-cover border border-white/10"
                />
              ) : (
                <div className="w-20 h-14 rounded-sm bg-[#151515] flex items-center justify-center border border-white/10">
                  <CarIcon className="w-6 h-6 text-gray-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500 block">{currentCar.brand}</span>
                <h4 className="text-sm font-bold text-white leading-tight uppercase italic truncate">{currentCar.model}</h4>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">{formatBRL(currentCar.price)} • {currentCar.transmission}</p>
              </div>
              {sourceCars.length > 1 && (
                <select
                  value={selectedCarId}
                  onChange={(e) => {
                    setSelectedCarId(e.target.value);
                    setFormData({ ...formData, carId: e.target.value });
                  }}
                  className="bg-[#151515] border border-white/10 text-xs text-gray-300 rounded-sm px-2.5 py-1.5 focus:outline-none focus:border-red-600 font-mono"
                >
                  {sourceCars.map((c) => (
                    <option key={c.id} value={c.id}>
                      Trocar carro ({c.brand} {c.model})
                    </option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <div className="p-3.5 rounded-sm bg-[#141414] border border-white/10 text-xs text-gray-300 flex items-center gap-2">
              <CarIcon className="w-4 h-4 text-[#e50914]" />
              <span>Agendamento de visita e test-drive exclusivo no Showroom F2K Motors</span>
            </div>
          )}

          {/* Date & Time Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-1.5">
                Data Preferida
              </label>
              <input
                type="date"
                required
                value={formData.preferredDate}
                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                className="w-full bg-[#151515] border border-white/10 rounded-sm px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-600 font-mono"
                id="testdrive-date-input"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-[0.15em] text-gray-400 mb-1.5">
                Horário da Sessão
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {timeSlots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setFormData({ ...formData, preferredTime: slot })}
                    className={`py-2 text-xs font-bold rounded-sm border transition-all font-mono ${
                      formData.preferredTime === slot 
                        ? 'bg-red-600 text-white border-red-600' 
                        : 'bg-[#151515] text-gray-300 border-white/10 hover:border-white/20'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">Nome Completo *</label>
              <input
                type="text"
                required
                placeholder="Seu nome completo"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-[#151515] border border-white/10 rounded-sm px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-600 font-mono"
                id="testdrive-fullname"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">WhatsApp / Telefone *</label>
                <input
                  type="tel"
                  required
                  placeholder="(43) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#151515] border border-white/10 rounded-sm px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-600 font-mono"
                  id="testdrive-phone"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-1">CNH (Opcional)</label>
                <input
                  type="text"
                  placeholder="Número da CNH"
                  value={formData.cnhNumber}
                  onChange={(e) => setFormData({ ...formData, cnhNumber: e.target.value })}
                  className="w-full bg-[#151515] border border-white/10 rounded-sm px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-600 font-mono"
                />
              </div>
            </div>
          </div>

          {/* VIP Lounge Note */}
          <div className="p-3 rounded-sm bg-[#151515] border border-white/10 text-xs text-gray-300 flex items-center gap-2">
            <Coffee className="w-4 h-4 text-red-500 shrink-0" />
            <span className="font-normal">Showroom F2K com Lounge VIP, café expresso gourmet e trajeto planejado de condução.</span>
          </div>

          {rateLimitWarning && (
            <div className="p-2.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs">
              {rateLimitWarning}
            </div>
          )}

          {/* Submit */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-sm bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 active:scale-95"
              id="testdrive-submit-btn"
            >
              <Send className="w-4 h-4" />
              <span>Confirmar Agendamento no WhatsApp</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
