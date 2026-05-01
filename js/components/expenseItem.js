import { formatCurrency } from '../utils/helpers.js';

export const ExpenseItem = (exp, payerName, members = []) => {
    const splitTypeLabel = exp.splitType === 'custom' ? 'Custom Split' : `Split with ${exp.splitWith.length}`;
    const splitTypeClass = exp.splitType === 'custom' ? 'text-amber-500/70' : 'text-blue-500/70';
    
    let participantsHtml = '';
    if (exp.splitType === 'custom' && exp.participants) {
        participantsHtml = '<div class="mt-1 flex flex-wrap gap-1">';
        exp.participants.forEach(p => {
            const member = members.find(m => m.id === p.memberId);
            if (member) {
                participantsHtml += `<span class="text-[9px] bg-slate-800/50 px-1.5 py-0.5 rounded text-slate-400">${member.name}: ${formatCurrency(p.owedAmount)}</span>`;
            }
        });
        participantsHtml += '</div>';
    }

    return `
    <tr class="group hover:bg-slate-800/20 transition-all border-b border-slate-800/30 last:border-0 card-enter">
        <td class="px-4 py-5">
            <p class="font-bold text-slate-200">${exp.desc}</p>
            <div class="flex items-center gap-2 mt-0.5">
                <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest">${exp.date}</p>
                <span class="text-slate-700 text-[10px]">•</span>
                <span class="text-[9px] ${splitTypeClass} font-black uppercase tracking-widest">${splitTypeLabel}</span>
            </div>
            ${participantsHtml}
        </td>
        <td class="px-4 py-5 text-right font-black text-blue-400 glow-blue tracking-tight">${formatCurrency(exp.amount)}</td>
        <td class="px-4 py-5 text-center">
            <span class="px-3 py-1 bg-slate-800/80 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-700/50">${payerName}</span>
        </td>
        <td class="px-4 py-5 text-right">
            <div class="flex justify-end gap-1">
                <button onclick="window.app.handleEditExpense('${exp.id}')" class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 transition-all btn-interact">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2 v11a2 2 0 002 2 h11a2 2 0 002-2 v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </button>
                <button onclick="window.app.handleDeleteExpense('${exp.id}')" class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all btn-interact">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        </td>
    </tr>
`;
};
