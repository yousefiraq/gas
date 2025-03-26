import { db, collection, addDoc, doc, onSnapshot } from "./firebase-config.js";

// ------ عرض النص الديناميكي من Firestore ------ //
const fetchDynamicNote = () => {
    const noteRef = doc(db, "orders", "A", "notes", "current_note");
    onSnapshot(noteRef, (snapshot) => {
        if (snapshot.exists()) {
            const noteData = snapshot.data();
            document.getElementById("dynamicNote").innerHTML = `
                <p style="margin: 0; font-weight: 500;">${noteData.text}</p>
            `;
        } else {
            console.log("⚠️ لا يوجد نص مخصص!");
        }
    });
};
fetchDynamicNote();

// ------ تحديث التاريخ بتنسيق عربي ------ //
document.getElementById('orderDate').textContent = new Date().toLocaleDateString('ar-IQ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});

// ------ تحسين دقة الموقع ------ //
const platform = new H.service.Platform({
    apikey: "7kAhoWptjUW7A_sSWh3K2qaZ6Lzi4q3xaDRYwFWnCbE"
});

let userLatitude = null;
let userLongitude = null;
let isLocationSet = false;
const locationButton = document.getElementById("getLocation");
const spinner = document.querySelector(".loading-spinner");

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
                userLatitude = position.coords.latitude.toFixed(6); // دقة 6 خانات عشرية
                userLongitude = position.coords.longitude.toFixed(6);
                isLocationSet = true;
                showMap(userLatitude, userLongitude);
                locationButton.textContent = "✓ تم التحديد بدقة";
                locationButton.style.backgroundColor = "#28a745";
            },
            (error) => {
                let errorMessage = "خطأ في تحديد الموقع: ";
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += "يُرجى تفعيل GPS لتحسين الدقة!";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += "الموقع غير متاح.";
                        break;
                    case error.TIMEOUT:
                        errorMessage += "انتهى الوقت المخصص.";
                        break;
                }
                alert(errorMessage);
                locationButton.disabled = false;
                locationButton.textContent = "تحديد الموقع";
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    } else {
        alert("المتصفح لا يدعم تحديد الموقع.");
    }
});

// ------ عرض الخريطة ------ //
function showMap(lat, lng) {
    const mapContainer = document.getElementById('map');
    const defaultLayers = platform.createDefaultLayers();
    const map = new H.Map(mapContainer, defaultLayers.vector.normal.map, {
        center: { lat: lat, lng: lng },
        zoom: 14
    });
    new H.map.Marker({ lat: lat, lng: lng }).addTo(map);
}

// ------ إرسال الطلب ------ //
document.getElementById("orderForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    spinner.style.display = "block";

    const formData = {
        name: document.getElementById("name").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        province: document.getElementById("province").value,
        pipes: document.getElementById("pipes").value,
        orderDate: new Date().toISOString().split('T')[0]
    };

    if (!isLocationSet) {
        spinner.style.display = "none";
        return alert("يجب تحديد الموقع أولاً!");
    }
    if (formData.phone.length !== 11) {
        spinner.style.display = "none";
        return alert("رقم الهاتف غير صحيح!");
    }
    if (!Object.values(formData).every(value => value)) {
        spinner.style.display = "none";
        return alert("يرجى ملء جميع الحقول!");
    }

    try {
        await addDoc(collection(db, "orders"), {
            ...formData,
            latitude: userLatitude,
            longitude: userLongitude,
            status: "قيد الانتظار",
            timestamp: new Date()
        });
        alert("✅ تم إرسال الطلب بنجاح!");
        document.getElementById("orderForm").reset();
        locationButton.textContent = "تحديد الموقع";
        locationButton.style.backgroundColor = "#218838";
        isLocationSet = false;
    } catch (error) {
        console.error("Error:", error);
        alert("❌ حدث خطأ أثناء الإرسال!");
    } finally {
        spinner.style.display = "none";
    }
});
