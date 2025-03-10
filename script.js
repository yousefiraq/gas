import { db, collection, addDoc } from "./firebase-config.js";

const platform = new H.service.Platform({
    apikey: "7kAhoWptjUW7A_sSWh3K2qaZ6Lzi4q3xaDRYwFWnCbE"
});

let userLatitude = null;
let userLongitude = null;

document.getElementById("getLocation").addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLatitude = position.coords.latitude;
                userLongitude = position.coords.longitude;
                showMap(userLatitude, userLongitude);
                alert("تم تحديد الموقع بنجاح!");
            },
            (error) => {
                alert("خطأ في تحديد الموقع: " + error.message);
            }
        );
    } else {
        alert("المتصفح لا يدعم تحديد الموقع.");
    }
});

function showMap(lat, lng) {
    const mapContainer = document.getElementById('map');
    const defaultLayers = platform.createDefaultLayers();
    const map = new H.Map(mapContainer, defaultLayers.vector.normal.map, {
        center: { lat: lat, lng: lng },
        zoom: 14
    });
    new H.map.Marker({ lat: lat, lng: lng }).addTo(map);
}

document.getElementById("orderForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const formData = {
        name: document.getElementById("name").value,
        phone: document.getElementById("phone").value,
        province: document.getElementById("province").value,
        pipes: document.getElementById("pipes").value
    };

    if (!Object.values(formData).every(Boolean) || !userLatitude) {
        return alert("يرجى تعبئة جميع الحقول وتحديد الموقع!");
    }

    if (formData.phone.length !== 11) {
        return alert("رقم الهاتف يجب أن يكون 11 رقمًا!");
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
        this.reset();
    } catch (error) {
        console.error("Error:", error);
        alert("حدث خطأ أثناء الإرسال!");
    }
});
