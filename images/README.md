# SmartSplit – Smart Expense Sharing

SmartSplit is a premium, intelligent web application designed to simplify group expense sharing. Built with a focus on high-end UI/UX and smart debt optimization, it helps users manage shared costs effortlessly while providing deep insights into group spending.

![SmartSplit Preview](https://via.placeholder.com/800x450?text=SmartSplit+Smart+Expense+Sharing)

## ✨ Features

-   **Smart Debt Simplification**: Uses a greedy algorithm to match highest debtors with highest creditors, minimizing the total number of transactions.
-   **Dynamic Settlements**:
    -   **Partial Payment Support**: Settle debts in installments or full with a custom branded modal.
    -   **Real-time Recalculation**: Settlements evolve dynamically as payments are made.
    -   **Visual Tracking**: See exactly how much is remaining for each suggested settlement with a live "Settlement Flow" visualization.
-   **Settlement History**:
    -   **Full Transparency**: Every payment (Full or Partial) is recorded in a persistent history log.
    -   **Transaction Filtering**: Filter history by settlement type (Full vs Partial) to track debt clearing.
    -   **Timestamped Records**: Precise date and time for every financial movement.
-   **Intelligent Insights**:
    -   **🏆 Top Spender**: Identifies who has contributed the most.
    -   **📉 Highest Debt**: Highlights who needs to pay back the most.
    -   **⚖️ Most Balanced**: Finds the user closest to a zero net balance.
-   **Professional UI/UX**:
    -   Modern **Glassmorphism** design with a custom dark theme.
    -   Smooth animations for modals, card entrances, and money flow.
    -   Real-time toast notifications for all user actions.
    -   **Brand Identity**: Custom logo and favicon integration for a professional feel.
-   **Dual-Mode Storage**:
    -   **Real Mode**: Securely stores your group data and history in `localStorage`.
    -   **Demo Mode**: Instantly loads sample data for presentations without affecting your real entries.
-   **Interactive Easter Eggs**:
    -   **⌨️ Hacker Mode**: Enter the Konami Code (`↑↑↓↓←→←→`) to activate a neon matrix theme.
    -   **💸 Money Rain**: Celebrate settling up with a celebratory animation.
    -   **🔥 Roast Mode**: Dynamic messages for users with high debt.
-   **Theme System**: Full support for Dark and Light modes with persistent preference.
-   **INR (₹) Support**: Fully localized for Indian currency with proper formatting (e.g., ₹1,00,000.00).
-   **Flexible Splitting**: Add expenses and split them among any subset of group members with "Select All" convenience.

## 🏗️ Architecture

The project follows a clean, modular ES6 architecture:

```text
/
├── index.html          # Main entry point & layout
├── images/             # Brand assets (Logos & Favicons)
├── js/                 # Modular JavaScript
    ├── main.js         # App controller & event binding
    ├── state.js        # State engine (Dual-mode persistence)
    ├── calc.js         # Calculation core (Balances & settlements)
    ├── ui.js           # DOM rendering engine
    ├── components/     # Functional UI templates
    │   ├── memberCard.js
    │   ├── expenseItem.js
    │   ├── settlementCard.js
    │   ├── settlementHistoryItem.js
    │   └── flowCard.js
    └── utils/          # Helpers & configuration
        ├── helpers.js  # Currency & DOM utilities
        └── constants.js # Global app constants & demo data
```

## 🚀 Getting Started

SmartSplit uses **ES6 Modules**, which requires a local web server to run due to browser security policies.

### Using Python
1. Open your terminal in the project root.
2. Run the server:
   ```bash
   python -m http.server 8000
   ```
3. Visit `http://localhost:8000` in your browser.

### Using Node.js (npx)
1. Run the server:
   ```bash
   npx serve .
   ```
2. Visit the URL provided in the terminal.

## 💡 How It Works (The Algorithm)

SmartSplit implements a **Greedy Heuristic** for transaction minimization:
1.  Calculate the **Net Balance** for every member (Paid - Owed).
2.  Separate members into **Debtors** (negative balance) and **Creditors** (positive balance).
3.  Match the **Largest Debtor** with the **Largest Creditor**.
4.  Execute a payment and update their balances.
5.  Repeat until all balances are zero.

This approach ensures the minimum number of payments required to settle the group.

## 🛠️ Tech Stack

-   **HTML5**
-   **Tailwind CSS** (CDN)
-   **Vanilla JavaScript** (ES6 Modules)
-   **Lucide Icons** (SVG implementation)

---

Built with ❤️ for smart group spending.
