import React, { useState, useEffect } from 'react';
import { 
  X, 
  Heart, 
  Scale, 
  MessageCircle, 
  Calendar, 
  Gauge, 
  Fuel, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Award, 
  SlidersHorizontal,
  Info,
  Car as CarIcon,
  Layers,
  FileText,
  Clock,
  Image as ImageIcon
} from 'lucide-react';
import { Car, VehicleImage } from '../types';
import { formatBRL, formatKM, getWhatsAppLink, getCarWhatsAppMessage, calculateFinancing } from '../utils/formatters';
import { fetchVehicleImages } from '../lib/supabase';
import { safeOpenUrl } from '../utils/security';

interface CarDetailModalProps {
  car: Car | null;
  isOpen: boolean;
  isFavorite: boolean;
  isCompared: boolean;
  onClose: () => void;
  onToggleFavorite: (carId: string) => void;
  onToggleCompare: (carId: string) => void;
  onScheduleTestDrive: (car: Car) => void;
  onOpenFinancingForCar: (car: Car) => void;
}

export const CarDetailModal: React.FC<CarDetailModalProps> = ({
  car,
  isOpen,
  isFavorite,
  isCompared,
  onClose,
  onToggleFavorite,
  onToggleCompare,
  onScheduleTestDrive,
  onOpenFinancingForCar
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'specs' | 'features' | 'history'>('specs');
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [vehicleImagesMetadata, setVehicleImagesMetadata] = useState<VehicleImage[]>([]);

  useEffect(() => {
    if (car && isOpen) {
      setSelectedPhotoIndex(0);
      // Imagens iniciais
      const baseImages = car.images && car.images.length > 0 
        ? car.images 
        : ['https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80'];
      setGalleryImages(baseImages);

      // Busca fotos em tempo real vinculadas ao Supabase
      fetchVehicleImages(car.id).then(imgs => {
        if (imgs && imgs.length > 0) {
          setVehicleImagesMetadata(imgs);
          const urls = imgs.map(i => i.public_url);
          setGalleryImages(urls);
        }
      }).catch(e => {
        console.warn('Aviso ao carregar galeria no modal:', e);
      });
    }
  }, [car, isOpen]);

  if (!isOpen || !car) return null;

  const imagesToDisplay = galleryImages.length > 0 ? galleryImages : (car.images || []);
  const currentPhoto = imagesToDisplay[selectedPhotoIndex] || imagesToDisplay[0] || 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80';

  const simulation = calculateFinancing(car.price, 30, 48, 1.39);

  const handleWhatsApp = () => {
    const msg = getCarWhatsAppMessage(car.brand, car.model, car.version, car.price);
    safeOpenUrl(getWhatsAppLink(msg));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 lg:p-6 animate-fadeIn">
      <div 
        className="bg-[#0d0d0d] border border-white/15 rounded-sm w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl text-white relative flex flex-col scrollbar-thin"
        id={`car-detail-modal-${car.id}`}
      >
        {/* Modal Header Bar */}
        <div className="sticky top-0 z-30 bg-[#0d0d0d]/95 backdrop-blur-md px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-red-500">{car.brand}</span>
              <span className="text-xs text-gray-500">•</span>
              <span className="text-xs uppercase tracking-wider text-gray-400 font-mono">{car.category}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight uppercase italic">{car.model}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleCompare(car.id)}
              className={`p-2 rounded-sm border transition-colors ${
                isCompared 
                  ? 'bg-red-600 text-white border-red-600' 
                  : 'bg-[#151515] border-white/10 text-gray-300 hover:text-white'
              }`}
              title="Comparar Veículo"
              id="modal-compare-btn"
            >
              <Scale className="w-4 h-4" />
            </button>

            <button
              onClick={() => onToggleFavorite(car.id)}
              className={`p-2 rounded-sm border transition-colors ${
                isFavorite 
                  ? 'bg-red-600 text-white border-red-600' 
                  : 'bg-[#151515] border-white/10 text-gray-300 hover:text-red-500'
              }`}
              title="Salvar Favorito"
              id="modal-favorite-btn"
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-sm bg-[#151515] hover:bg-[#202020] text-gray-400 hover:text-white border border-white/10 transition-colors ml-2"
              title="Fechar"
              id="modal-close-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-8">
          
          {/* Main Showcase (Gallery + Pricing Hero) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Gallery Column */}
            <div className="lg:col-span-7 space-y-3">
              {/* Featured Big Photo */}
              <div className="relative aspect-[16/10] w-full rounded-sm overflow-hidden bg-[#050505] border border-white/10">
                <img
                  src={currentPhoto}
                  alt={`${car.brand} ${car.model}`}
                  className="w-full h-full object-cover transition-all duration-300"
                  decoding="async"
                  referrerPolicy="no-referrer"
                />
                
                {imagesToDisplay.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedPhotoIndex((prev) => (prev - 1 + imagesToDisplay.length) % imagesToDisplay.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-sm bg-[#050505]/80 text-white hover:bg-black transition-colors z-10"
                      id="modal-photo-prev"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setSelectedPhotoIndex((prev) => (prev + 1) % imagesToDisplay.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-sm bg-[#050505]/80 text-white hover:bg-black transition-colors z-10"
                      id="modal-photo-next"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                <div className="absolute bottom-3 left-3 bg-[#050505]/90 backdrop-blur-md px-3 py-1 rounded-sm text-xs font-mono text-gray-300 border border-white/10 flex items-center gap-2">
                  <span>Foto {selectedPhotoIndex + 1} de {imagesToDisplay.length}</span>
                  {selectedPhotoIndex === 0 && (
                    <span className="text-[10px] bg-red-600/80 text-white font-bold px-1.5 py-0.2 rounded uppercase">
                      Principal
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails Row */}
              {imagesToDisplay.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {imagesToDisplay.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPhotoIndex(idx)}
                      className={`relative aspect-[16/10] rounded-sm overflow-hidden border transition-all ${
                        selectedPhotoIndex === idx 
                          ? 'border-red-600 ring-1 ring-red-600 scale-[0.98]' 
                          : 'border-white/10 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
                      {idx === 0 && (
                        <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-red-600 ring-2 ring-black" title="Foto Principal" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Price & Summary Info Column */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-5 bg-[#050505] p-6 rounded-sm border border-white/10">
              <div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {car.tags.map((tag, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-sm bg-[#151515] border border-white/10 text-gray-300 font-mono uppercase tracking-wider">
                      {tag}
                    </span>
                  ))}
                </div>

                <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">{car.brand} {car.model}</h1>
                <p className="text-xs text-gray-400 mt-1 font-mono uppercase">{car.version}</p>

                {/* Price Display */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <span className="text-xs text-gray-400 font-medium uppercase tracking-wider block">Preço à Vista</span>
                  <div className="text-3xl font-black text-white tracking-tight font-mono">
                    {formatBRL(car.price)}
                  </div>
                  {car.fipePrice && (
                    <p className="text-xs text-gray-400 mt-1 font-mono">
                      Tabela FIPE: <span className="text-gray-300 font-semibold">{formatBRL(car.fipePrice)}</span>
                    </p>
                  )}
                </div>

                {/* Monthly Installment Simulation Highlight */}
                <div className="mt-4 p-4 rounded-sm bg-[#151515] border border-white/10">
                  <div className="flex items-center justify-between text-xs text-gray-300 mb-1">
                    <span className="font-semibold text-red-500 uppercase tracking-wider">Plano Sugerido:</span>
                    <span className="font-mono text-[11px]">30% Entrada + 48x</span>
                  </div>
                  <div className="text-xl font-black text-red-500 font-mono">
                    {formatBRL(simulation.monthlyInstallment)} <span className="text-xs font-normal text-gray-400 font-sans">/mês</span>
                  </div>
                  <button
                    onClick={() => onOpenFinancingForCar(car)}
                    className="text-xs font-bold text-red-500 hover:text-red-400 underline mt-2 inline-flex items-center gap-1 uppercase tracking-wider text-[11px]"
                    id="modal-custom-simulate-link"
                  >
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>Personalizar valores e prazos</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-4">
                <button
                  onClick={handleWhatsApp}
                  className="w-full py-3.5 px-4 rounded-sm bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 active:scale-95"
                  id="modal-whatsapp-proposal-btn"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Fazer Proposta no WhatsApp</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onScheduleTestDrive(car)}
                    className="py-2.5 px-3 rounded-sm bg-[#151515] hover:bg-[#202020] text-gray-200 font-bold text-[11px] uppercase tracking-wider transition-colors border border-white/10 flex items-center justify-center gap-1.5"
                    id="modal-schedule-testdrive-btn"
                  >
                    <Calendar className="w-3.5 h-3.5 text-red-500" />
                    <span>Agendar Test Drive</span>
                  </button>

                  <button
                    onClick={() => onOpenFinancingForCar(car)}
                    className="py-2.5 px-3 rounded-sm bg-[#151515] hover:bg-[#202020] text-gray-200 font-bold text-[11px] uppercase tracking-wider transition-colors border border-white/10 flex items-center justify-center gap-1.5"
                    id="modal-open-financing-btn"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-red-500" />
                    <span>Simular Financiamento</span>
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Quick Specifications Highlights Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 p-4 rounded-sm bg-[#050505] border border-white/10 text-center font-mono">
            <div className="p-2">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block">Ano/Modelo</span>
              <span className="text-sm font-bold text-white mt-0.5 block">{car.yearFabrication}/{car.yearModel}</span>
            </div>
            <div className="p-2 border-l border-white/10">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block">Quilometragem</span>
              <span className="text-sm font-bold text-white mt-0.5 block">{formatKM(car.mileage)}</span>
            </div>
            <div className="p-2 sm:border-l border-white/10">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block">Câmbio</span>
              <span className="text-sm font-bold text-white mt-0.5 block">{car.transmission}</span>
            </div>
            <div className="p-2 lg:border-l border-white/10">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block">Combustível</span>
              <span className="text-sm font-bold text-white mt-0.5 block">{car.fuel}</span>
            </div>
            <div className="p-2 border-l border-white/10">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block">Cor</span>
              <span className="text-sm font-bold text-white mt-0.5 block truncate">{car.color}</span>
            </div>
          </div>

          {/* Tab navigation */}
          <div className="border-b border-white/10 flex items-center gap-6">
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-3 font-bold text-xs uppercase tracking-[0.15em] transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'specs' 
                  ? 'text-red-500 border-red-600' 
                  : 'text-gray-400 border-transparent hover:text-gray-200'
              }`}
              id="tab-specs-btn"
            >
              <Gauge className="w-4 h-4" />
              <span>Ficha Técnica Completa</span>
            </button>

            <button
              onClick={() => setActiveTab('features')}
              className={`pb-3 font-bold text-xs uppercase tracking-[0.15em] transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'features' 
                  ? 'text-red-500 border-red-600' 
                  : 'text-gray-400 border-transparent hover:text-gray-200'
              }`}
              id="tab-features-btn"
            >
              <Layers className="w-4 h-4" />
              <span>Itens de Série & Tecnologia</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`pb-3 font-bold text-xs uppercase tracking-[0.15em] transition-all border-b-2 flex items-center gap-2 ${
                activeTab === 'history' 
                  ? 'text-red-500 border-red-600' 
                  : 'text-gray-400 border-transparent hover:text-gray-200'
              }`}
              id="tab-history-btn"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Procedência & Laudo Cautelar</span>
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'specs' && (() => {
            const motorSpecs = [
              { label: 'Motorização', value: car.specifications?.motor },
              { label: 'Potência', value: car.specifications?.potencia, isHighlight: true },
              { label: 'Torque', value: car.specifications?.torque },
              { label: 'Aceleração 0-100 km/h', value: car.specifications?.aceleracao0a100 },
              { label: 'Velocidade Máxima', value: car.specifications?.velocidadeMaxima },
              { label: 'Tração', value: car.specifications?.tracao }
            ].filter(item => item.value && String(item.value).trim().length > 0);

            const dimensionSpecs = [
              { label: 'Consumo Urbano', value: car.specifications?.consumoUrbano },
              { label: 'Consumo Rodoviário', value: car.specifications?.consumoRodoviario },
              { label: 'Porta-Malas', value: car.specifications?.portaMalas },
              { label: 'Tanque de Combustível', value: car.specifications?.capacidadeTanque },
              { label: 'Peso Total', value: car.specifications?.peso }
            ].filter(item => item.value && String(item.value).trim().length > 0);

            const hasAnySpec = motorSpecs.length > 0 || dimensionSpecs.length > 0;

            if (!hasAnySpec) {
              return (
                <div className="bg-[#050505] p-6 rounded-sm border border-white/10 text-center">
                  <p className="text-xs text-gray-400">
                    Ficha técnica detalhada disponível mediante consulta com nosso time de consultores.
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {motorSpecs.length > 0 && (
                  <div className="space-y-3 bg-[#050505] p-4 rounded-sm border border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">Motorização & Performance</h4>
                    <div className="space-y-2 text-xs divide-y divide-white/5 font-mono">
                      {motorSpecs.map((item, idx) => (
                        <div key={idx} className="flex justify-between py-1.5">
                          <span className="text-gray-400 font-sans">{item.label}</span>
                          <span className={`font-semibold ${item.isHighlight ? 'text-red-500' : 'text-white'}`}>
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dimensionSpecs.length > 0 && (
                  <div className="space-y-3 bg-[#050505] p-4 rounded-sm border border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">Consumo & Dimensões</h4>
                    <div className="space-y-2 text-xs divide-y divide-white/5 font-mono">
                      {dimensionSpecs.map((item, idx) => (
                        <div key={idx} className="flex justify-between py-1.5">
                          <span className="text-gray-400 font-sans">{item.label}</span>
                          <span className="font-semibold text-white">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {activeTab === 'features' && (() => {
            const segurancaItems = (car.features?.seguranca || []).filter(item => item && item.trim().length > 0);
            const confortoItems = (car.features?.conforto || []).filter(item => item && item.trim().length > 0);
            const tecnologiaItems = (car.features?.tecnologia || []).filter(item => item && item.trim().length > 0);

            const hasAnyFeature = segurancaItems.length > 0 || confortoItems.length > 0 || tecnologiaItems.length > 0;

            if (!hasAnyFeature) {
              return (
                <div className="bg-[#050505] p-6 rounded-sm border border-white/10 text-center">
                  <p className="text-xs text-gray-400">
                    Consulte nossos consultores para a lista completa de pacotes e opcionais deste modelo.
                  </p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Segurança */}
                {segurancaItems.length > 0 && (
                  <div className="bg-[#050505] p-4 rounded-sm border border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-red-500 mb-3 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Segurança</span>
                    </h4>
                    <ul className="space-y-2 text-xs text-gray-300">
                      {segurancaItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Conforto */}
                {confortoItems.length > 0 && (
                  <div className="bg-[#050505] p-4 rounded-sm border border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-red-500 mb-3 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>Conforto & Acabamento</span>
                    </h4>
                    <ul className="space-y-2 text-xs text-gray-300">
                      {confortoItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Tecnologia */}
                {tecnologiaItems.length > 0 && (
                  <div className="bg-[#050505] p-4 rounded-sm border border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-red-500 mb-3 flex items-center gap-1.5">
                      <Zap className="w-4 h-4" />
                      <span>Tecnologia & Multimídia</span>
                    </h4>
                    <ul className="space-y-2 text-xs text-gray-300">
                      {tecnologiaItems.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })()}

          {activeTab === 'history' && (() => {
            const hasDescription = Boolean(car.description && car.description.trim().length > 0);
            const hasLaudo = Boolean(car.history?.laudoCautelar && car.history.laudoCautelar.trim().length > 0);
            const hasOwnerInfo = car.history?.unicoDono !== undefined && car.history?.unicoDono !== null;
            const hasRevisionInfo = car.history?.revisoesNaConcessionaria !== undefined && car.history?.revisoesNaConcessionaria !== null;
            const hasWarrantyInfo = Boolean(car.history?.garantiaMeses && car.history.garantiaMeses > 0);
            const hasIpvaInfo = car.history?.ipvaPago !== undefined && car.history.ipvaPago !== null;

            return (
              <div className="space-y-4">
                {hasDescription && (
                  <div className="p-4 rounded-sm bg-[#050505] border border-white/10">
                    <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-2">Descrição do Especialista F2K</h4>
                    <p className="text-xs text-gray-300 leading-relaxed font-normal">{car.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  {hasLaudo && (
                    <div className="p-3 rounded-sm bg-[#050505] border border-white/10">
                      <span className="text-gray-400 uppercase tracking-wider text-[10px] block mb-1">Laudo Cautelar</span>
                      <span className="font-bold text-emerald-400 flex items-center gap-1 font-mono">
                        <ShieldCheck className="w-4 h-4" />
                        {car.history?.laudoCautelar}
                      </span>
                      {car.history?.observacoesLaudo && car.history.observacoesLaudo.trim().length > 0 && (
                        <span className="text-[10px] text-gray-400 block mt-1 font-sans">
                          {car.history.observacoesLaudo}
                        </span>
                      )}
                    </div>
                  )}

                  {hasOwnerInfo && (
                    <div className="p-3 rounded-sm bg-[#050505] border border-white/10">
                      <span className="text-gray-400 uppercase tracking-wider text-[10px] block mb-1">Propriedade</span>
                      <span className="font-bold text-white font-mono">
                        {car.history?.unicoDono ? 'Único Dono' : 'Procedência Verificada'}
                      </span>
                    </div>
                  )}

                  {hasRevisionInfo && (
                    <div className="p-3 rounded-sm bg-[#050505] border border-white/10">
                      <span className="text-gray-400 uppercase tracking-wider text-[10px] block mb-1">Manutenção</span>
                      <span className="font-bold text-white font-mono">
                        {car.history?.revisoesNaConcessionaria ? '100% em Concessionária' : 'Oficinas Credenciadas'}
                      </span>
                    </div>
                  )}

                  {hasWarrantyInfo && (
                    <div className="p-3 rounded-sm bg-[#050505] border border-white/10">
                      <span className="text-gray-400 uppercase tracking-wider text-[10px] block mb-1">Garantia F2K</span>
                      <span className="font-bold text-red-500 font-mono">
                        {car.history?.garantiaMeses} Meses de Cobertura
                      </span>
                    </div>
                  )}

                  {hasIpvaInfo && car.history?.ipvaPago && (
                    <div className="p-3 rounded-sm bg-[#050505] border border-white/10">
                      <span className="text-gray-400 uppercase tracking-wider text-[10px] block mb-1">Documentação</span>
                      <span className="font-bold text-emerald-400 font-mono">
                        IPVA Totalmente Pago
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

        </div>
      </div>
    </div>
  );
};

