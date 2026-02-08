/**
 * Role Manager - Role-based Access Control
 * Author: Lai Yan (S10274594G)
 * Features: Session management, role verification, page protection
 */

/**
 * Check user authentication and verify role access
 * Redirects to login if not authenticated or wrong role
 * @param {string} requiredRole - Required role for the page ('customer', 'vendor', 'staff')
 * @returns {Promise<Object>} User data object with name, email, role
 */
async function checkAuth(requiredRole) {
  return new Promise((resolve, reject) => {
    firebase.auth().onAuthStateChanged(async (user) => {
      if (!user) {
        sessionStorage.setItem('selectedRole', requiredRole);
        window.location.href = '../index.html';
        reject(new Error('Not authenticated'));
        return;
      }

      try {
        const db = firebase.firestore();
        const userDoc = await db.collection('users').doc(user.uid).get();

        if (!userDoc.exists) {
          await firebase.auth().signOut();
          alert('Access denied: user profile not found.');
          window.location.href = '../index.html';
          reject(new Error('Profile missing'));
          return;
        }

        const data = userDoc.data() || {};
        const role = (data.role || 'customer').toLowerCase();
        const status = (data.status || 'active').toLowerCase();

        if (status === 'disabled') {
          await firebase.auth().signOut();
          alert('Access denied: your account is disabled.');
          window.location.href = '../index.html';
          reject(new Error('Disabled'));
          return;
        }


        if (requiredRole === 'staff') {
          if (role !== 'admin' && role !== 'nea') {
            await firebase.auth().signOut();
            alert('Access denied. This account is not staff.');
            window.location.href = '../index.html';
            reject(new Error('Not staff'));
            return;
          }
        } 

        resolve({
          uid: user.uid,
          email: user.email,
          name: data.name || user.email.split('@')[0],
          role,
          phone: data.phone || '',
          stallId: data.stallId || '',
          stallName: data.stallName || '',
          createdAt: data.createdAt || new Date()
        });
      } catch (err) {
        console.error(err);
        reject(err);
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
 * @param {string} role - User role ('customer', 'vendor', 'admin', 'nea')
 */
function redirectToHome(role) {
  const rolePages = {
    customer: 'customer-home.html',
    vendor: 'vendor-home.html',
    admin: 'admin-home.html',
    nea: '../../Chloe/Inspector.html'
  };

  const page = rolePages[role.toLowerCase()] || 'customer-home.html';
  window.location.href = page;
}
