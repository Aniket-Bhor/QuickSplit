import { formatCurrency } from '../utils/helpers.js';

export const SettlementHistoryItem = (h, fromName, toName) => {
    const date = new Date(h.timestamp);
    const dateStr = date.toLocaleDateString();
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (h.type === 'FULL_SETTLEMENT') {
        return `
            <div class="flex items-center justify-between p-4 bg-blue-500/5 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all premium-card group relative overflow-hidden card-enter">
                <div class="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 blur-2xl rounded-full -mr-12 -mt-12"></div>
                <div class="flex items-center gap-4 relative z-10">
                    <div class="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p class="text-sm font-black text-white uppercase tracking-tight">Full Group Settlement</p>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[9px] font-black uppercase tracking-widest border border-blue-500/20">System</span>
                            <span class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">${h.count} transactions cleared • ${dateStr}</span>
                        </div>
                    </div>
                </div>
                <div class="text-right relative z-10">
                    <p class="text-lg font-black text-blue-400 glow-blue tracking-tighter">${formatCurrency(h.amount)}</p>
                    <p class="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Total Settled</p>
                </div>
            </div>
        `;
    }

    const isFull = h.type === 'full';
    
    return `
        <div class="flex items-center justify-between p-4 bg-slate-900/40 rounded-2xl border border-slate-800/60 hover:border-slate-700/60 transition-all premium-card group card-enter">
            <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-xl ${isFull ? 'bg-green-500/10' : 'bg-blue-500/10'} flex items-center justify-center border ${isFull ? 'border-green-500/20' : 'border-blue-500/20'} shrink-0">
                    ${isFull ? 
                        `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>` : 
                        `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>`
                    }
                </div>
                <div>
                    <div class="flex items-center gap-2">
                        <span class="text-sm font-bold text-slate-200"><span class="text-red-400">${fromName}</span> paid <span class="text-green-400">${toName}</span></span>
                    </div>
                    <div class="flex items-center gap-2 mt-1">
                        <span class="px-1.5 py-0.5 ${isFull ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'} rounded text-[9px] font-black uppercase tracking-widest border ${isFull ? 'border-green-500/20' : 'border-blue-500/20'}">${h.type}</span>
                        <span class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">${dateStr} • ${timeStr}</span>
                    </div>
                </div>
            </div>
            <div class="text-right">
                <p class="text-lg font-black text-white glow-blue tracking-tighter">${formatCurrency(h.amount)}</p>
            </div>
        </div>
    `;
};
