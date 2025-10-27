---
title: "Xây dựng Nhà bếp JavaScript: Server đầu tiên với Node.js và Express"
date: 2025-10-26
categories: ["JavaScript", "Node.js"]
image: "/images/blog/nodejs-express.png"
draft: false
weight: 8
---

Chúng ta sẽ xây dựng một "Nhà bếp" (Server) bằng JavaScript, sẵn sàng nhận "Đơn hàng" (HTTP Requests) từ "Người phục vụ" (Fetch API) mà chúng ta đã học.

### *1. Bước 1: Xin "Giấy phép Kinh doanh" (Khởi tạo dự án Node.js)*

Trước khi thuê "Trợ lý", bạn cần đăng ký "Nhà hàng" của mình.

1.  Tạo một thư mục mới cho dự án: `mkdir my-express-server`
2.  Đi vào thư mục đó: `cd my-express-server`
3.  Chạy lệnh sau:

```bash
npm init -y
```

**Giải thích (Peyman):**

*   `npm` (Node Package Manager) là "Cơ quan Quản lý Nhân sự & Trang thiết bị" 👷.
*   `npm init -y` là hành động bạn nói: "Hãy cấp cho tôi một Giấy phép Kinh doanh ngay lập tức, dùng các thông tin mặc định."
*   Hành động này tạo ra một file tên là `package.json`.

`package.json` chính là tờ **"Giấy phép Kinh doanh"** 📜. Nó ghi lại:

*   Tên nhà hàng (`name`).
*   Phiên bản (`version`).
*   Và quan trọng nhất: Danh sách "nhân viên" (`dependencies`) mà bạn sẽ thuê.

### *2. Bước 2: Thuê "Trợ lý Bếp" (Cài đặt Express)*

Giờ "Nhà hàng" đã có giấy phép, hãy thuê "Trợ lý Bếp" (Express) đầu tiên.

Chạy lệnh sau trong terminal:

```bash
npm install express
```

**Giải thích (Peyman):**

*   `npm install express` là lệnh bạn gọi cho "Cơ quan Quản lý" (npm) và nói: "Hãy thuê và gửi cho tôi một "Trợ lý" tên là 'express'."

npm sẽ làm 2 việc:

1.  Tải code của Express và toàn bộ "đồ nghề" 🔧 của anh ta vào thư mục tên là `node_modules` (đây là "Phòng chứa Đồ nghề").
2.  Tự động cập nhật "Giấy phép Kinh doanh" (`package.json`) của bạn, ghi vào mục `dependencies`: `"express": "..."`. (Đây là bằng chứng bạn đã thuê anh ta hợp pháp).

### *3. Bước 3: Mở cửa "Nhà bếp" (Tạo Máy chủ Web)*

"Trợ lý" đã đến! Giờ hãy bảo anh ta mở cửa "Nhà bếp" và bắt đầu lắng nghe đơn hàng.

Tạo một file mới tên là `index.js` (đây là nơi "Bếp trưởng" là BẠN viết chỉ dẫn).

Viết code sau vào `index.js`:

```javascript
// 1. "Triệu hồi" Trợ lý Express từ phòng Đồ nghề
const express = require('express');

// 2. Tạo một "phiên bản" của Trợ lý, sẵn sàng làm việc
const app = express();

// 3. Chọn "Cổng" (giống như số máy lẻ) mà Bếp sẽ nghe
// Cổng 3000 là cổng phổ biến cho phát triển
const port = 3000;

// 4. BẢO TRỢ LÝ: "Mở cửa Bếp ở Cổng 3000"
// và bắt đầu LẮNG NGHE 🔔 đơn hàng.
app.listen(port, () => {
    // Đoạn code này chỉ chạy 1 lần khi Bếp mở cửa thành công
    console.log(`Nhà bếp (Server) đang lắng nghe ở cổng ${port}`);
});
```

**Cách chạy "Nhà bếp":**

1.  Mở terminal.
2.  Gõ lệnh: `node index.js`

Nếu bạn thấy: `Nhà bếp (Server) đang lắng nghe ở cổng 3000` -> Chúc mừng, "Bếp" của bạn đã mở cửa!

### *4. Bước 4: Dạy "Trợ lý" xử lý Đơn hàng (API Endpoints)*

Đây là phần "Bếp trưởng" (bạn) dạy cho "Trợ lý" (Express) các quy tắc nghiệp vụ.

#### *Quy tắc 1: Món "Hello World" (GET Request)*

Dạy "Trợ lý": "Nếu 'Người phục vụ' (Fetch) gọi món (GET) có tên là `/api/hello`..."

Thêm code này vào trước `app.listen()`:

```javascript
// Dạy Trợ lý (app) cách xử lý đơn hàng GET
// tại "địa chỉ món" (endpoint) là '/api/hello'
app.get('/api/hello', (req, res) => {
    
    // (req) = "Phiếu Đơn hàng" 📝 (Request)
    //         Nó chứa thông tin: khách gọi món gì, từ bàn nào...
    
    // (res) = "Khay Thức ăn" 🍲 (Response)
    //         Là thứ bạn dùng để gửi trả món ăn lại
    
    console.log("Bếp: Vừa nhận đơn hàng /api/hello!");
    
    // Dùng "Khay" (res) để gửi trả một "món ăn" dạng JSON
    res.json({ message: "Chào bạn, đây là Nhà bếp Express!" });
});
```

**Kiểm tra:** Chạy lại server (`node index.js`). Mở trình duyệt và gõ: `http://localhost:3000/api/hello`. Bạn sẽ thấy "món ăn" JSON của mình!

#### *Quy tắc 2: Nhận "Công thức" Mới (POST Request)*

Dạy "Trợ lý": "Nếu 'Người phục vụ' (Fetch) gửi một 'Công thức' (POST) đến `/api/users`..."

"Người phục vụ" (Fetch) sẽ gửi "công thức" (JSON) dưới dạng văn bản đã mã hóa (`JSON.stringify`). "Trợ lý" Express mặc định không hiểu văn bản này.

Chúng ta cần lắp cho anh ta một **"Cỗ máy Dịch"** 📦 (Middleware).

**Lắp "Máy Dịch JSON":** Thêm dòng này ngay sau `const app = express();`:

```javascript
// Dạy Trợ lý: "Hãy tự động dùng 'máy dịch' này cho MỌI đơn hàng"
// "Máy" này sẽ dịch "giấy" JSON (String) thành "nguyên liệu" (JS Object)
app.use(express.json()); 
```

**Dạy quy tắc POST:** Thêm quy tắc mới này (vẫn trước `app.listen`):

```javascript
// Dạy Trợ lý xử lý đơn POST tại '/api/users'
app.post('/api/users', (req, res) => {

    // Nhờ "Máy dịch" (express.json()),
    // "công thức" từ Fetch gửi lên đã nằm sẵn trong req.body
    const newUser = req.body; 

    console.log("Bếp: Nhận được công thức cho user mới:", newUser);

    // (Đây là lúc bạn sẽ gọi Service/Repository để lưu vào DB)
    // Bây giờ, chúng ta chỉ cần giả lập là đã tạo thành công:

    // Gửi trả "món ăn" (user mới) kèm theo ID (giả lập)
    // và mã 201 (Created)
    res.status(201).json({ id: 123, ...newUser });
});
```

Giờ đây, "Nhà bếp" của bạn đã sẵn sàng nhận yêu cầu POST từ Fetch API mà chúng ta đã học ở bài trước!

### *5. Bước 5: Phục vụ "Menu" (Phục vụ Tệp Tĩnh)*

Một "Nhà bếp" (Server) không chỉ gửi dữ liệu JSON, nó còn phải cung cấp "Menu" (HTML), "Khăn ăn" (CSS), và "Dao dĩa" (Client-side JS) cho "Người phục vụ" (Browser).

Đây gọi là **Tệp Tĩnh (Static Files)**.

"Trợ lý" Express có một quy tắc tự động siêu phàm cho việc này.

1.  Tạo một thư mục mới trong dự án tên là `public`.
2.  Bên trong `public`, tạo file `index.html`:

```html
<!DOCTYPE html>
<html>
<head><title>Nhà hàng Express</title></head>
<body>
    <h1>Chào mừng đến Nhà hàng của chúng tôi!</h1>
    <p>Đây là Menu (tệp tĩnh).</p>
</body>
</html>
```

3.  **Kích hoạt quy tắc tự động:** Thêm dòng này vào `index.js` (ngay sau `app.use(express.json())`):

```javascript
// Dạy Trợ lý: "Nếu ai đó hỏi BẤT CỨ file gì (HTML, CSS, JPG)..."
// "...hãy tự động TÌM trong thư mục 'public' và gửi đi."
// "KHÔNG CẦN HỎI 'Bếp trưởng' (bạn)!"
app.use(express.static('public'));
```

**Kiểm tra:**

1.  Chạy lại server (`node index.js`).
2.  Bây giờ, mở trình duyệt và truy cập: `http://localhost:3000/` (không có `/api/hello`).

**Bùm!** "Trợ lý" Express tự động tìm thấy `index.html` trong `public` và gửi nó đi. Bạn đã phục vụ thành công trang web đầu tiên của mình!
