export const MemberCard = (member) => `
    <div class="flex items-center justify-between p-3 bg-slate-800/30 rounded-2xl border border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-800/50 transition-all group premium-card card-enter">
        <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-[11px] font-black text-blue-400 uppercase tracking-widest">
                ${member.name.charAt(0)}
            </div>
            <span class="text-sm font-bold text-slate-200">${member.name}</span>
        </div>
        <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
            <button onclick="window.app.handleEditMember('${member.id}')" class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 transition-all btn-interact" title="Edit Member">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
            </button>
            <button onclick="window.app.handleRemoveMember('${member.id}')" class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all btn-interact" title="Delete Member">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    </div>
`;
