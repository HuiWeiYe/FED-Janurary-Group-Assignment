// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyB5pd5cJ88oj_Otwew2X_byVKBb6FTUuHA",
  authDomain: "fed-asg-1.firebaseapp.com",
  projectId: "fed-asg-1",
  storageBucket: "fed-asg-1.firebasestorage.app",
  messagingSenderId: "405182077180",
  appId: "1:405182077180:web:ad9bea1328ad19c90f9f79"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Initialize Services
const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence (optional but recommended)
db.enablePersistence()
  .catch((err) => {
    if (err.code == 'failed-precondition') {
      console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code == 'unimplemented') {
      console.log('Browser does not support persistence');
    }
  });

console.log('Firebase initialized successfully');