-- ====================================================================
-- F2K MOTORS - SUPABASE DATABASE INITIALIZATION MIGRATION
-- Data: 2025 / Schema Oficial F2K MOTORS
-- ====================================================================

-- 1. Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Veículos em Estoque (vehicles)
CREATE TABLE IF NOT EXISTS public.vehicles (
  id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  version TEXT NOT NULL,
  year_fabrication INTEGER NOT NULL,
  year_model INTEGER NOT NULL,
  price NUMERIC(12, 2) NOT NULL,
  fipe_price NUMERIC(12, 2),
  mileage INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'SUV',
  fuel TEXT NOT NULL DEFAULT 'Flex',
  transmission TEXT NOT NULL DEFAULT 'Automático',
  color TEXT NOT NULL DEFAULT 'Preto',
  plate_end INTEGER,
  doors INTEGER DEFAULT 4,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  featured BOOLEAN NOT NULL DEFAULT false,
  is_new_arrival BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'disponivel', -- 'disponivel' | 'reservado' | 'vendido'
  specifications JSONB DEFAULT '{}'::jsonb,
  features JSONB DEFAULT '{"seguranca":[],"conforto":[],"tecnologia":[]}'::jsonb,
  history JSONB DEFAULT '{"laudoCautelar":"100% Aprovado","unicoDono":true,"revisoesNaConcessionaria":true,"garantiaMeses":12,"ipvaPago":true}'::jsonb,
  description TEXT,
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para buscas rápidas no estoque
CREATE INDEX IF NOT EXISTS idx_vehicles_brand ON public.vehicles(brand);
CREATE INDEX IF NOT EXISTS idx_vehicles_category ON public.vehicles(category);
CREATE INDEX IF NOT EXISTS idx_vehicles_price ON public.vehicles(price);
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON public.vehicles(status);
CREATE INDEX IF NOT EXISTS idx_vehicles_featured ON public.vehicles(featured);

-- 3. Tabela de Formulários e Propostas de Leads (form_submissions)
CREATE TABLE IF NOT EXISTS public.form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type TEXT NOT NULL, -- 'financiamento' | 'avaliacao_troca' | 'test_drive' | 'contato_direto' | 'whatsapp'
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_city TEXT,
  car_id TEXT REFERENCES public.vehicles(id) ON DELETE SET NULL,
  car_name TEXT,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'novo', -- 'novo' | 'em_atendimento' | 'proposta_enviada' | 'aprovado' | 'concluido' | 'perdido'
  internal_notes TEXT,
  assigned_to TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_form_submissions_type ON public.form_submissions(form_type);
CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON public.form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON public.form_submissions(created_at DESC);

-- 4. Tabela de Métricas e Fluxo do Site (site_flow_events)
CREATE TABLE IF NOT EXISTS public.site_flow_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL, -- 'page_view' | 'car_view' | 'simulacao_financiamento' | 'clique_whatsapp' | 'filtro_busca'
  page_path TEXT,
  car_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_flow_event_type ON public.site_flow_events(event_type);
CREATE INDEX IF NOT EXISTS idx_site_flow_created_at ON public.site_flow_events(created_at DESC);

-- 5. Configuração de Row Level Security (RLS)
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_flow_events ENABLE ROW LEVEL SECURITY;

-- Políticas para VEHICLES:
-- Leitura pública para que os visitantes vejam o estoque no site
CREATE POLICY "Veículos são visíveis publicamente" 
  ON public.vehicles FOR SELECT 
  USING (true);

-- Apenas administradores autenticados podem inserir, editar ou excluir veículos
CREATE POLICY "Admins podem inserir veículos" 
  ON public.vehicles FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

CREATE POLICY "Admins podem atualizar veículos" 
  ON public.vehicles FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Admins podem deletar veículos" 
  ON public.vehicles FOR DELETE 
  TO authenticated 
  USING (true);

-- Políticas para FORM_SUBMISSIONS:
-- Visitantes anônimos podem submeter formulários pelo site
CREATE POLICY "Qualquer visitante pode enviar formulário" 
  ON public.form_submissions FOR INSERT 
  WITH CHECK (true);

-- Apenas administradores autenticados podem ler e gerenciar leads
CREATE POLICY "Admins podem visualizar formulários recebidos" 
  ON public.form_submissions FOR SELECT 
  TO authenticated 
  USING (true);

CREATE POLICY "Admins podem atualizar status dos formulários" 
  ON public.form_submissions FOR UPDATE 
  TO authenticated 
  USING (true);

CREATE POLICY "Admins podem deletar formulários" 
  ON public.form_submissions FOR DELETE 
  TO authenticated 
  USING (true);

-- Políticas para SITE_FLOW_EVENTS:
-- Registro público de telemetria/fluxo de navegação
CREATE POLICY "Registro público de fluxo de eventos" 
  ON public.site_flow_events FOR INSERT 
  WITH CHECK (true);

-- Apenas administradores autenticados podem analisar o fluxo
CREATE POLICY "Admins podem ler métricas de fluxo" 
  ON public.site_flow_events FOR SELECT 
  TO authenticated 
  USING (true);
