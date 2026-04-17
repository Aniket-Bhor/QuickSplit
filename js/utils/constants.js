export const APP_NAME = 'SmartSplit';
export const CURRENCY_SYMBOL = '₹';
export const STORAGE_KEYS = {
    MEMBERS: 'qs_members',
    EXPENSES: 'qs_expenses',
    PAYMENTS: 'qs_payments',
    SETTLEMENT_HISTORY: 'qs_settlement_history',
    DEMO_MEMBERS: 'qs_demo_members',
    DEMO_EXPENSES: 'qs_demo_expenses',
    DEMO_PAYMENTS: 'qs_demo_payments',
    DEMO_SETTLEMENT_HISTORY: 'qs_demo_settlement_history',
    DEMO_MODE: 'qs_demo_mode'
};

export const DEMO_DATA = {
    members: [
        { id: 'm1', name: 'Alex' },
        { id: 'm2', name: 'Jordan' },
        { id: 'm3', name: 'Casey' },
        { id: 'm4', name: 'Sam' }
    ],
    expenses: [
        { id: 'e1', desc: 'Hotel Booking', amount: 15000, payer: 'm1', splitWith: ['m1', 'm2', 'm3', 'm4'], date: new Date().toLocaleDateString() },
        { id: 'e2', desc: 'Dinner Party', amount: 4500, payer: 'm2', splitWith: ['m1', 'm2', 'm3', 'm4'], date: new Date().toLocaleDateString() },
        { id: 'e3', desc: 'Sightseeing', amount: 2400, payer: 'm3', splitWith: ['m1', 'm2', 'm3', 'm4'], date: new Date().toLocaleDateString() },
        { id: 'e4', desc: 'Local Taxi', amount: 1200, payer: 'm4', splitWith: ['m1', 'm2', 'm3', 'm4'], date: new Date().toLocaleDateString() },
        { id: 'e5', desc: 'Souvenirs', amount: 3000, payer: 'm1', splitWith: ['m1', 'm3'], date: new Date().toLocaleDateString() }
    ]
};
