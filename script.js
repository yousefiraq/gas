import { db, collection, addDoc, getDocs, query, orderBy } from "./firebase-config.js";

// عرض التاريخ الحالي
document.getElementById('orderDate').value = new Date().toLocaleDateString('ar-IQ', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
});

// تهيئة الخريطة
const platform = new H.service.Platform({
    apikey: "7kAhoWptjUW7A_sSWh3K2qaZ6Lzi4q3xaDRYwFWnCbE"
});

let userLatitude = null;
let userLongitude = null;
let isLocationSet = false;
const locationButton = document.getElementById("getLocation");
const spinner = document.querySelector(".loading-spinner");

// تحديد الموقع
locationButton.addEventListener("click", () => {
    if (isLocationSet) {
        alert("تم تحديد الموقع مسبقاً!");
        return;
    }
    
    if (navigator.geolocation) {
        locationButton.disabled = true;
        locationButton.textContent = " تم تحديد ";
        
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
            timestamp: new Date(),
            notes: "لا توجد ملاحظات" // <-- يمكنك تعديلها أو حذفها
        });
        alert("تم إرسال الطلب بنجاح!");
        document.getElementById("orderForm").reset();
        locationButton.textContent = "تحديد الموقع";
        locationButton.style.backgroundColor = "#218838";
        isLocationSet = false;
        await fetchAndDisplayNotes(); // تحديث الملاحظات بعد الإرسال
    } catch (error) {
        console.error("Error:", error);
        alert("حدث خطأ أثناء الإرسال!");
    } finally {
        spinner.style.display = "none";
    }
});

// جلب وعرض الملاحظات
async function fetchAndDisplayNotes() {
    try {
        const notesList = document.getElementById('notesList');
        notesList.innerHTML = '';

        const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.notes) {
                const noteElement = document.createElement('div');
                noteElement.className = 'note-item';
                noteElement.innerHTML = `
                    <p><strong>الاسم:</strong> ${data.name}</p>
                    <p><strong>التاريخ:</strong> ${new Date(data.timestamp?.toDate()).toLocaleString('ar-IQ')}</p>
                    <p><strong>الملاحظة:</strong> ${data.notes}</p>
                `;
                notesList.appendChild(noteElement);
            }
        });
    } catch (error) {
        console.error("Error fetching notes:", error);
        alert("حدث خطأ أثناء جلب الملاحظات!");
    }
}

// تحميل الملاحظات عند فتح الصفحة
window.addEventListener('load', fetchAndDisplayNotes);
