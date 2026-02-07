/**
 * Profile Management
 * Author: Lai Yan (S10274594G)
 * Features: Profile display, update, vendor-specific fields
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', async () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  // Get form elements
  const profileForm = document.getElementById('profileForm');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const stallNameInput = document.getElementById('stallName');
  const stallIdSelect = document.getElementById('stallId');
  const vendorFields = document.getElementById('vendor-fields');
  
  // Get display elements
  const profileNameDisplay = document.getElementById('profile-name');
  const profileRoleDisplay = document.getElementById('profile-role');
  const profileAvatar = document.getElementById('profile-avatar');
  const avatarInitial = document.getElementById('avatar-initial');
  
  // Get message elements
  const successMessage = document.getElementById('success-message');
  const errorMessage = document.getElementById('error-message');

  /**
   * Load user profile data
   */
  async function loadProfile() {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        window.location.href = '../index.html';
        return;
      }

      // Get user document from Firestore
      const userDoc = await db.collection('users').doc(user.uid).get();
      
      let userData = {
        email: user.email,
        name: '',
        phone: '',
        role: 'customer',
        stallId: '',
        stallName: ''
      };

      // If user document exists, get data
      if (userDoc.exists) {
        const data = userDoc.data();
        userData = { ...userData, ...data };
      } else {
        // Create default user document if doesn't exist
        userData.name = user.email.split('@')[0];
        await db.collection('users').doc(user.uid).set(userData);
      }

      // Determine role from allowlist for vendor/admin
      const allowedDoc = await db.collection('allowedAccounts').doc(user.email.toLowerCase()).get();
      if (allowedDoc.exists) {
        userData.role = (allowedDoc.data().role || 'customer').toLowerCase();
      }

      // Populate form fields
      nameInput.value = userData.name || '';
      emailInput.value = userData.email || '';
      phoneInput.value = userData.phone || '';

      // Display profile header
      profileNameDisplay.textContent = userData.name || 'User';
      profileRoleDisplay.textContent = userData.role;

      // Set avatar using helper function
      if (window.setAvatar && profileAvatar) {
        setAvatar(profileAvatar, userData.name, userData.email, 120);
      } else if (avatarInitial) {
        // Fallback if avatar helper not available
        const initials = (userData.name || userData.email)
          .split(' ')
          .map(word => word[0])
          .join('')
          .toUpperCase()
          .substring(0, 2);
        avatarInitial.textContent = initials;
      }

      // Show vendor fields if vendor
      if (userData.role === 'vendor') {
        vendorFields.style.display = 'block';
        stallNameInput.value = userData.stallName || '';
        
        // Load available stalls
        await loadStalls();
        
        if (userData.stallId) {
          stallIdSelect.value = userData.stallId;
        }
      } else {
        vendorFields.style.display = 'none';
      }

    } catch (error) {
      console.error('Error loading profile:', error);
      showError('Failed to load profile data. Please refresh the page.');
    }
  }

  /**
   * Load available stalls for vendor selection
   */
  async function loadStalls() {
    try {
      const stallsSnapshot = await db.collection('stalls').get();
      
      // Clear existing options except the first one
      stallIdSelect.innerHTML = '<option value="">Select your stall</option>';
      
      // Add stalls to dropdown
      stallsSnapshot.forEach(doc => {
        const stall = doc.data();
        const option = document.createElement('option');
        option.value = doc.id;
        option.textContent = `${stall.name} (${doc.id})`;
        stallIdSelect.appendChild(option);
      });
      
    } catch (error) {
      console.error('Error loading stalls:', error);
    }
  }

  /**
   * Handle profile form submission
   */
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Clear previous messages
    clearMessages();

    try {
      const user = auth.currentUser;
      
      if (!user) {
        showError('You must be logged in to update your profile.');
        return;
      }

      // Get form values
      const updatedData = {
        name: nameInput.value.trim(),
        phone: phoneInput.value.trim(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      // Validate name
      if (!updatedData.name) {
        showError('Name is required.');
        return;
      }

      // Add vendor-specific fields if vendor role
      const userDoc = await db.collection('users').doc(user.uid).get();
      const role = userDoc.exists ? (userDoc.data().role || 'customer') : 'customer';
      
      if (role === 'vendor') {
        updatedData.stallName = stallNameInput.value.trim();
        updatedData.stallId = stallIdSelect.value;
      }

      // Update Firestore
      await db.collection('users').doc(user.uid).update(updatedData);

      // Update display
      profileNameDisplay.textContent = updatedData.name;
      
      // Update avatar
      if (window.setAvatar && profileAvatar) {
        setAvatar(profileAvatar, updatedData.name, user.email, 120);
      }

      // Show success message
      showSuccess('Profile updated successfully!');

    } catch (error) {
      console.error('Error updating profile:', error);
      showError('Failed to update profile. Please try again.');
    }
  });

  /**
   * Show success message
   * @param {string} message - Success message to display
   */
  function showSuccess(message) {
    successMessage.textContent = message;
    errorMessage.textContent = '';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      successMessage.textContent = '';
    }, 5000);
  }

  /**
   * Show error message
   * @param {string} message - Error message to display
   */
  function showError(message) {
    errorMessage.textContent = message;
    successMessage.textContent = '';
  }

  /**
   * Clear all messages
   */
  function clearMessages() {
    successMessage.textContent = '';
    errorMessage.textContent = '';
  }

  // Initialize profile on page load
  loadProfile();
});
