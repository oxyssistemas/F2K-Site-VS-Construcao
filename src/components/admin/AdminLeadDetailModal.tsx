import React, { useState } from 'react';
import { X, CheckCircle, MessageSquare, Phone, Mail, MapPin, Calendar, Clock, DollarSign, Car, Shield, Send } from 'lucide-react';
import { FormSubmission } from '../../lib/supabase';

interface AdminLeadDetailModalProps {
  lead: FormSubmission | null;
  onClose: () => void;
  onUpdateStatus: (id: string, status: FormSubmission['status'], notes?: string) => Promise<void>;
}

export const AdminLeadDetailModal: React.FC<AdminLeadDetailModalProps> = ({
  lead,
  onClose,
  onUpdateStatus
}) => {
  if (!lead) return null;

  const [status, setStatus] = useState<FormSubmission['status']>(lead.status);
  const [internalNotes, setInternalNotes] = useState(lead.internal_notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const cleanPhone = lead.customer_phone.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
    `Olá ${lead.customer_name}! Aqui é da F2K MOTORS referente à sua solicitação no nosso site sobre o veículo ${lead.car_name || 'do estoque'}. Como podemos ajudar?`
  )}`;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateStatus(lead.id, status, internalNotes);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const getFormTypeBadge = (type: FormSubmission['form_type']) => {
    switch (type) {
      case 'financiamento':
        return <span className="px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full font-bold text-xs">Financiamento</span>;
      case 'avaliacao_troca':
        return <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-bold text-xs">Avaliação de Troca</span>;
      case 'test_drive':
        return <span className="px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full font-bold text-xs">Agendamento Test Drive</span>;
      case 'contato_direto':
        return <span className="px-3 py-1 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full font-bold text-xs">Contato Direto</span>;
      default:
        return <span className="px-3 py-1 bg-gray-500/20 text-gray-300 border border-gray-500/30 rounded-full font-bold text-xs">WhatsApp / Lead</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#18181c] border border-white/15 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#141416]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e50914] flex items-center justify-center text-white shadow-lg shadow-red-950/60">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white">{lead.customer_name}</h2>
                {getFormTypeBadge(lead.form_type)}
              </div>
              <p className="text-xs text-gray-400">
                Recebido em {new Date(lead.created_at).toLocaleString('pt-BR')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Conteúdo do Lead */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-sm">
          
          {/* Contato do Cliente */}
          <div className="p-4 rounded-xl bg-[#202026] border border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-center gap-2.5 text-gray-200">
              <Phone className="w-4 h-4 text-[#e50914]" />
              <span className="font-bold">{lead.customer_phone}</span>
            </div>
            {lead.customer_email && (
              <div className="flex items-center gap-2.5 text-gray-300">
                <Mail className="w-4 h-4 text-[#e50914]" />
                <span>{lead.customer_email}</span>
              </div>
            )}
            {lead.customer_city && (
              <div className="flex items-center gap-2.5 text-gray-300">
                <MapPin className="w-4 h-4 text-[#e50914]" />
                <span>{lead.customer_city}</span>
              </div>
            )}
            {lead.car_name && (
              <div className="flex items-center gap-2.5 text-gray-300">
                <Car className="w-4 h-4 text-[#e50914]" />
                <span className="font-semibold text-white">{lead.car_name}</span>
              </div>
            )}
          </div>

          {/* Botão de Contato WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-950/40"
          >
            <Send className="w-4 h-4" />
            Iniciar Conversa no WhatsApp
          </a>

          {/* Dados Específicos do Formulário */}
          {lead.form_type === 'financiamento' && lead.data && (
            <div className="p-4 rounded-xl bg-[#141418] border border-blue-500/20 space-y-2">
              <h4 className="font-bold text-blue-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <DollarSign className="w-4 h-4" /> Detalhes da Simulação de Financiamento
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div>
                  <span className="text-gray-400 block">Entrada proposta:</span>
                  <span className="font-bold text-white text-sm">
                    {lead.data.downPayment ? `R$ ${Number(lead.data.downPayment).toLocaleString('pt-BR')}` : 'R$ 0'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Plano:</span>
                  <span className="font-bold text-white text-sm">
                    {lead.data.installmentsCount}x parcelas
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Parcela estimada:</span>
                  <span className="font-bold text-emerald-400 text-sm">
                    {lead.data.monthlyInstallment ? `R$ ${Number(lead.data.monthlyInstallment).toLocaleString('pt-BR')}` : 'A calcular'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {lead.form_type === 'avaliacao_troca' && lead.data && (
            <div className="p-4 rounded-xl bg-[#141418] border border-emerald-500/20 space-y-2">
              <h4 className="font-bold text-emerald-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Car className="w-4 h-4" /> Dados do Carro de Troca do Cliente
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div>
                  <span className="text-gray-400 block">Veículo:</span>
                  <span className="font-bold text-white">
                    {lead.data.tradeInBrand} {lead.data.tradeInModel}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Ano / KM:</span>
                  <span className="font-bold text-white">
                    {lead.data.tradeInYear || lead.data.year} · {lead.data.tradeInKm || lead.data.km} km
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Estado de conservação:</span>
                  <span className="font-bold text-white">{lead.data.condition || 'Bom'}</span>
                </div>
              </div>
            </div>
          )}

          {lead.form_type === 'test_drive' && lead.data && (
            <div className="p-4 rounded-xl bg-[#141418] border border-amber-500/20 space-y-2">
              <h4 className="font-bold text-amber-400 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Agendamento de Test Drive
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div>
                  <span className="text-gray-400 block">Data Preferencial:</span>
                  <span className="font-bold text-white">{lead.data.preferredDate || 'A combinar'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Horário:</span>
                  <span className="font-bold text-white">{lead.data.preferredTime || 'Manhã'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Número CNH:</span>
                  <span className="font-bold text-white">{lead.data.cnhNumber || 'Não informado'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Status do Atendimento */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-300">Status do Atendimento</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as FormSubmission['status'])}
              className="w-full bg-[#202026] border border-white/15 rounded-xl px-3 py-2.5 text-white font-bold focus:border-[#e50914] focus:outline-none"
            >
              <option value="novo">🔵 Novo Lead (Não atendido)</option>
              <option value="em_atendimento">🟡 Em Atendimento / Negociação</option>
              <option value="proposta_enviada">🟣 Proposta Enviada ao Cliente</option>
              <option value="aprovado">🟢 Aprovado / Venda Fechada</option>
              <option value="perdido">🔴 Perdido / Sem interesse</option>
              <option value="concluido">⚪ Concluído / Arquivado</option>
            </select>
          </div>

          {/* Anotações Internas */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-300">Notas Internas da Equipe Comercial</label>
            <textarea
              rows={3}
              value={internalNotes}
              onChange={e => setInternalNotes(e.target.value)}
              placeholder="Ex: Cliente aguardando aprovação bancária do Santander, retorno na sexta-feira..."
              className="w-full bg-[#202026] border border-white/15 rounded-xl px-3 py-2.5 text-white placeholder-gray-500 focus:border-[#e50914] focus:outline-none text-xs"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-[#141416] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/15 text-gray-300 hover:text-white font-bold text-xs"
          >
            Fechar
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-[#e50914] hover:bg-[#b80710] text-white font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            {isSaving ? 'Salvando...' : 'Salvar Status'}
          </button>
        </div>

      </div>
    </div>
  );
};
