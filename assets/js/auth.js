// Auth utility functions
const AUTH = {
  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    return !!token;
  },

  // Get token from storage
  getToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  },

  // Get user info from storage
  getUser() {
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Set auth data
  setAuth(token, user, remember = false) {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('token', token);
    storage.setItem('user', JSON.stringify(user));
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '/login.html';
  },

  // Redirect to login if not authenticated
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = '/login.html';
      return false;
    }
    return true;
  }
};

// API configuration
const API_URL = 'http://localhost:3000/api';

// Fetch with auth headers
async function fetchWithAuth(url, options = {}) {
  const token = AUTH.getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    // Check if unauthorized
    if (response.status === 401) {
      AUTH.logout();
      return null;
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

// Check auth on page load
document.addEventListener('DOMContentLoaded', () => {
  // Skip auth check on login page
  if (!window.location.pathname.includes('login.html')) {
    AUTH.requireAuth();
    
    // Display user info in topbar if available
    const user = AUTH.getUser();
    if (user) {
      const avatarElements = document.querySelectorAll('.avatar-small');
      avatarElements.forEach(el => {
        const initials = user.fullName
          .split(' ')
          .map(n => n[0])
          .join('')
          .toUpperCase()
          .substring(0, 2);
        el.textContent = initials;
        el.title = user.fullName;
      });
    }
  }
});

// Logout handler
function setupLogoutHandlers() {
  // Add logout button to settings or user menu
  const logoutBtns = document.querySelectorAll('[data-logout]');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Are you sure you want to logout?')) {
        AUTH.logout();
      }
    });
  });
}

// Initialize auth handlers
setupLogoutHandlers();

// Export for use in other scripts
window.AUTH = AUTH;
window.API_URL = API_URL;
window.fetchWithAuth = fetchWithAuth;
