const inspectionData = {
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

function switchTab(tabId) {
    // UI: Update Buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    // UI: Update Content Visibility
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabId + '-view').classList.add('active');

    // Logic: Render data if it's not the "Today" empty state
    if (tabId !== 'today') {
        renderList(tabId);
    }
}

function renderList(category) {
    const listContainer = document.getElementById(`${category}-list`);
    const data = inspectionData[category];
    
    listContainer.innerHTML = data.map(item => `
        <div class="inspection-card ${category}">
            <div class="card-header">
                <span class="date-tag">${item.date}</span>
                <span class="status-tag ${category === 'overdue' ? 'red' : 'green'}">
                    ${category === 'overdue' ? 'OVERDUE' : (item.result || 'SCHEDULED')}
                </span>
            </div>
            <div class="card-body">
                <h4>${item.name}</h4>
                <p>📍 ${item.location}</p>
                <p>📋 ${item.type}</p>
            </div>
        </div>
    `).join('');
}