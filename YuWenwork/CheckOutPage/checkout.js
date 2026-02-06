// Add this at the bottom to make sure the cart loads when the page opens
window.onload = loadCheckout;
function loadCheckout(){
    const data = JSON.parse(localStorage.getItem("canteenCart"));
    const itemList = document.getElementById("item-list");
    let totalItems = 0;
    let totalPrice = 0;

    itemList.innerHTML ="";

    // Loop through all stalls and all items
    for (const stall in data){
        data[stall].forEach(item => {
            if (item.qty > 0){
                totalItems += item.qty;
                totalPrice += item.price * item.qty;

                const row = document.createElement("div");
                row.className = "item-row";
                row.innerHTML = `
                    <span>${item.name}:</span>
                    <span>${item.qty} x $${item.price.toFixed(2)}</span>
                `;
                itemList.appendChild(row);
            }
        });
    }

    document.getElementById("total-items-count").innerText = `Total Item: ${totalItems}`;
    document.getElementById("order-total-price").innerText = `Order Total: $${totalPrice.toFixed(2)}`;
}

function goToCollection(){
    window.location.href = "../Delivery/DeliveryPage.html"
}

// Function to handle payment button clicks
function processPayment(method) {
    if (method === 'Apple Pay') {
        // Navigates out of CheckOutPage folder and into PaymentPage folder
        window.location.href = "../PaymentPage/ApplePay.html";
    }
}