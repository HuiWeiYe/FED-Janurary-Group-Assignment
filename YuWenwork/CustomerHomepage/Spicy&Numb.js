const menuItems = [
    {name: "Sausage", price:1.20, img: "images/sausage.jpg"},
    {name: "Maggi Mee", price:2.00, img: "images/Maggi Mee.jpg"},
    {name: "Lotus Root", price:1.50, img: "images/Lotus Root.jpg"},
    {name: "Corn", price:1.50, img: "images/corn.webp"},
    {name: "Potato", price:2.30, img: "images/Potato.jpg"},
    {name: "Enoki Mushroom", price:1.50, img: "images/Enoki Mushrrom.jpg"}
];

const itemsGrid = document.getElementById("itemsGrid");
menuItems.forEach(item  => {
    const card = document.createElement("div");
    card.classList.add("item-card");

    card.innerHTML = `
    <img src="${item.img}`
})