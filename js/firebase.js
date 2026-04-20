// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, set, get, child, onValue, update, remove } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    // For a Realtime Database-only project with public rules, 
    // the databaseURL is the primary required field.
    // Hackathon level: Minimum config required to connect.
    databaseURL: "https://smartsplit-7af1c-default-rtdb.firebaseio.com/",
    projectId: "smartsplit-7af1c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Dummy Data Seeding Utility
async function seedDummyData() {
    const emailKey = 'demo_example_com'.replace(/\./g, '_');
    
    const dummyUser = {
        id: 'user_admin_001',
        name: 'Admin User',
        email: 'demo@example.com',
        password: 'password123',
        createdAt: new Date().toISOString()
    };

    const dummyData = {
        members: [
            { id: 'm1', name: 'Alex' },
            { id: 'm2', name: 'Jordan' },
            { id: 'm3', name: 'Casey' },
            { id: 'm4', name: 'Sam' }
        ],
        expenses: [
            { id: 'e1', desc: 'Hotel Booking', amount: 15000, payer: 'm1', splitWith: ['m1', 'm2', 'm3', 'm4'], date: new Date().toLocaleDateString() },
            { id: 'e2', desc: 'Dinner Party', amount: 4500, payer: 'm2', splitWith: ['m1', 'm2', 'm3', 'm4'], date: new Date().toLocaleDateString() },
            { id: 'e3', desc: 'Sightseeing', amount: 2400, payer: 'm3', splitWith: ['m1', 'm2', 'm3', 'm4'], date: new Date().toLocaleDateString() }
        ],
        payments: [],
        settlementHistory: [],
        settings: {
            settlementMode: 'optimized',
            isHackerMode: false
        }
    };

    try {
        // Seed user profile with email-based key
        await set(ref(db, `users/${emailKey}`), dummyUser);
        // Seed user data
        await set(ref(db, `users/${emailKey}/data`), dummyData);
        console.log("Firebase: Dummy data seeded for user 'demo@example.com' (password: password123)");
    } catch (error) {
        console.error("Firebase Seed Error:", error);
    }
}

// Export for use in other modules
export { db, ref, set, get, child, onValue, update, remove, seedDummyData };
