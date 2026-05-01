import { STORAGE_KEYS, DEMO_DATA } from './utils/constants.js';
import { generateUUID } from './utils/helpers.js';
import { auth } from './auth.js';
import { db, ref, set, onValue, remove } from './firebase.js';

class State {
    constructor() {
        this.mode = localStorage.getItem('qs_app_mode') || 'user';
        this.settlementMode = 'optimized';
        this.isHackerMode = false;
        this.tutorialActive = false;
        this.tutorialStep = 0;
        
        // Initial clean state
        this.members = [];
        this.expenses = [];
        this.payments = [];
        this.settlementHistory = [];
        
        this.firebaseUnsubscribe = null;
        
        // Start mode-specific logic
        this.initMode();
    }

    get isDemoMode() {
        return this.mode === 'demo';
    }

    initMode() {
        if (this.isDemoMode) {
            this.stopFirebaseSync();
            this.loadDemoData();
        } else {
            this.initFirebaseSync();
        }
    }

    getUserKey(key) {
        const user = auth.getCurrentUser();
        if (!user) return key;
        return `u_${user.id}_${key}`;
    }

    stopFirebaseSync() {
        if (this.firebaseUnsubscribe) {
            this.firebaseUnsubscribe();
            this.firebaseUnsubscribe = null;
            console.log("Firebase: Sync stopped.");
        }
    }

    initFirebaseSync() {
        const user = auth.getCurrentUser();
        if (!user || this.isDemoMode) return;

        this.stopFirebaseSync();

        // Use emailKey for Firebase path (safe for special chars)
        const userPath = `users/${user.emailKey}/data`;
        const dataRef = ref(db, userPath);

        // Real-time listener
        this.firebaseUnsubscribe = onValue(dataRef, (snapshot) => {
            if (this.isDemoMode) return; // Guard clause

            const data = snapshot.val();
            if (data) {
                console.log("Firebase: Syncing user data...", data);
                this.members = data.members || [];
                this.expenses = data.expenses || [];
                this.payments = data.payments || [];
                this.settlementHistory = data.settlementHistory || [];
                
                if (data.settings) {
                    this.settlementMode = data.settings.settlementMode || this.settlementMode;
                    this.isHackerMode = data.settings.isHackerMode || this.isHackerMode;
                }
                
                if (window.app) window.app.updateUI();
            }
        }, (error) => {
            console.error("Firebase Sync Error:", error);
        });
    }

    loadDemoData() {
        console.log("Demo: Loading local demo data...");
        this.members = JSON.parse(localStorage.getItem('demo_members')) || [...DEMO_DATA.members];
        this.expenses = JSON.parse(localStorage.getItem('demo_expenses')) || [...DEMO_DATA.expenses];
        this.payments = JSON.parse(localStorage.getItem('demo_payments')) || [];
        this.settlementHistory = JSON.parse(localStorage.getItem('demo_history')) || [];
        this.settlementMode = localStorage.getItem('demo_settlement_mode') || 'optimized';
    }

    saveDemoData() {
        localStorage.setItem('demo_members', JSON.stringify(this.members));
        localStorage.setItem('demo_expenses', JSON.stringify(this.expenses));
        localStorage.setItem('demo_payments', JSON.stringify(this.payments));
        localStorage.setItem('demo_history', JSON.stringify(this.settlementHistory));
        localStorage.setItem('demo_settlement_mode', this.settlementMode);
    }

    load() {
        // No longer used for user mode as Firebase is primary
        if (this.isDemoMode) this.loadDemoData();
    }

    save() {
        if (this.isDemoMode) {
            this.saveDemoData();
            return;
        }

        // User Mode: Save to Firebase
        const user = auth.getCurrentUser();
        if (user) {
            const userPath = `users/${user.emailKey}/data`;
            const dataRef = ref(db, userPath);
            set(dataRef, {
                members: this.members,
                expenses: this.expenses,
                payments: this.payments,
                settlementHistory: this.settlementHistory,
                settings: {
                    settlementMode: this.settlementMode,
                    isHackerMode: this.isHackerMode
                }
            }).catch(error => {
                console.error("Firebase Save Error:", error);
            });
        }
    }

    setDemoMode(active) {
        this.mode = active ? 'demo' : 'user';
        localStorage.setItem('qs_app_mode', this.mode);
        
        // Reset state completely when switching
        this.members = [];
        this.expenses = [];
        this.payments = [];
        this.settlementHistory = [];
        
        if (active) {
            this.tutorialActive = true;
            this.tutorialStep = 0;
            this.initMode();
        } else {
            this.tutorialActive = false;
            this.initMode();
        }
        
        if (window.app) window.app.updateUI();
    }

    setSettlementMode(mode) {
        this.settlementMode = mode;
        this.save();
    }

    setHackerMode(active) {
        this.isHackerMode = active;
        this.save();
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

    async wipeAllData() {
        const user = auth.getCurrentUser();
        if (!user) return;

        try {
            if (this.isDemoMode) {
                // Clear Demo Data from Local Storage
                const demoKeys = ['demo_members', 'demo_expenses', 'demo_payments', 'demo_history', 'demo_settlement_mode'];
                demoKeys.forEach(k => localStorage.removeItem(k));
                this.loadDemoData(); // Reload defaults
            } else {
                // Clear User Data from Firebase
                const dataRef = ref(db, `users/${user.emailKey}/data`);
                await remove(dataRef);
            }
            
            // Clear Local Memory State
            this.members = [];
            this.expenses = [];
            this.payments = [];
            this.settlementHistory = [];
            
            return true;
        } catch (error) {
            console.error("SmartSplit Wipe Error:", error);
            throw error;
        }
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
