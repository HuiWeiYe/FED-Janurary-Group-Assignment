// Button references
const pickUpBtn = document.getElementById('pickUpBtn');
const deliveryBtn = document.getElementById('deliveryBtn');
const confirmBtn = document.querySelector('.confirm-btn');

// Helper functions
function setActive(activeBtn, inactiveBtn){
    activeBtn.classList.add('active');
    inactiveBtn.classList.remove('active');
}

function clearMap() {
    map.eachLayer(function(layer) {
        if (layer instanceof L.Marker || layer instanceof L.Polyline) {
            map.removeLayer(layer);
        }
    });
}

function showDeliveryBox(){
    const deliverBox = document.querySelector('.delivery-time-box')
    const pickupBox = document.querySelector('.pickUp-time-box');

    if (deliveryBox) deliveryBox.style.display = 'flex';
    if (pickupBox) pickupBox.style.display = 'none';
}

function showPickUpBox(){
    const deliveryBox = document.querySelector('.delivery-time-box')
    const pickupBox = document.querySelector('.pickUp-time-box');

    if (deliveryBox) deliveryBox.style.display = 'none';
    if (pickupBox) pickupBox.style.display = 'flex';
}

// Leaflet API           
// 1. Initialize the mape and set its view (coordinates for bukit batok area from the image)
// [latitude, longitue], Zoom level
var map = L.map('map').setView([1.3490, 103.7537], 15);

// 2. Add OpenStreetMap tiles (the actual map graphics)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

          // --- Delivery Method ---
// 3. Add a marker for the delivery destination
if(deliveryBtn){
    deliveryBtn.addEventListener('click', () =>{
    setActive(deliveryBtn, pickUpBtn);
    showDeliveryBox();
    clearMap();

    document.querySelector('.info-block label').textContent = "Delivery Address:";
    document.querySelector('.info-block p').textContent = "123 West Lane, Blk 446";

    if (confirmBtn) confirmBtn.textContent = "Confirm Delivery";

    const deliveryLocation = [1.3490, 103.7537];
     map.setView(deliveryLocation, 15); // This moves the camera back!

    var marker = L.marker([1.3490, 103.7537]).addTo(map);
    marker.bindPopup("<b>Delivery Address</b><br>123 West Lane, Blk 446").openPopup();

    // 4. Draw the Blue Route Line (Polyline)
    var routePoints = [
        [1.3400, 103.7500],
        [1.3450, 103.7520],
        [1.3490, 103.7537]
    ];
    var polyline = L.polyline(routePoints, {
        color: '#1a73e8',
        weight: 6,
        opacity: 0.8
    }).addTo(map);
});
}
                       // --- Pick Up Method ---
pickUpBtn.addEventListener('click', () =>{
    setActive(pickUpBtn, deliveryBtn);
    showPickUpBox();
    clearMap();

    // Update Buttons
    pickUpBtn.classList.add('active');
    deliveryBtn.classList.remove('active');

    // 2. Update text to Store Location
    document.querySelector('.info-block label').textContent = "Store Location:";
    document.querySelector('.info-block p').textContent = "456 West lane, JEM #1-09";

    if (confirmBtn) confirmBtn.textContent = "Confirm PickUp";

    // Coordinates for store address
    var storeLocation = [1.3335, 103.7431];

    // move the map view to the store location
    map.setView(storeLocation, 16);

    var storeMarker = L.marker(storeLocation).addTo(map);
    storeMarker.bindPopup("<b>Store Location</b><br>West 234 lane, JEM #3-10").openPopup()
});

document.querySelector('.confirm-btn').addEventListener('click', () =>{
    // Check which button has the 'active' class to know the method
    const isDelivery = document.getElementById('deliveryBtn').classList.contains('active');
    const method = isDelivery ? "Delivery" : "Pick Up"

    // Save the choice to local storage
    localStorage.setItem("chosenCollectionMethod", method);

    // Redirect to Payment Confirmed
    window.location.href = "confirmation.html";
});

setTimeout(function() {
    map.invalidateSize();
}, 200);