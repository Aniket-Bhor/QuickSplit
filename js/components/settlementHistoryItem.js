import { formatCurrency } from '../utils/helpers.js';

export const SettlementHistoryItem = (h, fromName, toName) => {
    const date = new Date(h.timestamp);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (h.type === 'FULL_SETTLEMENT') {
        return `
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 md:p-4 bg-blue-500/5 rounded-xl md:rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all premium-card group relative overflow-hidden card-enter gap-3">
                <div class="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl rounded-full -mr-12 -mt-12"></div>
                <div class="flex items-center gap-3 md:gap-4 relative z-10">
                    <div class="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 md:h-6 md:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p class="text-xs md:text-sm font-black text-white uppercase tracking-tight">Full Group Settlement</p>
                        <div class="flex flex-wrap items-center gap-2 mt-1">
                            <span class="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[8px] md:text-[9px] font-black uppercase tracking-widest border border-blue-500/20">System</span>
                            <span class="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest">${h.count} transactions • ${dateStr}</span>
                        </div>
                    </div>
                </div>
                <div class="text-left sm:text-right relative z-10 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/50">
                    <p class="text-base md:text-lg font-black text-blue-400 glow-blue tracking-tighter">${formatCurrency(h.amount)}</p>
                    <p class="text-[8px] md:text-[9px] text-slate-500 font-bold uppercase tracking-widest">Total Settled</p>
                </div>
            </div>
        `;
    }

    const isFull = h.type === 'full';
    
    return `
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 md:p-4 bg-slate-900/40 rounded-xl md:rounded-2xl border border-slate-800/60 hover:border-slate-700/60 transition-all premium-card group card-enter gap-3">
            <div class="flex items-center gap-3 md:gap-4">
                <div class="w-9 h-9 md:w-10 md:h-10 rounded-xl ${isFull ? 'bg-green-500/10' : 'bg-blue-500/10'} flex items-center justify-center border ${isFull ? 'border-green-500/20' : 'border-blue-500/20'} shrink-0">
                    ${isFull ? 
                        `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 md:h-5 md:w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>` : 
                        `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 md:h-5 md:w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>`
                    }
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <span class="text-xs md:text-sm font-bold text-slate-200 min-w-0 truncate max-w-[150px] md:max-w-none"><span class="text-red-400">${fromName}</span> paid <span class="text-green-400">${toName}</span></span>
                    </div>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="px-1.5 py-0.5 ${isFull ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'} rounded text-[8px] md:text-[9px] font-black uppercase tracking-widest border ${isFull ? 'border-green-500/20' : 'border-blue-500/20'}">${h.type}</span>
                        <span class="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest">${dateStr} • ${timeStr}</span>
                    </div>
                </div>
            </div>
            <div class="text-left sm:text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/50">
                <p class="text-base md:text-lg font-black text-white glow-blue tracking-tighter">${formatCurrency(h.amount)}</p>
            </div>
        </div>
    `;
};
