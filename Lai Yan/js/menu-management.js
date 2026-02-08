/**
 * Menu Management JavaScript
 * Author: Lai Yan (S10274594G)
 * Features: Add, edit, delete, toggle availability of menu items
 */

document.addEventListener('DOMContentLoaded', async () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  // Get DOM elements
  const addMenuForm = document.getElementById('addMenuForm');
  const menuItemsGrid = document.getElementById('menuItemsGrid');
  const emptyState = document.getElementById('emptyState');
  const loadingSpinner = document.getElementById('loading');
  const formMessage = document.getElementById('form-message');
  const successMessage = document.getElementById('success-message');
  const submitBtn = addMenuForm.querySelector('button[type="submit"]');


  let currentStallId = null;
  let editingItemId = null;
  let editingItemAvailable = true; // keep availability when editing


  /**
   * Check authentication and get vendor stall ID
   */
  async function initializeVendor() {
    try {
      const userData = await checkAuth('vendor');
      
      // Get vendor's stall ID from user profile
      const userDoc = await db.collection('users').doc(userData.uid).get();
      
      if (userDoc.exists && userDoc.data().stallId) {
        currentStallId = userDoc.data().stallId;
        loadMenuItems();
      } else {
        showError('Please link your account to a stall in your profile first.');
      }
    } catch (error) {
      console.error('Error initializing vendor:', error);
      showError('Failed to load vendor information.');
    }
  }

  /**
   * Load all menu items for the vendor's stall
   */
  async function loadMenuItems() {
    if (!currentStallId) return;

    showLoading(true);

    try {
      const menuItemsSnapshot = await db
        .collection('menuItems')
        .where('stallId', '==', currentStallId)
        .get(); // <-- removed orderBy to avoid index requirement

      if (menuItemsSnapshot.empty) {
        showEmptyState(true);
        menuItemsGrid.innerHTML = '';
      } else {
        showEmptyState(false);

        // Sort by name on the client side
        const docs = menuItemsSnapshot.docs.sort((a, b) => {
          const an = (a.data().name || '').toLowerCase();
          const bn = (b.data().name || '').toLowerCase();
          return an.localeCompare(bn);
        });

        renderMenuItems(docs);
      }
    } catch (error) {
      console.error('Error loading menu items:', error);
      showError(error.message || 'Failed to load menu items. Please refresh the page.');
    } finally {
      showLoading(false);
    }
  }


  /**
   * Render menu items to the grid
   * @param {Array} menuDocs - Firestore documents
   */
  function renderMenuItems(menuDocs) {
    menuItemsGrid.innerHTML = '';

    menuDocs.forEach(doc => {
      const item = doc.data();
      const itemCard = createMenuItemCard(doc.id, item);
      menuItemsGrid.appendChild(itemCard);
    });
  }

  /**
   * Create a menu item card element
   * @param {string} itemId - Menu item document ID
   * @param {Object} item - Menu item data
   * @returns {HTMLElement} Menu item card
   */
  function createMenuItemCard(itemId, item) {
    const card = document.createElement('div');
    card.className = 'menu-item-card';

    const isAvailable = item.available !== false; // Default to available

    card.innerHTML = `
      <div class="menu-item-header">
        <h3 class="menu-item-name">${escapeHtml(item.name)}</h3>
        <span class="menu-item-price">$${parseFloat(item.price).toFixed(2)}</span>
      </div>
      
      ${item.description ? `<p class="menu-item-description">${escapeHtml(item.description)}</p>` : ''}
      
      <div class="menu-item-meta">
        <span class="menu-item-category">${escapeHtml(item.category)}</span>
        <span class="menu-item-cuisine">${escapeHtml(item.cuisine)}</span>
        <span class="menu-item-availability ${isAvailable ? 'available' : 'unavailable'}">
          ${isAvailable ? '✓ Available' : '✗ Unavailable'}
        </span>
      </div>
      
      <div class="menu-item-actions">
        <button class="btn-small btn-edit" onclick="editMenuItem('${itemId}')">Edit</button>
        <button class="btn-small btn-toggle" onclick="toggleAvailability('${itemId}', ${!isAvailable})">
          ${isAvailable ? 'Mark Unavailable' : 'Mark Available'}
        </button>
        <button class="btn-small btn-delete" onclick="deleteMenuItem('${itemId}')">Delete</button>
      </div>
    `;

    return card;
  }

  function resetFormMode() {
    editingItemId = null;
    editingItemAvailable = true;
    submitBtn.textContent = 'Add Menu Item';
  }

  /**
   * Handle add menu item form submission
   */
  addMenuForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();

    if (!currentStallId) {
      showError('Please link your account to a stall first.');
      return;
    }

    const name = document.getElementById('itemName').value.trim();
    const price = parseFloat(document.getElementById('itemPrice').value);
    const description = document.getElementById('itemDescription').value.trim();
    const category = document.getElementById('itemCategory').value;
    const cuisine = document.getElementById('itemCuisine').value;

    if (!name || !price || !category || !cuisine) {
      showError('Please fill in all required fields.');
      return;
    }

    if (price <= 0) {
      showError('Price must be greater than 0.');
      return;
    }

    try {
      if (editingItemId) {
        // UPDATE (do NOT overwrite createdAt, do NOT force available=true)
        await db.collection('menuItems').doc(editingItemId).update({
          name,
          price,
          description,
          category,
          cuisine,
          stallId: currentStallId,
          available: editingItemAvailable,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showSuccess('Menu item updated successfully!');
        resetFormMode();
      } else {
        // ADD
        await db.collection('menuItems').add({
          stallId: currentStallId,
          name,
          price,
          description,
          category,
          cuisine,
          available: true,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showSuccess('Menu item added successfully!');
      }

      addMenuForm.reset();
      loadMenuItems();

      setTimeout(() => {
        successMessage.textContent = '';
      }, 3000);

    } catch (error) {
      console.error('Error saving menu item:', error);
      showError(error.message || 'Failed to save menu item. Please try again.');
    }
  });


  /**
   * Edit a menu item - populate form with existing data
   * @param {string} itemId - Menu item document ID
   */
  window.editMenuItem = async function(itemId) {
    try {
      const itemDoc = await db.collection('menuItems').doc(itemId).get();

      if (!itemDoc.exists) {
        showError('Menu item not found.');
        return;
      }

      const item = itemDoc.data();

      // Populate form
      document.getElementById('itemName').value = item.name || '';
      document.getElementById('itemPrice').value = item.price ?? '';
      document.getElementById('itemDescription').value = item.description || '';
      document.getElementById('itemCategory').value = item.category || '';
      document.getElementById('itemCuisine').value = item.cuisine || '';

      // Set editing mode
      editingItemId = itemId;
      editingItemAvailable = item.available !== false;

      // Update button text
      submitBtn.textContent = 'Update Menu Item';

      // Scroll to form
      document.querySelector('.add-menu-section').scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
      console.error('Error loading menu item for editing:', error);
      showError(error.message || 'Failed to load menu item.');
    }
  };


  /**
   * Toggle menu item availability
   * @param {string} itemId - Menu item document ID
   * @param {boolean} available - New availability status
   */
  window.toggleAvailability = async function(itemId, available) {
    try {
      await db.collection('menuItems').doc(itemId).update({
        available: available,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      loadMenuItems();
      showSuccess(`Item marked as ${available ? 'available' : 'unavailable'}.`);

      setTimeout(() => {
        successMessage.textContent = '';
      }, 2000);

    } catch (error) {
      console.error('Error toggling availability:', error);
      showError('Failed to update availability.');
    }
  };

  /**
   * Delete a menu item
   * @param {string} itemId - Menu item document ID
   */
  window.deleteMenuItem = async function(itemId) {
    if (!confirm('Are you sure you want to delete this menu item?')) {
      return;
    }

    try {
      await db.collection('menuItems').doc(itemId).delete();
      
      loadMenuItems();
      showSuccess('Menu item deleted successfully.');

      setTimeout(() => {
        successMessage.textContent = '';
      }, 2000);

    } catch (error) {
      console.error('Error deleting menu item:', error);
      showError('Failed to delete menu item.');
    }
  };

  /**
   * Show/hide loading spinner
   * @param {boolean} show - Whether to show spinner
   */
  function showLoading(show) {
    loadingSpinner.style.display = show ? 'flex' : 'none';
  }

  /**
   * Show/hide empty state
   * @param {boolean} show - Whether to show empty state
   */
  function showEmptyState(show) {
    emptyState.style.display = show ? 'block' : 'none';
  }

  /**
   * Show success message
   * @param {string} message - Success message
   */
  function showSuccess(message) {
    successMessage.textContent = message;
    formMessage.textContent = '';
  }

  /**
   * Show error message
   * @param {string} message - Error message
   */
  function showError(message) {
    formMessage.textContent = message;
    successMessage.textContent = '';
  }

  /**
   * Clear all messages
   */
  function clearMessages() {
    formMessage.textContent = '';
    successMessage.textContent = '';
  }

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize vendor and load menu items
  initializeVendor();
});