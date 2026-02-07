/**
 * Role Manager - Role-based Access Control
 * Author: Lai Yan (S10274594G)
 * Features: Session management, role verification, page protection
 */

/**
 * Check user authentication and verify role access
 * Redirects to login if not authenticated or wrong role
 * @param {string} requiredRole - Required role for the page ('customer', 'vendor', 'admin')
 * @returns {Promise<Object>} User data object with name, email, role
 */
async function checkAuth(requiredRole) {
  return new Promise((resolve, reject) => {
    // Wait for Firebase Auth to initialize
    firebase.auth().onAuthStateChanged(async (user) => {
      // User not logged in - redirect to role selection
      if (!user) {
        sessionStorage.setItem('selectedRole', requiredRole);
        window.location.href = '../index.html';
        reject(new Error('Not authenticated'));
        return;
      }

      try {
        const db = firebase.firestore();
        
        // For vendor and admin, check allowlist
        if (requiredRole === 'vendor' || requiredRole === 'admin') {
          const allowedDoc = await db
            .collection('allowedAccounts')
            .doc(user.email.toLowerCase())
            .get();

          if (!allowedDoc.exists) {
            // Not in allowlist - logout and redirect
            await firebase.auth().signOut();
            alert('Access denied. This account is not authorized.');
            window.location.href = '../index.html';
            reject(new Error('Not authorized'));
            return;
          }

          const allowedRole = (allowedDoc.data().role || '').toLowerCase();
          
          // Check if allowlist role matches required role
          if (allowedRole !== requiredRole) {
            await firebase.auth().signOut();
            alert(`This account is registered as ${allowedRole}, not ${requiredRole}.`);
            window.location.href = '../index.html';
            reject(new Error('Role mismatch'));
            return;
          }
        }

        // Get user profile data
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        const userData = {
          uid: user.uid,
          email: user.email,
          name: userDoc.exists ? userDoc.data().name : user.email.split('@')[0],
          role: requiredRole,
          phone: userDoc.exists ? userDoc.data().phone : '',
          createdAt: userDoc.exists ? userDoc.data().createdAt : new Date()
        };

        // Add vendor-specific data if applicable
        if (requiredRole === 'vendor' && userDoc.exists) {
          userData.stallId = userDoc.data().stallId || '';
          userData.stallName = userDoc.data().stallName || '';
        }

        resolve(userData);
      } catch (error) {
        console.error('Error checking authentication:', error);
        reject(error);
      }
    });
  });
}

/**
 * Logout function - signs out user and redirects to home
 * Can be called from any page with logout button
 */
async function logout() {
  try {
    await firebase.auth().signOut();
    
    // Clear session storage
    sessionStorage.clear();
    
    // Redirect to home page
    window.location.href = '../index.html';
  } catch (error) {
    console.error('Error during logout:', error);
    alert('Error logging out. Please try again.');
  }
}

/**
 * Get current user data without role verification
 * Useful for profile page where role doesn't matter
 * @returns {Promise<Object>} User data
 */
async function getCurrentUser() {
  return new Promise((resolve, reject) => {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        reject(new Error('Not authenticated'));
        return;
      }

      try {
        const db = firebase.firestore();
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        const userData = {
          uid: user.uid,
          email: user.email,
          name: userDoc.exists ? userDoc.data().name : user.email.split('@')[0],
          phone: userDoc.exists ? userDoc.data().phone : '',
          stallId: userDoc.exists ? userDoc.data().stallId : '',
          stallName: userDoc.exists ? userDoc.data().stallName : ''
        };

        resolve(userData);
      } catch (error) {
        reject(error);
      }
    });
  });
}

/**
 * Check if user is authenticated (without role verification)
 * Returns true if user is logged in, false otherwise
 * @returns {Promise<boolean>}
 */
function isAuthenticated() {
  return new Promise((resolve) => {
    firebase.auth().onAuthStateChanged((user) => {
      resolve(!!user);
    });
  });
}

/**
 * Redirect to appropriate home page based on role
 * @param {string} role - User role ('customer', 'vendor', 'admin')
 */
function redirectToHome(role) {
  const rolePages = {
    customer: 'customer-home.html',
    vendor: 'vendor-home.html',
    admin: 'admin-home.html'
  };

  const page = rolePages[role.toLowerCase()] || 'customer-home.html';
  window.location.href = page;
}
