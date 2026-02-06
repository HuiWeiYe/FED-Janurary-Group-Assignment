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

function goToCOllection(){
    window.location.href = ""
}