import React from 'react';
import { 
  X, 
  Heart, 
  Trash2, 
  MessageCircle, 
  ArrowRight,
  ExternalLink,
  Car as CarIcon
} from 'lucide-react';
import { Car } from '../types';
import { formatBRL, formatKM, getWhatsAppLink } from '../utils/formatters';

interface FavoritesDrawerProps {
  isOpen: boolean;
  favorites: Car[];
  onClose: () => void;
  onRemoveFavorite: (carId: string) => void;
  onClearFavorites: () => void;
  onViewCar: (car: Car) => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  isOpen,
  favorites,
  onClose,
  onRemoveFavorite,
  onClearFavorites,
  onViewCar
}) => {
  if (!isOpen) return null;

  const totalSum = favorites.reduce((acc, c) => acc + c.price, 0);

  const handleWhatsAppFavorites = () => {
    const list = favorites.map(c => `• ${c.brand} ${c.model} (${c.version}) - ${formatBRL(c.price)}`).join('\n');
    const msg = `*Lista de Veículos Favoritados no Site F2K*\n\n` +
      `Olá! Salvei os seguintes veículos no site e gostaria de tirar dúvidas e consultar condições:\n\n` +
      list +
      `\n\n_Podem me passar mais detalhes desses modelos?_`;

    window.open(getWhatsAppLink(msg), '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="bg-[#0d0d0d] border-l border-white/10 w-full max-w-md h-full flex flex-col shadow-2xl text-white">
        
        {/* Header */}
        <div className="p-5 bg-[#0d0d0d] border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-sm bg-[#151515] border border-white/10 text-red-500">
              <Heart className="w-5 h-5 fill-red-600 text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-tight italic">Meus Favoritos</h3>
              <p className="text-xs text-gray-400 font-mono">{favorites.length} {favorites.length === 1 ? 'veículo salvo' : 'veículos salvos'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {favorites.length > 0 && (
              <button
                onClick={onClearFavorites}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Limpar todos"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-sm bg-[#151515] hover:bg-[#202020] text-gray-400 hover:text-white border border-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {favorites.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-14 h-14 rounded-full bg-[#151515] border border-white/10 flex items-center justify-center mx-auto text-gray-500 mb-3">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white uppercase tracking-tight">Sua garagem de favoritos está vazia</h4>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto font-normal">
                Clique no coração nos cartões de carros do estoque para salvar e comparar mais tarde.
              </p>
            </div>
          ) : (
            favorites.map((car) => (
              <div
                key={car.id}
                className="p-3.5 rounded-sm bg-[#050505] border border-white/10 flex gap-3.5 items-center group relative hover:border-red-600/40 transition-colors"
              >
                <img
                  src={car.images[0]}
                  alt={car.model}
                  className="w-20 h-20 rounded-sm object-cover border border-white/10 shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-[0.2em]">{car.brand}</span>
                    <button
                      onClick={() => onRemoveFavorite(car.id)}
                      className="text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-xs font-bold text-white truncate uppercase italic">{car.model}</h4>
                  <p className="text-[11px] text-gray-400 font-mono">{car.yearFabrication}/{car.yearModel} • {formatKM(car.mileage)}</p>
                  
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-black text-white font-mono">{formatBRL(car.price)}</span>
                    <button
                      onClick={() => {
                        onClose();
                        onViewCar(car);
                      }}
                      className="text-[11px] text-red-500 hover:underline font-bold uppercase tracking-wider"
                    >
                      Ver Ficha
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        {favorites.length > 0 && (
          <div className="p-5 bg-[#050505] border-t border-white/10 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 uppercase tracking-wider text-[11px]">Total Selecionado:</span>
              <span className="font-black text-red-500 text-sm font-mono">{formatBRL(totalSum)}</span>
            </div>

            <button
              onClick={handleWhatsAppFavorites}
              className="w-full py-3 px-4 rounded-sm bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Consultar Favoritos no WhatsApp</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

