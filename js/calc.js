export const calculateBalances = (members, expenses, payments = []) => {
    const balances = {};
    members.forEach(m => balances[m.id] = 0);

    // Calculate balances from expenses
    expenses.forEach(exp => {
        balances[exp.payer] += exp.amount;
        
        if (exp.splitType === 'custom' && exp.participants) {
            // Custom split: use participant owed amounts
            exp.participants.forEach(p => {
                if (balances[p.memberId] !== undefined) {
                    balances[p.memberId] -= p.owedAmount;
                }
            });
        } else {
            // Equal split (backward compatible)
            const splitAmount = exp.amount / exp.splitWith.length;
            exp.splitWith.forEach(id => {
                if (balances[id] !== undefined) balances[id] -= splitAmount;
            });
        }
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

export const calculateRawDebtsFromBalances = (balances, members) => {
    const debtors = [];
    const creditors = [];

    Object.entries(balances).forEach(([id, balance]) => {
        if (balance < -0.01) debtors.push({ id, balance: Math.abs(balance) });
        else if (balance > 0.01) creditors.push({ id, balance });
    });

    const tempDebtors = debtors.map(x => ({ ...x }));
    const tempCreditors = creditors.map(x => ({ ...x }));
    const rawSettlements = [];

    let d = 0, c = 0;
    while (d < tempDebtors.length && c < tempCreditors.length) {
        const amount = Math.min(tempDebtors[d].balance, tempCreditors[c].balance);
        if (amount > 0.01) {
            rawSettlements.push({
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

    return rawSettlements;
};
