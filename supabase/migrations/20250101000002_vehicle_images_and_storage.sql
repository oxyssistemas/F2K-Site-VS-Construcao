-- ====================================================================
-- F2K MOTORS - SUPABASE STORAGE & VEHICLE IMAGES MIGRATION
-- Migration: 20250101000002_vehicle_images_and_storage.sql
-- ====================================================================

-- 1. Extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Assegurar tabela vehicles
CREATE TABLE IF NOT EXISTS public.vehicles (
  id TEXT PRIMARY KEY,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  version TEXT,
  year_fab INTEGER NOT NULL,
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
  status TEXT NOT NULL DEFAULT 'disponivel',
  specifications JSONB DEFAULT '{}'::jsonb,
  features JSONB DEFAULT '{"seguranca":[],"conforto":[],"tecnologia":[]}'::jsonb,
  history JSONB DEFAULT '{"laudoCautelar":"100% Aprovado","unicoDono":true,"revisoesNaConcessionaria":true,"garantiaMeses":12,"ipvaPago":true}'::jsonb,
  description TEXT,
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Criar tabela de imagens dos veículos (vehicle_images)
CREATE TABLE IF NOT EXISTS public.vehicle_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id ON public.vehicle_images(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_is_primary ON public.vehicle_images(vehicle_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_order ON public.vehicle_images(vehicle_id, display_order ASC, created_at ASC);

-- 4. Habilitar RLS na tabela vehicle_images
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;

-- Limpar políticas antigas de vehicle_images
DROP POLICY IF EXISTS "Imagens de veículos são visíveis publicamente" ON public.vehicle_images;
DROP POLICY IF EXISTS "Admins podem inserir imagens de veículos" ON public.vehicle_images;
DROP POLICY IF EXISTS "Admins podem atualizar imagens de veículos" ON public.vehicle_images;
DROP POLICY IF EXISTS "Admins podem deletar imagens de veículos" ON public.vehicle_images;
DROP POLICY IF EXISTS "Permitir leitura de imagens" ON public.vehicle_images;
DROP POLICY IF EXISTS "Permitir inserção de imagens" ON public.vehicle_images;
DROP POLICY IF EXISTS "Permitir atualização de imagens" ON public.vehicle_images;
DROP POLICY IF EXISTS "Permitir exclusão de imagens" ON public.vehicle_images;
DROP POLICY IF EXISTS "Permitir gerenciar imagens" ON public.vehicle_images;
DROP POLICY IF EXISTS "Acesso total a vehicle_images" ON public.vehicle_images;

-- Políticas universais de RLS para vehicle_images (leitura e escrita)
CREATE POLICY "Permitir leitura de imagens" 
  ON public.vehicle_images FOR SELECT 
  USING (true);

CREATE POLICY "Permitir gerenciar imagens" 
  ON public.vehicle_images FOR ALL 
  USING (true);

-- 5. Criar e Configurar o Bucket de Storage 'vehicles' no Supabase
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicles', 
  'vehicles', 
  true, 
  10485760, -- Limite de 10MB por foto
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- 6. Políticas de Segurança RLS para o Storage 'vehicles'
-- Limpar políticas antigas do bucket vehicles
DROP POLICY IF EXISTS "Fotos de veículos no Storage são públicas" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem fazer upload de fotos de veículos no Storage" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem atualizar fotos de veículos no Storage" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem deletar fotos de veículos no Storage" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload no bucket vehicles" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura no bucket vehicles" ON storage.objects;
DROP POLICY IF EXISTS "Permitir update no bucket vehicles" ON storage.objects;
DROP POLICY IF EXISTS "Permitir delete no bucket vehicles" ON storage.objects;
DROP POLICY IF EXISTS "Acesso total ao bucket vehicles" ON storage.objects;

-- Leitura pública de fotos dos veículos
CREATE POLICY "Permitir leitura no bucket vehicles"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vehicles');

-- Upload permitido para o bucket vehicles (tanto anon quanto authenticated)
CREATE POLICY "Permitir upload no bucket vehicles"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vehicles');

-- Atualização permitida no bucket vehicles
CREATE POLICY "Permitir update no bucket vehicles"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'vehicles')
  WITH CHECK (bucket_id = 'vehicles');

-- Exclusão permitida no bucket vehicles
CREATE POLICY "Permitir delete no bucket vehicles"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'vehicles');
