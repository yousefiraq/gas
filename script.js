import { db, collection, addDoc } from "./firebase-config.js";

const platform = new H.service.Platform({
    apikey: "7kAhoWptjUW7A_sSWh3K2qaZ6Lzi4q3xaDRYwFWnCbE"
});

let userLocation = { lat: null, lng: null };
let isLocationLocked = false;

document.getElementById("getLocation").addEventListener("click", async () => {
    if (isLocationLocked) return alert("✓ تم تأكيد الموقع مسبقاً");
    
    try {
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000
            });
        });
        
        userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        };
        
        renderMap(userLocation.lat, userLocation.lng);
        isLocationLocked = true;
        document.getElementById("getLocation").textContent = "✓ تم تحديد الموقع";
        
    } catch (error) {
        alert(`❌ خطأ: ${error.message || "تأكد من تفعيل الموقع"}`);
    }
});

function renderMap(lat, lng) {
    const map = new H.Map(
        document.getElementById('map'),
        platform.createDefaultLayers().vector.normal.map,
        { center: { lat, lng }, zoom: 15 }
    );
    new H.map.Marker({ lat, lng }).addTo(map);
}

document.getElementById("orderForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const spinner = document.querySelector(".loading-spinner");
    
    const orderData = {
        name: document.getElementById("name").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        province: document.getElementById("province").value,
        pipes: document.getElementById("pipes").value,
        timestamp: new Date().toLocaleString("ar-IQ"),
        location: userLocation
    };

    // التحقق من البيانات
    if (!isLocationLocked) return alert("❗ الرجاء تحديد الموقع أولاً");
    if (orderData.phone.length !== 11) return alert("📱 رقم الهاتف غير صحيح");
    
    try {
        spinner.style.display = "block";
        await addDoc(collection(db, "orders"), orderData);
        alert("✅ تم إرسال الطلب بنجاح");
        document.getElementById("orderForm").reset();
        isLocationLocked = false;
        document.getElementById("getLocation").textContent = "📍 تحديد الموقع";
    } catch (error) {
        alert("❌ فشل الإرسال: " + error.message);
    } finally {
        spinner.style.display = "none";
    }
});
