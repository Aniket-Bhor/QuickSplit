import { formatCurrency } from '../utils/helpers.js';

export const SettlementCard = (s, fromName, toName, index, mode = 'optimized') => `
    <div class="p-4 md:p-5 bg-slate-900/40 rounded-2xl md:rounded-3xl border border-slate-800/60 flex flex-col gap-4 hover:border-blue-500/30 transition-all group card-enter premium-card" style="animation-delay: ${index * 0.1}s">
        <div class="flex items-center justify-between gap-2">
            <div class="flex flex-col min-w-0">
                <span class="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-red-400 mb-1">Payer</span>
                <span class="text-xs md:text-sm font-bold text-slate-200 truncate">${fromName}</span>
            </div>
            <div class="flex flex-col items-center flex-1 px-2 md:px-4">
                <div class="w-full h-[1px] md:h-[2px] bg-slate-800 relative">
                    <div class="absolute inset-0 bg-gradient-to-r from-red-500/20 via-blue-500/40 to-green-500/20 animate-pulse"></div>
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 md:h-4 md:w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </div>
                </div>
            </div>
            <div class="flex flex-col items-end text-right min-w-0">
                <span class="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-green-400 mb-1">Receiver</span>
                <span class="text-xs md:text-sm font-bold text-slate-200 truncate">${toName}</span>
            </div>
        </div>
        <div class="pt-3 md:pt-4 border-t border-slate-800/50 flex flex-col gap-3">
            <div class="flex justify-between items-center gap-2">
                <div class="min-w-0">
                    <span class="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">${mode === 'raw' ? 'Direct Debt' : 'Suggested'}</span>
                    ${s.desc ? `<p class="text-[8px] md:text-[9px] text-slate-600 font-bold truncate max-w-[80px] md:max-w-[120px]">${s.desc}</p>` : ''}
                </div>
                <span class="text-lg md:text-2xl font-black text-white glow-blue tracking-tighter shrink-0">${formatCurrency(s.amount)}</span>
            </div>
            <div class="flex gap-2">
                <button onclick="window.app.handlePartialSettle('${s.from}', '${s.to}', ${s.amount})" class="flex-1 py-2 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-blue-500/20 transition-all btn-interact">
                    Partial
                </button>
                <button onclick="window.app.handleFullSettle('${s.from}', '${s.to}', ${s.amount})" class="px-3 md:px-4 py-2 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border border-green-500/20 transition-all btn-interact">
                    Full
                </button>
            </div>
        </div>
    </div>
`;
