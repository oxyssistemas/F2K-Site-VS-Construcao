import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, Car, Sparkles, Gauge, Layers, ShieldCheck, FileText, Info } from 'lucide-react';
import { Car as CarType, CarCategory, FuelType, TransmissionType } from '../../types';
import { VehicleImageUploadManager } from './VehicleImageUploadManager';

interface AdminVehicleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (car: CarType, status: string) => Promise<void>;
  carToEdit?: CarType | null;
}

const CATEGORIES: CarCategory[] = ['SUV', 'Sedan', 'Hatchback', 'Picape', 'Esportivo', 'Elétrico / Híbrido'];
const FUELS: FuelType[] = ['Flex', 'Gasolina', 'Diesel', 'Híbrido', 'Elétrico'];
const TRANSMISSIONS: TransmissionType[] = ['Automático', 'Manual', 'CVT', 'Dupla Embreagem'];

export const AdminVehicleFormModal: React.FC<AdminVehicleFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  carToEdit
}) => {
  const [vehicleId, setVehicleId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'geral' | 'specs' | 'features' | 'history' | 'fotos'>('geral');
  
  const [formData, setFormData] = useState<Partial<CarType>>({
    brand: '',
    model: '',
    version: '',
    yearFabrication: 2024,
    yearModel: 2024,
    price: 150000,
    fipePrice: 155000,
    mileage: 0,
    category: 'SUV',
    fuel: 'Flex',
    transmission: 'Automático',
    color: 'Preto',
    plateEnd: 0,
    doors: 4,
    images: ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80'],
    featured: false,
    isNewArrival: true,
    tags: ['Único Dono', 'Laudo Cautelar Aprovado', 'Garantia de 1 Ano'],
    description: '',
    specifications: {
      motor: '2.0 Turbo',
      potencia: '200 cv',
      torque: '30,0 kgfm',
      aceleracao0a100: '7.8s',
      velocidadeMaxima: '220 km/h',
      consumoUrbano: '10.2 km/l',
      consumoRodoviario: '13.5 km/l',
      tracao: 'Dianteira',
      portaMalas: '450 L',
      capacidadeTanque: '55 L',
      peso: '1.450 kg'
    },
    features: {
      seguranca: ['Airbags frontais, laterais e de cortina', 'Freios ABS com EBD', 'Controle de estabilidade e tração'],
      conforto: ['Ar-condicionado digital dual zone', 'Bancos em couro com ajuste elétrico', 'Piloto automático adaptativo'],
      tecnologia: ['Central Multimídia com Apple CarPlay e Android Auto', 'Painel digital TFT', 'Câmera 360 graus']
    },
    history: {
      laudoCautelar: '100% Aprovado',
      observacoesLaudo: 'Estrutura 100% íntegra, sem apontamentos ou repinturas.',
      unicoDono: true,
      revisoesNaConcessionaria: true,
      garantiaMeses: 12,
      ipvaPago: true
    }
  });

  // State helpers for features multi-line editing
  const [segurancaText, setSegurancaText] = useState('');
  const [confortoText, setConfortoText] = useState('');
  const [tecnologiaText, setTecnologiaText] = useState('');

  const [status, setStatus] = useState<string>('disponivel');
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (carToEdit) {
      setVehicleId(carToEdit.id);
      setFormData(carToEdit);
      setStatus('disponivel');

      setSegurancaText((carToEdit.features?.seguranca || []).join('\n'));
      setConfortoText((carToEdit.features?.conforto || []).join('\n'));
      setTecnologiaText((carToEdit.features?.tecnologia || []).join('\n'));
    } else {
      const newId = 'f2k-' + Date.now();
      setVehicleId(newId);
      setFormData({
        id: newId,
        brand: '',
        model: '',
        version: '',
        yearFabrication: 2024,
        yearModel: 2024,
        price: 180000,
        fipePrice: 190000,
        mileage: 15000,
        category: 'SUV',
        fuel: 'Flex',
        transmission: 'Automático',
        color: 'Preto Metálico',
        doors: 4,
        images: ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'],
        featured: true,
        isNewArrival: true,
        tags: ['Garantia F2K Motors', 'Laudo 100% Aprovado', 'Revisões em Dia'],
        description: 'Veículo em excelente estado de conservação, revisado e com procedência comprovada por laudo cautelar.',
        specifications: {
          motor: '2.0 Turbo',
          potencia: '220 cv',
          torque: '35,0 kgfm',
          aceleracao0a100: '7.2s',
          velocidadeMaxima: '230 km/h',
          consumoUrbano: '9.8 km/l',
          consumoRodoviario: '13.0 km/l',
          tracao: 'Integral AWD',
          portaMalas: '480 L',
          capacidadeTanque: '60 L',
          peso: '1.550 kg'
        },
        features: {
          seguranca: ['Alerta de Ponto Cego', 'Frenagem Autônoma de Emergência', 'Faróis Full LED'],
          conforto: ['Teto Solar Panorâmico', 'Bancos Elétricos com Memória', 'Ar Quadrizone'],
          tecnologia: ['GPS Nativo', 'Som Premium', 'Carregador por Indução']
        },
        history: {
          laudoCautelar: '100% Aprovado',
          observacoesLaudo: 'Aprovado sem restrições ou retoques estruturais.',
          unicoDono: true,
          revisoesNaConcessionaria: true,
          garantiaMeses: 12,
          ipvaPago: true
        }
      });

      setSegurancaText('Alerta de Ponto Cego\nFrenagem Autônoma de Emergência\nFaróis Full LED');
      setConfortoText('Teto Solar Panorâmico\nBancos Elétricos com Memória\nAr Quadrizone');
      setTecnologiaText('GPS Nativo\nSom Premium\nCarregador por Indução');
      setStatus('disponivel');
    }
  }, [carToEdit, isOpen]);

  if (!isOpen) return null;

  const handleImagesChange = (updatedUrls: string[], primaryUrl?: string) => {
    if (updatedUrls.length > 0) {
      let sorted = [...updatedUrls];
      if (primaryUrl && sorted.includes(primaryUrl)) {
        sorted = [primaryUrl, ...sorted.filter(u => u !== primaryUrl)];
      }
      setFormData(prev => ({ ...prev, images: sorted }));
    }
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    const currentTags = formData.tags || [];
    setFormData({ ...formData, tags: [...currentTags, newTag.trim()] });
    setNewTag('');
  };

  const handleRemoveTag = (index: number) => {
    const currentTags = [...(formData.tags || [])];
    currentTags.splice(index, 1);
    setFormData({ ...formData, tags: currentTags });
  };

  const updateSpecField = (field: keyof NonNullable<CarType['specifications']>, value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...(prev.specifications || {}),
        [field]: value
      }
    }));
  };

  const updateHistoryField = (field: keyof NonNullable<CarType['history']>, value: any) => {
    setFormData(prev => ({
      ...prev,
      history: {
        ...(prev.history || {}),
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.brand || !formData.model || !formData.price) {
      setErrorMsg('Preencha os campos obrigatórios: Marca, Modelo e Preço.');
      return;
    }

    const currentId = vehicleId || (carToEdit ? carToEdit.id : `f2k-${Date.now()}`);

    // Parse features from textareas (one per line, filtered)
    const parsedSeguranca = segurancaText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const parsedConforto = confortoText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const parsedTecnologia = tecnologiaText
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const completeCar: CarType = {
      id: currentId,
      brand: formData.brand.trim(),
      model: formData.model.trim(),
      version: formData.version || '',
      yearFabrication: Number(formData.yearFabrication) || 2024,
      yearModel: Number(formData.yearModel) || 2024,
      price: Number(formData.price) || 0,
      fipePrice: Number(formData.fipePrice) || Number(formData.price) * 1.05,
      mileage: Number(formData.mileage) || 0,
      category: (formData.category as CarCategory) || 'SUV',
      fuel: (formData.fuel as FuelType) || 'Flex',
      transmission: (formData.transmission as TransmissionType) || 'Automático',
      color: formData.color || 'Preto',
      doors: Number(formData.doors) || 4,
      images: (formData.images && formData.images.length > 0) ? formData.images : ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80'],
      featured: Boolean(formData.featured),
      isNewArrival: Boolean(formData.isNewArrival),
      tags: formData.tags || [],
      specifications: formData.specifications || {},
      features: {
        seguranca: parsedSeguranca,
        conforto: parsedConforto,
        tecnologia: parsedTecnologia
      },
      history: formData.history || {},
      description: formData.description || ''
    };

    setIsSubmitting(true);
    try {
      await onSave(completeCar, status);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Falha ao salvar veículo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#18181c] border border-white/15 rounded-2xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in duration-200">
        
        {/* Header do Modal */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-[#141416]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#e50914] flex items-center justify-center text-white shadow-lg shadow-red-950/60">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase">
                {carToEdit ? `Editar ${carToEdit.brand} ${carToEdit.model}` : 'Cadastrar Novo Carro no Estoque'}
              </h2>
              <p className="text-xs text-gray-400">
                Sincronização em tempo real com o banco de dados e vitrine online.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-[#121215] px-4 sm:px-6 pt-3 border-b border-white/10 flex items-center gap-2 sm:gap-4 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('geral')}
            className={`pb-3 px-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'geral'
                ? 'text-[#e50914] border-[#e50914]'
                : 'text-gray-400 border-transparent hover:text-gray-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>1. Dados Gerais</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            className={`pb-3 px-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'specs'
                ? 'text-[#e50914] border-[#e50914]'
                : 'text-gray-400 border-transparent hover:text-gray-200'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>2. Ficha Técnica</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`pb-3 px-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'features'
                ? 'text-[#e50914] border-[#e50914]'
                : 'text-gray-400 border-transparent hover:text-gray-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>3. Itens de Série</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'history'
                ? 'text-[#e50914] border-[#e50914]'
                : 'text-gray-400 border-transparent hover:text-gray-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>4. Laudo & Procedência</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fotos')}
            className={`pb-3 px-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'fotos'
                ? 'text-[#e50914] border-[#e50914]'
                : 'text-gray-400 border-transparent hover:text-gray-200'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>5. Fotos & Mídia</span>
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          
          {errorMsg && (
            <div className="p-4 bg-red-950/60 border border-red-500/50 rounded-xl text-red-300 font-medium text-xs">
              {errorMsg}
            </div>
          )}

          {/* TAB 1: DADOS GERAIS */}
          {activeTab === 'geral' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Identificação */}
              <div>
                <h3 className="text-xs font-bold text-[#e50914] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Identificação do Veículo
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Marca *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: BMW, Porsche, Jeep"
                      value={formData.brand || ''}
                      onChange={e => setFormData({ ...formData, brand: e.target.value })}
                      className="w-full bg-[#202026] border border-white/15 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-[#e50914] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Modelo *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: 320i, Macan GTS, Compass"
                      value={formData.model || ''}
                      onChange={e => setFormData({ ...formData, model: e.target.value })}
                      className="w-full bg-[#202026] border border-white/15 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-[#e50914] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Versão Comercial</label>
                    <input
                      type="text"
                      placeholder="Ex: 2.0 Turbo M Sport, 2.9 V6 PDK"
                      value={formData.version || ''}
                      onChange={e => setFormData({ ...formData, version: e.target.value })}
                      className="w-full bg-[#202026] border border-white/15 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-[#e50914] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Preço, Ano e KM */}
              <div>
                <h3 className="text-xs font-bold text-[#e50914] uppercase tracking-wider mb-3">
                  Preço, Ano e Quilometragem
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Preço de Venda (R$) *</label>
                    <input
                      type="number"
                      required
                      value={formData.price || ''}
                      onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full bg-[#202026] border border-white/15 rounded-lg px-3 py-2 text-white font-bold focus:border-[#e50914] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Tabela FIPE (R$)</label>
                    <input
                      type="number"
                      value={formData.fipePrice || ''}
                      onChange={e => setFormData({ ...formData, fipePrice: Number(e.target.value) })}
                      className="w-full bg-[#202026] border border-white/15 rounded-lg px-3 py-2 text-white focus:border-[#e50914] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Ano Fab. / Mod.</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={formData.yearFabrication || 2024}
                        onChange={e => setFormData({ ...formData, yearFabrication: Number(e.target.value) })}
                        className="w-1/2 bg-[#202026] border border-white/15 rounded-lg px-2 py-2 text-center text-white focus:border-[#e50914] focus:outline-none"
                      />
                      <input
                        type="number"
                        value={formData.yearModel || 2024}
                        onChange={e => setFormData({ ...formData, yearModel: Number(e.target.value) })}
                        className="w-1/2 bg-[#202026] border border-white/15 rounded-lg px-2 py-2 text-center text-white focus:border-[#e50914] focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">KM Rodados</label>
                    <input
                      type="number"
                      value={formData.mileage ?? 0}
                      onChange={e => setFormData({ ...formData, mileage: Number(e.target.value) })}
                      className="w-full bg-[#202026] border border-white/15 rounded-lg px-3 py-2 text-white focus:border-[#e50914] focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Categorização e Detalhes */}
              <div>
                <h3 className="text-xs font-bold text-[#e50914] uppercase tracking-wider mb-3">
                  Categorização e Status
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Categoria</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value as CarCategory })}
                      className="w-full bg-[#202026] border border-white/15 rounded-lg px-3 py-2 text-white focus:border-[#e50914] focus:outline-none"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Combustível</label>
                    <select
                      value={formData.fuel}
                      onChange={e => setFormData({ ...formData, fuel: e.target.value as FuelType })}
                      className="w-full bg-[#202026] border border-white/15 rounded-lg px-3 py-2 text-white focus:border-[#e50914] focus:outline-none"
                    >
                      {FUELS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Câmbio</label>
                    <select
                      value={formData.transmission}
                      onChange={e => setFormData({ ...formData, transmission: e.target.value as TransmissionType })}
                      className="w-full bg-[#202026] border border-white/15 rounded-lg px-3 py-2 text-white focus:border-[#e50914] focus:outline-none"
                    >
                      {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Cor</label>
                    <input
                      type="text"
                      value={formData.color || ''}
                      onChange={e => setFormData({ ...formData, color: e.target.value })}
                      placeholder="Ex: Preto Metálico, Branco"
                      className="w-full bg-[#202026] border border-white/15 rounded-lg px-3 py-2 text-white focus:border-[#e50914] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Status no Estoque</label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value)}
                      className="w-full bg-[#202026] border border-white/15 rounded-lg px-3 py-2 text-white font-bold focus:border-[#e50914] focus:outline-none"
                    >
                      <option value="disponivel">🟢 Disponível para Venda</option>
                      <option value="reservado">🟡 Reservado</option>
                      <option value="vendido">🔴 Vendido / Entregue</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 pt-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featured || false}
                        onChange={e => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-4 h-4 rounded text-[#e50914] focus:ring-0 accent-[#e50914]"
                      />
                      <span className="font-bold text-gray-200">Destacar na Home</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-3 pt-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isNewArrival || false}
                        onChange={e => setFormData({ ...formData, isNewArrival: e.target.checked })}
                        className="w-4 h-4 rounded text-[#e50914] focus:ring-0 accent-[#e50914]"
                      />
                      <span className="font-bold text-gray-200">Selo "Novidade"</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Tags e Descrição */}
              <div>
                <h3 className="text-xs font-bold text-[#e50914] uppercase tracking-wider mb-3">
                  Tags e Descrição Comercial
                </h3>
                
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Adicionar diferencial (Ex: Teto Solar, Pacote M Sport, Único Dono)"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    className="flex-1 bg-[#202026] border border-white/15 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-[#e50914] focus:outline-none text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-xs flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Inserir Tag
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {(formData.tags || []).map((tag, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 text-gray-200 text-xs font-medium border border-white/10">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(idx)} className="hover:text-red-400">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Descrição Comercial do Especialista F2K</label>
                  <textarea
                    rows={3}
                    value={formData.description || ''}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva os diferenciais, revisões, laudo cautelar ou estado impecável deste veículo..."
                    className="w-full bg-[#202026] border border-white/15 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-[#e50914] focus:outline-none text-xs"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FICHA TÉCNICA */}
          {activeTab === 'specs' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-3.5 bg-blue-950/30 border border-blue-500/20 rounded-xl flex items-start gap-2.5 text-xs text-blue-200">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Dica:</strong> Todos os campos abaixo são opcionais. Caso algum item fique em branco, ele será automaticamente ocultado na ficha técnica do site.
                </p>
              </div>

              {/* Motorização & Performance */}
              <div className="bg-[#141418] p-4 sm:p-5 rounded-2xl border border-white/10">
                <h3 className="text-xs font-bold text-[#e50914] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Gauge className="w-4 h-4" />
                  <span>Motorização & Performance</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Motorização</label>
                    <input
                      type="text"
                      placeholder="Ex: 2.0 16V Turbo"
                      value={formData.specifications?.motor || ''}
                      onChange={e => updateSpecField('motor', e.target.value)}
                      className="w-full bg-[#202026] border border-white/15 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-[#e50914] focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Potência</label>
                    <input
                      type="text"
                      placeholder="Ex: 252 cv @ 5000 rpm"
                      value={formData.specifications?.potencia || ''}
                      onChange={e => updateSpecField('potencia', e.target.value)}
                      className="w-full bg-[#202026] border border-white/15 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-[#e50914] focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Torque</label>
                    <input
                      type="text"
                      placeholder="Ex: 35,7 kgfm @ 1450 rpm"
                      value={formData.specifications?.torque || ''}
                      onChange={e => updateSpecField('torque', e.target.value)}
                      className="w-full bg-[#202026] border border-white/15 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-[#e50914] focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Aceleração (0 a 100 km/h)</label>
                    <input
                      type="text"
                      placeholder="Ex: 6.8s"
                      value={formData.specifications?.aceleracao0a100 || ''}
                      onChange={e => updateSpecField('aceleracao0a100', e.target.value)}
                      className="w-full bg-[#202026] border border-white/15 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-[#e50914] focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Velocidade Máxima</label>
                    <input
                      type="text"
                      placeholder="Ex: 250 km/h"
                      value={formData.specifications?.velocidadeMaxima || ''}
                      onChange={e => updateSpecField('velocidadeMaxima', e.target.value)}
                      className="w-full bg-[#202026] border border-white/15 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-[#e50914] focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Tração</label>
                    <input
                      type="text"
                      placeholder="Ex: Integral AWD, Traseira, Dianteira"
                      value={formData.specifications?.tracao || ''}
                      onChange={e => updateSpecField('tracao', e.target.value)}
                      className="w-full bg-[#202026] border border-white/15 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-[#e50914] focus:outline-none text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Consumo & Dimensões */}
              <div className="bg-[#141418] p-4 sm:p-5 rounded-2xl border border-white/10">
                <h3 className="text-xs font-bold text-[#e50914] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  <span>Consumo, Dimensões e Capacidade</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Consumo Urbano</label>
                    <input
                      type="text"
                      placeholder="Ex: 9.8 km/l"
                      value={formData.specifications?.consumoUrbano || ''}
                      onChange={e => updateSpecField('consumoUrbano', e.target.value)}
                      className="w-full bg-[#202026] border border-white/15 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-[#e50914] focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Consumo Rodoviário</label>
                    <input
                      type="text"
                      placeholder="Ex: 13.5 km/l"
                      value={formData.specifications?.consumoRodoviario || ''}
                      onChange={e => updateSpecField('consumoRodoviario', e.target.value)}
                      className="w-full bg-[#202026] border border-white/15 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-[#e50914] focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Porta-Malas</label>
                    <input
                      type="text"
                      placeholder="Ex: 480 Litros"
                      value={formData.specifications?.portaMalas || ''}
                      onChange={e => updateSpecField('portaMalas', e.target.value)}
                      className="w-full bg-[#202026] border border-white/15 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-[#e50914] focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Tanque de Combustível</label>
                    <input
                      type="text"
                      placeholder="Ex: 60 Litros"
                      value={formData.specifications?.capacidadeTanque || ''}
                      onChange={e => updateSpecField('capacidadeTanque', e.target.value)}
                      className="w-full bg-[#202026] border border-white/15 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-[#e50914] focus:outline-none text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Peso Total</label>
                    <input
                      type="text"
                      placeholder="Ex: 1.540 kg"
                      value={formData.specifications?.peso || ''}
                      onChange={e => updateSpecField('peso', e.target.value)}
                      className="w-full bg-[#202026] border border-white/15 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-[#e50914] focus:outline-none text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ITENS DE SÉRIE */}
          {activeTab === 'features' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-3.5 bg-blue-950/30 border border-blue-500/20 rounded-xl flex items-start gap-2.5 text-xs text-blue-200">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Como preencher:</strong> Digite cada item ou acessório em uma linha separada. Categorias vazias não serão mostradas no site.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Segurança */}
                <div className="bg-[#141418] p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col">
                  <h4 className="text-xs font-bold text-[#e50914] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Segurança</span>
                  </h4>
                  <p className="text-[11px] text-gray-400 mb-2">Um equipamento por linha</p>
                  <textarea
                    rows={8}
                    value={segurancaText}
                    onChange={e => setSegurancaText(e.target.value)}
                    placeholder="Airbags frontais e laterais&#10;Controle de tração e estabilidade&#10;Freios ABS com EBD&#10;Faróis Full LED..."
                    className="w-full flex-1 bg-[#202026] border border-white/15 rounded-lg p-3 text-white placeholder-gray-500 focus:border-[#e50914] focus:outline-none text-xs leading-relaxed font-mono"
                  />
                </div>

                {/* Conforto */}
                <div className="bg-[#141418] p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col">
                  <h4 className="text-xs font-bold text-[#e50914] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    <span>Conforto & Acabamento</span>
                  </h4>
                  <p className="text-[11px] text-gray-400 mb-2">Um equipamento por linha</p>
                  <textarea
                    rows={8}
                    value={confortoText}
                    onChange={e => setConfortoText(e.target.value)}
                    placeholder="Bancos em couro com ajuste elétrico&#10;Teto solar panorâmico&#10;Ar-condicionado dual zone&#10;Chave presencial com partida por botão..."
                    className="w-full flex-1 bg-[#202026] border border-white/15 rounded-lg p-3 text-white placeholder-gray-500 focus:border-[#e50914] focus:outline-none text-xs leading-relaxed font-mono"
                  />
                </div>

                {/* Tecnologia */}
                <div className="bg-[#141418] p-4 sm:p-5 rounded-2xl border border-white/10 flex flex-col">
                  <h4 className="text-xs font-bold text-[#e50914] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    <span>Tecnologia & Conectividade</span>
                  </h4>
                  <p className="text-[11px] text-gray-400 mb-2">Um equipamento por linha</p>
                  <textarea
                    rows={8}
                    value={tecnologiaText}
                    onChange={e => setTecnologiaText(e.target.value)}
                    placeholder="Central Multimídia Apple CarPlay/Android Auto&#10;Painel digital 12.3 polegadas&#10;Sistema de som premium&#10;Carregador de celular sem fio..."
                    className="w-full flex-1 bg-[#202026] border border-white/15 rounded-lg p-3 text-white placeholder-gray-500 focus:border-[#e50914] focus:outline-none text-xs leading-relaxed font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LAUDO CAUTELAR & PROCEDÊNCIA */}
          {activeTab === 'history' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-[#141418] p-4 sm:p-5 rounded-2xl border border-white/10">
                <h3 className="text-xs font-bold text-[#e50914] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Laudo Cautelar e Vistoria</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Status do Laudo Cautelar</label>
                    <select
                      value={formData.history?.laudoCautelar || '100% Aprovado'}
                      onChange={e => updateHistoryField('laudoCautelar', e.target.value)}
                      className="w-full bg-[#202026] border border-white/15 rounded-lg px-3 py-2 text-white focus:border-[#e50914] focus:outline-none text-xs font-bold"
                    >
                      <option value="100% Aprovado">🛡️ 100% Aprovado (Sem apontamentos)</option>
                      <option value="Aprovado com Apontamento">⚠️ Aprovado com Apontamento</option>
                      <option value="Laudo Pericial Aprovado">✅ Laudo Pericial Aprovado</option>
                      <option value="Vistoria Cautelar Concluída">🔍 Vistoria Cautelar Concluída</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Garantia F2K Motors (Meses)</label>
                    <select
                      value={formData.history?.garantiaMeses ?? 12}
                      onChange={e => updateHistoryField('garantiaMeses', Number(e.target.value))}
                      className="w-full bg-[#202026] border border-white/15 rounded-lg px-3 py-2 text-white focus:border-[#e50914] focus:outline-none text-xs"
                    >
                      <option value={24}>24 Meses (2 Anos)</option>
                      <option value={12}>12 Meses (1 Ano de Garantia F2K)</option>
                      <option value={6}>6 Meses</option>
                      <option value={3}>3 Meses (Garantia Legal de Câmbio/Motor)</option>
                      <option value={0}>Sem garantia adicional</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-bold text-gray-300 mb-1">Observações do Laudo Cautelar (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ex: Pintura 100% original de fábrica, histórico pericial totalmente limpo."
                    value={formData.history?.observacoesLaudo || ''}
                    onChange={e => updateHistoryField('observacoesLaudo', e.target.value)}
                    className="w-full bg-[#202026] border border-white/15 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-[#e50914] focus:outline-none text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-white/10">
                  <label className="flex items-center gap-2 cursor-pointer p-3 bg-[#202026] rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.history?.unicoDono || false}
                      onChange={e => updateHistoryField('unicoDono', e.target.checked)}
                      className="w-4 h-4 rounded text-[#e50914] focus:ring-0 accent-[#e50914]"
                    />
                    <div>
                      <span className="font-bold text-white text-xs block">Único Dono</span>
                      <span className="text-[10px] text-gray-400">Exibir selo de único proprietário</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-3 bg-[#202026] rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.history?.revisoesNaConcessionaria || false}
                      onChange={e => updateHistoryField('revisoesNaConcessionaria', e.target.checked)}
                      className="w-4 h-4 rounded text-[#e50914] focus:ring-0 accent-[#e50914]"
                    />
                    <div>
                      <span className="font-bold text-white text-xs block">Revisões em Concessionária</span>
                      <span className="text-[10px] text-gray-400">Manual com histórico carimbado</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer p-3 bg-[#202026] rounded-xl border border-white/5 hover:border-white/20 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.history?.ipvaPago || false}
                      onChange={e => updateHistoryField('ipvaPago', e.target.checked)}
                      className="w-4 h-4 rounded text-[#e50914] focus:ring-0 accent-[#e50914]"
                    />
                    <div>
                      <span className="font-bold text-white text-xs block">IPVA Total Pago</span>
                      <span className="text-[10px] text-gray-400">Documentação 100% quitada</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FOTOS & MÍDIA */}
          {activeTab === 'fotos' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="bg-[#141418] p-4 sm:p-5 rounded-2xl border border-white/10">
                <VehicleImageUploadManager
                  vehicleId={vehicleId || (carToEdit ? carToEdit.id : 'f2k-temp')}
                  onImagesChange={handleImagesChange}
                  initialImages={formData.images || []}
                />
              </div>
            </div>
          )}

        </form>

        {/* Footer do Modal */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#141416] flex items-center justify-between gap-3">
          <div className="text-xs text-gray-400 hidden sm:block">
            {activeTab === 'geral' && 'Etapa 1 de 5: Dados comerciais principais'}
            {activeTab === 'specs' && 'Etapa 2 de 5: Ficha técnica & motor'}
            {activeTab === 'features' && 'Etapa 3 de 5: Opcionais e itens de série'}
            {activeTab === 'history' && 'Etapa 4 de 5: Procedência e laudo'}
            {activeTab === 'fotos' && 'Etapa 5 de 5: Galeria de imagens'}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/15 text-gray-300 hover:text-white hover:bg-white/5 font-bold text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#e50914] hover:bg-[#b80710] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-950/60 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {isSubmitting ? 'Gravando...' : (carToEdit ? 'Salvar Alterações' : 'Cadastrar no Estoque')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
