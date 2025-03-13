import { db, collection, addDoc, getDocs } from "./firebase-config.js";

document.getElementById('orderDate').value = new Date().toLocaleDateString('ar-IQ');

const platform = new H.service.Platform({
    apikey: "7kAhoWptjUW7A_sSWh3K2qaZ6Lzi4q3xaDRYwFWnCbE"
});

let userLatitude = null;
let userLongitude = null;
let isLocationSet = false;
const locationButton = document.getElementById("getLocation");
const spinner = document.querySelector(".loading-spinner");
const notesContainer = document.querySelector(".location-permission-info");

async function loadNotes() {
    try {
        const querySnapshot = await getDocs(collection(db, "orders"));
        notesContainer.innerHTML = "";

        if (querySnapshot.empty) {
            notesContainer.innerHTML = "<p>لا توجد ملاحظات متاحة حالياً</p>";
            return;
        }

        querySnapshot.forEach((doc) => {
            const noteData = doc.data();
            if (noteData.notes) {
                const noteElement = document.createElement("p");
                noteElement.className = "note-item";
                noteElement.innerHTML = `
                    <span class="note-date">${new Date(noteData.timestamp?.toDate()).toLocaleDateString('ar-IQ')}</span>
                    ${noteData.notes}
                `;
                notesContainer.appendChild(noteElement);
            }
        });

    } catch (error) {
        console.error("فشل في جلب البيانات:", error);
        notesContainer.innerHTML = "<p class='error'>⚠️ تعذر تحميل الملاحظات</p>";
    }
}

locationButton.addEventListener("click", () => {
    if (isLocationSet) {
        alert("تم تحديد الموقع مسبقاً!");
        return;
    }
    
    if (navigator.geolocation) {
        locationButton.disabled = true;
        locationButton.textContent = " جاري التحديد... ";
        
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
            { enableHighAccuracy: true, timeout: 10000 }
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

    if (!isLocationSet || formData.phone.length !== 11 || !Object.values(formData).every(Boolean)) {
        spinner.style.display = "none";
        return alert("يرجى تعبئة جميع الحقول بشكل صحيح!");
    }

    try {
        await addDoc(collection(db, "orders"), {
            ...formData,
            notes: "طلب توصيل غاز وطني",
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
        loadNotes();
    } catch (error) {
        console.error("Error:", error);
        alert("حدث خطأ أثناء الإرسال!");
    } finally {
        spinner.style.display = "none";
    }
});

loadNotes();
