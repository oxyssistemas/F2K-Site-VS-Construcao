import React from 'react';
import { 
  X, 
  Scale, 
  Trash2, 
  MessageCircle, 
  Check, 
  ExternalLink,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { Car } from '../types';
import { formatBRL, formatKM, getWhatsAppLink, getCarWhatsAppMessage } from '../utils/formatters';

interface ComparisonDrawerProps {
  isOpen: boolean;
  comparedCars: Car[];
  onClose: () => void;
  onRemoveCar: (carId: string) => void;
  onClearAll: () => void;
  onViewCarDetails: (car: Car) => void;
}

export const ComparisonDrawer: React.FC<ComparisonDrawerProps> = ({
  isOpen,
  comparedCars,
  onClose,
  onRemoveCar,
  onClearAll,
  onViewCarDetails
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-[#0d0d0d] border border-white/15 rounded-sm w-full max-w-6xl max-h-[92vh] overflow-y-auto shadow-2xl text-white relative flex flex-col scrollbar-thin">
        
        {/* Header */}
        <div className="sticky top-0 z-20 bg-[#0d0d0d]/95 backdrop-blur-md px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-sm bg-[#151515] border border-white/10 text-red-500">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-tight italic">Comparador de Veículos F2K</h2>
              <p className="text-xs text-gray-400 font-mono">Comparando {comparedCars.length} de 3 veículos selecionados</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {comparedCars.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 font-semibold transition-colors uppercase tracking-wider text-[11px]"
                id="clear-comparison-btn"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Limpar Comparação</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-sm bg-[#151515] hover:bg-[#202020] text-gray-400 hover:text-white border border-white/10 transition-colors"
              id="close-comparison-modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {comparedCars.length === 0 ? (
            <div className="text-center py-16">
              <Scale className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white uppercase tracking-tight">Nenhum veículo selecionado para comparar</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto font-normal">
                Clique no ícone de balança nos cartões dos carros do estoque para comparar até 3 modelos lado a lado.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="p-3 w-48 text-gray-400 font-bold uppercase tracking-[0.2em] text-[11px]">
                      Especificação
                    </th>
                    {comparedCars.map((car) => (
                      <th key={car.id} className="p-3 min-w-[240px] max-w-[280px] align-top">
                        <div className="relative aspect-[16/10] rounded-sm overflow-hidden mb-3 border border-white/10 bg-[#050505]">
                          <img src={car.images[0]} alt={car.model} className="w-full h-full object-cover" />
                          <button
                            onClick={() => onRemoveCar(car.id)}
                            className="absolute top-2 right-2 p-1.5 rounded-sm bg-[#050505]/80 text-gray-400 hover:text-red-500 transition-colors"
                            title="Remover"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">{car.brand}</span>
                        <h4 className="text-sm font-bold text-white line-clamp-1 uppercase italic">{car.model}</h4>
                        <div className="text-lg font-black text-white mt-1 font-mono">{formatBRL(car.price)}</div>

                        <div className="grid grid-cols-2 gap-2 mt-3">
                          <button
                            onClick={() => {
                              onClose();
                              onViewCarDetails(car);
                            }}
                            className="py-1.5 px-2 rounded-sm bg-[#151515] hover:bg-[#202020] text-gray-200 font-bold text-[10px] uppercase tracking-wider text-center border border-white/10"
                          >
                            Ver Ficha
                          </button>
                          <a
                            href={getWhatsAppLink(getCarWhatsAppMessage(car.brand, car.model, car.version, car.price))}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="py-1.5 px-2 rounded-sm bg-red-600 hover:bg-red-700 text-white font-bold text-[10px] uppercase tracking-wider text-center flex items-center justify-center gap-1"
                          >
                            <MessageCircle className="w-3 h-3 fill-white" />
                            <span>Proposta</span>
                          </a>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-gray-300 font-mono">
                  <tr>
                    <td className="p-3 font-semibold text-gray-400 font-sans uppercase text-[11px]">Ano / Modelo</td>
                    {comparedCars.map((c) => (
                      <td key={c.id} className="p-3 font-medium text-white">{c.yearFabrication} / {c.yearModel}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-gray-400 font-sans uppercase text-[11px]">Quilometragem</td>
                    {comparedCars.map((c) => (
                      <td key={c.id} className="p-3 font-medium text-white">{formatKM(c.mileage)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-gray-400 font-sans uppercase text-[11px]">Motorização</td>
                    {comparedCars.map((c) => (
                      <td key={c.id} className="p-3 text-white">{c.specifications?.motor || '-'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-gray-400 font-sans uppercase text-[11px]">Potência</td>
                    {comparedCars.map((c) => (
                      <td key={c.id} className="p-3 font-bold text-red-500">{c.specifications?.potencia || '-'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-gray-400 font-sans uppercase text-[11px]">Torque</td>
                    {comparedCars.map((c) => (
                      <td key={c.id} className="p-3 text-white">{c.specifications?.torque || '-'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-gray-400 font-sans uppercase text-[11px]">Aceleração 0-100 km/h</td>
                    {comparedCars.map((c) => (
                      <td key={c.id} className="p-3 text-white">{c.specifications?.aceleracao0a100 || '-'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-gray-400 font-sans uppercase text-[11px]">Câmbio</td>
                    {comparedCars.map((c) => (
                      <td key={c.id} className="p-3 text-white">{c.transmission}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-gray-400 font-sans uppercase text-[11px]">Combustível</td>
                    {comparedCars.map((c) => (
                      <td key={c.id} className="p-3 text-white">{c.fuel}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-gray-400 font-sans uppercase text-[11px]">Consumo Urbano</td>
                    {comparedCars.map((c) => (
                      <td key={c.id} className="p-3 text-white">{c.specifications?.consumoUrbano || '-'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-gray-400 font-sans uppercase text-[11px]">Porta-Malas</td>
                    {comparedCars.map((c) => (
                      <td key={c.id} className="p-3 text-white">{c.specifications?.portaMalas || '-'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-gray-400 font-sans uppercase text-[11px]">Procedência / Laudo</td>
                    {comparedCars.map((c) => (
                      <td key={c.id} className="p-3 font-bold text-emerald-400 flex items-center gap-1 font-sans">
                        {c.history?.laudoCautelar ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {c.history.laudoCautelar}
                          </>
                        ) : '-'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-gray-400 font-sans uppercase text-[11px]">Garantia F2K</td>
                    {comparedCars.map((c) => (
                      <td key={c.id} className="p-3 font-semibold text-red-500 font-sans">
                        {c.history?.garantiaMeses ? `${c.history.garantiaMeses} Meses` : '-'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

