import React, { useRef, useState } from 'react';
import { 
  Star, 
  ExternalLink, 
  ThumbsUp, 
  Share2,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play
} from 'lucide-react';
import { REVIEWS_DATA, GOOGLE_MAPS_INFO } from '../data/reviews';

const GoogleGIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

// Google Profile Avatar with authentic colors and icons
const GoogleAvatar: React.FC<{ name: string; isLocalGuide?: boolean }> = ({ name, isLocalGuide }) => {
  const getBgColor = (n: string) => {
    if (n.startsWith('Altair')) return 'bg-[#a33c1d]'; // Terra-cotta brown
    if (n.startsWith('Sandra')) return 'bg-[#1a73e8]'; // Google blue
    if (n.startsWith('Keliton')) return 'bg-[#00897b]'; // Teal green
    if (n.startsWith('Matheus')) return 'bg-[#33691e]'; // Olive green
    if (n.startsWith('Felipe')) return 'bg-[#0288d1]'; // Sky blue
    return 'bg-[#d9381e]';
  };

  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <div className="relative shrink-0">
      <div className={`w-11 h-11 rounded-full ${getBgColor(name)} flex items-center justify-center text-white text-lg font-bold shadow-md`}>
        {name.startsWith('Sandra') ? (
          // Sandra's custom image icon representation
          <div className="w-full h-full rounded-full bg-blue-500 flex items-center justify-center text-[12px] font-bold text-white border border-white/20">
            SB
          </div>
        ) : (
          <span>{initial}</span>
        )}
      </div>
      {isLocalGuide && (
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-[#f9ab00]">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </div>
      )}
    </div>
  );
};

export const CustomerReviews: React.FC = () => {
  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const marqueeReviews = [...REVIEWS_DATA, ...REVIEWS_DATA, ...REVIEWS_DATA];

  return (
    <section id="avaliacoes" className="py-16 lg:py-24 bg-[#08080a] text-white border-b border-white/10 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs font-bold text-gray-300 uppercase tracking-widest mb-3 shadow-inner">
              <GoogleGIcon className="w-4 h-4" />
              <span>Avaliações Reais do Google Maps</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-1.5 sm:w-2 h-7 sm:h-9 bg-[#e50914] rounded-full shrink-0 shadow-[0_0_14px_rgba(229,9,20,0.85)]" />
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight uppercase italic">
                O QUE NOSSOS CLIENTES DIZEM NO GOOGLE
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mt-2 max-w-2xl font-normal pl-4.5 sm:pl-5">
              Depoimentos reais e recentes de clientes da <strong className="text-white">F2K MOTORS</strong> em Londrina - PR.
            </p>
          </div>

          {/* Google Score Banner */}
          <div className="bg-[#121215] p-5 sm:p-6 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center sm:items-stretch gap-6 shadow-2xl shrink-0">
            <div className="flex flex-col items-center justify-center text-center pr-0 sm:pr-6 sm:border-r border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <GoogleGIcon className="w-6 h-6" />
                <span className="text-3xl sm:text-4xl font-black text-white font-mono">5.0</span>
              </div>
              <div className="flex items-center gap-1 text-amber-400 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-[11px] text-gray-400 font-medium">Avaliação Máxima 5 Estrelas</span>
            </div>

            <div className="flex flex-col justify-between gap-3 text-xs">
              <div className="text-[11px] text-gray-300">
                <span className="text-white font-bold block">F2K MOTORS</span>
                <span className="text-gray-400 flex items-center gap-1 text-[10px] mt-0.5 font-mono">
                  <MapPin className="w-3 h-3 text-[#e50914]" />
                  Rua da Lapa, 201 · Londrina - PR
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <a
                  href={GOOGLE_MAPS_INFO.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] transition-colors border border-white/15 active:scale-95"
                >
                  <MapPin className="w-3 h-3 text-[#e50914]" />
                  <span>Ver no Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </a>

                <a
                  href={GOOGLE_MAPS_INFO.writeReviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e50914] hover:bg-red-600 text-white font-bold text-[11px] transition-colors shadow-md active:scale-95"
                >
                  <Star className="w-3 h-3 fill-white" />
                  <span>Avaliar Loja</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center justify-between gap-4 mb-6 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Carrossel Contínuo de Avaliações
            </span>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="px-2.5 py-1 rounded-md bg-white/[0.05] hover:bg-white/10 text-[10px] text-gray-300 font-mono flex items-center gap-1 border border-white/10 transition-colors"
            >
              {isPaused ? <Play className="w-3 h-3 text-emerald-400" /> : <Pause className="w-3 h-3 text-amber-400" />}
              <span>{isPaused ? 'Animar' : 'Pausar'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScroll('left')}
              className="w-8 h-8 rounded-full bg-[#16161a] hover:bg-[#e50914] border border-white/10 text-white flex items-center justify-center transition-all active:scale-90"
              aria-label="Rolar para esquerda"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="w-8 h-8 rounded-full bg-[#16161a] hover:bg-[#e50914] border border-white/10 text-white flex items-center justify-center transition-all active:scale-90"
              aria-label="Rolar para direita"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Marquee Carousel */}
      <div 
        className="relative w-full overflow-hidden py-4 group"
        ref={scrollContainerRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-[#08080a] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-[#08080a] to-transparent z-10 pointer-events-none" />

        <div 
          className="flex gap-5 px-4"
          style={{
            width: 'max-content',
            animation: 'marqueeLeft 30s linear infinite',
            animationPlayState: isPaused ? 'paused' : 'running'
          }}
        >
          {marqueeReviews.map((review, idx) => (
            <div
              key={`${review.id}-${idx}`}
              className="w-[320px] sm:w-[380px] bg-[#111115] hover:bg-[#16161c] p-6 rounded-2xl border border-white/10 hover:border-[#e50914]/50 transition-all duration-300 flex flex-col justify-between shadow-2xl shrink-0 group/card select-none"
            >
              <div>
                {/* Header with Google icon and Date */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-1.5">
                    <GoogleGIcon className="w-4 h-4" />
                    <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                      Google Maps
                    </span>
                  </div>
                  
                  {/* NOVA badge & date */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-bold text-gray-300 bg-white/10 px-1.5 py-0.5 rounded border border-white/10 uppercase">
                      NOVA
                    </span>
                    <span className="text-[11px] text-gray-400 font-mono">
                      {review.date}
                    </span>
                  </div>
                </div>

                {/* Author Info with Google Avatar */}
                <div className="flex items-start gap-3 mb-3.5">
                  <GoogleAvatar name={review.author} isLocalGuide={!!review.localGuideLevel} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xs font-bold text-white tracking-tight truncate group-hover/card:text-red-400 transition-colors">
                      {review.author}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-normal">
                      {review.role}
                    </p>
                  </div>
                </div>

                {/* 5 Stars Rating */}
                <div className="flex items-center gap-1 text-amber-400 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>

                {/* Review Text Exactly as in screenshot */}
                <p className="text-xs text-gray-200 leading-relaxed font-normal whitespace-pre-line">
                  {review.comment}
                </p>
              </div>

              {/* Action buttons (Gostei / Compartilhar) */}
              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                <button className="flex items-center gap-1.5 hover:text-white transition-colors text-[11px]">
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Gostei</span>
                </button>

                <button className="flex items-center gap-1.5 hover:text-white transition-colors text-[11px]">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Compartilhar</span>
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

    </section>
  );
};
