import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Trash2, 
  Star, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Plus, 
  RefreshCw, 
  X,
  FileImage,
  ExternalLink,
  Copy,
  Check,
  ShieldAlert,
  Code
} from 'lucide-react';
import { VehicleImage } from '../../types';
import { 
  fetchVehicleImages, 
  uploadVehicleImage, 
  setPrimaryVehicleImage, 
  deleteVehicleImage,
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  SUPABASE_STORAGE_FIX_SQL
} from '../../lib/supabase';

interface VehicleImageUploadManagerProps {
  vehicleId: string;
  onImagesChange: (images: string[], primaryImage?: string) => void;
  initialImages?: string[];
}

interface PendingUpload {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  errorMessage?: string;
}

export const VehicleImageUploadManager: React.FC<VehicleImageUploadManagerProps> = ({
  vehicleId,
  onImagesChange,
  initialImages = []
}) => {
  const [savedImages, setSavedImages] = useState<VehicleImage[]>([]);
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([]);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [rlsNotice, setRlsNotice] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [externalUrlInput, setExternalUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar imagens salvas no Supabase Storage / Tabela vehicle_images
  const loadImages = async () => {
    if (!vehicleId) return;
    setIsLoadingExisting(true);
    try {
      const list = await fetchVehicleImages(vehicleId);
      setSavedImages(list);
      
      // Notifica o formulário pai
      const urls = list.map(img => img.public_url);
      const primary = list.find(img => img.is_primary)?.public_url || urls[0];
      onImagesChange(urls.length > 0 ? urls : initialImages, primary);
    } catch (err) {
      console.error('Erro ao carregar imagens do veículo:', err);
    } finally {
      setIsLoadingExisting(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, [vehicleId]);

  // Copiar script de correção RLS
  const handleCopyFixSql = () => {
    navigator.clipboard.writeText(SUPABASE_STORAGE_FIX_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  // Validação de formato e tamanho do arquivo
  const validateFile = (file: File): string | null => {
    const fileType = file.type.toLowerCase();
    const ext = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
    
    if (!ALLOWED_IMAGE_TYPES.includes(fileType) && (!ext || !validExtensions.includes(ext))) {
      return `Arquivo "${file.name}" inválido. Aceitamos apenas JPG, JPEG, PNG e WEBP.`;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return `Arquivo "${file.name}" muito pesado (${(file.size / (1024 * 1024)).toFixed(1)}MB). O limite é 10MB por foto.`;
    }

    return null;
  };

  // Processamento de seleção de arquivos (Múltiplas fotos de uma vez)
  const handleFilesSelected = async (files: FileList | File[]) => {
    setErrorBanner(null);
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    const newPendingList: PendingUpload[] = [];
    const validationErrors: string[] = [];

    for (const file of fileArray) {
      const err = validateFile(file);
      if (err) {
        validationErrors.push(err);
        continue;
      }

      newPendingList.push({
        id: 'pending-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        file,
        previewUrl: URL.createObjectURL(file),
        status: 'pending',
        progress: 0
      });
    }

    if (validationErrors.length > 0) {
      setErrorBanner(validationErrors.join(' | '));
    }

    if (newPendingList.length === 0) return;

    setPendingUploads(prev => [...prev, ...newPendingList]);

    // Dispara upload para cada arquivo para o Supabase Storage (vehicles/{vehicleId}/...)
    for (const pending of newPendingList) {
      setPendingUploads(prev => prev.map(p => p.id === pending.id ? { ...p, status: 'uploading', progress: 30 } : p));

      try {
        const isFirstGlobal = savedImages.length === 0 && newPendingList[0].id === pending.id;
        
        setPendingUploads(prev => prev.map(p => p.id === pending.id ? { ...p, progress: 65 } : p));

        const result = await uploadVehicleImage(vehicleId, pending.file, isFirstGlobal);

        if (result.success && result.image) {
          if (result.rlsWarning) {
            setRlsNotice(true);
          }

          setPendingUploads(prev => prev.map(p => p.id === pending.id ? { ...p, status: 'success', progress: 100 } : p));

          // Atualiza lista de imagens salvas
          setSavedImages(prev => {
            const updated = result.image!.is_primary 
              ? [result.image!, ...prev.map(img => ({ ...img, is_primary: false }))]
              : [...prev, result.image!];
            
            const urls = updated.map(img => img.public_url);
            const primary = updated.find(img => img.is_primary)?.public_url || urls[0];
            onImagesChange(urls, primary);
            return updated;
          });

          setTimeout(() => {
            setPendingUploads(prev => prev.filter(p => p.id !== pending.id));
            URL.revokeObjectURL(pending.previewUrl);
          }, 800);

        } else {
          setPendingUploads(prev => prev.map(p => p.id === pending.id ? { 
            ...p, 
            status: 'error', 
            errorMessage: result.error || 'Falha no upload para o Storage' 
          } : p));
        }
      } catch (uploadErr: any) {
        setPendingUploads(prev => prev.map(p => p.id === pending.id ? { 
          ...p, 
          status: 'error', 
          errorMessage: uploadErr.message || 'Erro inesperado' 
        } : p));
      }
    }
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  // Definir como Foto Principal (is_primary = true)
  const handleSetPrimary = async (image: VehicleImage) => {
    try {
      const res = await setPrimaryVehicleImage(vehicleId, image.id);
      if (res.success) {
        setSavedImages(prev => {
          const updated = prev.map(img => ({
            ...img,
            is_primary: img.id === image.id
          })).sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0));
          
          const urls = updated.map(img => img.public_url);
          const primary = updated.find(img => img.is_primary)?.public_url || urls[0];
          onImagesChange(urls, primary);
          return updated;
        });
      }
    } catch (err) {
      console.error('Erro ao definir foto principal:', err);
    }
  };

  // Excluir foto do Supabase Storage e do banco
  const handleDeleteImage = async (image: VehicleImage) => {
    if (!window.confirm('Tem certeza que deseja excluir esta foto do Supabase Storage e do banco de dados?')) {
      return;
    }

    try {
      const res = await deleteVehicleImage(image.id, vehicleId, image.storage_path);
      if (res.success) {
        setSavedImages(prev => {
          const remaining = prev.filter(img => img.id !== image.id);
          // Se a excluída era principal, a primeira remanescente vira principal
          if (image.is_primary && remaining.length > 0) {
            remaining[0].is_primary = true;
          }
          const urls = remaining.map(img => img.public_url);
          const primary = remaining.find(img => img.is_primary)?.public_url || urls[0];
          onImagesChange(urls, primary);
          return remaining;
        });
      }
    } catch (err) {
      console.error('Erro ao excluir foto:', err);
    }
  };

  // Adicionar URL Externa como fallback
  const handleAddExternalUrl = () => {
    if (!externalUrlInput.trim()) return;
    const url = externalUrlInput.trim();

    const mockRecord: VehicleImage = {
      id: 'ext-' + Date.now(),
      vehicle_id: vehicleId,
      storage_path: `external/${vehicleId}/link-${Date.now()}`,
      public_url: url,
      is_primary: savedImages.length === 0,
      created_at: new Date().toISOString()
    };

    setSavedImages(prev => {
      const updated = [...prev, mockRecord];
      const urls = updated.map(img => img.public_url);
      const primary = updated.find(img => img.is_primary)?.public_url || urls[0];
      onImagesChange(urls, primary);
      return updated;
    });

    setExternalUrlInput('');
  };

  return (
    <div className="space-y-4">
      
      {/* Cabeçalho da Seção de Fotos */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div>
          <h3 className="text-xs font-bold text-[#e50914] uppercase tracking-wider flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4" /> Fotos do Veículo & Galeria Supabase Storage
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Organização: <code className="text-red-400 font-mono">vehicles/{vehicleId || '{id}'}/[nome].ext</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isLoadingExisting && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin text-red-500" /> Sincronizando fotos...
            </span>
          )}
          <button
            type="button"
            onClick={handleCopyFixSql}
            title="Copiar script SQL para liberar permissões RLS no Supabase"
            className="px-2 py-1 text-[11px] bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg flex items-center gap-1 transition-colors border border-white/10"
          >
            {copiedSql ? <Check className="w-3 h-3 text-green-400" /> : <Code className="w-3 h-3 text-red-400" />}
            {copiedSql ? 'SQL Copiado!' : 'SQL Storage RLS'}
          </button>
          <button
            type="button"
            onClick={loadImages}
            title="Recarregar fotos do Storage"
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Alerta Informativo de RLS do Supabase Storage */}
      {rlsNotice && (
        <div className="p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300">Aviso do Supabase Storage (RLS)</p>
              <p className="text-[11px] text-amber-200/80 mt-0.5">
                A foto foi salva e vinculada com sucesso no veículo. Para liberar o upload direto no Storage sem restrições, execute a política RLS no seu projeto Supabase.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
            <button
              type="button"
              onClick={handleCopyFixSql}
              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg font-bold text-[11px] flex items-center gap-1.5 transition-colors"
            >
              {copiedSql ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              {copiedSql ? 'Copiado!' : 'Copiar SQL RLS'}
            </button>
            <button
              type="button"
              onClick={() => setRlsNotice(false)}
              className="p-1 text-amber-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Alerta de Erro */}
      {errorBanner && (
        <div className="p-3 bg-red-950/70 border border-red-500/50 rounded-xl text-red-300 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{errorBanner}</span>
          </div>
          <button type="button" onClick={() => setErrorBanner(null)} className="text-red-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Dropzone de Upload Múltiplo */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragging 
            ? 'border-red-500 bg-red-950/30 ring-4 ring-red-500/20' 
            : 'border-white/15 bg-[#141418] hover:border-red-500/60 hover:bg-[#1a1a20]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={e => {
            if (e.target.files) handleFilesSelected(e.target.files);
            e.target.value = '';
          }}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
          <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <UploadCloud className="w-6 h-6 animate-pulse" />
          </div>
          
          <div>
            <p className="text-sm font-bold text-white">
              Arraste múltiplas fotos do carro aqui ou <span className="text-red-500 underline">clique para selecionar</span>
            </p>
            <p className="text-xs text-gray-400 mt-1 font-mono">
              Formatos aceitos: <strong>JPG, JPEG, PNG, WEBP</strong> (Máx: 10MB por foto)
            </p>
          </div>
        </div>
      </div>

      {/* Opção para adicionar foto via link externo */}
      <div className="flex gap-2">
        <input
          type="url"
          placeholder="Ou cole uma URL externa direta (ex: https://images.unsplash.com/...)"
          value={externalUrlInput}
          onChange={e => setExternalUrlInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleAddExternalUrl();
            }
          }}
          className="flex-1 bg-[#1a1a20] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-500 text-xs focus:border-red-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={handleAddExternalUrl}
          className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Adicionar Link
        </button>
      </div>

      {/* Fila de Uploads em Andamento */}
      {pendingUploads.length > 0 && (
        <div className="space-y-2 pt-2">
          <p className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-red-500" /> Enviando para Supabase Storage:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {pendingUploads.map(pending => (
              <div key={pending.id} className="relative bg-[#16161c] border border-white/10 rounded-xl p-2.5 flex items-center gap-3 overflow-hidden">
                <img 
                  src={pending.previewUrl} 
                  alt={pending.file.name} 
                  className="w-14 h-14 object-cover rounded-lg bg-black shrink-0 border border-white/10" 
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{pending.file.name}</p>
                  <p className="text-[10px] text-gray-400 font-mono">
                    {(pending.file.size / 1024).toFixed(0)} KB
                  </p>

                  {/* Barra de Progresso */}
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        pending.status === 'error' ? 'bg-red-500' : 'bg-red-600'
                      }`}
                      style={{ width: `${pending.progress}%` }}
                    />
                  </div>

                  <p className="text-[10px] mt-1 flex items-center gap-1">
                    {pending.status === 'uploading' && (
                      <span className="text-amber-400 flex items-center gap-1">
                        <Loader2 className="w-2.5 h-2.5 animate-spin" /> Enviando...
                      </span>
                    )}
                    {pending.status === 'success' && (
                      <span className="text-green-400 flex items-center gap-1 font-bold">
                        <CheckCircle className="w-2.5 h-2.5" /> Salvo no Storage
                      </span>
                    )}
                    {pending.status === 'error' && (
                      <span className="text-red-400 truncate" title={pending.errorMessage}>
                        {pending.errorMessage || 'Erro'}
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid de Fotos Salvas no Storage / Banco */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-gray-300">
            Galeria do Veículo ({savedImages.length} {savedImages.length === 1 ? 'foto' : 'fotos'} salvas)
          </p>
          <span className="text-[10px] text-gray-400">
            ⭐ A foto marcada como "Capa Principal" será a imagem de destaque do veículo
          </span>
        </div>

        {savedImages.length === 0 && pendingUploads.length === 0 ? (
          <div className="p-8 border border-white/5 bg-[#121216] rounded-2xl text-center">
            <FileImage className="w-10 h-10 text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Nenhuma foto cadastrada ainda para este veículo.</p>
            <p className="text-[11px] text-gray-500 mt-1">Selecione fotos acima para enviar ao Supabase Storage.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {savedImages.map((img, idx) => (
              <div 
                key={img.id || idx}
                className={`relative group bg-[#16161c] rounded-xl overflow-hidden border transition-all duration-200 ${
                  img.is_primary 
                    ? 'border-red-600 ring-2 ring-red-600/40 shadow-lg shadow-red-950/40' 
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Imagem */}
                <div className="aspect-[4/3] bg-black overflow-hidden relative">
                  <img
                    src={img.public_url}
                    alt={`Foto ${idx + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  
                  {/* Badge de Capa Principal */}
                  {img.is_primary && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 text-white font-bold text-[10px] rounded-md shadow-md flex items-center gap-1 uppercase tracking-wider">
                      <Star className="w-3 h-3 fill-white" /> Foto Principal
                    </div>
                  )}

                  {/* Número da foto */}
                  <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/80 backdrop-blur-md text-[10px] text-gray-300 font-mono rounded">
                    #{idx + 1}
                  </div>
                </div>

                {/* Painel de Ações da Foto */}
                <div className="p-2 bg-[#121216] border-t border-white/5 flex items-center justify-between gap-1">
                  
                  {/* Botão Definir como Principal */}
                  {!img.is_primary ? (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(img)}
                      className="px-2 py-1 bg-white/5 hover:bg-red-600 text-gray-300 hover:text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                      title="Definir como foto principal de capa"
                    >
                      <Star className="w-3 h-3" /> Tornar Capa
                    </button>
                  ) : (
                    <span className="text-[10px] text-red-400 font-bold flex items-center gap-1 px-1">
                      <CheckCircle className="w-3 h-3 text-red-500" /> Capa Atual
                    </span>
                  )}

                  {/* Botão Excluir */}
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img)}
                    className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-950/50 rounded-lg transition-colors"
                    title="Excluir foto do Supabase Storage e do banco"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Storage Path Tooltip */}
                {img.storage_path && (
                  <div className="px-2 py-1 bg-black/90 border-t border-white/5 text-[9px] text-gray-400 font-mono truncate" title={img.storage_path}>
                    {img.storage_path}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
