// State Management
let members = JSON.parse(localStorage.getItem('qs_members')) || [];
let expenses = JSON.parse(localStorage.getItem('qs_expenses')) || [];

// UI Selectors
const $ = (id) => document.getElementById(id);
const membersList = $('membersList');
const expenseHistory = $('expenseHistory');
const settlementsList = $('settlementsList');
const memberCount = $('memberCount');
const totalGroupExpense = $('totalGroupExpense');
const spendingInsight = $('spendingInsight');
const expenseModal = $('expenseModal');
const expenseForm = $('expenseForm');
const expPayerSelect = $('expPayer');
const splitAmongList = $('splitAmongList');
const balanceList = $('balanceList');
const optimizationStats = $('optimizationStats');
const loadingOverlay = $('loadingOverlay');
const toastContainer = $('toastContainer');
const whyModal = $('whyModal');

// Toast Notification System
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const bgClass = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-600';
    const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
    
    toast.className = `toast-enter pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-white text-sm font-bold ${bgClass}`;
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize App
async function init() {
    renderMembers();
    await calculateSettlements();
    updateDashboard();
}

// LocalStorage Helper
async function save() {
    localStorage.setItem('qs_members', JSON.stringify(members));
    localStorage.setItem('qs_expenses', JSON.stringify(expenses));
    updateDashboard();
    await calculateSettlements();
}

// Dashboard Summary & Insights
function updateDashboard() {
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    totalGroupExpense.textContent = `$${total.toFixed(2)}`;
    memberCount.textContent = members.length;
    
    // Disable simplify button if no expenses
    $('simplifyBtn').disabled = expenses.length === 0;

    if (expenses.length > 0 && members.length > 0) {
        // Calculate detailed insights
        const balances = {};
        const spentByUser = {};
        members.forEach(m => { balances[m.id] = 0; spentByUser[m.id] = 0; });

        expenses.forEach(exp => {
            const splitAmount = exp.amount / exp.splitWith.length;
            spentByUser[exp.payer] += exp.amount;
            balances[exp.payer] += exp.amount;
            exp.splitWith.forEach(id => { if (balances[id] !== undefined) balances[id] -= splitAmount; });
        });

        const topSpenderId = Object.keys(spentByUser).reduce((a, b) => spentByUser[a] > spentByUser[b] ? a : b);
        const topSpender = members.find(m => m.id === topSpenderId);

        const debtorId = Object.keys(balances).reduce((a, b) => balances[a] < balances[b] ? a : b);
        const topDebtor = members.find(m => m.id === debtorId);

        const mostBalancedId = Object.keys(balances).reduce((a, b) => Math.abs(balances[a]) < Math.abs(balances[b]) ? a : b);
        const balancedUser = members.find(m => m.id === mostBalancedId);

        spendingInsight.innerHTML = `
            <div class="grid grid-cols-1 gap-3">
                <div class="flex items-center gap-3 p-2 bg-slate-900/40 rounded-xl border border-slate-800/50">
                    <span class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-sm shadow-inner">🏆</span>
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-widest text-slate-500">Top Spender</p>
                        <p class="text-xs font-bold text-slate-200">${topSpender?.name} ($${spentByUser[topSpenderId].toFixed(2)})</p>
                    </div>
                </div>
                <div class="flex items-center gap-3 p-2 bg-slate-900/40 rounded-xl border border-slate-800/50">
                    <span class="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-sm shadow-inner">📉</span>
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-widest text-slate-500">Highest Debt</p>
                        <p class="text-xs font-bold text-slate-200">${topDebtor?.name} ($${Math.abs(balances[debtorId]).toFixed(2)})</p>
                    </div>
                </div>
                <div class="flex items-center gap-3 p-2 bg-slate-900/40 rounded-xl border border-slate-800/50">
                    <span class="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center text-sm shadow-inner">⚖️</span>
                    <div>
                        <p class="text-[10px] font-black uppercase tracking-widest text-slate-500">Most Balanced</p>
                        <p class="text-xs font-bold text-slate-200">${balancedUser?.name} (±$${Math.abs(balances[mostBalancedId]).toFixed(2)})</p>
                    </div>
                </div>
            </div>`;
    } else {
        spendingInsight.innerHTML = `
            <div class="flex flex-col items-center justify-center py-6 text-center">
                <div class="w-12 h-12 bg-slate-800/30 rounded-2xl flex items-center justify-center mb-3 border border-slate-700/30">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <p class="text-slate-500 text-xs font-bold uppercase tracking-widest">No Insights Yet</p>
            </div>`;
    }
}

// Member Management
const addMember = async () => {
    const name = $('memberNameInput').value.trim();
    if (name) {
        members.push({ id: crypto.randomUUID(), name });
        $('memberNameInput').value = '';
        await save();
        renderMembers();
        showToast(`Added member: ${name}`, "success");
    }
};

$('addMemberBtn').onclick = addMember;
$('memberNameInput').onkeypress = (e) => { if (e.key === 'Enter') addMember(); };

function renderMembers() {
    membersList.innerHTML = members.map(m => `
        <div class="flex items-center justify-between p-3 bg-slate-800/30 rounded-2xl border border-slate-700/30 hover:border-slate-600/50 hover:bg-slate-800/50 transition-all group">
            <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-[11px] font-black text-blue-400 uppercase tracking-widest">
                    ${m.name.charAt(0)}
                </div>
                <span class="text-sm font-bold text-slate-200">${m.name}</span>
            </div>
            <button onclick="removeMember('${m.id}')" class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    `).join('');
    
    // Update Modal Selects
    const currentPayer = expPayerSelect.value;
    expPayerSelect.innerHTML = members.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    if (currentPayer) expPayerSelect.value = currentPayer;

    splitAmongList.innerHTML = members.map(m => `
        <label class="flex items-center gap-3 p-3 hover:bg-slate-800/50 rounded-xl cursor-pointer transition-all border border-transparent hover:border-slate-700/50">
            <input type="checkbox" name="splitWith" value="${m.id}" checked class="w-5 h-5 rounded-lg border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500/40">
            <span class="text-sm font-medium text-slate-300">${m.name}</span>
        </label>
    `).join('');
}

function renderBalances(balances) {
    // Sort creditors first (positive balance), then by absolute value
    const sortedMembers = [...members].sort((a, b) => {
        const balA = balances[a.id] || 0;
        const balB = balances[b.id] || 0;
        return balB - balA;
    });

    balanceList.innerHTML = sortedMembers.map(m => {
        const bal = balances[m.id] || 0;
        const isSettled = Math.abs(bal) < 0.01;
        const balColor = isSettled ? 'text-slate-500' : (bal > 0 ? 'text-green-400' : 'text-red-400');
        const bgOpacity = isSettled ? 'bg-slate-800/10' : (bal > 0 ? 'bg-green-400/5' : 'bg-red-400/5');
        const borderOpacity = isSettled ? 'border-slate-800/20' : (bal > 0 ? 'border-green-400/10' : 'border-red-400/10');
        
        return `
            <div class="flex items-center justify-between p-4 ${bgOpacity} rounded-2xl border ${borderOpacity} transition-all">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full ${isSettled ? 'bg-slate-800/50' : (bal > 0 ? 'bg-green-400/20' : 'bg-red-400/20')} flex items-center justify-center text-[10px] font-black ${balColor} uppercase">
                        ${m.name.charAt(0)}
                    </div>
                    <span class="text-sm font-semibold">${m.name}</span>
                </div>
                <div class="text-right">
                    <p class="text-sm font-black ${balColor} ${bal > 0 ? 'glow-green' : (bal < 0 ? 'glow-red' : '')}">
                        ${isSettled ? '$0.00' : (bal > 0 ? '+' : '-') + '$' + Math.abs(bal).toFixed(2)}
                    </p>
                    <p class="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-0.5">
                        ${isSettled ? 'Settled' : (bal > 0 ? 'To Receive' : 'To Pay')}
                    </p>
                </div>
            </div>
        `;
    }).join('');

    if (members.length === 0) {
        balanceList.innerHTML = '<div class="text-center py-8 text-slate-500 text-xs font-bold uppercase tracking-widest">No members yet</div>';
    }
}

window.removeMember = async (id) => {
    const member = members.find(m => m.id === id);
    members = members.filter(m => m.id !== id);
    expenses = expenses.filter(exp => exp.payer !== id && !exp.splitWith.includes(id));
    await save();
    renderMembers();
    renderExpenses();
    if (member) showToast(`Removed member: ${member.name}`, "info");
};

// Expense Management
$('addExpenseBtn').onclick = () => {
    if (members.length === 0) return alert("Add some members first!");
    expenseModal.classList.remove('hidden');
    renderMembers(); // Refresh checkbox list
};

$('closeModal').onclick = () => expenseModal.classList.add('hidden');

expenseForm.onsubmit = (e) => {
    e.preventDefault();
    const desc = $('expDesc').value;
    const amount = parseFloat($('expAmount').value);
    const payer = $('expPayer').value;
    const splitWith = Array.from(document.querySelectorAll('input[name="splitWith"]:checked')).map(cb => cb.value);

    if (splitWith.length === 0) return showToast("Select at least one person to split with!", "error");

    expenses.unshift({
        id: crypto.randomUUID(),
        desc, amount, payer, splitWith,
        date: new Date().toLocaleDateString()
    });

    expenseForm.reset();
    expenseModal.classList.add('hidden');
    save();
    renderExpenses();
    showToast(`Added expense: ${desc}`, "success");
};

function renderExpenses() {
    if (expenses.length === 0) {
        $('emptyHistory').classList.remove('hidden');
        expenseHistory.innerHTML = '';
    } else {
        $('emptyHistory').classList.add('hidden');
        expenseHistory.innerHTML = expenses.map(exp => {
            const payerName = members.find(m => m.id === exp.payer)?.name || 'Deleted User';
            return `
                <tr class="group hover:bg-slate-800/20 transition-all border-b border-slate-800/30 last:border-0">
                    <td class="px-4 py-5">
                        <p class="font-bold text-slate-200">${exp.desc}</p>
                        <p class="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">${exp.date}</p>
                    </td>
                    <td class="px-4 py-5 text-right font-black text-blue-400 glow-blue tracking-tight">$${exp.amount.toFixed(2)}</td>
                    <td class="px-4 py-5 text-center">
                        <span class="px-3 py-1 bg-slate-800/80 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400 border border-slate-700/50">${payerName}</span>
                    </td>
                    <td class="px-4 py-5 text-right">
                        <div class="flex justify-end gap-1">
                            <button onclick="editExpense('${exp.id}')" class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <button onclick="deleteExpense('${exp.id}')" class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

window.editExpense = (id) => {
    const exp = expenses.find(e => e.id === id);
    if (!exp) return;
    
    // Fill form
    $('expDesc').value = exp.desc;
    $('expAmount').value = exp.amount;
    $('expPayer').value = exp.payer;
    
    // Open modal
    expenseModal.classList.remove('hidden');
    renderMembers(); // Refresh checkbox list
    
    // Set checkboxes
    document.querySelectorAll('input[name="splitWith"]').forEach(cb => {
        cb.checked = exp.splitWith.includes(cb.value);
    });

    // Delete the old one so "Save" acts as update
    deleteExpense(id);
};

window.deleteExpense = (id) => {
    const exp = expenses.find(e => e.id === id);
    expenses = expenses.filter(exp => exp.id !== id);
    save();
    renderExpenses();
    if (exp) showToast(`Deleted expense: ${exp.desc}`, "info");
};

// Settlement Logic (Debt Simplification Algorithm)
async function calculateSettlements() {
    if (members.length === 0) {
        settlementsList.innerHTML = '<div class="col-span-full text-center text-slate-500 py-12 text-xs font-bold uppercase tracking-widest">No members to calculate</div>';
        optimizationStats.textContent = "Add members first";
        renderBalances({});
        return;
    }

    // Show loading for a bit to feel "intelligent"
    loadingOverlay.classList.remove('hidden');
    await new Promise(r => setTimeout(r, 400));

    const balances = {};
    members.forEach(m => balances[m.id] = 0);

    expenses.forEach(exp => {
        const splitAmount = exp.amount / exp.splitWith.length;
        balances[exp.payer] += exp.amount;
        exp.splitWith.forEach(userId => {
            if (balances[userId] !== undefined) balances[userId] -= splitAmount;
        });
    });

    const debtors = [];
    const creditors = [];

    Object.entries(balances).forEach(([id, balance]) => {
        if (balance < -0.01) debtors.push({ id, balance: Math.abs(balance) });
        else if (balance > 0.01) creditors.push({ id, balance });
    });

    // Naive count (worst case: each debtor pays their share to a central pool or multiple people)
    // A simple naive count is just sum of debtors + creditors - 1 (in a connected graph)
    // Or more simply, if everyone just paid into a pool, it would be number of debtors + number of creditors
    const naiveCount = expenses.length > 0 ? debtors.length + creditors.length : 0;

    const settlements = [];
    
    // Greedy approach for debt simplification
    let d = 0, c = 0;
    const tempDebtors = debtors.map(x => ({ ...x })).sort((a, b) => b.balance - a.balance);
    const tempCreditors = creditors.map(x => ({ ...x })).sort((a, b) => b.balance - a.balance);

    while (d < tempDebtors.length && c < tempCreditors.length) {
        const amount = Math.min(tempDebtors[d].balance, tempCreditors[c].balance);
        if (amount > 0.01) {
            settlements.push({
                from: tempDebtors[d].id,
                to: tempCreditors[c].id,
                amount
            });
        }

        tempDebtors[d].balance -= amount;
        tempCreditors[c].balance -= amount;

        if (tempDebtors[d].balance < 0.01) d++;
        if (tempCreditors[c].balance < 0.01) c++;
    }

    loadingOverlay.classList.add('hidden');
    
    const optimizedCount = settlements.length;
    if (expenses.length > 0) {
        const reduction = naiveCount - optimizedCount;
        optimizationStats.innerHTML = `
            <div class="flex items-center gap-2">
                <span>Reduced from <span class="text-slate-300">${naiveCount}</span> to <span class="text-blue-400">${optimizedCount}</span> transactions</span>
                ${reduction > 0 ? `<span class="px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded text-[9px]">Saved ${reduction} payments</span>` : ''}
            </div>`;
    } else {
        optimizationStats.textContent = "Ready to simplify";
    }

    renderBalances(balances);
    renderSettlements(settlements);
}

function renderSettlements(settlements) {
    if (settlements.length === 0) {
        settlementsList.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center py-12 text-center card-enter">
                <div class="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-4 border border-green-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <p class="text-green-400/80 font-bold uppercase tracking-widest text-[10px]">All settled up!</p>
            </div>
        `;
        return;
    }

    settlementsList.innerHTML = settlements.map((s, index) => {
        const fromName = members.find(m => m.id === s.from)?.name || 'Deleted User';
        const toName = members.find(m => m.id === s.to)?.name || 'Deleted User';
        return `
            <div class="p-5 bg-slate-900/40 rounded-3xl border border-slate-800/60 flex flex-col gap-4 hover:border-blue-500/30 transition-all group card-enter" style="animation-delay: ${index * 0.1}s">
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
                <div class="pt-4 border-t border-slate-800/50 text-center">
                    <span class="text-2xl font-black text-white glow-blue tracking-tighter">$${s.amount.toFixed(2)}</span>
                </div>
            </div>
        `;
    }).join('');
}

// Global Actions
$('whyBtn').onclick = () => whyModal.classList.remove('hidden');
$('closeWhyModal').onclick = () => whyModal.classList.add('hidden');

$('demoModeBtn').onclick = async () => {
    if ((members.length > 0 || expenses.length > 0) && !confirm("This will replace all current data with demo data. Continue?")) return;

    // Sample Data
    const demoMembers = [
        { id: 'm1', name: 'Alex' },
        { id: 'm2', name: 'Jordan' },
        { id: 'm3', name: 'Casey' },
        { id: 'm4', name: 'Sam' }
    ];

    const demoExpenses = [
        { id: 'e1', desc: 'AirBnB Booking', amount: 450.00, payer: 'm1', splitWith: ['m1', 'm2', 'm3', 'm4'], date: new Date().toLocaleDateString() },
        { id: 'e2', desc: 'Car Rental', amount: 120.00, payer: 'm2', splitWith: ['m1', 'm2', 'm3', 'm4'], date: new Date().toLocaleDateString() },
        { id: 'e3', desc: 'Group Dinner', amount: 185.50, payer: 'm3', splitWith: ['m1', 'm2', 'm3', 'm4'], date: new Date().toLocaleDateString() },
        { id: 'e4', desc: 'Groceries', amount: 65.20, payer: 'm4', splitWith: ['m1', 'm2', 'm3', 'm4'], date: new Date().toLocaleDateString() },
        { id: 'e5', desc: 'Museum Tickets', amount: 80.00, payer: 'm1', splitWith: ['m1', 'm3'], date: new Date().toLocaleDateString() }
    ];

    // Load Data
    members = demoMembers;
    expenses = demoExpenses;
    
    // Animate and Update
    const sections = document.querySelectorAll('section');
    sections.forEach(s => s.classList.add('settle-animate'));
    
    setTimeout(async () => {
        await save();
        renderMembers();
        renderExpenses();
        sections.forEach(s => s.classList.remove('settle-animate'));
        showToast("Demo Mode loaded! 🚀", "success");
    }, 800);
};

$('settleAllBtn').onclick = () => {
    if (expenses.length === 0) return showToast("No expenses to clear", "info");
    
    if (confirm("Clear all expenses and settle up?")) {
        // Quick Clear Animation
        const sections = document.querySelectorAll('section');
        sections.forEach(s => s.classList.add('settle-animate'));
        
        setTimeout(() => {
            expenses = [];
            save();
            renderExpenses();
            sections.forEach(s => s.classList.remove('settle-animate'));
            showToast("All debts cleared!", "success");
        }, 800);
    }
};

$('simplifyBtn').onclick = async () => {
    const btn = $('simplifyBtn');
    btn.disabled = true;
    
    await calculateSettlements();
    
    showToast("Transactions optimized!", "success");
    btn.innerHTML = `
        <span class="flex items-center gap-1">
            Optimized
            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
            </svg>
        </span>`;
    
    setTimeout(() => {
        btn.disabled = false;
        btn.textContent = "Simplify Debts";
    }, 2000);
};

// Start App
init();
