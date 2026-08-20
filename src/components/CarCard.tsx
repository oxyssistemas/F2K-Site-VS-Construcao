import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Heart, 
  Scale, 
  Calendar, 
  Gauge, 
  Fuel, 
  Cog, 
  ChevronLeft, 
  ChevronRight,
  ShieldCheck,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { Car } from '../types';
import { formatBRL, formatKM } from '../utils/formatters';

interface CarCardProps {
  car: Car;
  isFavorite: boolean;
  isCompared: boolean;
  onToggleFavorite: (carId: string) => void;
  onToggleCompare: (carId: string) => void;
  onViewDetails: (car: Car) => void;
  onScheduleTestDrive?: (car: Car) => void;
}

export const CarCard: React.FC<CarCardProps> = ({
  car,
  isFavorite,
  isCompared,
  onToggleFavorite,
  onToggleCompare,
  onViewDetails,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const imageList = (car.images && car.images.length > 0) 
    ? car.images 
    : ['https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80'];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % imageList.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + imageList.length) % imageList.length);
  };

  // Format Transmission to standard "Automático" or "Manual"
  const formattedTransmission = car.transmission.toLowerCase().includes('manual') 
    ? 'Manual' 
    : 'Automático';

  // Format Fuel type (Gasolina, Flex, Diesel, Híbrido, Elétrico)
  const formattedFuel = car.fuel || 'Flex';

  // Format Year: Model Year or Fabrication/Model
  const formattedYear = car.yearModel ? `${car.yearModel}` : `${car.yearFabrication}`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{ y: -6 }}
      onClick={() => onViewDetails(car)}
      className="group bg-[#101010] hover:bg-[#141414] rounded-xl border border-white/10 hover:border-[#e50914] transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-red-950/30"
      id={`car-card-${car.id}`}
    >
      {/* 1. Foto do Veículo Acima */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
        <img
          src={imageError ? 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80' : imageList[currentImageIndex] || imageList[0]}
          alt={`${car.brand} ${car.model}`}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />

        {/* Ambient Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-transparent to-black/40 pointer-events-none" />

        {/* Badges on Top Left */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10 pointer-events-none">
          {car.featured && (
            <span className="px-2 py-0.5 rounded bg-[#e50914] text-white font-extrabold text-[10px] uppercase tracking-wider shadow-md flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              Destaque
            </span>
          )}
          {car.history?.laudoCautelar === '100% Aprovado' && (
            <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-emerald-400 font-bold text-[9px] flex items-center gap-1 border border-emerald-500/30">
              <ShieldCheck className="w-3 h-3" />
              Laudo 100%
            </span>
          )}
        </div>

        {/* Favorite & Compare on Top Right */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(car.id);
            }}
            title={isCompared ? 'Remover da comparação' : 'Comparar'}
            className={`p-1.5 rounded-lg backdrop-blur-md transition-all ${
              isCompared 
                ? 'bg-[#e50914] text-white shadow-lg' 
                : 'bg-black/60 text-zinc-300 hover:text-white hover:bg-black/90'
            }`}
            id={`compare-btn-${car.id}`}
          >
            <Scale className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(car.id);
            }}
            title={isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
            className={`p-1.5 rounded-lg backdrop-blur-md transition-all ${
              isFavorite 
                ? 'bg-[#e50914] text-white shadow-lg' 
                : 'bg-black/60 text-zinc-300 hover:text-[#e50914] hover:bg-black/90'
            }`}
            id={`favorite-btn-${car.id}`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Carousel Image Controls (if multiple images) */}
        {car.images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              aria-label="Foto anterior"
              className="absolute left-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={nextImage}
              aria-label="Próxima foto"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>

      {/* 2. Abaixo: Modelo e Informações */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Marca e Modelo do Carro */}
          <div className="mb-2">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#e50914] block">
              {car.brand}
            </span>
            <h3 className="font-black text-base sm:text-lg text-white uppercase italic tracking-tight group-hover:text-red-400 transition-colors line-clamp-1">
              {car.model}
            </h3>
            <p className="text-[11px] text-gray-400 font-normal line-clamp-1 mt-0.5">
              {car.version}
            </p>
          </div>

          {/* Preço do Veículo */}
          <div className="my-2.5 pb-2.5 border-b border-white/10 flex items-baseline justify-between">
            <span className="text-xl sm:text-2xl font-black text-white italic tracking-tight font-mono">
              {formatBRL(car.price)}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">
              Pronta Entrega
            </span>
          </div>

          {/* 3. Abaixo: 4 Tópicos Divididos em 2 Fileiras e 2 Linhas (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-lg bg-black/50 border border-white/5 text-xs text-gray-300">
            {/* 1° Ano do modelo */}
            <div className="flex items-center gap-2 py-1.5 px-2 rounded bg-white/[0.03]">
              <Calendar className="w-4 h-4 text-[#e50914] shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] uppercase tracking-wider text-gray-400 font-medium">Ano</span>
                <span className="font-bold text-white text-[11px] truncate">{formattedYear}</span>
              </div>
            </div>

            {/* 2° Kilometragem */}
            <div className="flex items-center gap-2 py-1.5 px-2 rounded bg-white/[0.03]">
              <Gauge className="w-4 h-4 text-[#e50914] shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] uppercase tracking-wider text-gray-400 font-medium">KM</span>
                <span className="font-bold text-white text-[11px] truncate">{formatKM(car.mileage)}</span>
              </div>
            </div>

            {/* 3° Câmbio (Automático ou Manual) */}
            <div className="flex items-center gap-2 py-1.5 px-2 rounded bg-white/[0.03]">
              <Cog className="w-4 h-4 text-[#e50914] shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] uppercase tracking-wider text-gray-400 font-medium">Câmbio</span>
                <span className="font-bold text-white text-[11px] truncate">{formattedTransmission}</span>
              </div>
            </div>

            {/* 4° Combustível (Flex ou tipo de gasolina) */}
            <div className="flex items-center gap-2 py-1.5 px-2 rounded bg-white/[0.03]">
              <Fuel className="w-4 h-4 text-[#e50914] shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] uppercase tracking-wider text-gray-400 font-medium">Combustível</span>
                <span className="font-bold text-white text-[11px] truncate">{formattedFuel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Abaixo: Botão Transparente com Bordas em Vermelho Vivo e Efeito Especial */}
        <div className="mt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(car);
            }}
            className="w-full relative group/btn overflow-hidden bg-transparent hover:bg-[#e50914] border-2 border-[#e50914] text-white font-black uppercase tracking-wider text-xs py-2.5 px-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-[0_0_22px_rgba(229,9,20,0.65)] hover:scale-[1.02] active:scale-95 cursor-pointer"
            id={`details-btn-${car.id}`}
          >
            {/* Shimmer Light Sweep Effect on Hover */}
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 pointer-events-none" />

            <span className="relative z-10 tracking-widest">VER DETALHES</span>
            <ArrowRight className="w-4 h-4 text-white relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </button>
        </div>

      </div>
    </motion.div>
  );
};
