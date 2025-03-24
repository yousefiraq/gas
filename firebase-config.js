import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBf9FQ...", // 🔴 استبدل بمفتاحك
    authDomain: "gaz-delivery-1.firebaseapp.com",
    databaseURL: "https://gaz-delivery-1-default-rtdb.firebaseio.com/",
    projectId: "gaz-delivery-1",
    storageBucket: "gaz-delivery-1.appspot.com",
    messagingSenderId: "127631148400",
    appId: "1:127631148400:web:5eaaed244303ba3bbc3bb5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const realtimeDb = getDatabase(app);

export { db, collection, addDoc, realtimeDb, ref, onValue };
