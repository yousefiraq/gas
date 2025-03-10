import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// استبدل هذه القيم بمعلومات مشروعك من Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyBf9FQ...", // 🔑 مفتاحك هنا
    authDomain: "gaz-delivery-1.firebaseapp.com",
    projectId: "gaz-delivery-1",
    storageBucket: "gaz-delivery-1.appspot.com",
    messagingSenderId: "127631148400",
    appId: "1:127631148400:web:5eaaed244303ba3bbc3bb5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, addDoc };
