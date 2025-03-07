<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>توصيل الغاز</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <script type="module">
    import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
    import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

    const firebaseConfig = {
      apiKey: "AIzaSyDKjlATm8_ip7olBhadROhqodFOAhgJaSw",
      authDomain: "gas-fded4.firebaseapp.com",
      projectId: "gas-fded4",
      storageBucket: "gas-fded4.firebasestorage.app",
      messagingSenderId: "452703999347",
      appId: "1:452703999347:web:f971e6b75a6a125e41e106",
      measurementId: "G-L0PL0MG0ZH"
    };

    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    const ordersRef = ref(db, 'orders');

    document.getElementById('gasOrderForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('clientName').value.trim();
      const phone = document.getElementById('clientPhone').value.trim();
      const quantity = document.getElementById('cylindersCount').value;

      if (name && phone && quantity) {
        try {
          await push(ordersRef, { name, phone, quantity });
          console.log("تم إرسال الطلب بنجاح إلى Firebase:", { name, phone, quantity });
          showConfirmation(name, phone, quantity);
          loadOrders();
        } catch (error) {
          console.error("خطأ أثناء إرسال البيانات إلى Firebase:", error);
          alert("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.");
        }
      } else {
        alert("يرجى ملء جميع الحقول بشكل صحيح");
      }
    });

    function showConfirmation(name, phone, quantity) {
      document.getElementById('orderForm').style.display = 'none';
      document.getElementById('receipt').style.display = 'block';
      document.getElementById('receiptName').textContent = name;
      document.getElementById('receiptPhone').textContent = phone;
      document.getElementById('receiptQuantity').textContent = quantity;
      alert(`تم إرسال الطلب بنجاح!\nالاسم: ${name}\nرقم الجوال: ${phone}\nعدد الأسطوانات: ${quantity}`);
    }

    function loadOrders() {
      const ordersList = document.getElementById('ordersList');
      ordersList.innerHTML = '';
      onValue(ordersRef, (snapshot) => {
        ordersList.innerHTML = ''; // تفريغ القائمة قبل التحديث
        snapshot.forEach((childSnapshot) => {
          const order = childSnapshot.val();
          const li = document.createElement('li');
          li.textContent = `الاسم: ${order.name}, رقم الجوال: ${order.phone}, العدد: ${order.quantity}`;
          li.classList.add('list-group-item');
          ordersList.appendChild(li);
        });
      }, (error) => {
        console.error("خطأ أثناء تحميل البيانات من Firebase:", error);
      });
    }

    document.addEventListener("DOMContentLoaded", loadOrders);
  </script>
  <style>
    body {
      font-family: 'Tajawal', sans-serif;
      background: #f8f9fa;
    }
    .container {
      max-width: 500px;
      margin: 50px auto;
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .submit-btn {
      background-color: #2A5C82;
      color: white;
      width: 100%;
      padding: 10px;
      border: none;
      border-radius: 5px;
    }
    .receipt-section {
      display: none;
      text-align: center;
      margin-top: 20px;
    }
    .orders-section {
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container" id="orderForm">
    <h2 class="text-center">طلب توصيل الغاز</h2>
    <form id="gasOrderForm">
      <div class="mb-3">
        <label class="form-label">الاسم الكامل</label>
        <input type="text" class="form-control" id="clientName" required>
      </div>
      <div class="mb-3">
        <label class="form-label">رقم الجوال</label>
        <input type="tel" class="form-control" id="clientPhone" required>
      </div>
      <div class="mb-3">
        <label class="form-label">عدد الأسطوانات</label>
        <input type="number" class="form-control" id="cylindersCount" min="1" required>
      </div>
      <button type="submit" class="submit-btn">إرسال الطلب</button>
    </form>
  </div>
  <div class="container receipt-section" id="receipt">
    <h3 class="text-success">تم إرسال الطلب بنجاح!</h3>
    <p><strong>الاسم:</strong> <span id="receiptName"></span></p>
    <p><strong>رقم الجوال:</strong> <span id="receiptPhone"></span></p>
    <p><strong>عدد الأسطوانات:</strong> <span id="receiptQuantity"></span></p>
    <button onclick="location.reload()" class="submit-btn">طلب جديد</button>
  </div>
  <div class="container orders-section">
    <h3 class="text-center">جميع الطلبات</h3>
    <ul class="list-group" id="ordersList"></ul>
  </div>
</body>
</html>
