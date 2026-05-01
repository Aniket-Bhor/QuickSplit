import { $, formatCurrency, qsa } from './utils/helpers.js';
import { MemberCard } from './components/memberCard.js';
import { ExpenseItem } from './components/expenseItem.js';
import { SettlementCard } from './components/settlementCard.js';
import { FlowCard } from './components/flowCard.js';
import { SettlementHistoryItem } from './components/settlementHistoryItem.js';

export const renderMembers = (members, payerSelect, splitList, membersList, splitType = 'equal', customAmounts = {}) => {
    membersList.innerHTML = members.map(m => MemberCard(m)).join('');
    
    // Update Modal Selects
    const currentPayer = payerSelect.value;
    payerSelect.innerHTML = members.map(m => `<option value="${m.id}">${m.name}</option>`).join('');
    if (currentPayer) payerSelect.value = currentPayer;

    splitList.innerHTML = members.map(m => `
        <label class="flex items-center gap-3 p-3 hover:bg-slate-800/50 rounded-xl cursor-pointer transition-all border border-transparent hover:border-slate-700/50">
            <input type="checkbox" name="splitWith" value="${m.id}" checked class="w-5 h-5 rounded-lg border-slate-700 bg-slate-900 text-blue-600 focus:ring-blue-500/40 split-checkbox" data-member-id="${m.id}">
            <span class="flex-1 text-sm font-medium text-slate-300">${m.name}</span>
            ${splitType === 'custom' ? `<input type="number" step="0.01" name="customAmount" data-member-id="${m.id}" class="w-24 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-sm text-white text-right focus:outline-none focus:ring-2 focus:ring-blue-500/40 custom-amount-input" value="${customAmounts[m.id] || ''}" placeholder="0.00">` : ''}
        </label>
    `).join('');
};

export const renderExpenses = (expenses, members, historyList, emptyState) => {
    if (expenses.length === 0) {
        emptyState.classList.remove('hidden');
        historyList.innerHTML = '';
    } else {
        emptyState.classList.add('hidden');
        historyList.innerHTML = expenses.map(exp => {
            const payerName = members.find(m => m.id === exp.payer)?.name || 'Deleted User';
            return ExpenseItem(exp, payerName, members);
        }).join('');
    }
};

const animateValue = (obj, start, end, duration) => {
    if (isNaN(start) || isNaN(end)) {
        obj.innerHTML = formatCurrency(end);
        return;
    }
    
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        // Use easeOutExpo for smoother number counting
        const easeOutExpo = (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));
        const easedProgress = easeOutExpo(progress);
        
        const currentVal = easedProgress * (end - start) + start;
        obj.innerHTML = formatCurrency(currentVal);
        
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
};

export const renderBalances = (members, balances, balanceList) => {
    const sortedMembers = [...members].sort((a, b) => (balances[b.id] || 0) - (balances[a.id] || 0));

    const oldBalances = {};
    qsa('.balance-amt').forEach(el => {
        oldBalances[el.dataset.id] = parseFloat(el.dataset.value || 0);
    });

    balanceList.innerHTML = sortedMembers.map(m => {
        const bal = balances[m.id] || 0;
        const isSettled = Math.abs(bal) < 0.01;
        const balColor = isSettled ? 'text-slate-500' : (bal > 0 ? 'text-green-400' : 'text-red-400');
        const bgOpacity = isSettled ? 'bg-slate-800/10' : (bal > 0 ? 'bg-green-400/5' : 'bg-red-400/5');
        const borderOpacity = isSettled ? 'border-slate-800/20' : (bal > 0 ? 'border-green-400/10' : 'border-red-400/10');
        
        return `
            <div class="flex items-center justify-between p-4 ${bgOpacity} rounded-2xl border ${borderOpacity} transition-all premium-card">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-full ${isSettled ? 'bg-slate-800/50' : (bal > 0 ? 'bg-green-400/20' : 'bg-red-400/20')} flex items-center justify-center text-[10px] font-black ${balColor} uppercase">
                        ${m.name.charAt(0)}
                    </div>
                    <span class="text-sm font-semibold">${m.name}</span>
                </div>
                <div class="text-right">
                    <p class="text-sm font-black ${balColor} ${bal > 0 ? 'glow-green' : (bal < 0 ? 'glow-red' : '')} balance-amt" data-id="${m.id}" data-value="${bal}">
                        ${formatCurrency(bal)}
                    </p>
                    <p class="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-0.5">
                        ${isSettled ? 'Settled' : (bal > 0 ? 'To Receive' : 'To Pay')}
                    </p>
                </div>
            </div>
        `;
    }).join('');

    // Animate the new values
    qsa('.balance-amt').forEach(el => {
        const id = el.dataset.id;
        const newVal = parseFloat(el.dataset.value);
        const oldVal = oldBalances[id] || 0;
        if (Math.abs(newVal - oldVal) > 0.01) {
            animateValue(el, oldVal, newVal, 1000);
        }
    });

    if (members.length === 0) {
        balanceList.innerHTML = '<div class="text-center py-8 text-slate-500 text-xs font-bold uppercase tracking-widest">No members yet</div>';
    }
};

export const renderSettlements = (settlements, members, settlementsList, statsEl, mode = 'optimized') => {
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

    settlementsList.innerHTML = settlements.map((s, idx) => {
        const fromName = members.find(m => m.id === s.from)?.name || 'Deleted User';
        const toName = members.find(m => m.id === s.to)?.name || 'Deleted User';
        return SettlementCard(s, fromName, toName, idx, mode);
    }).join('');
};

export const renderFlow = (settlements, members, container, emptyState) => {
    if (!container || !emptyState) return;
    
    if (settlements.length === 0) {
        emptyState.classList.remove('hidden');
        container.innerHTML = '';
        return;
    }

    emptyState.classList.add('hidden');
    container.innerHTML = settlements.map((s, idx) => {
        const fromName = members.find(m => m.id === s.from)?.name || 'Deleted User';
        const toName = members.find(m => m.id === s.to)?.name || 'Deleted User';
        return FlowCard(s, fromName, toName, idx);
    }).join('');
};

let currentChart = null;
export const renderBalanceChart = (members, balances) => {
    const canvas = document.getElementById('balanceChart');
    const emptyMessage = document.getElementById('emptyChartMessage');
    if (!canvas) return;

    // Filter members with non-zero balances
    const dataPoints = members
        .map(m => ({
            name: m.name,
            balance: balances[m.id] || 0
        }))
        .filter(d => Math.abs(d.balance) > 0.01);

    if (dataPoints.length < 2) {
        canvas.style.display = 'none';
        emptyMessage.classList.remove('hidden');
        if (currentChart) {
            currentChart.destroy();
            currentChart = null;
        }
        return;
    }

    canvas.style.display = 'block';
    emptyMessage.classList.add('hidden');

    if (currentChart) {
        currentChart.destroy();
    }

    const labels = dataPoints.map(d => d.name);
    const data = dataPoints.map(d => Math.abs(d.balance));
    
    // Extended Color Palettes for creditors and debtors
    const creditorPalettes = [
        'rgba(34, 197, 94, 0.7)',  // Green-500
        'rgba(16, 185, 129, 0.7)', // Emerald-500
        'rgba(20, 184, 166, 0.7)', // Teal-500
        'rgba(132, 204, 22, 0.7)', // Lime-500
        'rgba(74, 222, 128, 0.7)'  // Green-400
    ];

    const debtorPalettes = [
        'rgba(239, 68, 68, 0.7)',   // Red-500
        'rgba(244, 63, 94, 0.7)',   // Rose-500
        'rgba(249, 115, 22, 0.7)',  // Orange-500
        'rgba(217, 70, 239, 0.7)',  // Fuchsia-500
        'rgba(248, 113, 113, 0.7)'  // Red-400
    ];

    let creditorIdx = 0;
    let debtorIdx = 0;

    const backgroundColors = dataPoints.map(d => {
        if (d.balance > 0) {
            return creditorPalettes[creditorIdx++ % creditorPalettes.length];
        } else {
            return debtorPalettes[debtorIdx++ % debtorPalettes.length];
        }
    });

    const borderColors = backgroundColors.map(c => c.replace('0.7', '1'));

    currentChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderColor: borderColors,
                borderWidth: 2,
                hoverOffset: 15,
                spacing: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        color: '#94a3b8',
                        font: {
                            size: 10,
                            weight: 'bold',
                            family: 'Inter'
                        },
                        padding: 15,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#f8fafc',
                    bodyColor: '#94a3b8',
                    borderColor: '#334155',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: (context) => {
                            const d = dataPoints[context.dataIndex];
                            const type = d.balance > 0 ? 'Receives' : 'Pays';
                            return ` ${d.name}: ₹${Math.abs(d.balance).toFixed(2)} (${type})`;
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 800,
                easing: 'easeOutQuart'
            }
        }
    });
};

export const renderSettlementHistory = (history, members, container, emptyState) => {
    if (!container || !emptyState) return;

    if (history.length === 0) {
        emptyState.classList.remove('hidden');
        container.innerHTML = '';
        return;
    }

    emptyState.classList.add('hidden');
    container.innerHTML = history.map(h => {
        const fromName = members.find(m => m.id === h.from)?.name || 'Deleted User';
        const toName = members.find(m => m.id === h.to)?.name || 'Deleted User';
        return SettlementHistoryItem(h, fromName, toName);
    }).join('');
};

export const showToast = (container, message, type = 'info') => {
    const toast = document.createElement('div');
    const colors = {
        success: 'bg-green-500/10 border-green-500/20 text-green-400',
        error: 'bg-red-500/10 border-red-500/20 text-red-400',
        info: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
        warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400'
    };
    
    toast.className = `flex items-center gap-3 px-6 py-4 rounded-2xl border backdrop-blur-xl shadow-2xl toast-enter pointer-events-auto ${colors[type] || colors.info}`;
    toast.innerHTML = `
        <span class="text-xs font-bold uppercase tracking-widest">${message}</span>
    `;
    
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

export const showConfirm = (options) => {
    const modal = $('confirmModal');
    const title = $('confirmTitle');
    const message = $('confirmMessage');
    const confirmBtn = $('confirmConfirmBtn');
    const cancelBtn = $('confirmCancelBtn');
    const iconContainer = $('confirmIconContainer');

    title.textContent = options.title || 'Are you sure?';
    message.textContent = options.message || '';
    confirmBtn.textContent = options.confirmText || 'Confirm';
    confirmBtn.className = `flex-1 px-6 py-4 font-bold rounded-2xl transition-all shadow-xl active:scale-95 ${options.confirmClass || 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'}`;
    
    iconContainer.innerHTML = options.icon || '';
    iconContainer.className = `w-16 h-16 rounded-3xl flex items-center justify-center mb-6 mx-auto ${options.iconBg || 'bg-blue-500/10'}`;

    modal.classList.remove('hidden');

    const close = () => modal.classList.add('hidden');

    confirmBtn.onclick = () => {
        close();
        if (options.onConfirm) options.onConfirm();
    };

    cancelBtn.onclick = () => {
        close();
        if (options.onCancel) options.onCancel();
    };
};

const TUTORIAL_STEPS = [
    {
        target: 'memberNameInput',
        title: 'Add Group Members',
        message: 'Start by adding your friends. Enter a name and click the plus icon to add them to the group.'
    },
    {
        target: 'addExpenseBtn',
        title: 'Add Your First Expense',
        message: 'Now record a shared expense. Enter the amount, who paid, and who shared the cost.'
    },
    {
        target: 'balanceSection',
        title: 'Live Balance Updates',
        message: 'Balances update instantly as you add expenses. Green = you\'re owed, Red = you owe.'
    },
    {
        target: 'simplifyBtn',
        title: 'Smart Optimization',
        message: 'Minimize transactions intelligently with our greedy algorithm. Switch between raw and optimized views.'
    },
    {
        target: 'settlementsList',
        title: 'Settlement Flow',
        message: 'Fewer transactions, less confusion. See exactly who pays whom in this optimized list.'
    },
    {
        target: 'settleAllBtn',
        title: 'Settle All at Once',
        message: 'Clear all debts in one click! All expenses are preserved in history for transparency.'
    }
];

export const renderTutorial = (step, onNext, onSkip) => {
    let existingOverlay = document.getElementById('tutorialOverlay');
    if (existingOverlay) existingOverlay.remove();

    if (step >= TUTORIAL_STEPS.length) return;

    const config = TUTORIAL_STEPS[step];
    const targetEl = document.getElementById(config.target);
    if (!targetEl) return;

    const rect = targetEl.getBoundingClientRect();
    const padding = 8;

    const overlay = document.createElement('div');
    overlay.id = 'tutorialOverlay';
    
    // Positioning logic for tooltip
    const tooltipWidth = window.innerWidth < 640 ? 260 : 320;
    const tooltipHeight = 200; // estimated
    
    let tooltipTop = rect.bottom + 16;
    let tooltipLeft = rect.left + (rect.width / 2) - (tooltipWidth / 2);
    
    // Boundary check for horizontal
    tooltipLeft = Math.max(16, Math.min(tooltipLeft, window.innerWidth - tooltipWidth - 16));
    
    // Boundary check for vertical - try above if below doesn't fit
    if (tooltipTop + tooltipHeight > window.innerHeight) {
        const aboveTop = rect.top - tooltipHeight - 16;
        if (aboveTop > 16) {
            tooltipTop = aboveTop;
        } else {
            // If it doesn't fit either, center it relative to viewport if it's really tight
            // Or just put it where there's more space
            if (rect.top > window.innerHeight - rect.bottom) {
                tooltipTop = Math.max(16, rect.top - tooltipHeight - 16);
            } else {
                tooltipTop = Math.min(window.innerHeight - tooltipHeight - 16, rect.bottom + 16);
            }
        }
    }
    
    // Final safety check
    tooltipTop = Math.max(16, Math.min(tooltipTop, window.innerHeight - tooltipHeight - 16));

    overlay.innerHTML = `
        <div class="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
            <div class="absolute" style="
                top: ${rect.top - padding}px; 
                left: ${rect.left - padding}px; 
                width: ${rect.width + padding * 2}px; 
                height: ${rect.height + padding * 2}px; 
                border-radius: 12px; 
                box-shadow: 0 0 0 9999px rgba(2, 6, 23, 0.8), 0 0 20px rgba(59, 130, 246, 0.5); 
                border: 2px solid #3b82f6;
                pointer-events: none;
            "></div>
        </div>
        <div class="fixed z-[201] bg-dark-card border border-blue-500/30 rounded-2xl p-6 shadow-2xl shadow-blue-500/20 transition-all duration-300" style="top:${tooltipTop}px;left:${tooltipLeft}px;width:${tooltipWidth}px;">
            <div class="flex items-start gap-3 mb-4">
                <div class="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <span class="text-blue-400 font-black text-sm">${step + 1}/${TUTORIAL_STEPS.length}</span>
                </div>
                <div>
                    <h4 class="font-bold text-white text-sm">${config.title}</h4>
                    <p class="text-slate-400 text-xs mt-1 leading-relaxed">${config.message}</p>
                </div>
            </div>
            <div class="flex justify-between items-center">
                <button id="tutorialSkip" class="text-slate-500 hover:text-slate-300 text-xs font-bold uppercase tracking-widest transition-colors">Skip Tutorial</button>
                <div class="flex gap-2">
                    <div class="flex gap-1 items-center">
                        ${TUTORIAL_STEPS.map((_, i) => `<span class="w-1.5 h-1.5 rounded-full ${i === step ? 'bg-blue-400' : 'bg-slate-600'}"></span>`).join('')}
                    </div>
                    <button id="tutorialNext" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors">${step === TUTORIAL_STEPS.length - 1 ? 'Finish' : 'Next'}</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

    document.getElementById('tutorialNext').onclick = onNext;
    document.getElementById('tutorialSkip').onclick = onSkip;
};

export const removeTutorial = () => {
    const overlay = document.getElementById('tutorialOverlay');
    if (overlay) overlay.remove();
};
