import { db, collection, addDoc } from "./firebase-config.js";

const platform = new H.service.Platform({
    apikey: "7kAhoWptjUW7A_sSWh3K2qaZ6Lzi4q3xaDRYwFWnCbE"
});

let userLatitude = null;
let userLongitude = null;
let isLocationSet = false;
const locationButton = document.getElementById("getLocation");

// تحديد الموقع الجغرافي
locationButton.addEventListener("click", () => {
    if (isLocationSet) {
        alert("تم تحديد الموقع مسبقاً!");
        return;
    }
    
    if (navigator.geolocation) {
        locationButton.disabled = true;
        locationButton.textContent = "تم تحديد";
        
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
                let errorMessage = "خطأ في تحديد الموقع: ";
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += "تم رفض الإذن. يرجى تمكين الموقع من إعدادات المتصفح.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += "الموقع غير متاح.";
                        break;
                    case error.TIMEOUT:
                        errorMessage += "انتهى الوقت المخصص للتحديد.";
                        break;
                }
                alert(errorMessage);
                locationButton.disabled = false;
                locationButton.textContent = "تحديد الموقع";
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        alert("المتصفح لا يدعم تحديد الموقع.");
    }
});

// عرض الخريطة
function showMap(lat, lng) {
    const mapContainer = document.getElementById('map');
    const defaultLayers = platform.createDefaultLayers();
    const map = new H.Map(mapContainer, defaultLayers.vector.normal.map, {
        center: { lat: lat, lng: lng },
        zoom: 14
    });
    new H.map.Marker({ lat: lat, lng: lng }).addTo(map);
}

// إرسال الطلب
document.getElementById("orderForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {
        name: document.getElementById("name").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        province: document.getElementById("province").value,
        pipes: document.getElementById("pipes").value
    };

    // التحقق من البيانات
    if (!isLocationSet) {
        return alert("يجب تحديد الموقع أولاً!");
    }
    if (formData.phone.length !== 11) {
        return alert("رقم الهاتف غير صحيح!");
    }
    if (!Object.values(formData).every(value => value)) {
        return alert("يرجى ملء جميع الحقول!");
    }

    // إرسال إلى Firebase
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
        locationButton.textContent = "تحديد الموقع";
        locationButton.style.backgroundColor = "#218838";
        isLocationSet = false;
    } catch (error) {
        console.error("Error:", error);
        alert("حدث خطأ أثناء الإرسال!");
    }
});
