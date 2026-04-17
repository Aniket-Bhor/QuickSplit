import { state } from './state.js';
import { $, qs, qsa, formatCurrency } from './utils/helpers.js';
import { calculateBalances, simplifyDebts, calculateRawDebts } from './calc.js';
import * as ui from './ui.js';

class App {
    constructor() {
        this.initSelectors();
        this.bindEvents();
        this.updateUI();
        this.checkDemoMode();
        if (state.isHackerMode) {
            document.body.classList.add('hacker-mode');
        }
    }

    initSelectors() {
        this.membersList = $('membersList');
        this.expenseHistory = $('expenseHistory');
        this.settlementsList = $('settlementsList');
        this.memberCount = $('memberCount');
        this.totalGroupExpense = $('totalGroupExpense');
        this.spendingInsight = $('spendingInsight');
        this.expenseModal = $('expenseModal');
        this.expenseForm = $('expenseForm');
        this.expPayerSelect = $('expPayer');
        this.splitAmongList = $('splitAmongList');
        this.balanceList = $('balanceList');
        this.optimizationStats = $('optimizationStats');
        this.loadingOverlay = $('loadingOverlay');
        this.toastContainer = $('toastContainer');
        this.whyModal = $('whyModal');
        this.demoBadge = $('demoBadge');
        this.flowContainer = $('flowContainer');
        this.emptyFlow = $('emptyFlow');
        this.themeToggle = $('themeToggle');
        this.sunIcon = $('sunIcon');
        this.moonIcon = $('moonIcon');
        this.fullResetBtn = $('fullResetBtn');
        this.editingExpenseId = null;
        
        // Mode Selectors
        this.simplifyBtn = $('simplifyBtn');
        this.modeBadge = $('modeBadge');
        
        // Settlement History
        this.settlementHistoryList = $('settlementHistoryList');
        this.emptySettlementHistory = $('emptySettlementHistory');
        this.clearHistoryBtn = $('clearHistoryBtn');
        this.historyFilter = $('historyFilter');
        
        // Partial Settlement Modal
        this.partialSettleModal = $('partialSettleModal');
        this.partialSettleForm = $('partialSettleForm');
        this.confirmModal = $('confirmModal');
        this.currentPartialSettle = null;
    }

    bindEvents() {
        $('addMemberBtn').onclick = () => this.handleAddMember();
        $('memberNameInput').onkeydown = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.handleAddMember();
            }
        };
        $('addExpenseBtn').onclick = () => {
            this.editingExpenseId = null;
            $('expenseModalTitle').textContent = 'Add New Expense';
            this.showExpenseModal();
        };
        $('closeModal').onclick = () => {
            this.expenseModal.classList.add('hidden');
            this.editingExpenseId = null;
            this.expenseForm.reset();
        };
        this.expenseForm.onsubmit = (e) => this.handleExpenseSubmit(e);
        
        $('closePartialModal').onclick = () => this.partialSettleModal.classList.add('hidden');
        this.partialSettleForm.onsubmit = (e) => this.handlePartialSettleSubmit(e);
        
        $('settleAllBtn').onclick = () => this.handleSettleAll();
        this.simplifyBtn.onclick = () => this.handleToggleMode();
        $('whyBtn').onclick = () => this.whyModal.classList.remove('hidden');
        $('closeWhyModal').onclick = () => this.whyModal.classList.add('hidden');
        $('demoModeBtn').onclick = () => this.toggleDemoMode();
        this.themeToggle.onclick = () => this.toggleTheme();
        this.fullResetBtn.onclick = () => this.handleFullReset();
        
        $('selectAllBtn').onclick = () => {
            qsa('input[name="splitWith"]').forEach(cb => cb.checked = true);
        };
        $('deselectAllBtn').onclick = () => {
            qsa('input[name="splitWith"]').forEach(cb => cb.checked = false);
        };
        
        this.clearHistoryBtn.onclick = () => this.handleClearHistory();
        this.historyFilter.onchange = () => this.updateUI();
        
        this.initKonamiCode();
        this.initTheme();
    }

    async updateUI() {
        const balances = calculateBalances(state.members, state.expenses, state.payments);
        const { settlements: optimizedSettlements, naiveCount } = simplifyDebts(balances);
        const rawSettlements = calculateRawDebts(state.expenses, state.payments);
        
        const currentSettlements = state.settlementMode === 'optimized' ? optimizedSettlements : rawSettlements;

        ui.renderMembers(state.members, this.expPayerSelect, this.splitAmongList, this.membersList);
        ui.renderExpenses(state.expenses, state.members, this.expenseHistory, $('emptyHistory'));
        ui.renderBalances(state.members, balances, this.balanceList);
        ui.renderBalanceChart(state.members, balances);
        ui.renderSettlements(currentSettlements, state.members, this.settlementsList, this.optimizationStats, state.settlementMode);
        ui.renderFlow(currentSettlements, state.members, this.flowContainer, this.emptyFlow);
        
        // Update Mode Button and Badge
        this.updateModeUI(rawSettlements.length, optimizedSettlements.length);

        const filter = this.historyFilter.value;
        let filteredHistory = state.settlementHistory;
        if (filter !== 'all') {
            filteredHistory = state.settlementHistory.filter(h => {
                if (filter === 'partial') return h.type === 'partial';
                if (filter === 'full') return h.type === 'full' || h.type === 'FULL_SETTLEMENT';
                if (filter === 'settlement') return h.type === 'FULL_SETTLEMENT';
                return true;
            });
        }
        ui.renderSettlementHistory(filteredHistory, state.members, this.settlementHistoryList, this.emptySettlementHistory);

        this.updateDashboard(balances);
    }

    initTheme() {
        const savedTheme = localStorage.getItem('qs_theme') || 'dark';
        if (savedTheme === 'light') {
            document.body.classList.add('light');
            this.sunIcon.classList.remove('hidden');
            this.moonIcon.classList.add('hidden');
        }
    }

    toggleTheme() {
        const isLight = document.body.classList.toggle('light');
        localStorage.setItem('qs_theme', isLight ? 'light' : 'dark');
        this.sunIcon.classList.toggle('hidden', !isLight);
        this.moonIcon.classList.toggle('hidden', isLight);
        this.updateUI();
        ui.showToast(this.toastContainer, `${isLight ? 'Light' : 'Dark'} Mode Activated`, "info");
    }

    initKonamiCode() {
        const code = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
        let idx = 0;
        
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && state.isHackerMode) {
                this.disableHackerMode();
                return;
            }
            
            if (e.key === code[idx]) {
                idx++;
                if (idx === code.length) {
                    this.toggleHackerMode();
                    idx = 0;
                }
            } else {
                idx = 0;
            }
        });
    }

    toggleHackerMode() {
        const newState = !state.isHackerMode;
        state.setHackerMode(newState);
        document.body.classList.toggle('hacker-mode', newState);
        ui.showToast(this.toastContainer, newState ? "Hacker Mode Activated 🟢" : "Hacker Mode Disabled ⚪", "success");
    }

    disableHackerMode() {
        state.setHackerMode(false);
        document.body.classList.remove('hacker-mode');
        ui.showToast(this.toastContainer, "Hacker Mode Disabled ⚪", "info");
    }

    moneyRain() {
        const symbols = ['₹', '💸', '💰', '💎'];
        for (let i = 0; i < 50; i++) {
            const el = document.createElement('div');
            el.className = 'money-rain';
            el.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            el.style.left = Math.random() * 100 + 'vw';
            el.style.animationDuration = (Math.random() * 2 + 1) + 's';
            el.style.opacity = Math.random();
            document.body.appendChild(el);
            setTimeout(() => el.remove(), 3000);
        }
    }

    updateDashboard(balances) {
        const total = state.expenses.reduce((sum, exp) => sum + exp.amount, 0);
        this.totalGroupExpense.textContent = formatCurrency(total);
        this.memberCount.textContent = state.members.length;
        
        $('simplifyBtn').disabled = state.expenses.length === 0;
        $('settleAllBtn').disabled = state.expenses.length === 0;
        $('settleAllBtn').classList.toggle('opacity-50', state.expenses.length === 0);
        $('settleAllBtn').classList.toggle('cursor-not-allowed', state.expenses.length === 0);

        // Insights
        if (state.expenses.length > 0 && state.members.length > 0) {
            const spentByUser = {};
            const expenseCountByUser = {};
            state.members.forEach(m => {
                spentByUser[m.id] = 0;
                expenseCountByUser[m.id] = 0;
            });

            state.expenses.forEach(exp => {
                spentByUser[exp.payer] += exp.amount;
                expenseCountByUser[exp.payer]++;
            });

            const topSpenderId = Object.keys(spentByUser).reduce((a, b) => spentByUser[a] > spentByUser[b] ? a : b);
            const frequentPayerId = Object.keys(expenseCountByUser).reduce((a, b) => expenseCountByUser[a] > expenseCountByUser[b] ? a : b);
            const debtorId = Object.keys(balances).reduce((a, b) => balances[a] < balances[b] ? a : b);
            const mostBalancedId = Object.keys(balances).reduce((a, b) => Math.abs(balances[a]) < Math.abs(balances[b]) ? a : b);

            const largestExpense = [...state.expenses].sort((a, b) => b.amount - a.amount)[0];

            const debtAmt = Math.abs(balances[debtorId]);
            const roastMsg = debtAmt > 5000 ? "Bro, you owe too much 😭" : debtAmt > 1000 ? "Time to pay up 💸" : "";

            this.spendingInsight.innerHTML = `
                <div class="grid grid-cols-1 gap-3">
                    ${this.insightRow('🏆', 'Top Spender', state.members.find(m => m.id === topSpenderId)?.name, formatCurrency(spentByUser[topSpenderId]), 'bg-blue-500/10')}
                    ${this.insightRow('🔄', 'Frequent Payer', state.members.find(m => m.id === frequentPayerId)?.name, `${expenseCountByUser[frequentPayerId]} expenses`, 'bg-indigo-500/10')}
                    ${this.insightRow('📉', 'Highest Debt', state.members.find(m => m.id === debtorId)?.name, formatCurrency(debtAmt), 'bg-red-500/10')}
                    ${roastMsg ? `<p class="text-[10px] font-bold text-red-400 uppercase tracking-tighter text-center animate-bounce">${roastMsg}</p>` : ''}
                    ${this.insightRow('💎', 'Largest Buy', largestExpense.desc, formatCurrency(largestExpense.amount), 'bg-amber-500/10')}
                    ${this.insightRow('⚖️', 'Most Balanced', state.members.find(m => m.id === mostBalancedId)?.name, `±${formatCurrency(Math.abs(balances[mostBalancedId]))}`, 'bg-green-500/10')}
                </div>`;
        } else {
            this.spendingInsight.innerHTML = `
                <div class="flex flex-col items-center justify-center py-6 text-center">
                    <div class="w-12 h-12 bg-slate-800/30 rounded-2xl flex items-center justify-center mb-3 border border-slate-700/30">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p class="text-slate-500 text-xs font-bold uppercase tracking-widest">No expenses yet… peace is maintained 😄</p>
                </div>`;
        }
    }

    insightRow(icon, label, name, value, bg) {
        return `
            <div class="flex items-center gap-3 p-2 bg-slate-900/40 rounded-xl border border-slate-800/50">
                <span class="w-8 h-8 rounded-lg ${bg} flex items-center justify-center text-sm shadow-inner">${icon}</span>
                <div>
                    <p class="text-[10px] font-black uppercase tracking-widest text-slate-500">${label}</p>
                    <p class="text-xs font-bold text-slate-200">${name} (${value})</p>
                </div>
            </div>`;
    }

    checkDemoMode() {
        if (state.isDemoMode) {
            this.demoBadge.classList.remove('hidden');
            $('demoModeBtn').innerHTML = `
                <span class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-red-500"></span>
                    Exit Demo Mode
                </span>`;
            $('demoModeBtn').classList.replace('text-amber-400', 'text-red-400');
            $('demoModeBtn').classList.replace('border-amber-400/20', 'border-red-400/20');
        } else {
            this.demoBadge.classList.add('hidden');
            $('demoModeBtn').innerHTML = `
                <span class="relative flex h-2 w-2">
                    <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                Enter Demo Mode`;
            $('demoModeBtn').classList.replace('text-red-400', 'text-amber-400');
            $('demoModeBtn').classList.replace('border-red-400/20', 'border-amber-400/20');
        }
    }

    toggleDemoMode() {
        const active = !state.isDemoMode;
        state.setDemoMode(active);
        
        if (active) {
            state.payments = [];
            setTimeout(() => {
                this.startTutorial();
            }, 500);
        }
        
        this.checkDemoMode();
        this.updateUI();
        ui.showToast(this.toastContainer, active ? "Entered Demo Mode" : "Restored User Data", "success");
    }

    startTutorial() {
        if (state.tutorialActive && state.isDemoMode) {
            this.renderTutorialStep();
        }
    }

    renderTutorialStep() {
        if (state.tutorialActive && state.tutorialStep < 6) {
            const TUTORIAL_STEP_IDS = [
                'memberNameInput',
                'addExpenseBtn',
                'balanceSection',
                'simplifyBtn',
                'settlementsList',
                'settleAllBtn'
            ];
            
            const targetId = TUTORIAL_STEP_IDS[state.tutorialStep];
            const targetEl = document.getElementById(targetId);
            
            if (targetEl) {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            // Small delay to allow scroll and DOM to settle
            setTimeout(() => {
                ui.renderTutorial(
                    state.tutorialStep,
                    () => {
                        state.nextTutorialStep();
                        this.renderTutorialStep();
                    },
                    () => {
                        state.skipTutorial();
                        ui.removeTutorial();
                    }
                );
            }, 300);
        } else {
            ui.removeTutorial();
        }
    }

    handleAddMember() {
        const input = $('memberNameInput');
        const name = input.value.trim();
        if (!name) return ui.showToast(this.toastContainer, "Please enter a name", "error");
        
        if (state.members.some(m => m.name.toLowerCase() === name.toLowerCase())) {
            return ui.showToast(this.toastContainer, "Member already exists", "error");
        }

        state.addMember(name);
        input.value = '';
        this.updateUI();
        ui.showToast(this.toastContainer, `Added ${name}`, "success");
    }

    handleRemoveMember(id) {
        const member = state.members.find(m => m.id === id);
        if (!member) return;

        const hasExpenses = state.expenses.some(e => e.payer === id || e.splitWith.includes(id));
        
        ui.showConfirm({
            title: `Remove ${member.name}?`,
            message: hasExpenses 
                ? `This will also delete all expenses where ${member.name} was involved.` 
                : `Are you sure you want to remove this member?`,
            confirmText: 'Remove',
            confirmClass: 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/20',
            iconBg: 'bg-red-500/10',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>`,
            onConfirm: () => {
                state.removeMember(id);
                this.updateUI();
                ui.showToast(this.toastContainer, `Removed ${member.name}`, "info");
            }
        });
    }

    handleEditMember(id) {
        const member = state.members.find(m => m.id === id);
        if (!member) return;

        const newName = prompt("Enter new name for " + member.name, member.name);
        if (newName && newName.trim() && newName.trim() !== member.name) {
            state.updateMember(id, newName.trim());
            this.updateUI();
            ui.showToast(this.toastContainer, `Updated member name`, "success");
        }
    }

    showExpenseModal() {
        if (state.members.length === 0) return ui.showToast(this.toastContainer, "Add members first!", "error");
        this.expenseModal.classList.remove('hidden');
        ui.renderMembers(state.members, this.expPayerSelect, this.splitAmongList, this.membersList);
    }

    handleExpenseSubmit(e) {
        e.preventDefault();
        const desc = $('expDesc').value.trim();
        const amount = parseFloat($('expAmount').value);
        const payer = $('expPayer').value;
        const splitWith = Array.from(qsa('input[name="splitWith"]:checked')).map(cb => cb.value);

        if (!desc) return ui.showToast(this.toastContainer, "Enter a description", "error");
        if (isNaN(amount) || amount <= 0) return ui.showToast(this.toastContainer, "Enter a valid amount", "error");
        if (!payer) return ui.showToast(this.toastContainer, "Select a payer", "error");
        if (splitWith.length === 0) return ui.showToast(this.toastContainer, "Select at least one person!", "error");

        if (this.editingExpenseId) {
            state.removeExpense(this.editingExpenseId);
            this.editingExpenseId = null;
        }

        state.addExpense({ desc, amount, payer, splitWith });
        this.expenseForm.reset();
        this.expenseModal.classList.add('hidden');
        this.updateUI();
        ui.showToast(this.toastContainer, "Expense saved", "success");
    }

    handleEditExpense(id) {
        const exp = state.expenses.find(e => e.id === id);
        if (!exp) return;
        
        this.editingExpenseId = id;
        $('expenseModalTitle').textContent = 'Edit Expense';
        
        $('expDesc').value = exp.desc;
        $('expAmount').value = exp.amount;
        $('expPayer').value = exp.payer;
        
        this.showExpenseModal();
        qsa('input[name="splitWith"]').forEach(cb => {
            cb.checked = exp.splitWith.includes(cb.value);
        });
    }

    handleDeleteExpense(id) {
        state.removeExpense(id);
        this.updateUI();
        ui.showToast(this.toastContainer, "Expense deleted", "info");
    }

    handleSettleAll() {
        if (state.expenses.length === 0) return ui.showToast(this.toastContainer, "Already settled!", "info");
        
        const balances = calculateBalances(state.members, state.expenses, state.payments);
        const { settlements } = simplifyDebts(balances);

        if (settlements.length === 0) {
            return ui.showToast(this.toastContainer, "Everything is already settled! 🎉", "info");
        }

        const totalAmount = settlements.reduce((s, x) => s + x.amount, 0);

        ui.showConfirm({
            title: 'Settle All Debts?',
            message: `This will mark all ₹${totalAmount.toFixed(2)} in current debts as paid. This action is recorded in history.`,
            confirmText: 'Settle All',
            confirmClass: 'bg-green-600 hover:bg-green-500 text-white shadow-green-500/20',
            iconBg: 'bg-green-500/10',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>`,
            onConfirm: () => {
                this.moneyRain();
                state.settleAll(settlements);
                this.updateUI();
                ui.showToast(this.toastContainer, "All balances settled successfully! 💸", "success");
            }
        });
    }

    async handleToggleMode() {
        const newMode = state.settlementMode === 'optimized' ? 'raw' : 'optimized';
        state.setSettlementMode(newMode);
        
        // Apply transition animation
        this.settlementsList.classList.add('mode-transition');
        this.flowContainer.classList.add('mode-transition');
        
        if (newMode === 'optimized') {
            this.loadingOverlay.classList.remove('hidden');
            await new Promise(r => setTimeout(r, 600));
            this.loadingOverlay.classList.add('hidden');
            ui.showToast(this.toastContainer, "Smart Settlements Enabled", "success");
        } else {
            ui.showToast(this.toastContainer, "Direct Debts Mode", "info");
        }
        
        this.updateUI();
        
        // Remove class after animation finishes
        setTimeout(() => {
            this.settlementsList.classList.remove('mode-transition');
            this.flowContainer.classList.remove('mode-transition');
        }, 500);
    }

    updateModeUI(rawCount, optimizedCount) {
        const isOptimized = state.settlementMode === 'optimized';
        
        // Update Button
        this.simplifyBtn.textContent = isOptimized ? 'Show Raw Debts' : 'Smart Optimize ⚡';
        this.simplifyBtn.classList.toggle('text-blue-400', isOptimized);
        this.simplifyBtn.classList.toggle('text-amber-400', !isOptimized);
        this.simplifyBtn.classList.toggle('border-blue-400/20', isOptimized);
        this.simplifyBtn.classList.toggle('border-amber-400/20', !isOptimized);
        this.simplifyBtn.disabled = state.expenses.length === 0;
        
        // Update Badge
        if (state.expenses.length === 0) {
            this.modeBadge.textContent = 'No Data';
            this.modeBadge.classList.toggle('bg-blue-500/10', true);
            this.modeBadge.classList.toggle('text-blue-400', true);
            this.modeBadge.classList.toggle('border-blue-500/20', true);
            this.modeBadge.classList.toggle('bg-amber-500/10', false);
            this.modeBadge.classList.toggle('text-amber-400', false);
            this.modeBadge.classList.toggle('border-amber-500/20', false);
        } else {
            this.modeBadge.textContent = isOptimized ? 'Smart (Minimized)' : 'Raw (Unoptimized)';
            this.modeBadge.classList.toggle('bg-blue-500/10', isOptimized);
            this.modeBadge.classList.toggle('text-blue-400', isOptimized);
            this.modeBadge.classList.toggle('border-blue-500/20', isOptimized);
            this.modeBadge.classList.toggle('bg-amber-500/10', !isOptimized);
            this.modeBadge.classList.toggle('text-amber-400', !isOptimized);
            this.modeBadge.classList.toggle('border-amber-500/20', !isOptimized);
        }

        // Update Optimization Stats
        if (state.expenses.length > 0) {
            const reduction = rawCount - optimizedCount;
            this.optimizationStats.innerHTML = `
                <div class="flex items-center gap-2">
                    <span>${isOptimized ? 'Minimized' : 'Raw'} from <span class="text-slate-300">${rawCount}</span> to <span class="text-blue-400">${optimizedCount}</span> transactions</span>
                    ${reduction > 0 ? `<span class="px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded text-[9px]">Saved ${reduction} payments</span>` : ''}
                </div>`;
        } else {
            this.optimizationStats.textContent = "Ready to simplify";
        }
    }

    handleFullSettle(from, to, amount) {
        const fromName = state.members.find(m => m.id === from)?.name;
        const toName = state.members.find(m => m.id === to)?.name;
        
        if (confirm(`Mark ₹${amount.toFixed(2)} as fully paid from ${fromName} to ${toName}?`)) {
            state.addPayment({ from, to, amount });
            state.addSettlementHistory({ from, to, amount, type: 'full' });
            this.updateUI();
            ui.showToast(this.toastContainer, "Settlement complete! 🎉", "success");
        }
    }

    handlePartialSettle(from, to, maxAmount) {
        const fromName = state.members.find(m => m.id === from)?.name;
        const toName = state.members.find(m => m.id === to)?.name;
        
        this.currentPartialSettle = { from, to, maxAmount, fromName, toName };
        
        $('partialSettleInfo').innerHTML = `
            <div class="p-4 bg-blue-500/10 rounded-xl border border-blue-500/20 mb-4">
                <p class="text-blue-400 font-bold mb-1">${fromName} → ${toName}</p>
                <p class="text-xs">Max amount: <span class="font-bold">${formatCurrency(maxAmount)}</span></p>
            </div>
        `;
        $('partialAmount').value = maxAmount.toFixed(2);
        $('partialAmount').max = maxAmount;
        
        this.partialSettleModal.classList.remove('hidden');
    }

    handlePartialSettleSubmit(e) {
        e.preventDefault();
        const amount = parseFloat($('partialAmount').value);
        
        if (isNaN(amount) || amount <= 0) {
            return ui.showToast(this.toastContainer, "Invalid amount", "error");
        }

        if (amount > this.currentPartialSettle.maxAmount + 0.01) {
            return ui.showToast(this.toastContainer, "Amount exceeds debt!", "error");
        }

        state.addPayment({ 
            from: this.currentPartialSettle.from, 
            to: this.currentPartialSettle.to, 
            amount 
        });
        state.addSettlementHistory({ 
            from: this.currentPartialSettle.from, 
            to: this.currentPartialSettle.to, 
            amount, 
            type: 'partial' 
        });
        
        this.partialSettleModal.classList.add('hidden');
        this.updateUI();
        ui.showToast(this.toastContainer, `Recorded ${formatCurrency(amount)} payment`, "success");
    }

    handleClearHistory() {
        if (state.settlementHistory.length === 0) return;
        if (confirm("Are you sure you want to clear settlement history?")) {
            state.clearSettlementHistory();
            this.updateUI();
            ui.showToast(this.toastContainer, "History cleared", "info");       
        }
    }

    handleFullReset() {
        ui.showConfirm({
            title: 'Wipe All Data?',
            message: 'This will permanently delete ALL members, expenses, and history. This action cannot be undone.',
            confirmText: 'Delete Everything',
            confirmClass: 'bg-red-600 hover:bg-red-500 text-white shadow-red-500/20',
            iconBg: 'bg-red-500/10',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>`,
            onConfirm: () => {
                localStorage.clear(); // Clear all including settings
                location.reload();
            }
        });
    }
}

export const app = new App();
window.app = app;
