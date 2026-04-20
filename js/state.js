import { STORAGE_KEYS, DEMO_DATA } from './utils/constants.js';
import { generateUUID } from './utils/helpers.js';
import { auth } from './auth.js';
import { db, ref, set, onValue } from './firebase.js';

class State {
    constructor() {
        this.isDemoMode = false;
        this.settlementMode = 'optimized';
        this.isHackerMode = false;
        this.tutorialActive = false;
        this.tutorialStep = 0;
        
        // Initial clean state
        this.members = [];
        this.expenses = [];
        this.payments = [];
        this.settlementHistory = [];
        
        // Start Firebase sync if user exists
        this.initFirebaseSync();
    }

    getUserKey(key) {
        const user = auth.getCurrentUser();
        if (!user) return key;
        return `u_${user.id}_${key}`;
    }

    initFirebaseSync() {
        const user = auth.getCurrentUser();
        if (!user) return;

        const userPath = `users/${user.username}/data`;
        const dataRef = ref(db, userPath);

        // Real-time listener
        onValue(dataRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                console.log("Firebase: Syncing data...", data);
                this.members = data.members || [];
                this.expenses = data.expenses || [];
                this.payments = data.payments || [];
                this.settlementHistory = data.settlementHistory || [];
                
                // Sync settings if they exist
                if (data.settings) {
                    this.settlementMode = data.settings.settlementMode || this.settlementMode;
                    this.isHackerMode = data.settings.isHackerMode || this.isHackerMode;
                    this.isDemoMode = data.settings.isDemoMode || this.isDemoMode;
                }
                
                // Trigger UI update if app is running
                if (window.app) window.app.updateUI();
            }
        }, (error) => {
            console.error("Firebase Sync Error:", error);
        });
    }

    load() {
        // No longer loading from local storage
    }

    save() {
        // Save to Firebase if user is logged in
        const user = auth.getCurrentUser();
        if (user && !this.isDemoMode) {
            const userPath = `users/${user.username}/data`;
            const dataRef = ref(db, userPath);
            set(dataRef, {
                members: this.members,
                expenses: this.expenses,
                payments: this.payments,
                settlementHistory: this.settlementHistory,
                settings: {
                    settlementMode: this.settlementMode,
                    isHackerMode: this.isHackerMode,
                    isDemoMode: this.isDemoMode
                }
            }).catch(error => {
                console.error("Firebase Save Error:", error);
            });
        }
    }

    setDemoMode(active) {
        this.isDemoMode = active;
        if (active) {
            this.members = [...DEMO_DATA.members];
            this.expenses = [...DEMO_DATA.expenses];
            this.payments = [];
            this.settlementHistory = [];
            this.tutorialActive = true;
            this.tutorialStep = 0;
        } else {
            // Re-initialize Firebase sync to restore user data
            this.initFirebaseSync();
        }
        
        // Trigger UI update
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
