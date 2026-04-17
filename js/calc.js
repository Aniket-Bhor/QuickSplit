export const calculateBalances = (members, expenses, payments = []) => {
    const balances = {};
    members.forEach(m => balances[m.id] = 0);

    // Calculate balances from expenses
    expenses.forEach(exp => {
        const splitAmount = exp.amount / exp.splitWith.length;
        balances[exp.payer] += exp.amount;
        exp.splitWith.forEach(id => {
            if (balances[id] !== undefined) balances[id] -= splitAmount;
        });
    });

    // Adjust balances with manual payments
    payments.forEach(pay => {
        if (balances[pay.from] !== undefined) balances[pay.from] += pay.amount;
        if (balances[pay.to] !== undefined) balances[pay.to] -= pay.amount;
    });

    return balances;
};

export const simplifyDebts = (balances) => {
    const debtors = [];
    const creditors = [];

    Object.entries(balances).forEach(([id, balance]) => {
        if (balance < -0.01) debtors.push({ id, balance: Math.abs(balance) });
        else if (balance > 0.01) creditors.push({ id, balance });
    });

    const settlements = [];
    const tempDebtors = debtors.map(x => ({ ...x })).sort((a, b) => b.balance - a.balance);
    const tempCreditors = creditors.map(x => ({ ...x })).sort((a, b) => b.balance - a.balance);

    let d = 0, c = 0;
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

    return { settlements, naiveCount: debtors.length + creditors.length };
};

export const calculateRawDebts = (expenses, payments = []) => {
    const rawSettlements = [];

    // Direct debts from expenses
    expenses.forEach(exp => {
        const splitAmount = exp.amount / exp.splitWith.length;
        exp.splitWith.forEach(participantId => {
            if (participantId !== exp.payer) {
                rawSettlements.push({
                    from: participantId,
                    to: exp.payer,
                    amount: splitAmount,
                    desc: exp.desc
                });
            }
        });
    });

    // Subtract manual payments from these raw debts
    payments.forEach(pay => {
        let remainingPayment = pay.amount;
        // Try to offset existing raw debts between these two people
        for (let i = 0; i < rawSettlements.length && remainingPayment > 0; i++) {
            const s = rawSettlements[i];
            if (s.from === pay.from && s.to === pay.to) {
                const offset = Math.min(s.amount, remainingPayment);
                s.amount -= offset;
                remainingPayment -= offset;
            }
        }
        // If there's still payment left (e.g. overpayment or paying something else), 
        // we can just leave it, but for "Raw" view we usually just want to see 
        // what's still owed.
    });

    return rawSettlements.filter(s => s.amount > 0.01);
};
