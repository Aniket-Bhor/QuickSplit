import { CURRENCY_SYMBOL } from './constants.js';

/**
 * Formats a number as INR currency
 * @param {number} amount 
 * @returns {string}
 */
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount).replace('INR', CURRENCY_SYMBOL);
};

export const $ = (id) => document.getElementById(id);

export const qs = (selector) => document.querySelector(selector);

export const qsa = (selector) => document.querySelectorAll(selector);

/**
 * Generates a unique ID
 * @returns {string}
 */
export const generateUUID = () => {
    return (typeof crypto.randomUUID === 'function') 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};
