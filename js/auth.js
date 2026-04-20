import { db, ref, set, get, child } from './firebase.js';

export const AUTH_KEYS = {
    USERS: 'qs_users', // Local fallback
    CURRENT_USER: 'qs_current_user'
};

export const AUTH_REGEX = {
    USERNAME: /^[a-zA-Z0-9_]{3,20}$/,
    PASSWORD: /^(?=.*[A-Za-z])(?=.*\d).{6,}$/
};

class Auth {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem(AUTH_KEYS.CURRENT_USER)) || null;
    }

    validateUsername(username) {
        if (!AUTH_REGEX.USERNAME.test(username)) {
            throw new Error('Username must be 3-20 characters (alphanumeric or underscore)');
        }
    }

    validatePassword(password) {
        if (!AUTH_REGEX.PASSWORD.test(password)) {
            throw new Error('Password must be at least 6 characters and include one letter and one number');
        }
    }

    async signup(username, password) {
        this.validateUsername(username);
        this.validatePassword(password);

        try {
            // Firebase Signup
            const userRef = ref(db, `users/${username}`);
            const snapshot = await get(userRef);
            
            if (snapshot.exists()) {
                throw new Error('Username already exists');
            }

            const newUser = {
                id: 'user_' + Math.random().toString(36).substr(2, 9),
                username,
                password, // Plain for hackathon demo
                createdAt: new Date().toISOString()
            };

            // Save to Firebase
            await set(userRef, newUser);

            return await this.login(username, password);
        } catch (error) {
            console.error("Firebase Signup Error:", error);
            throw error;
        }
    }

    async login(username, password) {
        this.validateUsername(username);
        this.validatePassword(password);

        try {
            // Firebase Login
            const userRef = ref(db, `users/${username}`);
            const snapshot = await get(userRef);
            
            if (!snapshot.exists()) {
                throw new Error('Invalid username or password');
            }

            const user = snapshot.val();
            if (user.password !== password) {
                throw new Error('Invalid password');
            }

            const sessionUser = { id: user.id, username: user.username };
            this.currentUser = sessionUser;
            localStorage.setItem(AUTH_KEYS.CURRENT_USER, JSON.stringify(sessionUser));
            return sessionUser;
        } catch (error) {
            console.error("Firebase Login Error:", error);
            throw error;
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem(AUTH_KEYS.CURRENT_USER);
        window.location.href = 'login.html';
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

export const auth = new Auth();
