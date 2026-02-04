// Initialize map centered on Singapore
var map = L.map('map').setView([1.3521, 103.8198], 12);

// Add the visual map layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// Data Array (Your "Database")
const stalls = [
    { name: "Newton Food Centre", lat: 1.3123, lng: 103.8392, grade: "A", region: "Central" },
    { name: "Maxwell Food Centre", lat: 1.2807, lng: 103.8447, grade: "B", region: "South" },
    { name: "Chomp Chomp", lat: 1.3541, lng: 103.8671, grade: "A", region: "North" },
    { name: "East Coast Lagoon", lat: 1.3071, lng: 103.9354, grade: "C", region: "East" }
];

let currentMarkers = L.layerGroup().addTo(map);

function renderMarkers(data) {
    currentMarkers.clearLayers();
    data.forEach(stall => {
        // Simple marker with a popup
        L.marker([stall.lat, stall.lng])
            .addTo(currentMarkers)
            .bindPopup(`<b>${stall.name}</b><br>Grade: ${stall.grade}`);
    });
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const gradeVal = document.getElementById('gradeFilter').value;
    const regionVal = document.getElementById('regionFilter').value;

    const filtered = stalls.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(searchTerm);
        const matchesGrade = gradeVal === 'all' || s.grade === gradeVal;
        const matchesRegion = regionVal === 'all' || s.region === regionVal;
        return matchesSearch && matchesGrade && matchesRegion;
    });

    renderMarkers(filtered);
}

// Event Listeners
document.getElementById('searchBtn').addEventListener('click', applyFilters);
document.getElementById('gradeFilter').addEventListener('change', applyFilters);
document.getElementById('regionFilter').addEventListener('change', applyFilters);

// Initial Load
renderMarkers(stalls);