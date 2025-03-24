import { db, collection, addDoc, realtimeDb, ref, onValue } from "./firebase-config.js";

// ------ جلب العبارة الديناميكية من Firebase ------
const dynamicNoteElement = document.getElementById('dynamicNote');

function fetchDynamicNote() {
    const noteRef = ref(realtimeDb, 'orders/A/notes/current_note');
    
    onValue(noteRef, (snapshot) => {
        const noteText = snapshot.val();
        dynamicNoteElement.textContent = noteText || "خدمة توصيل الغاز الوطني";
    }, (error) => {
        console.error('خطأ في جلب العبارة:', error);
        dynamicNoteElement.textContent = "مرحبًا بكم في خدمة التوصيل";
    });
}

// ------ تهيئة التاريخ ------
document.getElementById('orderDate').value = new Date().toLocaleDateString('ar-IQ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
});

// ------ تهيئة الخريطة ------
const platform = new H.service.Platform({
    apikey: "7kAhoWptjUW7A_sSWh3K2qaZ6Lzi4q3xaDRYwFWnCbE"
});

let userLatitude = null;
let userLongitude = null;
let isLocationSet = false;
const locationButton = document.getElementById("getLocation");
const spinner = document.querySelector(".loading-spinner");

// ------ أحداث تحديد الموقع ------
locationButton.addEventListener("click", () => {
    if (isLocationSet) {
        alert("تم تحديد الموقع مسبقًا!");
        return;
    }
    
    if (navigator.geolocation) {
        locationButton.disabled = true;
        locationButton.textContent = "جاري التحديد...";
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLatitude = position.coords.latitude;
                userLongitude = position.coords.longitude;
                isLocationSet = true;
                showMap(userLatitude, userLongitude);
                locationButton.textContent = "✓ تم التحديد";
                locationButton.style.backgroundColor = "#28a745";
            },
            (error) => {
                let errorMessage = "خطأ: ";
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += "الوصول إلى الموقع مرفوض.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += "الموقع غير متاح.";
                        break;
                    case error.TIMEOUT:
                        errorMessage += "انتهى الوقت المحدد.";
                        break;
                }
                alert(errorMessage);
                locationButton.disabled = false;
                locationButton.textContent = "تحديد الموقع";
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    } else {
        alert("المتصفح لا يدعم تحديد الموقع.");
    }
});

// ------ إرسال الطلب ------
document.getElementById("orderForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    spinner.style.display = "block";

    const formData = {
        name: document.getElementById("name").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        province: document.getElementById("province").value,
        pipes: document.getElementById("pipes").value,
        orderDate: new Date().toISOString()
    };

    if (!isLocationSet || formData.phone.length !== 11 || !Object.values(formData).every(value => value)) {
        spinner.style.display = "none";
        alert("يرجى تعبئة جميع الحقول بشكل صحيح!");
        return;
    }

    try {
        await addDoc(collection(db, "orders"), {
            ...formData,
            latitude: userLatitude,
            longitude: userLongitude,
            status: "قيد الانتظار",
            timestamp: new Date()
        });
        alert("تم إرسال الطلب بنجاح!");
        document.getElementById("orderForm").reset();
        resetMap();
        isLocationSet = false;
        locationButton.textContent = "تحديد الموقع";
        locationButton.style.backgroundColor = "#218838";
    } catch (error) {
        console.error("خطأ في الإرسال:", error);
        alert("حدث خطأ أثناء الإرسال!");
    } finally {
        spinner.style.display = "none";
    }
});

// ------ الدوال المساعدة ------
function showMap(lat, lng) {
    const mapContainer = document.getElementById('map');
    const defaultLayers = platform.createDefaultLayers();
    const map = new H.Map(mapContainer, defaultLayers.vector.normal.map, {
        center: { lat: lat, lng: lng },
        zoom: 14,
        pixelRatio: window.devicePixelRatio || 1
    });
    new H.map.Marker({ lat: lat, lng: lng }).addTo(map);
    window.addEventListener('resize', () => map.getViewPort().resize());
}

function resetMap() {
    document.getElementById('map').innerHTML = '';
}

// ------ تشغيل الدوال عند التحميل ------
window.addEventListener('DOMContentLoaded', fetchDynamicNote);
