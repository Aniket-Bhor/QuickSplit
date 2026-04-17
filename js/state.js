import { STORAGE_KEYS, DEMO_DATA } from './utils/constants.js';
import { generateUUID } from './utils/helpers.js';

class State {
    constructor() {
        this.isDemoMode = localStorage.getItem(STORAGE_KEYS.DEMO_MODE) === 'true';
        this.settlementMode = localStorage.getItem('qs_settlement_mode') || 'optimized';
        this.isHackerMode = localStorage.getItem('qs_hacker_mode') === 'true';
        this.tutorialActive = false;
        this.tutorialStep = 0;
        this.load();
    }

    load() {
        if (this.isDemoMode) {
            // Load demo data from storage or use default demo data if not exists
            this.members = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEMO_MEMBERS)) || [...DEMO_DATA.members];
            this.expenses = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEMO_EXPENSES)) || [...DEMO_DATA.expenses];
            this.payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEMO_PAYMENTS)) || [];
            this.settlementHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.DEMO_SETTLEMENT_HISTORY)) || [];
        } else {
            // Load real user data
            this.members = JSON.parse(localStorage.getItem(STORAGE_KEYS.MEMBERS)) || [];
            this.expenses = JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES)) || [];
            this.payments = JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS)) || [];
            this.settlementHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTLEMENT_HISTORY)) || [];
        }
    }

    save() {
        if (this.isDemoMode) {
            localStorage.setItem(STORAGE_KEYS.DEMO_MEMBERS, JSON.stringify(this.members));
            localStorage.setItem(STORAGE_KEYS.DEMO_EXPENSES, JSON.stringify(this.expenses));
            localStorage.setItem(STORAGE_KEYS.DEMO_PAYMENTS, JSON.stringify(this.payments));
            localStorage.setItem(STORAGE_KEYS.DEMO_SETTLEMENT_HISTORY, JSON.stringify(this.settlementHistory));
        } else {
            localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(this.members));
            localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(this.expenses));
            localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(this.payments));
            localStorage.setItem(STORAGE_KEYS.SETTLEMENT_HISTORY, JSON.stringify(this.settlementHistory));
        }
    }

    setDemoMode(active) {
        this.isDemoMode = active;
        localStorage.setItem(STORAGE_KEYS.DEMO_MODE, active.toString());
        if (active) {
            this.tutorialActive = true;
            this.tutorialStep = 0;
        }
        this.load();
    }

    setSettlementMode(mode) {
        this.settlementMode = mode;
        localStorage.setItem('qs_settlement_mode', mode);
    }

    setHackerMode(active) {
        this.isHackerMode = active;
        localStorage.setItem('qs_hacker_mode', active.toString());
    }

    nextTutorialStep() {
        this.tutorialStep++;
        if (this.tutorialStep >= 6) {
            this.tutorialActive = false;
            this.tutorialStep = 0;
        }
    }

    skipTutorial() {
        this.tutorialActive = false;
        this.tutorialStep = 0;
    }

    addMember(name) {
        const id = generateUUID();
        const member = { id, name };
        this.members.push(member);
        this.save();
        return member;
    }

    updateMember(id, newName) {
        const member = this.members.find(m => m.id === id);
        if (member) {
            member.name = newName;
            this.save();
        }
    }

    removeMember(id) {
        this.members = this.members.filter(m => m.id !== id);
        this.expenses = this.expenses.filter(e => e.payer !== id && !e.splitWith.includes(id));
        this.payments = this.payments.filter(p => p.from !== id && p.to !== id);
        this.save();
    }

    addExpense(expense) {
        const newExpense = { ...expense, id: generateUUID(), date: new Date().toLocaleDateString() };
        this.expenses.unshift(newExpense);
        this.save();
        return newExpense;
    }

    removeExpense(id) {
        this.expenses = this.expenses.filter(e => e.id !== id);
        this.save();
    }

    addPayment(payment) {
        this.payments.push({ ...payment, id: generateUUID(), date: new Date().toLocaleDateString() });
        this.save();
    }

    addSettlementHistory(entry) {
        const historyEntry = {
            ...entry,
            id: generateUUID(),
            timestamp: new Date().toISOString()
        };
        this.settlementHistory.unshift(historyEntry);
        this.save();
    }

    clearSettlementHistory() {
        this.settlementHistory = [];
        this.save();
    }

    settleAll(settlements) {
        const totalAmount = settlements.reduce((sum, s) => sum + s.amount, 0);
        
        // Add each settlement as a payment to zero out balances
        settlements.forEach(s => {
            this.addPayment({ 
                from: s.from, 
                to: s.to, 
                amount: s.amount,
                isSystem: true // Flag to indicate this was part of a "Settle All"
            });
        });

        // Add a summary record to history
        this.addSettlementHistory({
            type: 'FULL_SETTLEMENT',
            amount: totalAmount,
            count: settlements.length
        });
        
        this.save();
    }

    clearAll() {
        if (confirm("This will permanently delete ALL data (members, expenses, history). Proceed?")) {
            this.members = [];
            this.expenses = [];
            this.payments = [];
            this.settlementHistory = [];
            this.save();
            return true;
        }
        return false;
    }
}

export const state = new State();
