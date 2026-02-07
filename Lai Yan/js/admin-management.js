/**
 * Admin User Management JavaScript
 * Author: Lai Yan (S10274594G)
 * Features: Complete CRUD operations on all system users
 */

document.addEventListener('DOMContentLoaded', async () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

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
      renderUsers(allUsers);
      
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
    const total = allUsers.length;
    const customers = allUsers.filter(u => u.role === 'customer').length;
    const vendors = allUsers.filter(u => u.role === 'vendor').length;
    const nea = allUsers.filter(u => u.role === 'nea').length;

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
        await updateUser(currentEditUserId, { name, email, role, phone });
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

    // Create user in Firebase Authentication
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const userId = userCredential.user.uid;

    // Create user document in Firestore
    await db.collection('users').doc(userId).set({
      name: name,
      email: email,
      role: role,
      phone: phone,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // If vendor or admin, add to allowedAccounts
    if (role === 'vendor' || role === 'admin') {
      await db.collection('allowedAccounts').doc(email).set({
        role: role,
        approvedBy: auth.currentUser.email,
        approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
        approved: true
      });
    }
  }

  /**
   * Update existing user
   * @param {string} userId - User document ID
   * @param {Object} userData - Updated user data
   */
  async function updateUser(userId, userData) {
    const { name, email, role, phone } = userData;

    const user = allUsers.find(u => u.id === userId);
    const oldEmail = user.email;
    const oldRole = user.role;

    // Update user document in Firestore
    await db.collection('users').doc(userId).update({
      name: name,
      email: email,
      role: role,
      phone: phone,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Handle allowedAccounts changes if role changed
    if (oldRole !== role) {
      // Remove old allowlist entry if was vendor/admin
      if (oldRole === 'vendor' || oldRole === 'admin') {
        await db.collection('allowedAccounts').doc(oldEmail).delete();
      }

      // Add new allowlist entry if now vendor/admin
      if (role === 'vendor' || role === 'admin') {
        await db.collection('allowedAccounts').doc(email).set({
          role: role,
          approvedBy: auth.currentUser.email,
          approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
          approved: true
        });
      }
    } else if ((role === 'vendor' || role === 'admin') && oldEmail !== email) {
      // If email changed but role stayed vendor/admin, update allowlist
      await db.collection('allowedAccounts').doc(oldEmail).delete();
      await db.collection('allowedAccounts').doc(email).set({
        role: role,
        approvedBy: auth.currentUser.email,
        approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
        approved: true
      });
    }
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

      // Delete from Firestore
      await db.collection('users').doc(userId).delete();

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