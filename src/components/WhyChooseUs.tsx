import React from 'react';
import { 
  ShieldCheck, 
  Award, 
  SearchCheck, 
  Truck, 
  Banknote, 
  Sparkles, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';

export const WhyChooseUs: React.FC = () => {
  const features = [
    {
      icon: SearchCheck,
      title: 'Perícia Cautelar em 150+ Pontos',
      desc: 'Nenhum veículo entra em nosso estoque sem passar por rigorosa checagem estrutural, histórico de leilão, sinistros, módulo de injeção e pintura.'
    },
    {
      icon: Award,
      title: 'Garantia F2K Diamond',
      desc: 'Até 2 anos de cobertura mecânica e elétrica completa para sua tranquilidade, com suporte de guincho 24h e carro reserva.'
    },
    {
      icon: Banknote,
      title: 'Melhor Avaliação do seu Seminovo',
      desc: 'Valorização real pela tabela FIPE na troca do seu veículo, com quitação de eventuais débitos e pagamento instantâneo via PIX.'
    },
    {
      icon: Truck,
      title: 'Logística & Entrega Nacional VIP',
      desc: 'Entregamos em qualquer cidade do Brasil com transportadora própria em caminhão fechado tipo prancha e seguro 100% incluso.'
    },
    {
      icon: ShieldCheck,
      title: 'Documentação 100% Desembaraçada',
      desc: 'Veículos com IPVA pago, sem multas, sem alienações fiduciárias pendentes e transferência rápida conduzida por nosso despachante VIP.'
    },
    {
      icon: Clock,
      title: 'Atendimento Consultivo Sem Pressão',
      desc: 'Nossos consultores são especialistas automotivos preparados para entender seu perfil e indicar o melhor custo-benefício.'
    }
  ];

  return (
    <section id="sobre" className="py-16 lg:py-24 bg-[#050505] text-white border-b border-white/10 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-red-600/10 border border-red-600/20 text-xs font-bold text-red-500 uppercase tracking-[0.2em] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Por que escolher a F2K</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter italic">
            A EXPERIÊNCIA DEFINITIVA EM COMPRA E VENDA
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-3 font-normal">
            Criamos um novo padrão no mercado de seminovos, unindo procedência inegociável, tecnologia e transparência em todas as etapas.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <div 
                key={index}
                className="p-8 rounded-sm bg-[#0d0d0d] border border-white/10 hover:border-red-600/50 transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-sm bg-[#151515] border border-white/10 text-red-500 flex items-center justify-center mb-6 group-hover:scale-105 group-hover:border-red-600 transition-all">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-red-500 transition-colors uppercase tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs font-semibold text-red-500 uppercase tracking-wider">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Padrão de Qualidade F2K</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

