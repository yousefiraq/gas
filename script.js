import { db, collection, addDoc } from "./firebase-config.js";

// تهيئة HERE Maps
const platform = new H.service.Platform({
  apikey: "YOUR_HERE_MAPS_API_KEY" // ← استبدل بالمفتاح الفعلي
});

let mapInstance = null;
let userCoords = { lat: null, lng: null };

// ─── تحديد الموقع ───────────────────────────────────
const locationButton = document.getElementById("getLocation");
locationButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("⚠️ المتصفح لا يدعم تحديد الموقع!");
  }

  locationButton.classList.add("loading");
  locationButton.disabled = true;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      userCoords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };
      renderMap(userCoords.lat, userCoords.lng);
      locationButton.textContent = "✓ الموقع محدد";
      locationButton.classList.remove("loading");
      locationButton.style.backgroundColor = "#2ecc71";
    },
    (error) => {
      alert(`❌ خطأ في التحديد: ${error.message}`);
      locationButton.classList.remove("loading");
      locationButton.disabled = false;
      locationButton.textContent = "تحديد الموقع";
    }
  );
});

// ─── عرض الخريطة ───────────────────────────────────
function renderMap(lat, lng) {
  const mapContainer = document.getElementById("map");
  
  // إزالة الخريطة القديمة
  if (mapInstance) {
    mapInstance.dispose();
    mapContainer.innerHTML = "";
  }

  // إنشاء خريطة جديدة
  const defaultLayers = platform.createDefaultLayers();
  mapInstance = new H.Map(mapContainer, defaultLayers.vector.normal.map, {
    center: { lat, lng },
    zoom: 15,
    pixelRatio: window.devicePixelRatio || 1
  });

  // إضافة تفاعلات الخريطة
  new H.mapevents.Behavior(new H.mapevents.MapEvents(mapInstance));
  
  // إضافة العلامة
  new H.map.Marker({ lat, lng }).addTo(mapInstance);
}

// ─── إرسال الطلب ───────────────────────────────────
document.getElementById("orderForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = {
    name: document.getElementById("name").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    address: document.getElementById("address").value.trim(),
  };

  // التحقق من البيانات
  if (!Object.values(formData).every(Boolean) || !userCoords.lat) {
    return alert("❗ الرجاء تعبئة جميع الحقول وتحديد الموقع!");
  }

  try {
    await addDoc(collection(db, "orders"), {
      ...formData,
      ...userCoords,
      status: "قيد الانتظار",
      timestamp: new Date().toISOString()
    });

    alert("✅ تم إرسال الطلب بنجاح!");
    
    // إعادة التعيين
    document.getElementById("orderForm").reset();
    locationButton.textContent = "تحديد الموقع";
    locationButton.style.backgroundColor = "#28a745";
    locationButton.disabled = false;
    userCoords = { lat: null, lng: null };
    mapInstance.dispose();
    document.getElementById("map").innerHTML = "";
    
  } catch (error) {
    console.error("🚨 خطأ في الإرسال:", error);
    alert("🚨 حدث خطأ أثناء الإرسال!");
  }
});
