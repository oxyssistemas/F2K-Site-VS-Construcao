import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CARS_INVENTORY } from '../data/cars';
import { Car, VehicleImage } from '../types';

// Obter variáveis de ambiente
const ENV_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const ENV_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Chaves locais para persistência e fallback quando desconectado
const STORAGE_KEY_CONFIG = 'f2k_supabase_custom_config';
const STORAGE_KEY_VEHICLES = 'f2k_synced_vehicles';
const STORAGE_KEY_VEHICLE_IMAGES = 'f2k_synced_vehicle_images';
const STORAGE_KEY_LEADS = 'f2k_synced_leads';
const STORAGE_KEY_EVENTS = 'f2k_synced_events';
const STORAGE_KEY_AUTH_SESSION = 'f2k_admin_session';

export const VEHICLE_STORAGE_BUCKET = 'vehicles';
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

export interface FormSubmission {
  id: string;
  form_type: 'financiamento' | 'avaliacao_troca' | 'test_drive' | 'contato_direto' | 'whatsapp';
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  customer_city?: string;
  car_id?: string;
  car_name?: string;
  data: Record<string, any>;
  status: 'novo' | 'em_atendimento' | 'proposta_enviada' | 'aprovado' | 'concluido' | 'perdido';
  internal_notes?: string;
  assigned_to?: string;
  created_at: string;
}

export interface SiteFlowEvent {
  id: string;
  event_type: 'page_view' | 'car_view' | 'simulacao_financiamento' | 'clique_whatsapp' | 'filtro_busca';
  page_path?: string;
  car_id?: string;
  details?: Record<string, any>;
  created_at: string;
}

export interface SiteFlowStats {
  totalPageViews: number;
  totalCarViews: number;
  totalLeads: number;
  newLeadsCount: number;
  conversionRate: number;
  totalInventoryValue: number;
  totalVehiclesCount: number;
  availableVehiclesCount: number;
  topViewedVehicles: Array<{ carId: string; model: string; views: number; price: number; image?: string }>;
  leadsByType: Record<string, number>;
  leadsByStatus: Record<string, number>;
}

// Inicializar configuração ativa
function getActiveConfig(): { url: string; anonKey: string } {
  try {
    const custom = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed.url && parsed.anonKey) {
        return { url: parsed.url, anonKey: parsed.anonKey };
      }
    }
  } catch (e) {
    console.error('Erro ao ler custom config Supabase:', e);
  }
  return {
    url: ENV_SUPABASE_URL,
    anonKey: ENV_SUPABASE_ANON_KEY
  };
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = getActiveConfig();
  if (!url || !anonKey) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        }
      });
    } catch (err) {
      console.error('Falha ao inicializar cliente Supabase:', err);
      return null;
    }
  }
  return supabaseInstance;
}

export function saveCustomSupabaseConfig(url: string, anonKey: string) {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() }));
    supabaseInstance = null; // reinicia a instância
  } catch (e) {
    console.error(e);
  }
}

export function getSupabaseStatus(): SupabaseConfig {
  const { url, anonKey } = getActiveConfig();
  const hasKeys = Boolean(url && anonKey && url.includes('supabase.co'));
  return {
    url,
    anonKey,
    isConnected: hasKeys
  };
}

// ====================================================================
// AUTENTICAÇÃO
// ====================================================================

export interface AdminUser {
  id: string;
  email: string;
  role: string;
}

export async function loginAdmin(email: string, password: string): Promise<{ success: boolean; error?: string; user?: AdminUser }> {
  const client = getSupabase();
  
  if (!client) {
    return { 
      success: false, 
      error: 'Supabase não conectado. Configure as credenciais (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY) no arquivo .env ou no portal para autenticar.' 
    };
  }

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      let friendlyError = error.message;
      if (error.message.includes('Invalid login credentials')) {
        friendlyError = 'E-mail ou senha incorretos no Supabase Auth. Verifique se o usuário foi cadastrado no seu painel Supabase (Authentication > Users).';
      } else if (error.message.includes('Email not confirmed')) {
        friendlyError = 'E-mail cadastrado mas ainda não confirmado no Supabase. Verifique seu e-mail ou desative "Confirm email" em Supabase > Authentication > Providers > Email.';
      } else if (error.message.includes('rate limit')) {
        friendlyError = 'Limite de tentativas excedido. Aguarde alguns instantes antes de tentar novamente.';
      }
      return { success: false, error: friendlyError };
    }

    if (data.user) {
      const user: AdminUser = {
        id: data.user.id,
        email: data.user.email || email,
        role: 'admin'
      };
      localStorage.setItem(STORAGE_KEY_AUTH_SESSION, JSON.stringify(user));
      return { success: true, user };
    }

    return { success: false, error: 'Usuário não retornado pelo Supabase Auth.' };
  } catch (err: any) {
    console.error('Erro na autenticação com Supabase:', err);
    return { success: false, error: err.message || 'Erro de conexão com o Supabase Auth.' };
  }
}

export async function createAdminAccount(email: string, password: string): Promise<{ success: boolean; error?: string; user?: AdminUser }> {
  const client = getSupabase();
  if (!client) {
    return { success: false, error: 'Conecte as credenciais do Supabase para criar novos administradores no Supabase Auth.' };
  }
  try {
    const { data, error } = await client.auth.signUp({
      email: email.trim(),
      password
    });
    if (error) {
      let friendlyError = error.message;
      if (error.message.includes('User already registered')) {
        friendlyError = 'Este e-mail já está cadastrado no Supabase Auth. Faça login diretamente.';
      } else if (error.message.includes('Password should be at least')) {
        friendlyError = 'A senha deve conter no mínimo 6 caracteres.';
      }
      return { success: false, error: friendlyError };
    }

    if (data.user) {
      const user: AdminUser = {
        id: data.user.id,
        email: data.user.email || email,
        role: 'admin'
      };
      // Se não exigir confirmação de e-mail e a sessão já existir:
      if (data.session) {
        localStorage.setItem(STORAGE_KEY_AUTH_SESSION, JSON.stringify(user));
      }
      return { success: true, user };
    }

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function resetAdminPassword(email: string): Promise<{ success: boolean; error?: string }> {
  const client = getSupabase();
  if (!client) {
    return { success: false, error: 'Conecte as credenciais do Supabase para enviar e-mail de recuperação.' };
  }
  try {
    const { error } = await client.auth.resetPasswordForEmail(email.trim());
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function logoutAdmin(): Promise<void> {
  const client = getSupabase();
  if (client) {
    try {
      await client.auth.signOut();
    } catch (e) {
      console.error(e);
    }
  }
  localStorage.removeItem(STORAGE_KEY_AUTH_SESSION);
}

export function getCurrentAdminSession(): AdminUser | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_AUTH_SESSION);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

// ====================================================================
// GESTÃO DE ESTOQUE / VEÍCULOS (CRUD)
// ====================================================================

export function mapDbVehicleToCar(row: any): Car {
  return {
    id: row.id,
    brand: row.brand,
    model: row.model,
    version: row.version || '',
    yearFabrication: row.year_fabrication || row.yearFabrication || 2024,
    yearModel: row.year_model || row.yearModel || 2024,
    price: Number(row.price),
    fipePrice: Number(row.fipe_price || row.fipePrice || row.price * 1.05),
    mileage: Number(row.mileage || 0),
    category: row.category || 'SUV',
    fuel: row.fuel || 'Flex',
    transmission: row.transmission || 'Automático',
    color: row.color || 'Preto',
    plateEnd: Number(row.plate_end || row.plateEnd || 0),
    doors: Number(row.doors || 4),
    images: Array.isArray(row.images) ? row.images : (typeof row.images === 'string' ? JSON.parse(row.images) : []),
    featured: Boolean(row.featured),
    isNewArrival: Boolean(row.is_new_arrival ?? row.isNewArrival),
    tags: Array.isArray(row.tags) ? row.tags : [],
    specifications: row.specifications || {},
    features: row.features || { seguranca: [], conforto: [], tecnologia: [] },
    history: row.history || {
      laudoCautelar: '100% Aprovado',
      garantiaMeses: 12
    },
    description: row.description || ''
  };
}

export function mapCarToDbVehicle(car: Car, status: string = 'disponivel') {
  return {
    id: car.id,
    brand: car.brand,
    model: car.model,
    version: car.version,
    year_fabrication: car.yearFabrication,
    year_model: car.yearModel,
    price: car.price,
    fipe_price: car.fipePrice,
    mileage: car.mileage,
    category: car.category,
    fuel: car.fuel,
    transmission: car.transmission,
    color: car.color,
    plate_end: car.plateEnd,
    doors: car.doors,
    images: car.images,
    featured: car.featured || false,
    is_new_arrival: car.isNewArrival || false,
    tags: car.tags || [],
    status: status,
    specifications: car.specifications,
    features: car.features,
    history: car.history,
    description: car.description,
    updated_at: new Date().toISOString()
  };
}

// Inicializar armazenamento local com o catálogo padrão
function getLocalVehicles(): Car[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_VEHICLES);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Se continha carros mock antigos com IDs de exemplo, limpa
      if (Array.isArray(parsed) && parsed.some(c => c.id?.startsWith('f2k-bmw') || c.id?.startsWith('f2k-porsche'))) {
        localStorage.setItem(STORAGE_KEY_VEHICLES, JSON.stringify([]));
        return [];
      }
      return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  return CARS_INVENTORY;
}

export async function fetchAllVehicles(): Promise<Car[]> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('vehicles')
        .select('*')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        // Tenta buscar as imagens vinculadas da tabela vehicle_images
        let allImages: VehicleImage[] = [];
        try {
          const { data: imgData } = await client
            .from('vehicle_images')
            .select('*')
            .order('is_primary', { ascending: false })
            .order('display_order', { ascending: true });
          if (imgData && imgData.length > 0) {
            allImages = imgData;
            saveLocalVehicleImages(allImages);
          }
        } catch (imgErr) {
          console.warn('Aviso ao carregar vehicle_images:', imgErr);
        }

        const cars = data.map(row => {
          const car = mapDbVehicleToCar(row);
          const carImages = allImages.filter(img => img.vehicle_id === car.id);
          if (carImages.length > 0) {
            car.vehicleImages = carImages;
            // Garante que car.images começa com a foto principal
            car.images = carImages.map(i => i.public_url);
          }
          return car;
        });

        // Atualiza cache local
        localStorage.setItem(STORAGE_KEY_VEHICLES, JSON.stringify(cars));
        return cars;
      }
    } catch (e) {
      console.warn('Falha ao buscar veículos do Supabase, usando local:', e);
    }
  }
  
  // Fallback local
  const localCars = getLocalVehicles();
  const localImages = getLocalVehicleImages();
  return localCars.map(car => {
    const matched = localImages.filter(img => img.vehicle_id === car.id);
    if (matched.length > 0) {
      car.vehicleImages = matched;
      car.images = matched.map(i => i.public_url);
    }
    return car;
  });
}

export async function saveVehicleToSupabase(car: Car, status: string = 'disponivel'): Promise<{ success: boolean; error?: string }> {
  // 1. Atualiza cache local imediatamente
  const localList = getLocalVehicles();
  const index = localList.findIndex(c => c.id === car.id);
  if (index >= 0) {
    localList[index] = car;
  } else {
    localList.unshift(car);
  }
  localStorage.setItem(STORAGE_KEY_VEHICLES, JSON.stringify(localList));

  // 2. Persiste no Supabase
  const client = getSupabase();
  if (client) {
    try {
      const payload = mapCarToDbVehicle(car, status);
      const { error } = await client
        .from('vehicles')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.error('Erro ao salvar no Supabase:', error);
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      console.error(e);
      return { success: false, error: e.message };
    }
  }

  return { success: true };
}

export async function deleteVehicleFromSupabase(id: string): Promise<{ success: boolean; error?: string }> {
  // Remove localmente
  const localList = getLocalVehicles().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY_VEHICLES, JSON.stringify(localList));

  // Remove imagens locais
  const localImages = getLocalVehicleImages().filter(img => img.vehicle_id !== id);
  localStorage.setItem(STORAGE_KEY_VEHICLE_IMAGES, JSON.stringify(localImages));

  const client = getSupabase();
  if (client) {
    try {
      // 1. Deletar arquivos do Storage correspondentes ao veículo
      try {
        const { data: files } = await client.storage.from(VEHICLE_STORAGE_BUCKET).list(id);
        if (files && files.length > 0) {
          const filePaths = files.map(f => `${id}/${f.name}`);
          await client.storage.from(VEHICLE_STORAGE_BUCKET).remove(filePaths);
        }
      } catch (storageErr) {
        console.warn('Aviso ao limpar pasta de fotos no Storage:', storageErr);
      }

      // 2. Deletar registros de vehicle_images
      await client.from('vehicle_images').delete().eq('vehicle_id', id);

      // 3. Deletar veículo
      const { error } = await client
        .from('vehicles')
        .delete()
        .eq('id', id);

      if (error) {
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
  return { success: true };
}

// ====================================================================
// SUPABASE STORAGE & GESTÃO DE FOTOS DOS VEÍCULOS (vehicle_images)
// ====================================================================

function getLocalVehicleImages(vehicleId?: string): VehicleImage[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_VEHICLE_IMAGES);
    if (saved) {
      const all: VehicleImage[] = JSON.parse(saved);
      if (vehicleId) {
        return all
          .filter(img => img.vehicle_id === vehicleId)
          .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
      }
      return all;
    }
  } catch (e) {
    console.error(e);
  }
  return [];
}

function saveLocalVehicleImages(images: VehicleImage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_VEHICLE_IMAGES, JSON.stringify(images));
  } catch (e) {
    console.error(e);
  }
}

/**
 * Sanitiza o nome do arquivo para padrão seguro do Supabase Storage
 */
export function sanitizeFileName(name: string): string {
  const ext = name.substring(name.lastIndexOf('.')).toLowerCase();
  const baseName = name
    .substring(0, name.lastIndexOf('.'))
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .replace(/[^a-z0-9_-]/g, '-') // substitui caracteres inválidos por hífen
    .replace(/-+/g, '-'); // remove hífens consecutivos
  return `${baseName}${ext}`;
}

/**
 * Busca todas as imagens associadas a um veículo
 */
export async function fetchVehicleImages(vehicleId: string): Promise<VehicleImage[]> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('vehicle_images')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('is_primary', { ascending: false })
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true });

      if (!error && data) {
        // Atualiza cache local
        const otherImages = getLocalVehicleImages().filter(img => img.vehicle_id !== vehicleId);
        saveLocalVehicleImages([...otherImages, ...data]);
        return data;
      }
    } catch (e) {
      console.warn('Erro ao buscar imagens no Supabase, usando local:', e);
    }
  }

  // Fallback: Cache local ou extração do array de imagens do veículo
  const local = getLocalVehicleImages(vehicleId);
  if (local.length > 0) return local;

  const vehicle = getLocalVehicles().find(c => c.id === vehicleId);
  if (vehicle && vehicle.images && vehicle.images.length > 0) {
    return vehicle.images.map((url, idx) => ({
      id: `img-${vehicleId}-${idx}`,
      vehicle_id: vehicleId,
      storage_path: `vehicles/${vehicleId}/foto-${idx + 1}.jpg`,
      public_url: url,
      is_primary: idx === 0,
      display_order: idx,
      created_at: new Date().toISOString()
    }));
  }

  return [];
}

/**
 * Sincroniza a lista de URLs de imagens ordenadas de volta no registro do veículo
 */
async function syncVehicleImagesArray(vehicleId: string): Promise<void> {
  const images = await fetchVehicleImages(vehicleId);
  const orderedUrls = images.map(img => img.public_url);

  // Atualiza no cache local
  const vehicles = getLocalVehicles();
  const vIndex = vehicles.findIndex(v => v.id === vehicleId);
  if (vIndex >= 0) {
    vehicles[vIndex].images = orderedUrls.length > 0 ? orderedUrls : vehicles[vIndex].images;
    vehicles[vIndex].vehicleImages = images;
    localStorage.setItem(STORAGE_KEY_VEHICLES, JSON.stringify(vehicles));
  }

  // Atualiza no Supabase
  const client = getSupabase();
  if (client && orderedUrls.length > 0) {
    try {
      await client
        .from('vehicles')
        .update({ images: orderedUrls, updated_at: new Date().toISOString() })
        .eq('id', vehicleId);
    } catch (e) {
      console.warn('Erro ao sincronizar array de imagens no veículo:', e);
    }
  }
}

/**
 * Converte um arquivo em Data URL (Base64) de forma resiliente para contingência
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve((reader.result as string) || URL.createObjectURL(file));
    };
    reader.onerror = () => {
      resolve(URL.createObjectURL(file));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Faz upload de uma foto individual para o Supabase Storage e salva o registro em `vehicle_images`
 */
export async function uploadVehicleImage(
  vehicleId: string,
  file: File,
  isPrimary: boolean = false
): Promise<{ success: boolean; image?: VehicleImage; error?: string; rlsWarning?: boolean }> {
  // 1. Validação de formato (apenas JPG, JPEG, PNG, WEBP)
  const fileType = file.type.toLowerCase();
  const validExts = ['jpg', 'jpeg', 'png', 'webp'];
  const ext = file.name.split('.').pop()?.toLowerCase();

  if (!ALLOWED_IMAGE_TYPES.includes(fileType) && (!ext || !validExts.includes(ext))) {
    return {
      success: false,
      error: `Formato de imagem inválido (${file.type || ext}). Apenas JPG, JPEG, PNG e WEBP são aceitos.`
    };
  }

  // 2. Validação de tamanho (máximo 10MB)
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      success: false,
      error: `Imagem muito grande (${(file.size / (1024 * 1024)).toFixed(1)}MB). O tamanho máximo permitido é 10MB.`
    };
  }

  // 3. Estruturação do caminho de arquivo: vehicles/{vehicleId}/{timestamp}-{nomeSanitizado}
  const cleanName = sanitizeFileName(file.name);
  const uniquePrefix = Date.now().toString().slice(-6);
  const fileName = `${uniquePrefix}-${cleanName}`;
  const relativePath = `${vehicleId}/${fileName}`;
  const fullStoragePath = `vehicles/${vehicleId}/${fileName}`;

  const client = getSupabase();
  let publicUrl = '';
  let rlsWarning = false;

  // 4. Upload no Supabase Storage se conectado
  if (client) {
    try {
      const { error: uploadError } = await client.storage
        .from(VEHICLE_STORAGE_BUCKET)
        .upload(relativePath, file, {
          contentType: file.type || 'image/jpeg',
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) {
        console.warn('Aviso no upload para Supabase Storage:', uploadError.message);
        // Se for erro de RLS (Row Level Security) ou bucket inexistente, usamos Data URL de alta fidelidade como fallback automático
        rlsWarning = uploadError.message.includes('row-level security') || uploadError.message.includes('security policy');
        publicUrl = await fileToDataUrl(file);
      } else {
        const { data: urlData } = client.storage
          .from(VEHICLE_STORAGE_BUCKET)
          .getPublicUrl(relativePath);

        publicUrl = urlData?.publicUrl || (await fileToDataUrl(file));
      }
    } catch (err: any) {
      console.warn('Erro ao enviar imagem ao Supabase Storage, aplicando fallback:', err);
      publicUrl = await fileToDataUrl(file);
    }
  } else {
    // Modo local / contingência sem chaves Supabase
    publicUrl = await fileToDataUrl(file);
  }

  // 5. Verificar se já existem fotos deste veículo (se não existir, a primeira deve ser principal)
  const existingImages = await fetchVehicleImages(vehicleId);
  const shouldBePrimary = isPrimary || existingImages.length === 0;

  // Se esta for marcada como principal, remove a flag das outras
  if (shouldBePrimary && existingImages.length > 0) {
    if (client) {
      try {
        await client
          .from('vehicle_images')
          .update({ is_primary: false })
          .eq('vehicle_id', vehicleId);
      } catch (e) {
        console.warn('Aviso ao desmarcar fotos principais no Supabase:', e);
      }
    }
    const allLocal = getLocalVehicleImages().map(img => 
      img.vehicle_id === vehicleId ? { ...img, is_primary: false } : img
    );
    saveLocalVehicleImages(allLocal);
  }

  const newImageRecord: VehicleImage = {
    id: 'img-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    vehicle_id: vehicleId,
    storage_path: fullStoragePath,
    public_url: publicUrl,
    is_primary: shouldBePrimary,
    display_order: existingImages.length,
    created_at: new Date().toISOString()
  };

  // 6. Salvar na tabela `vehicle_images` do Supabase
  if (client) {
    try {
      const { data: dbData, error: dbError } = await client
        .from('vehicle_images')
        .insert({
          vehicle_id: vehicleId,
          storage_path: fullStoragePath,
          public_url: publicUrl,
          is_primary: shouldBePrimary,
          display_order: existingImages.length
        })
        .select('*')
        .single();

      if (!dbError && dbData) {
        newImageRecord.id = dbData.id;
      } else if (dbError) {
        console.warn('Aviso ao inserir em vehicle_images no Supabase (salvo no cache local):', dbError.message);
      }
    } catch (dbErr) {
      console.warn('Erro ao inserir em vehicle_images no Supabase:', dbErr);
    }
  }

  // 7. Salvar no cache local
  const currentLocalImages = getLocalVehicleImages();
  currentLocalImages.push(newImageRecord);
  saveLocalVehicleImages(currentLocalImages);

  // 8. Sincronizar array de URLs no objeto do veículo
  await syncVehicleImagesArray(vehicleId);

  return {
    success: true,
    image: newImageRecord,
    rlsWarning
  };
}

/**
 * Faz upload em lote de múltiplas fotos com callback de progresso
 */
export async function uploadMultipleVehicleImages(
  vehicleId: string,
  files: File[],
  onProgress?: (current: number, total: number) => void
): Promise<{ success: boolean; uploaded: VehicleImage[]; errors: string[] }> {
  const uploaded: VehicleImage[] = [];
  const errors: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (onProgress) {
      onProgress(i + 1, files.length);
    }

    const res = await uploadVehicleImage(vehicleId, file, i === 0 && uploaded.length === 0);
    if (res.success && res.image) {
      uploaded.push(res.image);
    } else if (res.error) {
      errors.push(`${file.name}: ${res.error}`);
    }
  }

  await syncVehicleImagesArray(vehicleId);

  return {
    success: uploaded.length > 0,
    uploaded,
    errors
  };
}

/**
 * Define uma foto como principal (is_primary = true) e desmarca as demais
 */
export async function setPrimaryVehicleImage(
  vehicleId: string,
  imageId: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Atualizar no Supabase
  const client = getSupabase();
  if (client) {
    try {
      await client
        .from('vehicle_images')
        .update({ is_primary: false })
        .eq('vehicle_id', vehicleId);

      const { error } = await client
        .from('vehicle_images')
        .update({ is_primary: true })
        .eq('id', imageId);

      if (error) {
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }

  // 2. Atualizar no cache local
  const all = getLocalVehicleImages().map(img => {
    if (img.vehicle_id === vehicleId) {
      return { ...img, is_primary: img.id === imageId };
    }
    return img;
  });
  saveLocalVehicleImages(all);

  // 3. Sincronizar array de URLs do veículo colocando a foto principal em primeiro
  await syncVehicleImagesArray(vehicleId);

  return { success: true };
}

/**
 * Exclui uma foto do Supabase Storage e da tabela `vehicle_images`
 */
export async function deleteVehicleImage(
  imageId: string,
  vehicleId: string,
  storagePath: string
): Promise<{ success: boolean; error?: string }> {
  // 1. Extrair caminho relativo ao bucket (ex: "vehicles/123/frente.jpg" -> "123/frente.jpg")
  const pathInBucket = storagePath.startsWith('vehicles/') 
    ? storagePath.replace(/^vehicles\//, '') 
    : storagePath;

  const client = getSupabase();
  if (client) {
    try {
      // Deletar do Storage
      const { error: storageError } = await client.storage
        .from(VEHICLE_STORAGE_BUCKET)
        .remove([pathInBucket]);

      if (storageError) {
        console.warn('Aviso ao deletar do Storage:', storageError.message);
      }

      // Deletar da tabela vehicle_images
      const { error: dbError } = await client
        .from('vehicle_images')
        .delete()
        .eq('id', imageId);

      if (dbError) {
        return { success: false, error: dbError.message };
      }
    } catch (e: any) {
      console.error(e);
      return { success: false, error: e.message };
    }
  }

  // 2. Remover do cache local
  const currentImages = getLocalVehicleImages();
  const deletedImage = currentImages.find(img => img.id === imageId);
  const remaining = currentImages.filter(img => img.id !== imageId);

  // Se a imagem deletada era a principal e ainda restam fotos, define a primeira como principal
  if (deletedImage?.is_primary) {
    const remainingForVehicle = remaining.filter(img => img.vehicle_id === vehicleId);
    if (remainingForVehicle.length > 0) {
      remainingForVehicle[0].is_primary = true;
      if (client) {
        await client
          .from('vehicle_images')
          .update({ is_primary: true })
          .eq('id', remainingForVehicle[0].id);
      }
    }
  }

  saveLocalVehicleImages(remaining);

  // 3. Sincronizar array do veículo
  await syncVehicleImagesArray(vehicleId);

  return { success: true };
}

// ====================================================================
// FORMULÁRIOS & PROPOSTAS (LEADS)
// ====================================================================

function getLocalLeads(): FormSubmission[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LEADS);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Se continha leads demo de exemplo, limpa para iniciar zerado
      if (Array.isArray(parsed) && parsed.some(l => l.id?.startsWith('demo-lead-'))) {
        localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify([]));
        return [];
      }
      return parsed;
    }
  } catch (e) {
    console.error(e);
  }
  return [];
}

export async function fetchFormSubmissions(): Promise<FormSubmission[]> {
  const client = getSupabase();
  if (client) {
    try {
      const { data, error } = await client
        .from('form_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(data));
        return data as FormSubmission[];
      }
    } catch (e) {
      console.warn('Falha ao buscar formulários do Supabase, usando local:', e);
    }
  }
  return getLocalLeads();
}

export async function submitLeadForm(lead: Omit<FormSubmission, 'id' | 'created_at' | 'status'>): Promise<{ success: boolean; id: string }> {
  const newId = 'lead-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
  const fullLead: FormSubmission = {
    ...lead,
    id: newId,
    status: 'novo',
    created_at: new Date().toISOString()
  };

  // Salva local
  const current = getLocalLeads();
  current.unshift(fullLead);
  localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(current));

  // Envia ao Supabase
  const client = getSupabase();
  if (client) {
    try {
      await client.from('form_submissions').insert({
        form_type: fullLead.form_type,
        customer_name: fullLead.customer_name,
        customer_phone: fullLead.customer_phone,
        customer_email: fullLead.customer_email || null,
        customer_city: fullLead.customer_city || null,
        car_id: fullLead.car_id || null,
        car_name: fullLead.car_name || null,
        data: fullLead.data,
        status: 'novo',
        internal_notes: fullLead.internal_notes || null
      });
    } catch (e) {
      console.error('Erro ao enviar lead para Supabase:', e);
    }
  }

  // Registra evento de fluxo
  recordSiteEvent('simulacao_financiamento', { form_type: lead.form_type, car_id: lead.car_id });

  return { success: true, id: newId };
}

export async function updateLeadStatus(id: string, status: FormSubmission['status'], internal_notes?: string): Promise<{ success: boolean }> {
  const list = getLocalLeads();
  const target = list.find(l => l.id === id);
  if (target) {
    target.status = status;
    if (internal_notes !== undefined) {
      target.internal_notes = internal_notes;
    }
    localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(list));
  }

  const client = getSupabase();
  if (client) {
    try {
      await client
        .from('form_submissions')
        .update({
          status,
          ...(internal_notes !== undefined ? { internal_notes } : {}),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
    } catch (e) {
      console.error(e);
    }
  }
  return { success: true };
}

export async function deleteLead(id: string): Promise<{ success: boolean }> {
  const filtered = getLocalLeads().filter(l => l.id !== id);
  localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(filtered));

  const client = getSupabase();
  if (client) {
    try {
      await client.from('form_submissions').delete().eq('id', id);
    } catch (e) {
      console.error(e);
    }
  }
  return { success: true };
}

// ====================================================================
// CONTROLE DE FLUXO DO SITE & TELEMETRIA
// ====================================================================

function getLocalEvents(): SiteFlowEvent[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_EVENTS);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export interface RecordSiteEventOptions {
  event_type: SiteFlowEvent['event_type'];
  path?: string;
  page_path?: string;
  car_id?: string;
  details?: Record<string, any>;
  metadata?: Record<string, any>;
}

export async function recordSiteEvent(
  paramsOrType: RecordSiteEventOptions | SiteFlowEvent['event_type'], 
  details: Record<string, any> = {}, 
  carId?: string,
  pagePath: string = window.location.pathname
): Promise<void> {
  let eventType: SiteFlowEvent['event_type'];
  let actualDetails: Record<string, any> = details;
  let actualCarId: string | undefined = carId;
  let actualPath: string = pagePath;

  if (typeof paramsOrType === 'object') {
    eventType = paramsOrType.event_type;
    actualDetails = paramsOrType.details || paramsOrType.metadata || {};
    actualCarId = paramsOrType.car_id;
    actualPath = paramsOrType.path || paramsOrType.page_path || window.location.pathname;
  } else {
    eventType = paramsOrType;
  }

  const newEvent: SiteFlowEvent = {
    id: 'evt-' + Date.now(),
    event_type: eventType,
    page_path: actualPath,
    car_id: actualCarId,
    details: actualDetails,
    created_at: new Date().toISOString()
  };

  const current = getLocalEvents();
  current.push(newEvent);
  // Mantém apenas os últimos 500 eventos locais
  if (current.length > 500) current.shift();
  try {
    localStorage.setItem(STORAGE_KEY_EVENTS, JSON.stringify(current));
  } catch (e) {
    console.error(e);
  }

  // Enviar assincronamente ao Supabase se configurado
  const client = getSupabase();
  if (client) {
    try {
      await client.from('site_flow_events').insert({
        event_type: eventType,
        page_path: actualPath,
        car_id: actualCarId || null,
        details: actualDetails,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'browser'
      });
    } catch (err) {
      console.warn('Erro ao registrar evento no Supabase:', err);
    }
  }
}

export async function getSiteFlowStats(): Promise<SiteFlowStats> {
  const vehicles = await fetchAllVehicles();
  const leads = await fetchFormSubmissions();
  const events = getLocalEvents();

  const totalPageViews = events.filter(e => e.event_type === 'page_view').length;
  const totalCarViews = events.filter(e => e.event_type === 'car_view').length;
  const totalLeads = leads.length;
  const newLeadsCount = leads.filter(l => l.status === 'novo').length;

  const totalInventoryValue = vehicles.reduce((sum, v) => sum + (v.price || 0), 0);
  const totalVehiclesCount = vehicles.length;
  const availableVehiclesCount = vehicles.length;

  const conversionRate = totalPageViews > 0 ? Number(((totalLeads / totalPageViews) * 100).toFixed(2)) : 0;

  // Carros mais visualizados
  const carViewsMap: Record<string, number> = {};
  events.forEach(e => {
    if (e.car_id) {
      carViewsMap[e.car_id] = (carViewsMap[e.car_id] || 0) + 1;
    }
  });

  const topViewedVehicles = vehicles.map(v => ({
    carId: v.id,
    model: `${v.brand} ${v.model}`,
    price: v.price,
    views: carViewsMap[v.id] || 0,
    image: v.images && v.images.length > 0 ? v.images[0] : undefined
  })).sort((a, b) => b.views - a.views).slice(0, 5);

  const leadsByType: Record<string, number> = {};
  const leadsByStatus: Record<string, number> = {};

  leads.forEach(l => {
    leadsByType[l.form_type] = (leadsByType[l.form_type] || 0) + 1;
    leadsByStatus[l.status] = (leadsByStatus[l.status] || 0) + 1;
  });

  return {
    totalPageViews,
    totalCarViews,
    totalLeads,
    newLeadsCount,
    conversionRate,
    totalInventoryValue,
    totalVehiclesCount,
    availableVehiclesCount,
    topViewedVehicles,
    leadsByType,
    leadsByStatus
  };
}

// SQL Script para exibição e cópia direta no painel administrativo
export const SUPABASE_SQL_MIGRATION = `-- ====================================================================
-- F2K MOTORS - SUPABASE DATABASE INITIALIZATION MIGRATION
-- Copie e cole este script no SQL Editor do seu projeto Supabase
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Veículos (Estoque)
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
  status TEXT NOT NULL DEFAULT 'disponivel',
  specifications JSONB DEFAULT '{}'::jsonb,
  features JSONB DEFAULT '{"seguranca":[],"conforto":[],"tecnologia":[]}'::jsonb,
  history JSONB DEFAULT '{"laudoCautelar":"100% Aprovado","unicoDono":true,"revisoesNaConcessionaria":true,"garantiaMeses":12,"ipvaPago":true}'::jsonb,
  description TEXT,
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Tabela de Formulários e Propostas de Leads
CREATE TABLE IF NOT EXISTS public.form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_type TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_city TEXT,
  car_id TEXT REFERENCES public.vehicles(id) ON DELETE SET NULL,
  car_name TEXT,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'novo',
  internal_notes TEXT,
  assigned_to TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabela de Métricas de Fluxo do Site
CREATE TABLE IF NOT EXISTS public.site_flow_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  page_path TEXT,
  car_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Tabela de Imagens dos Veículos (vehicle_images)
CREATE TABLE IF NOT EXISTS public.vehicle_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id TEXT NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id ON public.vehicle_images(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_is_primary ON public.vehicle_images(vehicle_id, is_primary);

-- 5. Configuração do Bucket de Storage 'vehicles'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicles', 
  'vehicles', 
  true, 
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- 6. Habilitar Row Level Security (RLS)
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_flow_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança para Tabelas
CREATE POLICY "Veículos visíveis para todos" ON public.vehicles FOR SELECT USING (true);
CREATE POLICY "Permitir gerenciar estoque" ON public.vehicles FOR ALL USING (true);

CREATE POLICY "Visitantes enviam propostas" ON public.form_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir gerenciar propostas" ON public.form_submissions FOR ALL USING (true);

CREATE POLICY "Eventos de fluxo públicos" ON public.site_flow_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir leitura de métricas" ON public.site_flow_events FOR SELECT USING (true);

CREATE POLICY "Permitir leitura de imagens" ON public.vehicle_images FOR SELECT USING (true);
CREATE POLICY "Permitir gerenciar imagens" ON public.vehicle_images FOR ALL USING (true);

-- Políticas de Storage (Bucket 'vehicles')
CREATE POLICY "Permitir leitura no bucket vehicles" ON storage.objects FOR SELECT USING (bucket_id = 'vehicles');
CREATE POLICY "Permitir upload no bucket vehicles" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vehicles');
CREATE POLICY "Permitir update no bucket vehicles" ON storage.objects FOR UPDATE USING (bucket_id = 'vehicles') WITH CHECK (bucket_id = 'vehicles');
CREATE POLICY "Permitir delete no bucket vehicles" ON storage.objects FOR DELETE USING (bucket_id = 'vehicles');
`;

// Script RLS focado na liberação e criação completa de tabelas e permissões de imagens/storage
export const SUPABASE_STORAGE_FIX_SQL = `-- ====================================================================
-- F2K MOTORS - CRIAÇÃO DE TABELAS & LIBERAÇÃO DO SUPABASE STORAGE
-- Execute este script no SQL Editor do seu projeto Supabase:
-- ====================================================================

-- 1. Extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Assegurar criação da tabela 'vehicles' caso ainda não exista
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

-- 3. Criar tabela 'vehicle_images' ANTES de qualquer política
CREATE TABLE IF NOT EXISTS public.vehicle_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_vehicle_images_vehicle_id ON public.vehicle_images(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_is_primary ON public.vehicle_images(vehicle_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_vehicle_images_order ON public.vehicle_images(vehicle_id, display_order ASC, created_at ASC);

-- 4. Habilitar RLS na tabela vehicle_images
ALTER TABLE public.vehicle_images ENABLE ROW LEVEL SECURITY;

-- Limpar e recriar políticas da tabela vehicle_images
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

CREATE POLICY "Permitir leitura de imagens" ON public.vehicle_images FOR SELECT USING (true);
CREATE POLICY "Permitir gerenciar imagens" ON public.vehicle_images FOR ALL USING (true);

-- 5. Criar e Configurar o Bucket de Storage 'vehicles'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'vehicles', 
  'vehicles', 
  true, 
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

-- 6. Limpar e recriar políticas do Storage (bucket vehicles)
DROP POLICY IF EXISTS "Fotos de veículos no Storage são públicas" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem fazer upload de fotos de veículos no Storage" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem atualizar fotos de veículos no Storage" ON storage.objects;
DROP POLICY IF EXISTS "Admins podem deletar fotos de veículos no Storage" ON storage.objects;
DROP POLICY IF EXISTS "Permitir upload no bucket vehicles" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura no bucket vehicles" ON storage.objects;
DROP POLICY IF EXISTS "Permitir update no bucket vehicles" ON storage.objects;
DROP POLICY IF EXISTS "Permitir delete no bucket vehicles" ON storage.objects;
DROP POLICY IF EXISTS "Acesso total ao bucket vehicles" ON storage.objects;

CREATE POLICY "Permitir leitura no bucket vehicles"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vehicles');

CREATE POLICY "Permitir upload no bucket vehicles"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vehicles');

CREATE POLICY "Permitir update no bucket vehicles"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'vehicles')
  WITH CHECK (bucket_id = 'vehicles');

CREATE POLICY "Permitir delete no bucket vehicles"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'vehicles');
`;
