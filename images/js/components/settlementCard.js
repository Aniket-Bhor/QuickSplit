import { formatCurrency } from '../utils/helpers.js';

export const SettlementCard = (s, fromName, toName, index, mode = 'optimized') => `
    <div class="p-5 bg-slate-900/40 rounded-3xl border border-slate-800/60 flex flex-col gap-4 hover:border-blue-500/30 transition-all group card-enter premium-card" style="animation-delay: ${index * 0.1}s">
        <div class="flex items-center justify-between">
            <div class="flex flex-col">
                <span class="text-[9px] font-black uppercase tracking-widest text-red-400 mb-1">Payer</span>
                <span class="text-sm font-bold text-slate-200">${fromName}</span>
            </div>
            <div class="flex flex-col items-center flex-1 px-4">
                <div class="w-full h-[2px] bg-slate-800 relative">
                    <div class="absolute inset-0 bg-gradient-to-r from-red-500/20 via-blue-500/40 to-green-500/20 animate-pulse"></div>
                    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </div>
                </div>
            </div>
            <div class="flex flex-col items-end text-right">
                <span class="text-[9px] font-black uppercase tracking-widest text-green-400 mb-1">Receiver</span>
                <span class="text-sm font-bold text-slate-200">${toName}</span>
            </div>
        </div>
        <div class="pt-4 border-t border-slate-800/50 flex flex-col gap-3">
            <div class="flex justify-between items-center">
                <div>
                    <span class="text-[10px] font-black uppercase tracking-widest text-slate-500">${mode === 'raw' ? 'Direct Debt' : 'Suggested Settlement'}</span>
                    ${s.desc ? `<p class="text-[9px] text-slate-600 font-bold truncate max-w-[120px]">${s.desc}</p>` : ''}
                </div>
                <span class="text-2xl font-black text-white glow-blue tracking-tighter">${formatCurrency(s.amount)}</span>
            </div>
            <div class="flex gap-2">
                <button onclick="window.app.handlePartialSettle('${s.from}', '${s.to}', ${s.amount})" class="flex-1 py-2 bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-500/20 transition-all btn-interact">
                    Partial Settle
                </button>
                <button onclick="window.app.handleFullSettle('${s.from}', '${s.to}', ${s.amount})" class="px-3 py-2 bg-green-500/10 hover:bg-green-500 text-green-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-green-500/20 transition-all btn-interact">
                    Full
                </button>
            </div>
        </div>
    </div>
`;
