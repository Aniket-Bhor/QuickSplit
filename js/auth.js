import { db, ref, set, get, child } from './firebase.js';

export const AUTH_KEYS = {
    USERS: 'qs_users', // Local fallback
    CURRENT_USER: 'qs_current_user'
};

export const AUTH_REGEX = {
    NAME: /^[A-Za-z\s]{2,}$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD: /^(?=.*[A-Za-z])(?=.*\d).{6,}$/
};

class Auth {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem(AUTH_KEYS.CURRENT_USER)) || null;
    }

    validateName(name) {
        const trimmed = name.trim();
        if (trimmed.length < 2) {
            throw new Error('Name must be at least 2 characters');
        }
        if (!/^[A-Za-z\s]+$/.test(trimmed)) {
            throw new Error('Name can only contain letters and spaces');
        }
    }

    validateEmail(email) {
        if (!AUTH_REGEX.EMAIL.test(email)) {
            throw new Error('Enter a valid email address');
        }
    }

    validatePassword(password) {
        if (!AUTH_REGEX.PASSWORD.test(password)) {
            throw new Error('Password must be at least 6 characters and include letters and numbers');
        }
    }

    async signup(name, email, password) {
        this.validateName(name);
        this.validateEmail(email);
        this.validatePassword(password);

        try {
            // Encode email for Firebase key (replace dots with underscores as dots are restricted)
            const emailKey = email.replace(/\./g, '_');
            const userRef = ref(db, `users/${emailKey}`);
            const snapshot = await get(userRef);
            
            if (snapshot.exists()) {
                throw new Error('User with this email already exists');
            }

            const newUser = {
                id: 'user_' + Math.random().toString(36).substr(2, 9),
                name,
                email,
                password, // Plain for hackathon demo
                createdAt: new Date().toISOString()
            };

            // Save to Firebase
            await set(userRef, newUser);

            return await this.login(email, password);
        } catch (error) {
            console.error("Firebase Signup Error:", error);
            throw error;
        }
    }

    async login(email, password) {
        this.validateEmail(email);
        this.validatePassword(password);

        try {
            const emailKey = email.replace(/\./g, '_');
            const userRef = ref(db, `users/${emailKey}`);
            const snapshot = await get(userRef);
            
            if (!snapshot.exists()) {
                throw new Error('Invalid email or password');
            }

            const user = snapshot.val();
            if (user.password !== password) {
                throw new Error('Invalid email or password');
            }

            const sessionUser = { 
                id: user.id, 
                username: user.name, // Use display name for UI
                email: user.email,
                emailKey: emailKey 
            };
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
