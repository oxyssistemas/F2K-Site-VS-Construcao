import React, { useState, useEffect } from 'react';
import { 
  Car as CarIcon, 
  Layers, 
  FileText, 
  Activity, 
  Database, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  Star, 
  CheckCircle2, 
  Clock, 
  LogOut, 
  ShieldCheck, 
  Lock, 
  ArrowLeft, 
  RefreshCw, 
  DollarSign, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  ChevronRight,
  User,
  AlertCircle,
  KeyRound,
  Check
} from 'lucide-react';
import { F2KLogo } from '../F2KLogo';
import { Car as CarType } from '../../types';
import { 
  AdminUser, 
  FormSubmission, 
  SiteFlowStats, 
  loginAdmin, 
  logoutAdmin, 
  getCurrentAdminSession, 
  fetchAllVehicles, 
  saveVehicleToSupabase, 
  deleteVehicleFromSupabase, 
  fetchFormSubmissions, 
  updateLeadStatus, 
  getSiteFlowStats,
  getSupabaseStatus,
  resetAdminPassword
} from '../../lib/supabase';
import { AdminVehicleFormModal } from './AdminVehicleFormModal';
import { AdminLeadDetailModal } from './AdminLeadDetailModal';
import { AdminFlowMetricsTab } from './AdminFlowMetricsTab';
import { AdminSupabaseTab } from './AdminSupabaseTab';

interface AdminPortalProps {
  onBackToSite: () => void;
}

const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutos
const RATE_LIMIT_STORAGE_KEY = 'f2k_admin_auth_rate_limit';

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToSite }) => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(getCurrentAdminSession);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'forgot'>('login');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Rate Limiting & Brute-Force Lockout State
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
      if (!saved) return 0;
      const data = JSON.parse(saved);
      if (data.lockUntil && data.lockUntil > Date.now()) {
        return data.failedAttempts || MAX_LOGIN_ATTEMPTS;
      }
      if (data.lockUntil && data.lockUntil <= Date.now()) {
        localStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
        return 0;
      }
      return Number(data.failedAttempts) || 0;
    } catch {
      return 0;
    }
  });

  const [lockUntil, setLockUntil] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
      if (!saved) return null;
      const data = JSON.parse(saved);
      if (data.lockUntil && data.lockUntil > Date.now()) {
        return data.lockUntil;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(RATE_LIMIT_STORAGE_KEY);
      if (!saved) return 0;
      const data = JSON.parse(saved);
      if (data.lockUntil && data.lockUntil > Date.now()) {
        return Math.ceil((data.lockUntil - Date.now()) / 1000);
      }
      return 0;
    } catch {
      return 0;
    }
  });

  // Countdown timer when locked
  useEffect(() => {
    if (!lockUntil) {
      setRemainingSeconds(0);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = Math.ceil((lockUntil - now) / 1000);
      if (diff <= 0) {
        setLockUntil(null);
        setFailedAttempts(0);
        setRemainingSeconds(0);
        localStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
        setAuthError('');
      } else {
        setRemainingSeconds(diff);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lockUntil]);

  const isLocked = Boolean(lockUntil && remainingSeconds > 0);

  const formatRemainingTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Tabs state
  const [activeTab, setActiveTab] = useState<'metrics' | 'inventory' | 'forms' | 'supabase'>('metrics');

  // Data states
  const [vehicles, setVehicles] = useState<CarType[]>([]);
  const [leads, setLeads] = useState<FormSubmission[]>([]);
  const [metrics, setMetrics] = useState<SiteFlowStats | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Vehicle filters & modal
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [vehicleCategoryFilter, setVehicleCategoryFilter] = useState('');
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [selectedCarToEdit, setSelectedCarToEdit] = useState<CarType | null>(null);

  // Leads filters & modal
  const [leadTypeFilter, setLeadTypeFilter] = useState('todos');
  const [leadStatusFilter, setLeadStatusFilter] = useState('todos');
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<FormSubmission | null>(null);

  const supabaseStatus = getSupabaseStatus();

  // Load all initial data on login
  const loadData = async () => {
    setIsLoadingData(true);
    try {
      const [vList, lList, mStats] = await Promise.all([
        fetchAllVehicles(),
        fetchFormSubmissions(),
        getSiteFlowStats()
      ]);
      setVehicles(vList);
      setLeads(lList);
      setMetrics(mStats);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  // Handle Login & Supabase Auth Actions
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (isLocked) {
      setAuthError(`Acesso bloqueado por segurança. Tente novamente em ${formatRemainingTime(remainingSeconds)}.`);
      return;
    }

    setAuthLoading(true);

    try {
      if (authMode === 'forgot') {
        const res = await resetAdminPassword(emailInput);
        if (res.success) {
          setAuthSuccess('E-mail de recuperação enviado pelo Supabase! Verifique sua caixa de entrada.');
        } else {
          setAuthError(res.error || 'Erro ao enviar e-mail de recuperação.');
        }
        setAuthLoading(false);
        return;
      }

      // Modo Login Oficial Supabase
      const res = await loginAdmin(emailInput, passwordInput);
      if (res.success && res.user) {
        // Limpa tentativas incorretas em caso de sucesso
        localStorage.removeItem(RATE_LIMIT_STORAGE_KEY);
        setFailedAttempts(0);
        setLockUntil(null);
        setRemainingSeconds(0);
        setCurrentUser(res.user);
      } else {
        // Falha no login: registrar tentativa
        const nextFailed = failedAttempts + 1;
        if (nextFailed >= MAX_LOGIN_ATTEMPTS) {
          const lockTime = Date.now() + LOCKOUT_DURATION_MS;
          setLockUntil(lockTime);
          setFailedAttempts(nextFailed);
          setRemainingSeconds(Math.ceil(LOCKOUT_DURATION_MS / 1000));
          localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify({
            failedAttempts: nextFailed,
            lockUntil: lockTime
          }));
          setAuthError(`Limite de ${MAX_LOGIN_ATTEMPTS} tentativas incorretas atingido! O acesso ao portal foi temporariamente bloqueado por 15 minutos para segurança.`);
        } else {
          setFailedAttempts(nextFailed);
          localStorage.setItem(RATE_LIMIT_STORAGE_KEY, JSON.stringify({
            failedAttempts: nextFailed,
            lockUntil: null
          }));
          const attemptsLeft = MAX_LOGIN_ATTEMPTS - nextFailed;
          setAuthError(`${res.error || 'Credenciais inválidas no Supabase.'} (${nextFailed}/${MAX_LOGIN_ATTEMPTS} tentativas utilizadas — restam ${attemptsLeft} antes do bloqueio temporário).`);
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Erro inesperado ao conectar ao Supabase.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setCurrentUser(null);
  };

  // Vehicle Actions
  const handleSaveVehicle = async (car: CarType, status: string) => {
    await saveVehicleToSupabase(car, status);
    await loadData();
  };

  const handleDeleteVehicle = async (id: string, modelName: string) => {
    if (window.confirm(`Tem certeza que deseja remover o veículo "${modelName}" do estoque?`)) {
      await deleteVehicleFromSupabase(id);
      await loadData();
    }
  };

  const handleToggleFeatured = async (car: CarType) => {
    const updated = { ...car, featured: !car.featured };
    await saveVehicleToSupabase(updated);
    await loadData();
  };

  // Lead Actions
  const handleUpdateLeadStatus = async (id: string, status: FormSubmission['status'], notes?: string) => {
    await updateLeadStatus(id, status, notes);
    await loadData();
  };

  // -------------------------------------------------------------
  // TELA DE AUTENTICAÇÃO OFICIAL SUPABASE AUTH
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0a0a0c] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden selection:bg-[#e50914] selection:text-white">
        
        {/* Background glow styling */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#e50914]/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-red-950/20 blur-[100px] rounded-full pointer-events-none" />

        {/* Botão de Retorno ao Site Público */}
        <button
          onClick={onBackToSite}
          className="absolute top-6 left-6 flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/10"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Site Público
        </button>

        <div className="w-full max-w-md bg-[#141418] border border-white/15 rounded-3xl p-8 shadow-2xl relative z-10">
          
          {/* Logo & Título */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-3">
              <F2KLogo size="lg" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Supabase Authentication
            </div>
            <h1 className="text-xl font-black text-white uppercase tracking-tight">
              Portal Administrativo
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Acesso restrito para administradores credenciados no Supabase.
            </p>
          </div>

          {/* Banner de Bloqueio por Excesso de Tentativas */}
          {isLocked ? (
            <div className="mb-5 p-4 bg-red-950/80 border border-red-500/60 rounded-2xl text-red-200 text-xs shadow-lg shadow-red-950/50">
              <div className="flex items-center gap-2 mb-2 font-black text-red-400 uppercase tracking-wider text-xs">
                <Lock className="w-4 h-4 text-red-400 animate-pulse" />
                <span>Acesso Bloqueado Temporariamente</span>
              </div>
              <p className="text-[11px] text-red-300 leading-relaxed mb-3">
                O limite de <strong>{MAX_LOGIN_ATTEMPTS} tentativas incorretas</strong> foi atingido. Para segurança do sistema contra acessos não autorizados, novas tentativas estão suspensas por 15 minutos.
              </p>
              <div className="bg-black/60 border border-red-500/30 rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-300 font-mono text-xs">
                  <Clock className="w-3.5 h-3.5 text-red-400" />
                  <span>Desbloqueio em:</span>
                </div>
                <span className="font-mono font-black text-base text-red-400 tracking-wider">
                  {formatRemainingTime(remainingSeconds)}
                </span>
              </div>
            </div>
          ) : failedAttempts > 0 ? (
            <div className="mb-4 p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-300 text-[11px] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Tentativas: <strong>{failedAttempts} de {MAX_LOGIN_ATTEMPTS}</strong> incorretas</span>
              </div>
              <span className="font-mono text-[10px] text-amber-400/80 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Restam {MAX_LOGIN_ATTEMPTS - failedAttempts}
              </span>
            </div>
          ) : null}

          {/* Mensagem de Erro (se não estiver no banner de bloqueio) */}
          {authError && !isLocked && (
            <div className="mb-4 p-3.5 bg-red-950/70 border border-red-500/50 rounded-xl text-red-300 text-xs font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* Mensagem de Sucesso */}
          {authSuccess && (
            <div className="mb-4 p-3.5 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-medium flex items-start gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{authSuccess}</span>
            </div>
          )}

          {/* Formulário de Login Supabase */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">E-mail do Administrador</label>
              <input
                type="email"
                required
                disabled={isLocked || authLoading}
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                placeholder="seu-email@dominio.com"
                className={`w-full bg-[#1c1c22] border border-white/15 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:border-[#e50914] focus:outline-none transition-colors ${
                  isLocked ? 'opacity-40 cursor-not-allowed bg-black/40' : ''
                }`}
              />
            </div>

            {authMode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-gray-300">Senha</label>
                  {!isLocked && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot');
                        setAuthError('');
                        setAuthSuccess('');
                      }}
                      className="text-[11px] text-gray-400 hover:text-[#e50914] transition-colors"
                    >
                      Esqueci a senha
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  required
                  disabled={isLocked || authLoading}
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-[#1c1c22] border border-white/15 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:border-[#e50914] focus:outline-none transition-colors ${
                    isLocked ? 'opacity-40 cursor-not-allowed bg-black/40' : ''
                  }`}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLocked || authLoading}
              className={`w-full py-3.5 px-4 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-2 ${
                isLocked 
                  ? 'bg-red-950/60 border border-red-500/40 text-red-400 cursor-not-allowed opacity-80'
                  : 'bg-[#e50914] hover:bg-[#b80710] text-white shadow-red-950/70 disabled:opacity-50'
              }`}
            >
              {isLocked ? (
                <>
                  <Lock className="w-4 h-4" /> Acesso Bloqueado ({formatRemainingTime(remainingSeconds)})
                </>
              ) : authLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Autenticando no Supabase...
                </>
              ) : authMode === 'forgot' ? (
                <>
                  <KeyRound className="w-4 h-4" /> Enviar Link de Redefinição
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Entrar com Supabase Auth
                </>
              )}
            </button>

            {authMode === 'forgot' && (
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                  setAuthSuccess('');
                }}
                className="w-full text-center text-xs text-gray-400 hover:text-white py-1 transition-colors"
              >
                Voltar para o Login
              </button>
            )}
          </form>

          {/* Supabase Status Pill */}
          <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-center gap-2 text-[11px] text-gray-400 font-medium">
            <div className={`w-2 h-2 rounded-full ${supabaseStatus.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span>Supabase Auth: {supabaseStatus.isConnected ? 'Conectado à Nuvem' : 'Aguardando Credenciais'}</span>
          </div>

        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // DASHBOARD ADMINISTRATIVO PRINCIPAL
  // -------------------------------------------------------------
  const filteredVehicles = vehicles.filter(v => {
    if (vehicleSearch) {
      const q = vehicleSearch.toLowerCase();
      const matchBrand = v.brand.toLowerCase().includes(q);
      const matchModel = v.model.toLowerCase().includes(q);
      const matchVersion = v.version.toLowerCase().includes(q);
      if (!matchBrand && !matchModel && !matchVersion) return false;
    }
    if (vehicleCategoryFilter && v.category !== vehicleCategoryFilter) {
      return false;
    }
    return true;
  });

  const filteredLeads = leads.filter(l => {
    if (leadTypeFilter !== 'todos' && l.form_type !== leadTypeFilter) return false;
    if (leadStatusFilter !== 'todos' && l.status !== leadStatusFilter) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0d0d10] text-white flex flex-col selection:bg-[#e50914] selection:text-white">
      
      {/* Topbar Administrativa */}
      <header className="sticky top-0 z-40 bg-[#141418]/95 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <F2KLogo size="md" />
            <div className="hidden sm:block h-5 w-px bg-white/15" />
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#e50914]/15 border border-[#e50914]/30 text-[#e50914] text-[11px] font-black uppercase tracking-wider">
              Gestão & Estoque
            </span>
          </div>

          <div className="flex items-center gap-3">
            
            {/* Supabase Status */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
              <Database className="w-3.5 h-3.5 text-[#e50914]" />
              <span className="text-gray-300">Supabase:</span>
              <span className={`font-bold ${supabaseStatus.isConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                {supabaseStatus.isConnected ? 'Nuvem' : 'Local'}
              </span>
            </div>

            {/* Usuário Logado */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-300">
              <User className="w-3.5 h-3.5 text-gray-400" />
              <span className="font-medium hidden sm:inline">{currentUser.email}</span>
            </div>

            {/* Voltar ao Site */}
            <button
              onClick={onBackToSite}
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
              title="Abrir site público"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ver Site</span>
            </button>

            {/* Sair */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 transition-colors"
              title="Encerrar Sessão"
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>

        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 scrollbar-none">
          
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'metrics'
                ? 'bg-[#e50914] text-white shadow-lg shadow-red-950/60'
                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <Activity className="w-4 h-4" />
            Controle de Fluxo & Métricas
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'inventory'
                ? 'bg-[#e50914] text-white shadow-lg shadow-red-950/60'
                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <CarIcon className="w-4 h-4" />
            Estoque de Carros ({vehicles.length})
          </button>

          <button
            onClick={() => setActiveTab('forms')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'forms'
                ? 'bg-[#e50914] text-white shadow-lg shadow-red-950/60'
                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <FileText className="w-4 h-4" />
            Formulários & Leads ({leads.length})
            {leads.filter(l => l.status === 'novo').length > 0 && (
              <span className="px-1.5 py-0.5 bg-red-600 text-[10px] font-black rounded-full text-white">
                {leads.filter(l => l.status === 'novo').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 transition-all shrink-0 ${
              activeTab === 'supabase'
                ? 'bg-[#e50914] text-white shadow-lg shadow-red-950/60'
                : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5'
            }`}
          >
            <Database className="w-4 h-4" />
            Supabase & Migrations
          </button>

        </div>

        {/* ========================================================= */}
        {/* TAB 1: CONTROLE DE FLUXO E MÉTRICAS */}
        {/* ========================================================= */}
        {activeTab === 'metrics' && metrics && (
          <AdminFlowMetricsTab stats={metrics} onRefresh={loadData} />
        )}

        {/* ========================================================= */}
        {/* TAB 2: GESTÃO DO ESTOQUE DE CARROS */}
        {/* ========================================================= */}
        {activeTab === 'inventory' && (
          <div className="space-y-5">
            
            {/* Barra de Ações do Estoque */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141418] p-4 rounded-2xl border border-white/10">
              
              <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={vehicleSearch}
                    onChange={e => setVehicleSearch(e.target.value)}
                    placeholder="Buscar por marca, modelo, versão..."
                    className="w-full bg-[#1c1c22] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:border-[#e50914] focus:outline-none"
                  />
                </div>

                <select
                  value={vehicleCategoryFilter}
                  onChange={e => setVehicleCategoryFilter(e.target.value)}
                  className="bg-[#1c1c22] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:border-[#e50914] focus:outline-none"
                >
                  <option value="">Todas Categorias</option>
                  <option value="SUV">SUV</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Picape">Picape</option>
                  <option value="Esportivo">Esportivo</option>
                  <option value="Elétrico / Híbrido">Elétrico / Híbrido</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setSelectedCarToEdit(null);
                  setIsVehicleModalOpen(true);
                }}
                className="px-5 py-2.5 bg-[#e50914] hover:bg-[#b80710] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-950/60 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" /> Cadastrar Novo Carro
              </button>

            </div>

            {/* Tabela de Veículos */}
            <div className="bg-[#141418] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#1c1c22] border-b border-white/10 text-gray-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-4">Veículo</th>
                      <th className="p-4">Ano / Categoria</th>
                      <th className="p-4">KM</th>
                      <th className="p-4">Preço</th>
                      <th className="p-4">Destaque</th>
                      <th className="p-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredVehicles.map(car => (
                      <tr key={car.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={car.images[0] || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=300&q=80'}
                              alt={car.model}
                              className="w-16 h-12 object-cover rounded-lg border border-white/10"
                            />
                            <div>
                              <span className="font-black text-white text-sm block">
                                {car.brand} {car.model}
                              </span>
                              <span className="text-[11px] text-gray-400">
                                {car.version}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-gray-300">
                          <span className="font-bold text-white block">{car.yearFabrication}/{car.yearModel}</span>
                          <span className="text-[11px] text-gray-400">{car.category} · {car.fuel}</span>
                        </td>
                        <td className="p-4 text-gray-300 font-mono">
                          {car.mileage.toLocaleString('pt-BR')} km
                        </td>
                        <td className="p-4">
                          <span className="font-black text-emerald-400 text-sm block">
                            R$ {car.price.toLocaleString('pt-BR')}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            FIPE: R$ {car.fipePrice.toLocaleString('pt-BR')}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => handleToggleFeatured(car)}
                            className={`p-1.5 rounded-lg border transition-all ${
                              car.featured
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                                : 'bg-white/5 text-gray-500 border-white/10 hover:text-gray-300'
                            }`}
                            title="Alternar Destaque na Home"
                          >
                            <Star className="w-4 h-4 fill-current" />
                          </button>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setSelectedCarToEdit(car);
                                setIsVehicleModalOpen(true);
                              }}
                              className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                              title="Editar Veículo"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteVehicle(car.id, `${car.brand} ${car.model}`)}
                              className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg border border-red-500/30 transition-colors"
                              title="Remover Veículo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: FORMULÁRIOS RECEBIDOS & LEADS */}
        {/* ========================================================= */}
        {activeTab === 'forms' && (
          <div className="space-y-5">
            
            {/* Filtros de Leads */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#141418] p-4 rounded-2xl border border-white/10">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-300">
                  <Filter className="w-4 h-4 text-[#e50914]" /> Tipo:
                </div>
                <select
                  value={leadTypeFilter}
                  onChange={e => setLeadTypeFilter(e.target.value)}
                  className="bg-[#1c1c22] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-[#e50914] focus:outline-none"
                >
                  <option value="todos">Todos os Tipos</option>
                  <option value="financiamento">Financiamento</option>
                  <option value="avaliacao_troca">Avaliação de Troca</option>
                  <option value="test_drive">Test Drive</option>
                  <option value="contato_direto">Contato Direto</option>
                </select>

                <div className="flex items-center gap-2 text-xs font-bold text-gray-300 ml-2">
                  Status:
                </div>
                <select
                  value={leadStatusFilter}
                  onChange={e => setLeadStatusFilter(e.target.value)}
                  className="bg-[#1c1c22] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:border-[#e50914] focus:outline-none"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="novo">Novos Leads</option>
                  <option value="em_atendimento">Em Atendimento</option>
                  <option value="proposta_enviada">Proposta Enviada</option>
                  <option value="aprovado">Aprovados</option>
                  <option value="concluido">Concluídos</option>
                </select>
              </div>

              <button
                onClick={loadData}
                className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Atualizar
              </button>
            </div>

            {/* Lista de Leads */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLeads.map(lead => (
                <div
                  key={lead.id}
                  onClick={() => setSelectedLeadForDetail(lead)}
                  className="p-5 rounded-2xl bg-[#141418] border border-white/10 hover:border-[#e50914]/50 transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                        lead.status === 'novo'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : lead.status === 'em_atendimento'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {lead.status.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <h4 className="font-black text-white text-base group-hover:text-[#e50914] transition-colors">
                      {lead.customer_name}
                    </h4>
                    <p className="text-xs text-gray-400 mt-0.5">{lead.customer_phone}</p>
                    
                    {lead.car_name && (
                      <div className="mt-3 p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs text-gray-200 font-semibold">
                        🚗 {lead.car_name}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                    <span className="font-bold text-[#e50914] uppercase text-[10px] tracking-wider">
                      {lead.form_type.replace('_', ' ')}
                    </span>
                    <span className="flex items-center gap-1 text-white font-bold group-hover:translate-x-1 transition-transform">
                      Ver detalhes <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: SUPABASE & MIGRATIONS */}
        {/* ========================================================= */}
        {activeTab === 'supabase' && (
          <AdminSupabaseTab />
        )}

      </main>

      {/* Modais Administrativos */}
      <AdminVehicleFormModal
        isOpen={isVehicleModalOpen}
        onClose={() => {
          setIsVehicleModalOpen(false);
          setSelectedCarToEdit(null);
        }}
        onSave={handleSaveVehicle}
        carToEdit={selectedCarToEdit}
      />

      <AdminLeadDetailModal
        lead={selectedLeadForDetail}
        onClose={() => setSelectedLeadForDetail(null)}
        onUpdateStatus={handleUpdateLeadStatus}
      />

    </div>
  );
};
