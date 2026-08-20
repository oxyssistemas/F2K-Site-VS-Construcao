import React, { useState } from 'react';
import { Database, Copy, Check, ExternalLink, ShieldCheck, Terminal, AlertCircle, RefreshCw, Key, HardDrive } from 'lucide-react';
import { SUPABASE_SQL_MIGRATION, SUPABASE_STORAGE_FIX_SQL, getSupabaseStatus, saveCustomSupabaseConfig } from '../../lib/supabase';

export const AdminSupabaseTab: React.FC = () => {
  const status = getSupabaseStatus();
  const [url, setUrl] = useState(status.url);
  const [anonKey, setAnonKey] = useState(status.anonKey);
  const [copied, setCopied] = useState(false);
  const [copiedStorage, setCopiedStorage] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_MIGRATION);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCopyStorageSQL = () => {
    navigator.clipboard.writeText(SUPABASE_STORAGE_FIX_SQL);
    setCopiedStorage(true);
    setTimeout(() => setCopiedStorage(false), 3000);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveCustomSupabaseConfig(url, anonKey);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 text-sm">
      
      {/* Status da Conexão Supabase */}
      <div className="p-6 rounded-2xl bg-[#1a1a20] border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 ${
            status.isConnected ? 'bg-emerald-600 shadow-lg shadow-emerald-950/60' : 'bg-amber-600 shadow-lg shadow-amber-950/60'
          }`}>
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white uppercase tracking-wider">
                Status da Conexão com Supabase
              </h3>
              {status.isConnected ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Conectado à Nuvem
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Modo Local Ativo / Aguardando Chaves
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1 max-w-2xl">
              {status.isConnected 
                ? 'Seu projeto F2K MOTORS está sincronizando veículos, fotos no Storage, formulários de leads e fluxo em tempo real na nuvem do Supabase.' 
                : 'O portal está funcionando perfeitamente em contingência local. Configure seu Projeto Supabase abaixo para persistência na nuvem.'}
            </p>
          </div>
        </div>

        <a
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 transition-colors shrink-0"
        >
          <ExternalLink className="w-4 h-4" /> Abrir Supabase Dashboard
        </a>
      </div>

      {/* Card Rápido de Liberação do Supabase Storage RLS */}
      <div className="p-6 rounded-2xl bg-[#1a1a20] border border-amber-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-amber-400" /> Correção de Permissões RLS (Supabase Storage)
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Caso receba a mensagem <code>violates row-level security policy</code> ao subir imagens, execute este comando no <strong>SQL Editor</strong> do Supabase para liberar o bucket <code className="text-red-400">vehicles</code>.
            </p>
          </div>
          <button
            onClick={handleCopyStorageSQL}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
              copiedStorage
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40'
            }`}
          >
            {copiedStorage ? (
              <>
                <Check className="w-4 h-4 text-white" /> SQL Storage Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copiar SQL de Liberação do Storage
              </>
            )}
          </button>
        </div>
      </div>

      {/* Formulário de Configuração das Chaves do Supabase */}
      <div className="p-6 rounded-2xl bg-[#1a1a20] border border-white/10">
        <h3 className="text-base font-black text-white uppercase tracking-wider mb-2 flex items-center gap-2">
          <Key className="w-5 h-5 text-[#e50914]" /> Configuração das Credenciais do Supabase
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Você pode configurar via variáveis de ambiente (.env) ou inserir diretamente aqui para vincular seu projeto Supabase instantaneamente.
        </p>

        <form onSubmit={handleSaveConfig} className="space-y-4">
          {savedSuccess && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-300 font-bold text-xs flex items-center gap-2">
              <Check className="w-4 h-4" /> Credenciais salvas com sucesso! A conexão foi reiniciada.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Project URL (VITE_SUPABASE_URL)
              </label>
              <input
                type="text"
                value={url}
                onChange={e => setUrl(e.target.value)}
                placeholder="https://seu-projeto.supabase.co"
                className="w-full bg-[#131317] border border-white/15 rounded-xl px-3 py-2.5 text-white font-mono text-xs focus:border-[#e50914] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1">
                Anon / Public API Key (VITE_SUPABASE_ANON_KEY)
              </label>
              <input
                type="password"
                value={anonKey}
                onChange={e => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full bg-[#131317] border border-white/15 rounded-xl px-3 py-2.5 text-white font-mono text-xs focus:border-[#e50914] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#b80710] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-950/60 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Salvar e Vincular Supabase
            </button>
          </div>
        </form>
      </div>

      {/* SQL Migration Script */}
      <div className="p-6 rounded-2xl bg-[#1a1a20] border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#e50914]" /> Migration SQL Completa do Supabase
            </h3>
            <p className="text-xs text-gray-400">
              Execute este script completo no <strong>SQL Editor</strong> do seu Supabase para criar as tabelas (<code className="text-[#e50914]">vehicles</code>, <code className="text-[#e50914]">vehicle_images</code>, <code className="text-[#e50914]">form_submissions</code>, <code className="text-[#e50914]">site_flow_events</code>), bucket de Storage <code className="text-[#e50914]">vehicles</code> e políticas de segurança RLS.
            </p>
          </div>

          <button
            onClick={handleCopySQL}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shrink-0 ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> Script SQL Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copiar SQL da Migration
              </>
            )}
          </button>
        </div>

        <div className="relative rounded-xl overflow-hidden border border-white/10 bg-[#0d0d10]">
          <div className="bg-[#141418] px-4 py-2 border-b border-white/10 flex items-center justify-between text-[11px] text-gray-400 font-mono">
            <span>supabase/migrations/20250101000000_f2k_motors_schema.sql</span>
            <span>PostgreSQL / Supabase</span>
          </div>
          <pre className="p-4 text-xs font-mono text-gray-300 overflow-x-auto max-h-80 leading-relaxed">
            {SUPABASE_SQL_MIGRATION}
          </pre>
        </div>
      </div>

    </div>
  );
};
