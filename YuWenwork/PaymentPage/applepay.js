window.onload = function(){
    // 1. Trigger slide up animation
    this.document.getElementByID('applePaySheet').classList.add('show');

    // 2. Load total from localStorange (from cart)
    const data = JSON.parse(localStorage.getItem('canteenCart'))
    let total = 0
    for (const stall in data){
        data[stall].forEach(item => {
            if (item.qty > 0) total += item.price * item.qty;
        });
    }
    this.document.getElementByID('display-total').innerText = `$${total.toFixed(2)}`;
};

function simulatePayment(){
    const statusText = document.getElementById('statusText');
    const statusIcon = document.getElementById('statusIcon');
    const payBtn = document.querySelector('.pay-button');

    statusText.innerText = "Processing...";
    payBtn.style.display = "none";

    // Simulate a 2-second delay for faceId
    setTimeout(() =>{
        statusIcon.className = "fa-solid fa-cirle-check";
        statusIcon.parentElement.classList.add('success-state');
        statusText.innerText = "Payment Complete";
    },2000)
}