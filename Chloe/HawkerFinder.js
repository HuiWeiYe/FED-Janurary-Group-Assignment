// const stalls = [...]; 

let map, markerLayer;

window.onload = () => {
    // --- 1. MAP PAGE SETUP ---
    const mapElement = document.getElementById('map');
    if (mapElement) {
        map = L.map('map').setView([1.3521, 103.8198], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        markerLayer = L.layerGroup().addTo(map);
        updateUI(stalls); 
    }

    // --- 2. LIST PAGE SETUP ---
    const listElement = document.getElementById('cardContainer');
    if (listElement) {
        updateUI(stalls);
    }

    // --- 3. DETAILS PAGE SETUP ---
    const detailsElement = document.getElementById('detTitle');
    if (detailsElement) {
        const params = new URLSearchParams(window.location.search);  // Get the name of the stall from URL
        const stallName = params.get('name');
        const stall = stalls.find(s => s.name === stallName);       // Use .find() to search through stalls array for object that matches that name

        if (stall) {
            detailsElement.innerText = stall.name;
            if (document.getElementById('detAddr')) document.getElementById('detAddr').innerText = stall.address;
            if (document.getElementById('detStalls')) document.getElementById('detStalls').innerText = stall.stalls;
            if (document.getElementById('detHours')) document.getElementById('detHours').innerText = stall.time;
            if (document.getElementById('detLastInsp')) document.getElementById('detLastInsp').innerText = stall.lastInspection || "Nov 20, 2024";
            
            if (stall.img && document.getElementById('heroImage')) {
                document.getElementById('heroImage').style.backgroundImage = `url(${stall.img})`;
            }

            // Mini Map Setup
            if (document.getElementById('miniMap')) {
                const miniMap = L.map('miniMap', {zoomControl: false, attributionControl: false}).setView([stall.lat, stall.lng], 15);  // Disabled the zoomControl and attributionControl to keep the UI clean
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(miniMap);   // Initialized a second Leaflet map instance specifically targeting the miniMap ID
                L.marker([stall.lat, stall.lng]).addTo(miniMap);
            }
        }
    }

    // --- 4. FILTER LISTENERS ---
    const search = document.getElementById('searchInput') || document.getElementById('listSearch');
    const grade = document.getElementById('gradeFilter') || document.getElementById('gradeFilterList');
    const region = document.getElementById('regionFilter');

    [search, grade, region].forEach(el => {
        if (el) el.addEventListener('input', applyFilters);
    });
};

// --- APPLY FILTERS ---
function applyFilters() {
    const searchEl = document.getElementById('searchInput') || document.getElementById('listSearch');
    const gradeEl = document.getElementById('gradeFilter') || document.getElementById('gradeFilterList');
    const regionEl = document.getElementById('regionFilter');

    // Use value retrieval, not assignment
    const term = searchEl ? searchEl.value.toLowerCase() : "";
    const gradeVal = gradeEl ? gradeEl.value : "all";
    const regionVal = regionEl ? regionEl.value : "all";

    const filtered = stalls.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(term);
        // Use === for comparison, NEVER a single =
        const matchesGrade = gradeVal === 'all' || s.grade === gradeVal;        
        const matchesRegion = regionVal === 'all' || s.region === regionVal;
        
        return matchesSearch && matchesGrade && matchesRegion;  // Used the logical AND (&&) operator. For a stall to show up, it must return true for the search match AND the grade match AND the region match.
    });

    updateUI(filtered);
}

function updateUI(data) {
    // Update Markers if Map exists
    if (markerLayer) {
        markerLayer.clearLayers();
        data.forEach(s => L.marker([s.lat, s.lng]).addTo(markerLayer).bindPopup(s.name));
    }
    
    // Update Cards if Container exists
    const container = document.getElementById('cardContainer');
    if (container) {
        const countText = document.getElementById('countText');
        if (countText) countText.innerText = `${data.length} Hawker centres found`;
        
        container.innerHTML = data.map(s => `
            <div class="card">
                <div class="card-img-container">
                    <img src="${s.img || 'https://via.placeholder.com/400x160'}" class="card-img">
                    <span class="grade-badge">🛡️ Grade ${s.grade}</span>
                </div>
                <div class="card-content">
                    <div class="card-title">${s.name}</div>
                    <div class="card-info">📍 ${s.address}</div>
                    <div class="card-btns">
                        <button class="btn-dir" onclick="location.href='HawkerFinder.html'">📍 Directions</button>
                        <button class="btn-view" onclick="goToDetails('${s.name}')">View Details ></button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function goToDetails(stallName) {
    window.location.href = `HawkerDetails.html?name=${encodeURIComponent(stallName)}`;
}