const stallNames = {
    "Spicy&Numb.html": "Spicy & Numb",
    "KingOfNoodle.html": "King Of Noodle",
    "WesternDelights.html": "Western Delights",
}
const allStallMenu = {
    "Spicy&Numb.html":[
    {name: "Sausage", price:1.20, qty: 0,img: "https://static.vecteezy.com/system/resources/thumbnails/038/144/798/small_2x/ai-generated-tasty-goodness-sausages-isolated-on-white-background-photo.jpg"},
    {name: "Maggi Mee", price:2.00, qty: 0,img: "https://m.media-amazon.com/images/I/61axCDVehZL.__AC_SY300_SX300_QL70_ML2_.jpg"},
    {name: "Lotus Root", price:1.50, qty: 0,img: "https://www.thespruceeats.com/thmb/kpt7oOfWY_nYoHf4cHIQdzqcJdc=/2121x1414/filters:no_upscale():max_bytes(150000):strip_icc()/antpkr-ee31ee7c1ab5494480b004be970c6019.jpg"},
    {name: "Corn", price:1.50, qty: 0,img: "https://th.bing.com/th/id/R.30db0cce9b92c24627620a5aa8eb9565?rik=SML5Z%2b0Tlyq9Lg&riu=http%3a%2f%2fpngimg.com%2fuploads%2fcorn%2fcorn_PNG5293.png&ehk=uFUcHy2Pca021l3tUTRY8Lw8bcN2olQCjcJm1hwCLBY%3d&risl=1&pid=ImgRaw&r=0"},
    {name: "Potato", price:2.30, qty: 0,img: "https://th.bing.com/th/id/R.fb9c2752eb6f791a41d3336168edd187?rik=HeRvSZWC8Hi8cw&riu=http%3a%2f%2fwww.homifreez.com%2fpictures%2flist%2f385_detail.jpg%3f1392200807&ehk=k5%2beKOTYKH2aDkTKq4Z%2fXYRotDVAOkqb22fYMVfGH%2fY%3d&risl=&pid=ImgRaw&r=0"},
    {name: "Enoki Mushroom", price:1.50, qty: 0,img: "https://th.bing.com/th/id/R.9a8a231f10a205a8d5a1d66377ac07e5?rik=OJXlcBUGbnz4sQ&riu=http%3a%2f%2fwww.chinasichuanfood.com%2fwp-content%2fuploads%2f2016%2f01%2fEnoki-mushrooms-steamed-with-garlic_.jpg&ehk=70FtGFp%2bTFye%2bAfhYc5bAMyuOLgz63xAcNjwEBmyVV8%3d&risl=&pid=ImgRaw&r=0"},
    {name: "MeatBall", price: 1.00, qty: 0, img: "https://c8.alamy.com/comp/EATTXM/raw-uncooked-meatballs-on-a-isolated-white-background-EATTXM.jpg"},
    {name: "Luncheon Meat", price: 1.10, qty: 0, img: "https://thefrenchgrocer.com/wp-content/uploads/2024/06/Luncheon_Meat-450x300.png"}
    ],

    "KingOfNoodle.html":[
        {name: "Chicken Noodle Soup", price: 5.70, qty: 0, img: "https://tse2.mm.bing.net/th/id/OIP.5TRIHfaBWv-m8tjBSvLTEgHaKX?rs=1&pid=ImgDetMain&o=7&rm=3"},
        {name: "Wonton Noodles (dry)", price: 6.00, qty: 0, img:"https://th.bing.com/th/id/R.e12eb2a96a34659455481f0e216c9fb3?rik=LLUOeiYGlF549A&riu=http%3a%2f%2fdelishar.com%2fwp-content%2fuploads%2f2013%2f10%2fwanton-noodle--1080x1386.jpg&ehk=FKemcJvDIbRxq0%2fU7jNfTqO9NfbP0c5qnvtMCsnQlP4%3d&risl=&pid=ImgRaw&r=0"},
        {name: "Wonton Noodles (wet)", price: 6.50, qty: 0, img:"https://tasteasianfood.com/wp-content/uploads/2017/04/WT-square-bowl.jpg"},
        {name: "Chow Mein", price: 5.90, qty: 0, img:"https://laurenslatest.com/wp-content/uploads/2021/04/chow-mein-12-scaled.jpg"},
        {name: "Fried Bee Hoon", price: 5.40, qty: 0, img:"https://tse2.mm.bing.net/th/id/OIP.hsMHcSYDRlaiRnBuVllZGwHaEK?rs=1&pid=ImgDetMain&o=7&rm=3"},
        {name: "Meepok", price: 4.90, qty: 0, img:"https://eatbook.sg/wp-content/uploads/2020/01/Hosay-Mee-Pok-Mee-Pok-intro-shot.jpg"},
        {name: "Laksa", price: 4.50, qty: 0, img:"https://www.chngkees.com.sg/image/catalog/project/recipes/Laksa.jpg"}
    ],

    "WesternDelights.html":[
        {name: "Black Pepper Chicken Chop", price: 7.00, qty: 0, img:"https://chiefeater.com/wp-content/uploads/2024/10/lau_yew_sp_hawker_centre_oct2024_davidleesp_01.jpg"},
        {name: "Creamy Carbonara Pasta", price: 5.90, qty: 0, img:"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj7EhzGin5hXLm-1VWPj8ccNltsTPca5m7MNQAfLURWTV4NC_eaLn9J-DshUFippBO3nPDqqxD5vEcX6uzg7jGpkSjzUbiRGxc_gBeWD65ddXnDiASBzY1_Y0Mx0ISDsqhQOrCrPqC-AKg/w640-h640/Meet+4+Meat+Carbonara+1.jpg"},
        {name: "Aglio Olio Pasta", price: 6.00, qty: 0, img:"https://therecipecritic.com/wp-content/uploads/2024/11/spaghetti-aglio-e-olio-2.jpg"},
        {name: "Fried Chicken Wing", price: 6.00, qty: 0, img:"https://tse3.mm.bing.net/th/id/OIP.ypIDRyYFbMxvGzyKujNbsAHaJ4?rs=1&pid=ImgDetMain&o=7&rm=3"},
        {name: "Fish & Chips", price: 7.00, qty: 0, img:"https://media.timeout.com/images/103696698/image.jpg"},
        {name: "Mushroom Soup", price: 3.00, qty: 0, img:"https://bigoven-res.cloudinary.com/image/upload/t_recipe-1280/mushroom-soup-f2e36e.jpg"}
    ]
};
const filename = decodeURIComponent(window.location.pathname.split("/").pop().trim()); 
//window.location.pathname: Gets the full path (e.g., /folder/subfolder/WesternDelights.html).
//.split("/"): Breaks that path into a list whenever there is a slash: ["", "folder", "subfolder", "WesternDelights.html"].
const currentPage = filename ==="" ? "Spicy&Numb.html":filename

// 2. PERSISTENCE LOGIC: Load from LocalStorage or use the default allStallMenu
// We store the WHOLE object so items in "KingOfNoodle" stay saved even while you are on "WesternDelights"
const storedData = localStorage.getItem("canteenCart");
const masterMenu = storedData ? JSON.parse(storedData) : allStallMenu;

// 3. Link this page's items to our master list
const menuItems = masterMenu[currentPage];

const headerTitle = document.querySelector(".menu-header h1")
if (headerTitle && stallNames[currentPage]){
    headerTitle.innerText = stallNames[currentPage];
}

const itemsGrid = document.getElementById("itemsGrid");
const totalDisplay = document.getElementById("totalDisplay");

const backButton = document.querySelector('.back-nav');
if (backButton){
    backButton.style.cursor = "pointer";
    backButton.addEventListener('click', () =>{
        window.history.back();
    })
}

function renderMenu(){
    if (!itemsGrid) return; // safety check
    itemsGrid.innerHTML = ""; // clear grid
    let grandTotal = 0;
    
    menuItems.forEach((item, index)=> {
        grandTotal += item.price*item.qty
        // creates a new <div> in memory, but it's not yet part of the page
        const card = document.createElement("div");
        card.classList.add("item-card");

        // Logic for the reveal: 
        // if qty is 0, only show plus symbol
        // if qty > 0, show the minus, number and plus sign 
        let controllayout = "";
        if (item.qty === 0){
            controllayout = `
            <div class="controls">
                 <span class="qty-circle" onclick="changeQty(${index}, 1)">+</span>
            </div>
            `
        } 
        else {
            controllayout = `
            <div class="controls">
            <span class="minus-symbol" onclick="changeQty(${index}, -1)">-</span>
            <span class="qty-number">${item.qty}</span> 
            <span class="qty-circle" onclick="changeQty(${index}, 1)">+</span>
            </div>
            `;
        }

        //fills that <div> with item's html (image, name, price)
        card.innerHTML = `
            <img src="${item.img}" alt="${item.name}" class="menu-img">
            <h3>${item.name}</h3>
            <div class="price-row">
               <p class="price">$${item.price.toFixed(2)}</p>
               ${controllayout}
            </div>
        `;
        itemsGrid.appendChild(card);
        // actually inserts that <div> into the <div id="itemsGrid"></div> in html so that it becomes visible
        // without appendchild, new element would only exist in JavaScript memory, browser would not render it
        });
        totalDisplay.innerText = `$${grandTotal.toFixed(2)}`;
}

//Function to update quantity
window.changeQty = (index, amount) => {
    menuItems[index].qty += amount;

    // ensure qty never goes below 0
    if (menuItems[index].qty < 0) menuItems[index].qty = 0

    // SAVE: Put the updated masterMenu into localStorage
    localStorage.setItem("canteenCart", JSON.stringify(masterMenu));

    renderMenu(); // redraw everything
};

// Add this at the very bottom of your JS file
const checkoutBar = document.getElementById("checkoutBar");

if (checkoutBar) {
    checkoutBar.addEventListener("click", () => {
        // This takes the user to your second image page
        // Adjust the path if your checkout file is in a different folder
        window.location.href = "../CheckOutPage/Checkout.html"; 
    });
}
// initial draw
renderMenu();