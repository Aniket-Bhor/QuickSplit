import { formatCurrency } from '../utils/helpers.js';

export const FlowCard = (s, fromName, toName, index) => `
    <div class="relative flex items-center justify-between p-3 md:p-4 bg-slate-900/40 rounded-xl md:rounded-2xl border border-slate-800/60 group card-enter premium-card" style="animation-delay: ${index * 0.15}s">
        <!-- Payer -->
        <div class="flex items-center gap-2 md:gap-3 z-10 w-[30%] md:w-1/3">
            <div class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-[10px] md:text-xs font-black text-red-400 uppercase shadow-lg group-hover:scale-110 transition-transform shrink-0">
                ${fromName.charAt(0)}
            </div>
            <div class="overflow-hidden hidden sm:block">
                <p class="text-[9px] md:text-xs font-black uppercase tracking-widest text-red-500 mb-0.5">Payer</p>
                <p class="text-xs md:text-sm font-bold text-slate-200 truncate">${fromName}</p>
            </div>
            <div class="sm:hidden overflow-hidden">
                <p class="text-[10px] font-bold text-slate-200 truncate">${fromName}</p>
            </div>
        </div>

        <!-- Flow Indicator -->
        <div class="flex-1 flex flex-col items-center px-1 md:px-4 relative h-10 md:h-12 justify-center min-w-0">
            <div class="absolute inset-0 flex items-center justify-center">
                <svg width="100%" height="20" class="overflow-visible">
                    <line x1="0" y1="10" x2="100%" y2="10" stroke="currentColor" stroke-width="1.5" class="text-slate-800 flow-line-animate" />
                </svg>
            </div>
            <div class="relative z-10 px-2 md:px-3 py-0.5 md:py-1 bg-slate-900 border border-slate-700 rounded-full shadow-xl group-hover:border-blue-500/50 transition-colors shrink-0">
                <span class="text-[10px] md:text-sm font-black text-white tracking-tighter">${formatCurrency(s.amount)}</span>
            </div>
            <div class="absolute right-0 md:right-2 top-1/2 -translate-y-1/2 text-blue-500 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 md:h-4 md:w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
            </div>
        </div>

        <!-- Receiver -->
        <div class="flex items-center gap-2 md:gap-3 z-10 w-[30%] md:w-1/3 justify-end text-right">
            <div class="overflow-hidden hidden sm:block">
                <p class="text-[9px] md:text-xs font-black uppercase tracking-widest text-green-500 mb-0.5">Receiver</p>
                <p class="text-xs md:text-sm font-bold text-slate-200 truncate">${toName}</p>
            </div>
            <div class="sm:hidden overflow-hidden">
                <p class="text-[10px] font-bold text-slate-200 truncate">${toName}</p>
            </div>
            <div class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-[10px] md:text-xs font-black text-green-400 uppercase shadow-lg group-hover:scale-110 transition-transform shrink-0">
                ${toName.charAt(0)}
            </div>
        </div>
    </div>
`;
