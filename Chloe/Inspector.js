// 1. Data Definition 
const initialData = {
    upcoming: [
        { name: "Maxwell Food Centre", location: "Stall #01-15", date: "Feb 10, 2026", type: "Routine" },
        { name: "Amoy Street", location: "Stall #02-04", date: "Feb 12, 2026", type: "Follow-up" }
    ],
    overdue: [
        { name: "Tiong Bahru Market", location: "Stall #01-88", date: "Feb 01, 2026", type: "Urgent Re-check" }
    ],
    completed: [
        { name: "Old Airport Road", location: "Stall #01-10", date: "Feb 05, 2026", type: "Routine", result: "Grade A" },
        { name: "Newton Food Centre", location: "Stall #01-50", date: "Feb 04, 2026", type: "Routine", result: "Grade B" }
    ]
};

// 2. Initialize the Active Data
// This looks in LocalStorage first, then falls back to initialData
if (!localStorage.getItem('inspectionData')) {
    localStorage.setItem('inspectionData', JSON.stringify(initialData));
}

// Now pull the data for the dashboard to show
let currentDisplayData = JSON.parse(localStorage.getItem('inspectionData'));

// 3. Navigation Tab Logic
function switchTab(tabId, event) {
    // UI: Update Button Styles
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    // UI: Update Content Visibility
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    const targetView = document.getElementById(tabId + '-view');
    if (targetView) {
        targetView.classList.add('active');
    }

    // Logic: Render the list for this tab
    if (tabId !== 'today') {
        renderList(tabId);
    }
}

// 4. Rendering Logic
function renderList(category) {
    const listContainer = document.getElementById(`${category}-list`);
    
    // Safety Check: If the container doesn't exist on this page, stop.
    if (!listContainer) return;

    const data = currentDisplayData[category];

    // If there's no data for this category, show an empty state
    if (!data || data.length === 0) {
        listContainer.innerHTML = `<div class="empty-state">No ${category} inspections.</div>`;
        return;
    }

    listContainer.innerHTML = data.map(item => `
        <div class="inspection-card ${category}">
            <div class="card-header">
                <span class="date-tag">${item.date}</span>
                <span class="status-tag ${category === 'overdue' ? 'red' : 'green'}">
                    ${category === 'completed' ? (item.result || 'COMPLETED') : (category === 'overdue' ? 'OVERDUE' : 'SCHEDULED')}
                </span>
            </div>
            <div class="card-body">
                <h4>${item.name}</h4>
                <p>📍 ${item.location}</p>
                <p>📋 ${item.type}</p>
                ${item.notes ? `<p class="notes" style="font-style: italic; color: #666; margin-top: 5px;">📝 ${item.notes}</p>` : ''}
            </div>
            
            ${category !== 'completed' ? `
                <div class="card-footer" style="margin-top: 10px; border-top: 1px solid #eee; padding-top: 10px;">
                    <button class="btn-start" onclick="startInspection('${item.name}', '${category}')">
                        📋 Start Inspection >
                    </button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// 5. Navigation to Form
function startInspection(stallName, category) {
    localStorage.setItem('currentInspectionStall', stallName);
    localStorage.setItem('currentCategory', category);
    window.location.href = 'Conduct-Inspection.html';
}

// 6. Startup Initialization
window.onload = () => {
    // Always start by showing the Upcoming list
    renderList('upcoming');
};

// Rewind button
function resetInspections() {
    if (confirm("This will move all completed stalls back to pending and clear your history. Proceed?")) {
        // 1. Clear the specific 'inspectionData' key
        localStorage.removeItem('inspectionData');
        
        // 2. Also clear the current stall context just in case
        localStorage.removeItem('currentInspectionStall');
        localStorage.removeItem('currentCategory');
        
        // 3. Reload the page to trigger the 'initialData' logic
        location.reload();
    }
}

function logout() {
  firebase.auth().signOut()
    .then(() => {
      window.location.href = "../../Lai Yan/pages/login.html";
    })
    .catch((error) => {
      console.error("Logout error:", error);
    });
}
