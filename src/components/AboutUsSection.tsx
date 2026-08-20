import React from 'react';
import { motion } from 'motion/react';
import { 
  Car, 
  ShieldCheck, 
  UserCheck, 
  Eye, 
  Award,
  Sparkles,
  MapPin,
  CheckCircle2,
  ArrowUpRight
} from 'lucide-react';
import { F2KLogo } from './F2KLogo';
import f2kStorefrontImg from '../assets/images/f2k_storefront_pure_1787018258798.jpg';

export const AboutUsSection: React.FC = () => {
  const topics = [
    {
      id: 'veiculos',
      title: 'Veículos Selecionados',
      desc: 'Curadoria criteriosa de modelos premium e seminovos.',
      icon: Car,
    },
    {
      id: 'procedencia',
      title: 'Procedência',
      desc: 'Histórico 100% verificado, sem leilões ou sinistros.',
      icon: ShieldCheck,
    },
    {
      id: 'atendimento',
      title: 'Atendimento Personalizado',
      desc: 'Consultoria exclusiva e suporte do início ao pós-venda.',
      icon: UserCheck,
    },
    {
      id: 'transparencia',
      title: 'Transparência',
      desc: 'Laudos periciais detalhados e negociação clara.',
      icon: Eye,
    },
    {
      id: 'qualidade',
      title: 'Qualidade',
      desc: 'Revisão completa e garantia mecânica rigorosa.',
      icon: Award,
    },
  ];

  return (
    <section id="sobre" className="py-16 lg:py-24 bg-[#141417] text-white border-y border-white/10 relative overflow-hidden">
      
      {/* Subtle ambient lighting */}
      <div className="absolute -top-24 right-1/4 w-96 h-96 bg-red-600/5 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-red-600/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main 2-Column Content: Left Image, Right Text */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-14">
          
          {/* ======================================================== */}
          {/* COLUNA DA ESQUERDA: ESPAÇO PARA IMAGEM DO SHOWROOM */}
          {/* ======================================================== */}
          <motion.div 
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 relative group" 
            id="about-us-image-container"
          >
            <div className="relative rounded-2xl overflow-hidden border border-white/15 shadow-2xl bg-[#1c1c20] aspect-[16/10] sm:aspect-[16/9]">
              <img
                src={f2kStorefrontImg || '/storefront.jpg'}
                alt="Fachada e Showroom F2K MOTORS"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                loading="eager"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/storefront.jpg';
                }}
              />
              
              {/* Floating Badge on Image */}
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-black/80 backdrop-blur-md border border-white/15 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#e50914] flex items-center justify-center text-white shadow-lg shadow-red-950/50 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase text-white block tracking-wider">
                      Showroom F2K Motors
                    </span>
                    <span className="text-[11px] text-gray-300 flex items-center gap-1 font-medium">
                      <MapPin className="w-3 h-3 text-[#e50914]" />
                      Rua da Lapa, 201 · Londrina - PR
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-500/30">
                  Aberto Hoje
                </span>
              </div>
            </div>

            {/* Corner Decorative Accent */}
            <div className="absolute -bottom-2 -right-2 w-16 h-16 border-b-2 border-r-2 border-[#e50914] rounded-br-2xl pointer-events-none -z-0 opacity-80" />
          </motion.div>

          {/* ======================================================== */}
          {/* COLUNA DA DIREITA: TÍTULO, LINHA VERMELHA & DESCRIÇÃO */}
          {/* ======================================================== */}
          <motion.div 
            initial={{ opacity: 0, x: 35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-4" 
            id="about-us-content"
          >
            
            {/* Tag superior */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.05] border border-white/10 text-xs font-bold text-gray-300 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-[#e50914] animate-pulse" />
              <span>Conheça Nossa História & Valores</span>
            </div>

            {/* Título F2K MOTORS com Logo em Destaque */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
              <F2KLogo size="xl" className="py-1" />
            </div>
            <div className="h-1.5 w-28 sm:w-36 bg-[#e50914] rounded-full mt-1.5 shadow-[0_0_14px_rgba(229,9,20,0.85)]" />

            {/* Descrição: Por que nos escolher */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm sm:text-base font-bold text-gray-200 uppercase tracking-wider">
                Por que escolher a F2K Motors?
              </h3>
              
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
                Na <strong className="text-white font-semibold">F2K MOTORS</strong>, transformamos a compra e venda de veículos em Londrina e região em uma experiência segura, sofisticada e transparente. Somos especializados em seminovos de alto padrão, procedência comprovada e veículos minuciosamente inspecionados.
              </p>

              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-normal">
                Nosso compromisso é entregar não apenas um automóvel, mas a certeza de um investimento sólido, com garantia documentada, laudos cautelares 100% aprovados e atendimento consultivo que coloca suas necessidades em primeiro lugar.
              </p>
            </div>

          </motion.div>
        </div>

        {/* ======================================================== */}
        {/* 5 TÓPICOS ENFILEIRADOS HORIZONTALMENTE COM ÍCONES VERMELHOS */}
        {/* ======================================================== */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
              Nossos Pilares & Diferenciais
            </span>
            <span className="text-[10px] font-mono text-[#e50914] font-bold">
              5 Compromissos F2K
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5" id="about-us-horizontal-topics">
            {topics.map((topic, index) => {
              const IconComponent = topic.icon;
              return (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                  whileHover={{ y: -4 }}
                  className="bg-[#1b1b20] hover:bg-[#222228] p-4.5 rounded-xl border border-white/10 hover:border-[#e50914]/50 transition-all duration-300 flex flex-col justify-between group shadow-lg"
                  id={`about-topic-${topic.id}`}
                >
                  <div>
                    {/* Red Icon Container */}
                    <div className="w-10 h-10 rounded-lg bg-red-600/10 border border-red-500/20 text-[#e50914] flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-[#e50914] group-hover:text-white transition-all shadow-md">
                      <IconComponent className="w-5 h-5 text-current" />
                    </div>

                    {/* Topic Title */}
                    <h4 className="text-xs font-black uppercase text-white tracking-tight mb-1.5 group-hover:text-red-400 transition-colors">
                      {topic.title}
                    </h4>

                    {/* Topic Description */}
                    <p className="text-[11px] text-gray-400 leading-snug font-normal">
                      {topic.desc}
                    </p>
                  </div>

                  {/* Bottom indicator */}
                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                    <span>0{index + 1}</span>
                    <CheckCircle2 className="w-3 h-3 text-[#e50914]" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

      </div>

    </section>
  );
};
