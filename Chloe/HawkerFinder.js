const stalls = [
    { name: "Old Airport Road Western Food", address: "51 Old Airport Road, S390051", time: "6 AM - 11 PM", stalls: 2, grade: "A", region: "East", lat: 1.3084, lng: 103.8858 },
    { name: "Bedok South Market", address: "16 Bedok South Road, S460016", time: "6 AM - 9 PM", stalls: 55, grade: "A", region: "East", lat: 1.3200, lng: 103.9300 },
    { name: "Newton Food Centre", address: "500 Clemenceau Ave N, S229495", time: "12 PM - 2 AM", stalls: 80, grade: "B", region: "Central", lat: 1.3123, lng: 103.8392 }
];

let map, markerLayer;

window.onload = () => {
    // 1. Setup Map if on Map Page
    if (document.getElementById('map')) {
        map = L.map('map').setView([1.3521, 103.8198], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
        markerLayer = L.layerGroup().addTo(map);
        updateUI(stalls);
    }

    // 2. Setup List if on List Page
    if (document.getElementById('cardContainer')) {
        updateUI(stalls);
    }

    // 3. Search & Filter Listeners
    const search = document.getElementById('searchInput') || document.getElementById('listSearch');
    const grade = document.getElementById('gradeFilter') || document.getElementById('gradeFilterList');

    [search, grade].forEach(el => {
        if (el) el.addEventListener('input', () => {
            const term = search.value.toLowerCase();
            const gradeVal = grade.value;
            const filtered = stalls.filter(s => 
                s.name.toLowerCase().includes(term) && 
                (gradeVal === 'all' || s.grade === gradeVal)
            );
            updateUI(filtered);
        });
    });
};

function updateUI(data) {
    if (markerLayer) { // Map Update
        markerLayer.clearLayers();
        data.forEach(s => L.marker([s.lat, s.lng]).addTo(markerLayer).bindPopup(s.name));
    }
    
    const container = document.getElementById('cardContainer');
    if (container) { // List Update
        document.getElementById('countText').innerText = `${data.length} Hawker centres found`;
        container.innerHTML = data.map(s => `
            <div class="card">
                <div style="height:160px; background:#ccc; display:flex; align-items:center; justify-content:center;">Image of ${s.name}</div>
                <div class="card-content">
                    <div class="card-title">${s.name}</div>
                    <div class="card-info">📍 ${s.address}</div>
                    <div class="card-info">🕒 ${s.time}</div>
                    <div class="card-btns"><button class="btn-dir">Directions</button><button class="btn-view">View Details</button></div>
                </div>
            </div>
        `).join('');
    }
}

function applyFilters() {
    const searchTerm = (document.getElementById('searchInput') || document.getElementById('listSearch')).value.toLowerCase();
    const gradeVal = (document.getElementById('gradeFilter') || document.getElementById('gradeFilterList')).value;
    const regionVal = document.getElementById('regionFilter') ? document.getElementById('regionFilter').value : 'all';

    const filteredData = stalls.filter(stall => {
        const matchesSearch = stall.name.toLowerCase().includes(searchTerm);
        const matchesGrade = gradeVal === 'all' || stall.grade === gradeVal;
        const matchesRegion = regionVal === 'all' || stall.region === regionVal;
        
        return matchesSearch && matchesGrade && matchesRegion;
    });

    updateUI(filteredData);
}