// frontend/api.js
const API_BASE_URL = 'https://discord-controlled-backend-xxxx.vercel.app/api'; // <--- REPLACE THIS WITH YOUR ACTUAL VERCEL BACKEND URL

// Helper to get JWT token from session storage
const getAuthToken = () => sessionStorage.getItem('token');

// Helper for making authenticated requests
const authenticatedFetch = async (endpoint, options = {}) => {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Something went wrong on the server.' }));
        throw new Error(errorData.message || 'API request failed');
    }
    return response.json();
};

const api = {
    // --- Auth & User ---
    login: async (username, password, userID_display) => {
        return authenticatedFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password, userID_display }),
        });
    },
    registerUser: async (username, password, userID_display, name, role = 'standard') => {
        // This route should ideally be admin-only, but for initial setup, we register a first admin.
        return authenticatedFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, password, userID_display, name, role }),
        });
    },
    getMe: async () => {
        return authenticatedFetch('/users/me');
    },
    updateUserSettings: async (settings) => {
        return authenticatedFetch('/users/me/settings', {
            method: 'PUT',
            body: JSON.stringify(settings),
        });
    },
    getUserSettings: async () => {
        return authenticatedFetch('/users/me/settings');
    },
    getUserStats: async () => {
        return authenticatedFetch('/users/me/stats');
    },
    updateUserStats: async (statsData) => {
        return authenticatedFetch('/users/me/stats', {
            method: 'PUT',
            body: JSON.stringify(statsData),
        });
    },

    // --- Logs ---
    logLoginAttempt: async (data) => {
        // This endpoint will be called by the FE, and the BE will handle the Discord Webhooks
        return authenticatedFetch('/log/login-attempt', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },
    logActivity: async (description, context = 'dashboard') => {
        return authenticatedFetch('/log/activity', {
            method: 'POST',
            body: JSON.stringify({ description, context }),
        });
    },
    logError: async (message, context = 'frontend', stackTrace = null) => {
        return authenticatedFetch('/log/error', {
            method: 'POST',
            body: JSON.stringify({ message, context, stackTrace }),
        });
    },
    getLoginHistory: async () => {
        return authenticatedFetch('/users/me/login-history');
    },
    getActivityLogs: async () => {
        return authenticatedFetch('/users/me/activity-logs');
    },
    getErrorLogs: async () => {
        return authenticatedFetch('/users/me/error-logs');
    },
    clearActivityLogs: async () => {
        return authenticatedFetch('/users/me/activity-logs/clear', { method: 'DELETE' });
    },
    clearErrorLogs: async () => {
        return authenticatedFetch('/users/me/error-logs/clear', { method: 'DELETE' });
    },

    // --- Important Dates ---
    getImportantDates: async () => {
        return authenticatedFetch('/users/me/important-dates');
    },
    addImportantDate: async (datetime, event) => {
        return authenticatedFetch('/users/me/important-dates', {
            method: 'POST',
            body: JSON.stringify({ datetime, event }),
        });
    },
    clearImportantDates: async () => {
        return authenticatedFetch('/users/me/important-dates/clear', { method: 'DELETE' });
    },

    // --- Notes ---
    getNotes: async () => {
        return authenticatedFetch('/users/me/notes');
    },
    saveNotes: async (textContent, drawingData) => {
        return authenticatedFetch('/users/me/notes', {
            method: 'PUT',
            body: JSON.stringify({ text_content: textContent, drawing_data: drawingData }),
        });
    },
    clearNotes: async () => {
        return authenticatedFetch('/users/me/notes', { method: 'DELETE' });
    },

    // --- Clicker ---
    getClickCount: async () => {
        return authenticatedFetch('/users/me/click-count');
    },
    incrementClickCount: async () => {
        return authenticatedFetch('/users/me/click-count/increment', { method: 'POST' });
    },
    resetClickCount: async () => {
        return authenticatedFetch('/users/me/click-count/reset', { method: 'POST' });
    },

    // --- Global Settings/Info ---
    getGlobalAnnouncement: async () => {
        return authenticatedFetch('/global/announcement');
    },
    getRandomFact: async () => {
        return authenticatedFetch('/global/facts/random');
    },
    getDailyQuote: async () => {
        return authenticatedFetch('/global/quotes/daily');
    },
    getSystemUpdates: async () => {
        return authenticatedFetch('/global/updates');
    },
    getSystemVersion: async () => {
        return authenticatedFetch('/global/version');
    },
    getWifiInfo: async () => {
        return authenticatedFetch('/global/wifi-info');
    },
    getIpadRestrictions: async () => {
        return authenticatedFetch('/global/ipad-restrictions');
    },
    getIpadBypasses: async () => {
        return authenticatedFetch('/global/ipad-bypasses');
    },
    getStudentHandbooks: async () => {
        return authenticatedFetch('/global/student-handbooks');
    },
    getBuildingMapInfo: async () => {
        return authenticatedFetch('/global/building-map');
    },
    getStudentWebsites: async () => {
        return authenticatedFetch('/global/student-websites');
    },
    getTeacherWebsites: async () => {
        return authenticatedFetch('/global/teacher-websites');
    },
    getPhoneDirectory: async () => {
        return authenticatedFetch('/global/phone-directory');
    },
    getSchoolCameraInfo: async () => {
        return authenticatedFetch('/global/camera-info');
    },
    getSchoolInfo: async () => {
        return authenticatedFetch('/global/school-info');
    },
    getExploitingTools: async () => {
        return authenticatedFetch('/global/exploiting-tools');
    },
    getBypassingTools: async () => {
        return authenticatedFetch('/global/bypassing-tools');
    },
    getVpnWebsites: async () => {
        return authenticatedFetch('/global/vpn-websites');
    },
    getGamingWebsites: async () => {
        return authenticatedFetch('/global/gaming-websites');
    },
    getMusicWebsites: async () => {
        return authenticatedFetch('/global/music-websites');
    },
    getKeyboardTricks: async () => {
        return authenticatedFetch('/global/keyboard-tricks');
    },
};

// Expose the API client globally
window.api = api;
