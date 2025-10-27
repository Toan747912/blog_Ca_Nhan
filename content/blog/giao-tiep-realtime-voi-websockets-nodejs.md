---
title: "'Bỏ Bồi bàn, Lắp Điện thoại!': Giao tiếp Real-time với WebSockets và Node.js"
date: 2025-10-26
categories: ["JavaScript", "Node.js", "WebSocket"]
image: "/images/blog/websockets-nodejs.png"
draft: false
weight: 9
---

Ở các bài trước, chúng ta đã xây dựng một "Nhà hàng" (Server) hoạt động theo kiểu REST API.

**Vấn đề của REST API (Kiểu Bồi bàn 🤵):**

*   Khách (Client) muốn gì, phải gọi Bồi bàn: "Cho tôi ly nước!"
*   Bồi bàn (HTTP Request) chạy vào bếp, lấy nước, mang ra, rồi... biến mất.
*   Khách muốn thêm đá? Phải gọi Bồi bàn một lần nữa.
*   **Vấn đề lớn nhất:** Bếp (Server) làm xong món, không thể tự mang ra. Bếp phải chờ Bồi bàn vào hỏi: "Món xong chưa?"

Đây là kiểu **Hỏi-Đáp (Request-Response)**. Nó hoạt động, nhưng rất chậm và "phiền phức" cho các ứng dụng cần liên tục, như Chat, Game, hay xem Tỷ số Trực tiếp.

### *1. Phép loại suy Cốt lõi: WebSocket là gì?*

**WebSocket** ☎️ là một công nghệ giải quyết dứt điểm vấn đề trên.

**Analogy:** Thay vì liên tục gọi "Bồi bàn", ngay khi Khách (Client) vào bàn, chúng ta đặt một **đường dây điện thoại nội bộ** 📞 kết nối thẳng từ "Bàn ăn" (Client) đến "Bếp" (Server).

Đường dây điện thoại này có 3 đặc điểm vàng:

1.  **Thiết lập 1 lần (Handshake):** Khách nhấc máy "Alo, Bếp nghe rõ không?". Bếp: "Rõ!" (Đây là cú "bắt tay" HTTP ban đầu).
2.  **Luôn mở (Persistent):** Cả hai bên không cúp máy. Đường dây được giữ mở liên tục.
3.  **Hai chiều (Full-Duplex):**
    *   **Client -> Server:** Khách (Client) có thể nhấc máy bất cứ lúc nào và nói: "Bàn 5 gửi tin nhắn: 'Chào bạn!'"
    *   **Server -> Client:** Bếp (Server) có thể nhấc máy bất cứ lúc nào và thông báo: "Có tin nhắn mới từ bàn 7: 'Bạn khỏe không?'"

**Kết quả?** Tin nhắn được gửi và nhận **ngay lập tức (real-time)** mà không cần "Bồi bàn" (F5 hay Fetch) chạy đi chạy lại.

### *2. "Tổng đài" hay "Điện thoại" (Nên dùng `ws` hay `socket.io`?)*

Node.js cung cấp 2 công cụ phổ biến:

*   `ws`: Giống như một cái điện thoại cơ bản. Nó làm đúng một việc là kết nối WebSocket. Nhanh, gọn, nhưng bạn phải tự làm mọi thứ (tự kết nối lại khi rớt mạng, tự chia phòng chat...).
*   `socket.io`: Giống như một **Tổng đài Thông minh** 👩‍💼. Nó sử dụng WebSocket làm lõi, nhưng "bọc" thêm rất nhiều tính năng xịn:
    *   **Tự động kết nối lại:** Nếu đường dây (mạng) bị nhiễu, nó tự động gọi lại.
    *   **Phát sóng (Broadcasting):** Cho phép "Bếp" hét một tin nhắn cho **tất cả** các bàn (Clients) đang kết nối.
    *   **Phòng (Rooms):** Cho phép bạn tạo các "phòng chat riêng" (ví dụ: chỉ bàn 5 và 7 nói chuyện với nhau).
    *   **Tương thích ngược (Fallback):** Nếu trình duyệt quá cũ, không biết "điện thoại" (WebSocket) là gì, `socket.io` sẽ tự động chuyển sang dùng... "Bồi bàn" (HTTP) để giả lập chat.

**Quyết định:** Đối với ứng dụng chat, `socket.io` là lựa chọn tốt hơn rất nhiều. Chúng ta sẽ dùng nó.

### *3. Bước 1: Xây dựng "Tổng đài" (Server-Side: Node.js + socket.io)*

Chúng ta sẽ xây dựng "Tổng đài" (Server) biết lắng nghe các "cuộc gọi" (connections) và chuyển "tin nhắn" (messages).

#### *A. Chuẩn bị (Giống bài Express):*

1.  Tạo thư mục `realtime-chat-server`.
2.  `cd realtime-chat-server`
3.  `npm init -y`
4.  Thuê "Trợ lý Bếp" (Express) và "Tổng đài" (Socket.io):

```bash
npm install express socket.io
```

#### *B. Viết code `index.js` (Trái tim của Tổng đài):*

```javascript
// 1. Triệu hồi "Trợ lý Bếp" và "Tổng đài"
const express = require('express');
const http = require('http'); // Cần "Người xây dựng" HTTP
const { Server } = require("socket.io"); // Lấy lớp "Server" từ socket.io

const app = express();
// 2. Phép loại suy quan trọng:
// "Tổng đài" (socket.io) không thể tự chạy.
// Nó cần "cưỡi" 🏇 lên một "con ngựa" (HTTP Server) có sẵn.
// Chúng ta tạo "con ngựa" đó từ "Trợ lý Bếp" (Express).
const server = http.createServer(app);

// 3. Bảo "Tổng đài" (io) cưỡi lên "con ngựa" (server)
const io = new Server(server);

// 4. (Tùy chọn) Bảo "Trợ lý Bếp" phục vụ "Menu" (file HTML)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html'); // Gửi file HTML mà ta sẽ tạo
});

// 5. ⭐️ ĐÂY LÀ PHÉP THUẬT ⭐️
// Dạy "Tổng đài" (io) phải làm gì khi có "Cuộc gọi" (connection)
io.on('connection', (socket) => {
    
  // Analogy: "connection" = một "Khách" (Client) vừa nhấc máy gọi đến.
  // "socket" = chính là "đường dây riêng" 📞 của ta với vị khách đó.
  console.log('Một Khách đã kết nối đường dây!');

  // Dạy "Tổng đài" lắng nghe "lời nói" từ đường dây riêng đó
  // Khi Khách đó nói (emit) một sự kiện tên là 'chat message'
  socket.on('chat message', (msg) => {
    console.log('Tin nhắn từ Khách: ' + msg);

    // Analogy: "Bếp" (Server) nhận được tin.
    // Giờ "Bếp" (io) hét lên cho TẤT CẢ các đường dây khác
    // (tất cả các Khách) đều nghe thấy.
    io.emit('chat message', msg);
  });

  // Dạy "Tổng đài" xử lý khi Khách "cúp máy" (disconnect)
  socket.on('disconnect', () => {
    console.log('Một Khách đã cúp máy.');
  });
});

// 6. Mở cửa "Nhà bếp" VÀ "Tổng đài"
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Tổng đài đang lắng nghe ở cổng ${PORT}`);
});
```

### *4. Bước 2: Lắp "Điện thoại Bàn" (Client-Side: HTML + JS)*

Giờ chúng ta tạo file `index.html` để "Khách" (Client) có cái để "gọi" và "nghe".

#### *A. Tạo file `index.html` (Đặt chung thư mục `index.js`):*

```html
<!DOCTYPE html>
<html>
<head>
  <title>Chat Real-time</title>
  <style>
    body { margin: 0; padding-bottom: 3rem; font-family: sans-serif; }
    #messages { list-style-type: none; margin: 0; padding: 0; }
    #messages li { padding: 0.5rem 1rem; }
    #messages li:nth-child(odd) { background: #efefef; }
    form { background: rgba(0, 0, 0, 0.1); padding: 0.25rem; position: fixed; bottom: 0; left: 0; right: 0; display: flex; }
    input { border: none; padding: 0 1rem; flex-grow: 1; margin-right: .25rem; }
    button { background: #007bff; border: none; padding: 0 1rem; color: white; }
  </style>
</head>
<body>
  <ul id="messages"></ul>

  <form id="form" action="">
    <input id="input" autocomplete="off" /><button>Gửi</button>
  </form>

  <script src="/socket.io/socket.io.js"></script>

  <script>
    // 3. "NHẤC MÁY LÊN!" 📞
    // "io()" = Tự động gọi đến "Tổng đài" (Server)
    // đã phục vụ trang web này.
    const socket = io();

    // Lấy các phần tử HTML
    const form = document.getElementById('form');
    const input = document.getElementById('input');
    const messages = document.getElementById('messages');

    // 4. HÀNH ĐỘNG 1: GỬI TIN (Nói 🗣️)
    // Khi Khách nhấn nút "Gửi"...
    form.addEventListener('submit', (e) => {
      e.preventDefault(); // Ngăn trang F5 (làm mất "Bồi bàn")
      if (input.value) {
        // "Nói" vào điện thoại (emit) sự kiện 'chat message'
        // kèm theo "lời nói" (input.value)
        socket.emit('chat message', input.value);
        input.value = ''; // Xóa ô chat
      }
    });

    // 5. HÀNH ĐỘNG 2: NHẬN TIN (Nghe 🎧)
    // "Lắng nghe" điện thoại.
    // Khi "Tổng đài" (Server) hét (emit) sự kiện 'chat message'...
    socket.on('chat message', (msg) => {
      // ...lấy "lời nói" (msg) đó...
      const item = document.createElement('li');
      item.textContent = msg;
      // ...và thêm vào danh sách chat trên màn hình.
      messages.appendChild(item);
      window.scrollTo(0, document.body.scrollHeight); // Cuộn xuống cuối
    });
  </script>
</body>
</html>
```

### *5. Chạy thử nghiệm!*

1.  Chạy Server:

    ```bash
    node index.js
    ```
    (Bạn sẽ thấy: `Tổng đài đang lắng nghe ở cổng 3000`)

2.  Mở trình duyệt (ví dụ: Chrome) và truy cập: `http://localhost:3000`
3.  Mở một trình duyệt khác (ví dụ: Firefox) hoặc một Tab Ẩn danh và cũng truy cập: `http://localhost:3000`
4.  Đặt 2 cửa sổ cạnh nhau.
5.  Gõ tin nhắn vào cửa sổ này, và nhấn **Gửi**.

**Kết quả:** Tin nhắn sẽ xuất hiện **ngay lập tức** ⚡ ở cửa sổ kia mà không cần F5 hay tải lại trang.

Bạn đã thành công! Bạn đã "cài đặt đường dây điện thoại nội bộ" (WebSocket) và bỏ đi "người bồi bàn" (HTTP) phiền phức, tạo ra một ứng dụng chat thời gian thực hoàn chỉnh.
