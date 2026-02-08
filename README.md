# FED-Janurary-Group-Assignment
Hawker Centre Website
# Hawker Centre Management System (Front-End)

A front-end web application designed to support the management and operation of Singapore hawker centres.  
The system serves **vendors**, **patrons**, and **NEA officers**, providing tools for ordering, stall management, customer engagement, and regulatory compliance.

This project was developed as part of the **Front-End Development (FED) module**.

---

## 📌 Overview

The Hawker Centre Management System aims to improve transparency, efficiency, and user experience within hawker centres by:

- Allowing patrons to browse menus, place orders, and leave feedback
- Enabling vendors to manage stalls, menus, and view performance insights
- Supporting NEA officers in inspection tracking and hygiene monitoring

The application focuses on **responsive design**, **usability**, and **front-end interactivity** using HTML, CSS, and JavaScript.

---

## ✨ Key Features

### 👤 User Account Management
- Vendors can create accounts to manage stalls, menus, and orders
- Patrons can register for personalized features or place orders as guests

### 🛒 Ordering & Checkout
- Add menu items to cart and complete checkout
- Separate orders handled for different vendors
- Optional add-ons and extra charges (e.g. packaging, delivery)

### ❤️ Customer Engagement
- Vendor ratings and reviews
- Likes for individual menu items
- Customer feedback submission (ratings and comments)

### 🧑‍🍳 Vendor Management
- Menu management with support for multiple cuisines per item
- Stall performance dashboard

### 🧾 Regulatory & Compliance
- Inspection scheduling and logging by NEA officers
- Recording of inspection scores, remarks, and hygiene grades
- Display of historical hygiene grades for transparency

### 📊 Analytics & Reporting
- Customer satisfaction dashboard (feedback and complaints)
- Inspection trends and hygiene grade history

---

## 👥 User Roles

- **Customers**  
  Browse stalls and menus, place orders as registered users or guests,
  and submit feedback, ratings, and likes.

- **Vendors**  
  Manage stall information, menus, rental agreements, and view stall
  performance dashboards.

- **NEA Officers**  
  Conduct inspections, record hygiene scores and remarks, and view
  historical inspection records.

- **Administrators**  
  Manage system-level data and oversee user accounts, including
  vendors, patrons, and NEA officers, through a centralized admin interface.

---

## 🛠 Technologies Used

- **HTML5** – semantic markup and accessibility
- **CSS3** – responsive layout and styling
- **JavaScript (ES6)** – front-end interactivity and dynamic behaviour
- **Leaflet.js** – interactive map rendering and location visualisation
- **Firebase** – authentication and cloud-based data storage
- **Git & GitHub** – version control and collaboration
- **GitHub Pages** – deployment platform

---

## 🚀 Deployment

The application is deployed using **GitHub Pages**.

🔗 **Live Demo:**  
> https://<your-github-username>.github.io/<repository-name>/

---

## 📁 Project Structure

```plaintext
/
├── README.md
├── structure.txt
├── credits.html
├── Chloe
│   ├── Conduct-Inspection.css
│   ├── Conduct-Inspection.html
│   ├── Conduct-Inspection.js
│   ├── Data.js
│   ├── firebase-config.js
│   ├── HawkerDetails.html
│   ├── HawkerFinder.css
│   ├── HawkerFinder.html
│   ├── HawkerFinder.js
│   ├── HawkerList.html
│   ├── Inspector.css
│   ├── Inspector.html
│   └── Inspector.js
├── Harsika
│   ├── customer_feedback.html
│   ├── customer_feedback.js
│   ├── dashboard.css
│   ├── dashboard.html
│   ├── dashboard.js
│   ├── popular_products.html
│   ├── sales_analytics.html
│   └── sales_analytics.js
├── Lai Yan
│   ├── css
│   │   ├── admin-management.css
│   │   ├── global.css
│   │   ├── home.css
│   │   ├── index.css
│   │   ├── login.css
│   │   ├── menu-management.css
│   │   └── profile.css
│   ├── images
│   ├── index.html
│   ├── js
│   │   ├── admin-management.js
│   │   ├── auth.js
│   │   ├── avatar-helper.js
│   │   ├── firebase-config.js
│   │   ├── menu-management.js
│   │   ├── profile.js
│   │   ├── role-manager.js
│   │   └── stall-menu.js
│   └── pages
│       ├── admin-management.html
│       ├── customer-home.html
│       ├── login.html
│       ├── menu-management.html
│       ├── nea-home.html
│       ├── profile.html
│       ├── register.html
│       ├── stall-menu.html
│       └── vendor-home.html
├── WeiYeWork
│   ├── CustomerSample.json
│   ├── Reviews.css
│   ├── Reviews.html
│   ├── Reviews.js
│   ├── ReviewsComments.css
│   ├── ReviewsComments.html
│   └── ReviewsComments.js
└── YuWenwork
    ├── CheckOutPage
    │   ├── Checkout.css
    │   ├── Checkout.html
    │   └── checkout.js
    ├── CustomerHomepage
    │   ├── Assignment.html
    │   ├── assignment.js
    │   ├── KingOfNoodle.html
    │   ├── Mala.css
    │   ├── Spicy&Numb.html
    │   ├── Spicy&Numb.js
    │   ├── stalls.css
    │   ├── stalls.html
    │   ├── style.css
    │   └── WesternDelights.html
    ├── Delivery
    │   ├── confirmdelivery.css
    │   ├── DeliveryPage.html
    │   └── deliverypage.js
    └── PaymentPage
        ├── applepay.css
        ├── ApplePay.html
        └── applepay.js

14 directories, 75 files

