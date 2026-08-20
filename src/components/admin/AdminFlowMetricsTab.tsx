import React from 'react';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  Car, 
  DollarSign, 
  Eye, 
  CheckCircle2, 
  PhoneCall, 
  FileSpreadsheet,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { SiteFlowStats } from '../../lib/supabase';

interface AdminFlowMetricsTabProps {
  stats: SiteFlowStats;
  onRefresh: () => void;
}

export const AdminFlowMetricsTab: React.FC<AdminFlowMetricsTabProps> = ({
  stats,
  onRefresh
}) => {
  return (
    <div className="space-y-6 text-sm">
      
      {/* 4 Cards de Métricas no Topo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-[#1a1a20] border border-white/10 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Acessos no Site</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{stats.totalPageViews}</span>
            <span className="text-xs text-emerald-400 font-bold flex items-center">
              +14.2% <TrendingUp className="w-3 h-3 ml-0.5" />
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Visualizações de páginas e showroom</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#1a1a20] border border-white/10 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Propostas / Leads</span>
            <div className="w-8 h-8 rounded-lg bg-[#e50914]/15 text-[#e50914] flex items-center justify-center border border-[#e50914]/30">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{stats.totalLeads}</span>
            {stats.newLeadsCount > 0 && (
              <span className="px-2 py-0.5 text-[10px] bg-red-600/90 text-white font-black rounded-full animate-pulse">
                {stats.newLeadsCount} novos
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Simulações, trocas e agendamentos</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#1a1a20] border border-white/10 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Conversão de Leads</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{stats.conversionRate}%</span>
            <span className="text-xs text-gray-400 font-medium">taxa média</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Visitantes que iniciam contato</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#1a1a20] border border-white/10 shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Valor em Estoque</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-black text-white">
              R$ {(stats.totalInventoryValue / 1000000).toFixed(2)}M
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">{stats.totalVehiclesCount} veículos ativos</p>
        </div>

      </div>

      {/* Grid com Veículos Mais Procurados & Distribuição dos Formulários */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Veículos Mais Visualizados */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#1a1a20] border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Car className="w-5 h-5 text-[#e50914]" /> Carros Mais Vistos no Site
              </h3>
              <p className="text-xs text-gray-400">Interesse e visualizações do catálogo em tempo real</p>
            </div>
          </div>

          <div className="space-y-3">
            {stats.topViewedVehicles.map((car, idx) => (
              <div key={car.carId || idx} className="p-3 rounded-xl bg-[#131317] border border-white/5 flex items-center justify-between gap-3 hover:border-white/20 transition-all">
                <div className="flex items-center gap-3">
                  <span className="w-6 text-center font-black text-gray-400 text-xs">#{idx + 1}</span>
                  {car.image && (
                    <img src={car.image} alt={car.model} className="w-12 h-9 object-cover rounded-lg border border-white/10" />
                  )}
                  <div>
                    <h4 className="font-bold text-white text-xs sm:text-sm">{car.model}</h4>
                    <span className="text-[11px] text-gray-400 font-semibold">
                      R$ {car.price.toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs font-black text-emerald-400 block">{car.views} views</span>
                    <span className="text-[10px] text-gray-400">interações</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Propostas por Canal / Tipo de Formulário */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#1a1a20] border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2 mb-1">
              <Activity className="w-5 h-5 text-[#e50914]" /> Propostas por Canal
            </h3>
            <p className="text-xs text-gray-400 mb-5">Origem dos leads gerados no site</p>

            <div className="space-y-4">
              
              <div>
                <div className="flex justify-between text-xs font-bold text-gray-300 mb-1">
                  <span>Simulações de Financiamento</span>
                  <span>{stats.leadsByType['financiamento'] || 0}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, ((stats.leadsByType['financiamento'] || 1) / Math.max(1, stats.totalLeads)) * 100)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-gray-300 mb-1">
                  <span>Avaliações de Troca</span>
                  <span>{stats.leadsByType['avaliacao_troca'] || 0}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, ((stats.leadsByType['avaliacao_troca'] || 1) / Math.max(1, stats.totalLeads)) * 100)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-gray-300 mb-1">
                  <span>Agendamentos de Test Drive</span>
                  <span>{stats.leadsByType['test_drive'] || 0}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, ((stats.leadsByType['test_drive'] || 1) / Math.max(1, stats.totalLeads)) * 100)}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-gray-300 mb-1">
                  <span>Contatos Diretos & WhatsApp</span>
                  <span>{(stats.leadsByType['contato_direto'] || 0) + (stats.leadsByType['whatsapp'] || 0)}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.min(100, (((stats.leadsByType['contato_direto'] || 0) + (stats.leadsByType['whatsapp'] || 0)) / Math.max(1, stats.totalLeads)) * 100)}%` }} />
                </div>
              </div>

            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
            <span>Sincronização em tempo real</span>
            <button
              onClick={onRefresh}
              className="text-[#e50914] hover:underline font-bold"
            >
              Atualizar Métricas
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
