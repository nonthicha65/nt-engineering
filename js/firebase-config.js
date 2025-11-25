// Firebase Configuration
// ⚠️ แทนที่ค่าเหล่านี้ด้วยค่าจาก Firebase Console ของคุณ
const firebaseConfig = {
    apiKey: "AIzaSyB_qylditvP3Cxt7JECSRtP66dDWazYxBA",
    authDomain: "nt-engineering-data.firebaseapp.com",
    databaseURL: "https://console.firebase.google.com/project/nt-engineering-data/database/nt-engineering-data-default-rtdb/data/~2F?fb_gclid=CjwKCAiA_orJBhBNEiwABkdmjLJ--Vbq18Aa0V9y2qpJ3JZzylf77f9IQMcbKshkBnnP6ecXwigAHBoCJB4QAvD_BwE",
    projectId: "nt-engineering-data",
    storageBucket: "nt-engineering-data.firebasestorage.app",
    messagingSenderId: "232559601242",
    appId: "1:232559601242:web:4730822ac59c40e2d35a63"
};
 
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase Services
const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();

console.log('✅ Firebase initialized successfully');