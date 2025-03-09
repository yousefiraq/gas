import { db, collection, addDoc } from "./firebase-config.js";

// تهيئة HERE Maps
const platform = new H.service.Platform({
  apikey: "7kAhoWptjUW7A_sSWh3K2qaZ6Lzi4q3xaDRYwFWnCbE"
});

let userLatitude = null;
let userLongitude = null;

// تحديد الموقع الجغرافي
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

// عرض الخريطة
function showMap(lat, lng) {
  const mapContainer = document.getElementById('map');
  const defaultLayers = platform.createDefaultLayers();
  
  const map = new H.Map(
    mapContainer,
    defaultLayers.vector.normal.map,
    {
      center: { lat: lat, lng: lng },
      zoom: 14
    }
  );

  // إضافة علامة للموقع
  const marker = new H.map.Marker({ lat: lat, lng: lng });
  map.addObject(marker);
}

// إرسال الطلب مع الموقع
document.getElementById("orderForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const address = document.getElementById("address").value;

    if (name && phone && address && userLatitude && userLongitude) {
        try {
            await addDoc(collection(db, "orders"), {
                name,
                phone,
                address,
                latitude: userLatitude,
                longitude: userLongitude,
                status: "قيد الانتظار",
                timestamp: new Date()
            });
            alert("تم إرسال الطلب بنجاح!");
            document.getElementById("orderForm").reset();
        } catch (error) {
            console.error("خطأ في إرسال الطلب: ", error);
        }
    } else {
        alert("يرجى ملء جميع الحقول وتحديد الموقع!");
    }
});
