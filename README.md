# SmartSplit – Smart Expense Sharing

SmartSplit is a premium, intelligent web application designed to simplify group expense sharing. Built with a focus on high-end UI/UX and smart debt optimization, it helps users manage shared costs effortlessly while providing deep insights into group spending.

---

## 🚀 Live Demo & Key Features

### 💎 Premium UI/UX
- **Glassmorphism Design**: Modern, translucent interface with a custom dark theme.
- **Fluid Animations**: Smooth transitions for modals, card entrances, and real-time balance updates.
- **Responsive Layout**: Optimized for both desktop and mobile devices.
- **Hacker Mode**: An interactive Easter egg triggered by the Konami Code (`↑↑↓↓←→←→`).

### 🧠 Smart Debt Optimization
- **Greedy Algorithm**: Minimizes the total number of transactions by matching the highest debtors with the highest creditors.
- **Raw vs. Optimized**: Toggle between direct relationships and optimized settlements to see the algorithm in action.
- **Settlement Flow**: A live SVG visualization of money movement between group members.

### 💰 Comprehensive Expense Management
- **Flexible Splitting**: Split expenses among any subset of group members with "Select All" support.
- **Partial Settlements**: Pay off debts in installments or full using a custom branded modal.
- **Settlement History**: A transparent, timestamped log of all financial movements.
- **Settle All**: Clear all outstanding debts with a single click while preserving history.

### 📊 Intelligent Insights
- **Top Spender**: Identifies the primary contributor to group costs.
- **Highest Debt**: Highlights who needs to pay back the most.
- **Most Balanced**: Finds the user closest to a zero net balance.
- **Balance Chart**: A dynamic doughnut chart visualizing the group's financial distribution.

---

## 🏗️ Technical Architecture

SmartSplit follows a clean, modular ES6 architecture (no build tools required):

```text
/
├── index.html          # Main entry point & layout
├── login.html          # Authentication interface
├── images/             # Brand assets & logos
├── js/                 # Modular JavaScript logic
    ├── auth.js         # Firebase Authentication logic
    ├── state.js        # Central state engine & Firebase sync
    ├── calc.js         # Math core (Balances & Greedy algorithm)
    ├── ui.js           # DOM rendering engine
    ├── firebase.js     # Firebase Realtime Database configuration
    ├── components/     # Reusable UI templates (Functional Components)
    └── utils/          # Helpers & configuration constants
```

### 🛠️ Tech Stack
- **Frontend**: HTML5, Tailwind CSS (via CDN)
- **Logic**: Vanilla JavaScript (ES6 Modules)
- **Database**: Firebase Realtime Database (Real-time Cloud Sync)
- **Visualization**: Chart.js for financial insights
- **Icons**: Lucide Icons (SVG implementation)

---

## 🚀 Getting Started

SmartSplit uses **ES6 Modules**, which requires a local web server for security reasons.

### 1. Prerequisites
- Python installed (standard on most systems) OR Node.js installed.

### 2. Run the Project
**Option A: Using Python**
```bash
python -m http.server 8000
```
**Option B: Using Node.js**
```bash
npx serve .
```

### 3. Open the App
Visit `http://localhost:8000` in your browser.

### 4. Database Setup (Firebase)
The app is pre-configured with a hackathon-ready Firebase instance. To use your own:
1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Realtime Database**.
3. Update the `firebaseConfig` in `js/firebase.js` with your own credentials.

---

## 💡 The Algorithm (Greedy Heuristic)

SmartSplit solves the "Minimum Cash Flow" problem using a greedy approach:
1. **Net Balance**: Calculate `(Paid - Owed)` for every member.
2. **Classify**: Separate members into **Debtors** (negative) and **Creditors** (positive).
3. **Sort**: Sort both lists by absolute value in descending order.
4. **Match**: Pay the `min(|Debtor|, Creditor)` from the largest debtor to the largest creditor.
5. **Repeat**: Update balances and continue until all debts are settled.

---

Built with ❤️ for the next generation of group spending.
