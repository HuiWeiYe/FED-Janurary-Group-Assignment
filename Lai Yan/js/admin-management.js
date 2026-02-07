/**
 * Admin Management JavaScript
 * Author: Lai Yan (S10274594G)
 * Features: Manage stalls, vendors, inspections, and access control
 */

document.addEventListener('DOMContentLoaded', async () => {
  const auth = firebase.auth();
  const db = firebase.firestore();

  let currentAdmin = null;

  /**
   * Initialize admin dashboard
   */
  async function initialize() {
    try {
      const userData = await checkAuth('admin');
      currentAdmin = userData;
      
      loadStatistics();
      loadStalls();
      loadVendors();
      loadInspections();
      loadAllowlist();
      
      setupEventListeners();
    } catch (error) {
      console.error('Error initializing admin dashboard:', error);
    }
  }

  /**
   * Load dashboard statistics
   */
  async function loadStatistics() {
    try {
      // Count total stalls
      const stallsSnapshot = await db.collection('stalls').get();
      document.getElementById('totalStalls').textContent = stallsSnapshot.size;

      // Count total vendors
      const vendorsSnapshot = await db.collection('allowedAccounts')
        .where('role', '==', 'vendor')
        .get();
      document.getElementById('totalVendors').textContent = vendorsSnapshot.size;

      // Count pending inspections (example - adjust based on your data structure)
      const inspectionsSnapshot = await db.collection('inspections')
        .where('status', '==', 'pending')
        .get();
      document.getElementById('pendingInspections').textContent = inspectionsSnapshot.size;

      // Count active complaints (example - adjust based on your data structure)
      const complaintsSnapshot = await db.collection('complaints')
        .where('status', '==', 'active')
        .get();
      document.getElementById('activeComplaints').textContent = complaintsSnapshot.size;

    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  }

  /**
   * Load stalls data
   */
  async function loadStalls() {
    try {
      const stallsSnapshot = await db.collection('stalls').orderBy('name').get();
      const tbody = document.getElementById('stallsTableBody');
      
      if (stallsSnapshot.empty) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No stalls found</td></tr>';
        return;
      }

      tbody.innerHTML = '';
      
      stallsSnapshot.forEach(doc => {
        const stall = doc.data();
        const row = createStallRow(doc.id, stall);
        tbody.appendChild(row);
      });

    } catch (error) {
      console.error('Error loading stalls:', error);
      document.getElementById('stallsTableBody').innerHTML = 
        '<tr><td colspan="6" style="text-align: center; padding: 20px; color: red;">Error loading stalls</td></tr>';
    }
  }

  /**
   * Create stall table row
   */
  function createStallRow(stallId, stall) {
    const row = document.createElement('tr');
    const grade = stall.hygieneGrade || 'N/A';
    const gradeClass = grade !== 'N/A' ? `grade-${grade.toLowerCase()}` : '';
    
    row.innerHTML = `
      <td>${escapeHtml(stallId)}</td>
      <td>${escapeHtml(stall.name)}</td>
      <td>${escapeHtml(stall.cuisine || 'N/A')}</td>
      <td><span class="hygiene-grade ${gradeClass}">${grade}</span></td>
      <td>${stall.lastInspection ? formatDate(stall.lastInspection.toDate()) : 'Never'}</td>
      <td>
        <div class="table-actions">
          <button class="btn-icon" onclick="viewStallDetails('${stallId}')">View</button>
          <button class="btn-icon" onclick="scheduleInspection('${stallId}')">Inspect</button>
        </div>
      </td>
    `;
    
    return row;
  }

  /**
   * Load vendors data
   */
  async function loadVendors() {
    try {
      const usersSnapshot = await db.collection('users')
        .where('role', '==', 'vendor')
        .get();
      
      const tbody = document.getElementById('vendorsTableBody');
      
      if (usersSnapshot.empty) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No vendors found</td></tr>';
        return;
      }

      tbody.innerHTML = '';
      
      usersSnapshot.forEach(doc => {
        const vendor = doc.data();
        const row = createVendorRow(doc.id, vendor);
        tbody.appendChild(row);
      });

    } catch (error) {
      console.error('Error loading vendors:', error);
      document.getElementById('vendorsTableBody').innerHTML = 
        '<tr><td colspan="6" style="text-align: center; padding: 20px; color: red;">Error loading vendors</td></tr>';
    }
  }

  /**
   * Create vendor table row
   */
  function createVendorRow(vendorId, vendor) {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${escapeHtml(vendor.name || 'N/A')}</td>
      <td>${escapeHtml(vendor.email)}</td>
      <td>${escapeHtml(vendor.stallName || 'Not assigned')}</td>
      <td>${escapeHtml(vendor.phone || 'N/A')}</td>
      <td><span class="status-badge status-active">Active</span></td>
      <td>
        <div class="table-actions">
          <button class="btn-icon" onclick="viewVendorDetails('${vendorId}')">View</button>
        </div>
      </td>
    `;
    
    return row;
  }

  /**
   * Load inspections data
   */
  async function loadInspections() {
    try {
      const inspectionsSnapshot = await db.collection('inspections')
        .orderBy('date', 'desc')
        .limit(50)
        .get();
      
      const tbody = document.getElementById('inspectionsTableBody');
      
      if (inspectionsSnapshot.empty) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">No inspections found</td></tr>';
        return;
      }

      tbody.innerHTML = '';
      
      inspectionsSnapshot.forEach(doc => {
        const inspection = doc.data();
        const row = createInspectionRow(doc.id, inspection);
        tbody.appendChild(row);
      });

    } catch (error) {
      console.error('Error loading inspections:', error);
      document.getElementById('inspectionsTableBody').innerHTML = 
        '<tr><td colspan="7" style="text-align: center; padding: 20px; color: red;">Error loading inspections</td></tr>';
    }
  }

  /**
   * Create inspection table row
   */
  function createInspectionRow(inspectionId, inspection) {
    const row = document.createElement('tr');
    const grade = inspection.grade || 'N/A';
    const gradeClass = grade !== 'N/A' ? `grade-${grade.toLowerCase()}` : '';
    const status = inspection.status || 'completed';
    
    row.innerHTML = `
      <td>${formatDate(inspection.date.toDate())}</td>
      <td>${escapeHtml(inspection.stallName || 'N/A')}</td>
      <td>${escapeHtml(inspection.inspectorName || 'N/A')}</td>
      <td>${inspection.score || 'N/A'}</td>
      <td><span class="hygiene-grade ${gradeClass}">${grade}</span></td>
      <td><span class="status-badge status-${status}">${capitalize(status)}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn-icon" onclick="viewInspection('${inspectionId}')">View</button>
        </div>
      </td>
    `;
    
    return row;
  }

  /**
   * Load allowlist data
   */
  async function loadAllowlist() {
    try {
      const allowlistSnapshot = await db.collection('allowedAccounts').get();
      const tbody = document.getElementById('allowlistTableBody');
      
      if (allowlistSnapshot.empty) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px;">No allowed accounts</td></tr>';
        return;
      }

      tbody.innerHTML = '';
      
      allowlistSnapshot.forEach(doc => {
        const account = doc.data();
        const row = createAllowlistRow(doc.id, account);
        tbody.appendChild(row);
      });

    } catch (error) {
      console.error('Error loading allowlist:', error);
      document.getElementById('allowlistTableBody').innerHTML = 
        '<tr><td colspan="5" style="text-align: center; padding: 20px; color: red;">Error loading allowlist</td></tr>';
    }
  }

  /**
   * Create allowlist table row
   */
  function createAllowlistRow(email, account) {
    const row = document.createElement('tr');
    
    row.innerHTML = `
      <td>${escapeHtml(email)}</td>
      <td><span class="status-badge status-approved">${capitalize(account.role)}</span></td>
      <td>${escapeHtml(account.approvedBy || 'System')}</td>
      <td>${account.approvedAt ? formatDate(account.approvedAt.toDate()) : 'N/A'}</td>
      <td>
        <div class="table-actions">
          <button class="btn-icon danger" onclick="removeFromAllowlist('${email}')">Remove</button>
        </div>
      </td>
    `;
    
    return row;
  }

  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    // Add allowed account form
    const addAllowedAccountForm = document.getElementById('addAllowedAccountForm');
    addAllowedAccountForm.addEventListener('submit', handleAddAllowedAccount);

    // Search and filter
    document.getElementById('stallSearch')?.addEventListener('input', filterStalls);
    document.getElementById('stallFilter')?.addEventListener('change', filterStalls);
    document.getElementById('vendorSearch')?.addEventListener('input', filterVendors);
  }

  /**
   * Handle add allowed account form submission
   */
  async function handleAddAllowedAccount(e) {
    e.preventDefault();
    
    const email = document.getElementById('allowedEmail').value.trim().toLowerCase();
    const role = document.getElementById('allowedRole').value;
    const messageEl = document.getElementById('allowlist-message');
    const successEl = document.getElementById('allowlist-success');

    messageEl.textContent = '';
    successEl.textContent = '';

    if (!email || !role) {
      messageEl.textContent = 'Please fill in all fields.';
      return;
    }

    try {
      await db.collection('allowedAccounts').doc(email).set({
        role: role,
        approvedBy: currentAdmin.email,
        approvedAt: firebase.firestore.FieldValue.serverTimestamp(),
        approved: true
      });

      successEl.textContent = `Successfully added ${email} to allowlist as ${role}.`;
      
      // Reset form
      e.target.reset();
      
      // Reload allowlist
      loadAllowlist();
      loadStatistics();

      setTimeout(() => {
        successEl.textContent = '';
      }, 3000);

    } catch (error) {
      console.error('Error adding to allowlist:', error);
      messageEl.textContent = 'Failed to add account. Please try again.';
    }
  }

  /**
   * Remove account from allowlist
   */
  window.removeFromAllowlist = async function(email) {
    if (!confirm(`Are you sure you want to remove ${email} from the allowlist?`)) {
      return;
    }

    try {
      await db.collection('allowedAccounts').doc(email).delete();
      loadAllowlist();
      loadStatistics();
      alert('Account removed from allowlist.');
    } catch (error) {
      console.error('Error removing from allowlist:', error);
      alert('Failed to remove account.');
    }
  };

  /**
   * Filter stalls
   */
  function filterStalls() {
    const searchTerm = document.getElementById('stallSearch').value.toLowerCase();
    const gradeFilter = document.getElementById('stallFilter').value;
    const rows = document.querySelectorAll('#stallsTableBody tr');

    rows.forEach(row => {
      const name = row.cells[1]?.textContent.toLowerCase() || '';
      const grade = row.cells[3]?.textContent.trim() || '';
      
      const matchesSearch = name.includes(searchTerm);
      const matchesFilter = !gradeFilter || grade === gradeFilter;

      row.style.display = matchesSearch && matchesFilter ? '' : 'none';
    });
  }

  /**
   * Filter vendors
   */
  function filterVendors() {
    const searchTerm = document.getElementById('vendorSearch').value.toLowerCase();
    const rows = document.querySelectorAll('#vendorsTableBody tr');

    rows.forEach(row => {
      const name = row.cells[0]?.textContent.toLowerCase() || '';
      const email = row.cells[1]?.textContent.toLowerCase() || '';
      
      const matches = name.includes(searchTerm) || email.includes(searchTerm);
      row.style.display = matches ? '' : 'none';
    });
  }

  /**
   * Switch tabs
   */
  window.switchTab = function(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
      btn.setAttribute('aria-selected', 'false');
    });
    event.target.classList.add('active');
    event.target.setAttribute('aria-selected', 'true');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
  };

  /**
   * View stall details (placeholder)
   */
  window.viewStallDetails = function(stallId) {
    alert(`View details for stall: ${stallId}\n(Feature to be implemented)`);
  };

  /**
   * Schedule inspection (placeholder)
   */
  window.scheduleInspection = function(stallId) {
    alert(`Schedule inspection for stall: ${stallId}\n(Feature to be implemented)`);
  };

  /**
   * View vendor details (placeholder)
   */
  window.viewVendorDetails = function(vendorId) {
    alert(`View details for vendor: ${vendorId}\n(Feature to be implemented)`);
  };

  /**
   * View inspection details (placeholder)
   */
  window.viewInspection = function(inspectionId) {
    document.getElementById('inspectionModal').classList.add('active');
    document.getElementById('inspectionDetails').innerHTML = `
      <p>Inspection ID: ${inspectionId}</p>
      <p>Detailed inspection view coming soon...</p>
    `;
  };

  /**
   * Close modal
   */
  window.closeModal = function() {
    document.getElementById('inspectionModal').classList.remove('active');
  };

  /**
   * Utility: Format date
   */
  function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-SG', options);
  }

  /**
   * Utility: Capitalize first letter
   */
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Utility: Escape HTML
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Initialize dashboard
  initialize();
});