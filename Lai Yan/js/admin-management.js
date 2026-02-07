/**
 * Admin User Management JavaScript
 * Author: Lai Yan (S10274594G)
 * Features: Complete CRUD operations on all system users
 */

document.addEventListener('DOMContentLoaded', async () => {
  const auth = firebase.auth();
  const db = firebase.firestore();
  
  // Secondary Firebase app for creating users without switching session
  const secondaryApp = firebase.apps.find(app => app.name === "Secondary")
    ? firebase.app("Secondary")
    : firebase.initializeApp(firebaseConfig, "Secondary");

  const secondaryAuth = secondaryApp.auth();


  // DOM elements
  const loadingSpinner = document.getElementById('loadingSpinner');
  const tableContainer = document.getElementById('tableContainer');
  const emptyState = document.getElementById('emptyState');
  const usersTableBody = document.getElementById('usersTableBody');
  const searchInput = document.getElementById('searchInput');
  const roleFilter = document.getElementById('roleFilter');
  const userModal = document.getElementById('userModal');
  const userForm = document.getElementById('userForm');
  const modalTitle = document.getElementById('modalTitle');
  const submitBtn = document.getElementById('submitBtn');
  const passwordGroup = document.getElementById('passwordGroup');

  let allUsers = [];
  let currentEditUserId = null;

  /**
   * Initialize admin management
   */
  async function initialize() {
    try {
      // Verify admin access
      await checkAuth('admin');
      
      // Load all users
      await loadUsers();
      
      // Setup event listeners
      setupEventListeners();
      
    } catch (error) {
      console.error('Error initializing admin management:', error);
      showError('Failed to initialize. Please refresh the page.');
    }
  }

  /**
   * Load all users from Firestore
   */
  async function loadUsers() {
    showLoading(true);

    try {
      const usersSnapshot = await db.collection('users').get();
      
      allUsers = [];
      usersSnapshot.forEach(doc => {
        allUsers.push({
          id: doc.id,
          ...doc.data()
        });
      });

      updateStatistics();
      const activeUsers = allUsers.filter(u => (u.status || 'active').toLowerCase() === 'active');
      renderUsers(activeUsers);

      
    } catch (error) {
      console.error('Error loading users:', error);
      showError('Failed to load users. Please refresh the page.');
    } finally {
      showLoading(false);
    }
  }

  /**
   * Update statistics cards
   */
    function updateStatistics() {
      const activeUsers = allUsers.filter(u => (u.status || 'active').toLowerCase() === 'active');

      const total = activeUsers.length;
      const customers = activeUsers.filter(u => (u.role || 'customer') === 'customer').length;
      const vendors = activeUsers.filter(u => u.role === 'vendor').length;
      const nea = activeUsers.filter(u => u.role === 'nea').length;

      document.getElementById('totalUsers').textContent = total;
      document.getElementById('totalCustomers').textContent = customers;
      document.getElementById('totalVendors').textContent = vendors;
      document.getElementById('totalNEA').textContent = nea;
    }


  /**
   * Render users to table
   * @param {Array} users - Array of user objects
   */
  function renderUsers(users) {
    if (users.length === 0) {
      tableContainer.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }

    tableContainer.style.display = 'block';
    emptyState.style.display = 'none';

    usersTableBody.innerHTML = '';

    users.forEach(user => {
      const row = createUserRow(user);
      usersTableBody.appendChild(row);
    });
  }

  /**
   * Create table row for user
   * @param {Object} user - User object
   * @returns {HTMLElement} Table row element
   */
  function createUserRow(user) {
    const row = document.createElement('tr');
    
    const createdDate = user.createdAt ? 
      formatDate(user.createdAt.toDate()) : 
      'N/A';

    row.innerHTML = `
      <td>${escapeHtml(user.name || 'N/A')}</td>
      <td>${escapeHtml(user.email)}</td>
      <td><span class="role-badge role-${user.role || 'customer'}">${user.role || 'customer'}</span></td>
      <td>${escapeHtml(user.phone || 'N/A')}</td>
      <td>${createdDate}</td>
      <td>
        <div class="action-buttons">
          <button class="btn-action btn-edit" onclick="editUser('${user.id}')" aria-label="Edit user">
            Edit
          </button>
          <button class="btn-action btn-delete" onclick="deleteUser('${user.id}', '${escapeHtml(user.email)}')" aria-label="Delete user">
            Delete
          </button>
        </div>
      </td>
    `;

    return row;
  }

  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', filterUsers);
    
    // Role filter
    roleFilter.addEventListener('change', filterUsers);
    
    // Form submission
    userForm.addEventListener('submit', handleFormSubmit);
    
    // Close modal on overlay click
    userModal.addEventListener('click', (e) => {
      if (e.target === userModal) {
        closeModal();
      }
    });
  }

  /**
   * Filter users based on search and role filter
   */
  function filterUsers() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const roleFilterValue = roleFilter.value.toLowerCase();

    let filtered = allUsers;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user => 
        (user.name && user.name.toLowerCase().includes(searchTerm)) ||
        (user.email && user.email.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by role
    if (roleFilterValue) {
      filtered = filtered.filter(user => user.role === roleFilterValue);
    }

    renderUsers(filtered);
  }

  /**
   * Open modal to add new user
   */
  window.openAddUserModal = function() {
    currentEditUserId = null;
    modalTitle.textContent = 'Add User';
    submitBtn.textContent = 'Add User';
    passwordGroup.style.display = 'block';
    userForm.reset();
    clearModalMessages();
    userModal.classList.add('active');
    document.getElementById('userName').focus();
    document.getElementById('userEmail').disabled = false;
  };

  /**
   * Edit existing user
   * @param {string} userId - User document ID
   */
  window.editUser = async function(userId) {
    try {
      const user = allUsers.find(u => u.id === userId);
      
      if (!user) {
        alert('User not found.');
        return;
      }

      currentEditUserId = userId;
      modalTitle.textContent = 'Edit User';
      submitBtn.textContent = 'Update User';
      passwordGroup.style.display = 'none'; // Can't change password in edit mode
      document.getElementById('userEmail').disabled = true; // Can't change email in edit mode

      // Populate form
      document.getElementById('userName').value = user.name || '';
      document.getElementById('userEmail').value = user.email || '';
      document.getElementById('userRole').value = user.role || 'customer';
      document.getElementById('userPhone').value = user.phone || '';

      clearModalMessages();
      userModal.classList.add('active');
      document.getElementById('userName').focus();

    } catch (error) {
      console.error('Error loading user for editing:', error);
      alert('Failed to load user data.');
    }
  };

  /**
   * Handle form submission (add or update)
   */
  async function handleFormSubmit(e) {
    e.preventDefault();
    clearModalMessages();

    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim().toLowerCase();
    const role = document.getElementById('userRole').value;
    const phone = document.getElementById('userPhone').value.trim();
    const password = document.getElementById('userPassword').value;

    // Validation
    if (!name || !email || !role) {
      showModalError('Please fill in all required fields.');
      return;
    }

    if (!currentEditUserId && !password) {
      showModalError('Password is required for new users.');
      return;
    }

    if (password && password.length < 6) {
      showModalError('Password must be at least 6 characters.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showModalError('Please enter a valid email address.');
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = currentEditUserId ? 'Updating...' : 'Adding...';

      if (currentEditUserId) {
        // Update existing user
        await updateUser(currentEditUserId, { name, role, phone });
      } else {
        // Create new user
        await createUser({ name, email, role, phone, password });
      }

      showModalSuccess(currentEditUserId ? 'User updated successfully!' : 'User added successfully!');
      
      // Reload users
      await loadUsers();
      
      // Close modal after brief delay
      setTimeout(() => {
        closeModal();
        document.getElementById('userEmail').disabled = false;
      }, 1500);

    } catch (error) {
      console.error('Error saving user:', error);
      showModalError(error.message || 'Failed to save user. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = currentEditUserId ? 'Update User' : 'Add User';
    }
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   */
  async function createUser(userData) {
    const { name, email, role, phone, password } = userData;

    const userCredential = await secondaryAuth.createUserWithEmailAndPassword(email, password);
    const userId = userCredential.user.uid;

    await db.collection('users').doc(userId).set({
      name,
      email,
      role,
      phone,
      status: 'active',
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    await secondaryAuth.signOut();
  }


  /**
   * Update existing user
   * @param {string} userId - User document ID
   * @param {Object} userData - Updated user data
   */
async function updateUser(userId, userData) {
  const { name, role, phone } = userData;

  await db.collection('users').doc(userId).update({
    name,
    role,
    phone,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}


  /**
   * Delete user
   * @param {string} userId - User document ID
   * @param {string} email - User email
   */
  window.deleteUser = async function(userId, email) {
    if (!confirm(`Are you sure you want to delete user: ${email}?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      const user = allUsers.find(u => u.id === userId);

      // "Delete" from Firestore, change to inactive
      await db.collection('users').doc(userId).update({
        status: 'inactive',
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });


      // Delete from allowedAccounts if vendor/admin
      if (user.role === 'vendor' || user.role === 'admin') {
        await db.collection('allowedAccounts').doc(email).delete();
      }

      // Note: Cannot delete from Firebase Auth without admin SDK
      // In production, you'd need Cloud Functions for this
      alert('User deleted from database successfully.\n\nNote: The authentication account still exists. Contact a Firebase administrator to fully delete the account.');

      // Reload users
      await loadUsers();

    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  /**
   * Close modal
   */
  window.closeModal = function() {
    userModal.classList.remove('active');
    userForm.reset();
    currentEditUserId = null;
    clearModalMessages();
  };

  /**
   * Show loading spinner
   * @param {boolean} show - Whether to show spinner
   */
  function showLoading(show) {
    loadingSpinner.style.display = show ? 'flex' : 'none';
  }

  /**
   * Show modal error message
   * @param {string} message - Error message
   */
  function showModalError(message) {
    document.getElementById('modal-error').textContent = message;
    document.getElementById('modal-success').textContent = '';
  }

  /**
   * Show modal success message
   * @param {string} message - Success message
   */
  function showModalSuccess(message) {
    document.getElementById('modal-success').textContent = message;
    document.getElementById('modal-error').textContent = '';
  }

  /**
   * Clear modal messages
   */
  function clearModalMessages() {
    document.getElementById('modal-error').textContent = '';
    document.getElementById('modal-success').textContent = '';
  }

  /**
   * Show general error message
   * @param {string} message - Error message
   */
  function showError(message) {
    alert(message);
  }

  /**
   * Format date
   * @param {Date} date - Date to format
   * @returns {string} Formatted date
   */
  function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-SG', options);
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize admin management
  initialize();
});