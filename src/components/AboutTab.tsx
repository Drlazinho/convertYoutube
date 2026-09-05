import React from 'react';
import { Code, Briefcase, MessageCircle, ExternalLink, Video, Shield, Gauge, Cpu } from 'lucide-react';

export function AboutTab() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      {/* Header Section */}
      <section className="bg-surface-card border border-white/[0.08] rounded-2xl p-8 sm:p-10 relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
        
        {/* Background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-brand-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="flex-1 space-y-4 text-center md:text-left relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-bold tracking-wide uppercase mb-2">
            Sobre o Projeto
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center justify-center md:justify-start gap-3">
            <Video className="w-8 h-8 text-brand-500" /> ConvertTube
          </h2>
          <p className="text-neutral-400 leading-relaxed text-sm md:text-base">
            O **ConvertTube** é uma aplicação focada em produtividade e alta performance. Ele foi construído para resolver um problema simples de forma definitiva: permitir o download rápido, sem anúncios irritantes e sem compressão forçada dos seus vídeos e músicas favoritas do YouTube. Tudo isso mantendo a privacidade estrita com armazenamento e processamento 100% locais no seu dispositivo.
          </p>
        </div>

        <div className="flex-shrink-0 flex flex-col gap-3 w-full md:w-auto z-10">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-black/30 border border-white/[0.06] rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <Shield className="w-5 h-5 text-emerald-400 mb-2" />
              <span className="text-xs font-medium text-neutral-300">Privacidade Local</span>
            </div>
            <div className="bg-black/30 border border-white/[0.06] rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <Gauge className="w-5 h-5 text-brand-400 mb-2" />
              <span className="text-xs font-medium text-neutral-300">Alta Velocidade</span>
            </div>
          </div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="bg-surface-card border border-white/[0.08] rounded-2xl p-8 sm:p-10 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/[0.04] bg-neutral-800 shadow-xl flex-shrink-0">
            {/* Using GitHub Avatar as picture */}
            <img 
              src="https://github.com/Drlazinho.png" 
              alt="Lázaro Bonfim"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 text-center md:text-left space-y-5">
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Lázaro Bonfim</h3>
              <p className="text-brand-400 text-sm font-medium mt-1">Desenvolvedor & Engenheiro de Software</p>
            </div>
            
            <p className="text-neutral-400 text-sm leading-relaxed max-w-2xl">
              Sou apaixonado por criar soluções tecnológicas escaláveis, eficientes e com excelente experiência de usuário (UX). Construí o ConvertTube utilizando tecnologias modernas como Next.js, Electron, React e yt-dlp para entregar uma aplicação híbrida poderosa e veloz.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <a 
                href="https://github.com/Drlazinho" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#24292e] hover:bg-[#2f363d] text-white text-sm font-medium rounded-xl transition-all shadow-sm border border-white/10 hover:border-white/20"
              >
                <Code className="w-4 h-4" />
                GitHub
                <ExternalLink className="w-3 h-3 text-white/50 ml-1" />
              </a>
              
              <a 
                href="https://linkedin.com/in/lazarobonfim" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#0077b5] hover:bg-[#006396] text-white text-sm font-medium rounded-xl transition-all shadow-sm border border-white/10 hover:border-white/20"
              >
                <Briefcase className="w-4 h-4" />
                LinkedIn
                <ExternalLink className="w-3 h-3 text-white/50 ml-1" />
              </a>

              <a 
                href="https://wa.me/5571992938275" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#1ebd59] text-white text-sm font-medium rounded-xl transition-all shadow-sm border border-white/10 hover:border-white/20"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
                <ExternalLink className="w-3 h-3 text-white/50 ml-1" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="border border-white/[0.04] bg-black/20 rounded-2xl p-6 text-center">
        <h4 className="text-xs font-semibold tracking-widest text-neutral-500 uppercase mb-4 flex items-center justify-center gap-2">
          <Cpu className="w-4 h-4" /> Tecnologias Utilizadas
        </h4>
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-neutral-400">
          <span className="px-3 py-1 bg-white/[0.03] rounded-lg border border-white/[0.05]">Next.js</span>
          <span className="px-3 py-1 bg-white/[0.03] rounded-lg border border-white/[0.05]">React</span>
          <span className="px-3 py-1 bg-white/[0.03] rounded-lg border border-white/[0.05]">Electron</span>
          <span className="px-3 py-1 bg-white/[0.03] rounded-lg border border-white/[0.05]">TypeScript</span>
          <span className="px-3 py-1 bg-white/[0.03] rounded-lg border border-white/[0.05]">Tailwind CSS</span>
          <span className="px-3 py-1 bg-white/[0.03] rounded-lg border border-white/[0.05]">yt-dlp</span>
          <span className="px-3 py-1 bg-white/[0.03] rounded-lg border border-white/[0.05]">FFmpeg</span>
        </div>
      </section>
    </div>
  );
}
