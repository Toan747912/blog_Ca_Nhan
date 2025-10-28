---
title: "'Người phục vụ' Gửi Đơn hàng: Làm chủ Fetch API (GET, POST)"
date: 2025-10-26
categories: ["JavaScript"]
image: "/images/blog/fetch-api.png"
draft: false
weight: 7
---

Bạn đã xây dựng một "Nhà bếp" (Spring Boot API) xịn sò. Giờ là lúc dạy cho "Người phục vụ" (JavaScript) cách gửi đơn hàng (Requests) đến đó.

**Fetch API** chính là cuốn **sổ ghi đơn hàng (Order Pad)** 📝 hiện đại, được tích hợp sẵn trong mọi trình duyệt. Nó cho phép "Người phục vụ" (JS) gửi yêu cầu đến "Bếp" (Server) và xử lý "món ăn" (Data) khi nó được trả về.

### *1. Vấn đề Lớn nhất: "Giấy hẹn" (The Promise)*

Hãy tưởng tượng bạn gọi một món ăn.

*   **Đồng bộ (Synchronous):** (Cách làm tệ) "Người phục vụ" gửi đơn hàng, và **đứng đơ tại quầy bếp** 🥶, không làm gì khác cho đến khi món ăn ra. Nếu bếp làm mất 30 giây, cả nhà hàng (trang web của bạn) bị đứng hình 30 giây.
*   **Bất đồng bộ (Asynchronous):** (Cách của Fetch) "Người phục vụ" gửi đơn hàng. Bếp không đưa món ăn ngay. Thay vào đó, Bếp đưa cho bạn một **"Giấy hẹn" (Promise)** 🔔.

"Giấy hẹn" này hứa một trong hai điều:

1.  **Fulfilled (Thành công):** "Món ăn đã sẵn sàng! 🍲"
2.  **Rejected (Thất bại):** "Xin lỗi, bếp hết nguyên liệu! ❌"

JavaScript nhận "Giấy hẹn" này và tiếp tục làm việc khác (giữ cho trang web mượt mà). Nó chỉ xử lý món ăn khi "Giấy hẹn" reo.

Đây là lý do tại sao bạn thấy `.then()` (khi thành công) và `.catch()` (khi thất bại).

### *2. Cách 1: Lấy Dữ liệu (GET) - "Cho tôi xem Món số 5!"*

Đây là yêu cầu đơn giản nhất. "Người phục vụ" chỉ cần nói tên món. Chúng ta sẽ dùng API `GET /api/users` mà bạn đã tạo ở bài Spring Boot.

#### *A. Cú pháp truyền thống `.then()` (Cầm "Giấy hẹn" và Chờ)*

```javascript
// File script.js
console.log("Phục vụ: Đang gửi đơn hàng GET...");

// 1. Gửi đơn hàng (fetch)
fetch('http://localhost:8080/api/users') // URL của Bếp Spring Boot
    
    // 2. KHI "Giấy hẹn" đầu tiên reo (Response đã về)
    // "response" là cái "khay thức ăn" Bếp đưa ra,
    // nó vẫn còn bọc màng bọc thực phẩm (raw data).
    .then(response => {
        // Kiểm tra xem Bếp có báo OK không (HTTP 200-299)
        if (!response.ok) {
            throw new Error('Bếp báo lỗi: ' + response.status);
        }
        
        // "Món ăn" (data) đang ở dạng JSON (văn bản).
        // Phải "mở màng bọc" (response.json()) để biến nó thành
        // một đối tượng JavaScript mà ta ăn được.
        // *Việc "mở" này cũng mất thời gian, nên nó lại trả về
        // một "Giấy hẹn" thứ hai!*
        return response.json(); 
    })
    
    // 3. KHI "Giấy hẹn" thứ hai reo (Món ăn đã được mở)
    .then(data => {
        // "data" bây giờ là một MẢNG các đối tượng User!
        console.log("Phục vụ: Món ăn đã về!", data);
        
        // Giờ bạn có thể dùng data để cập nhật HTML
        const userList = document.getElementById('user-list');
        data.forEach(user => {
            const li = document.createElement('li');
            li.textContent = `${user.id}: ${user.name} (${user.email})`;
            userList.appendChild(li);
        });
    })
    
    // 4. NẾU bất kỳ "Giấy hẹn" nào báo lỗi
    .catch(error => {
        console.error("Phục vụ: Thất bại!", error);
    });

console.log("Phục vụ: Đã gửi đơn. Đang làm việc khác trong khi chờ...");
```

#### *B. Cú pháp hiện đại `async/await` (Cách "Đứng chờ" thanh lịch)*

Cú pháp `.then()` hơi rắc rối vì phải lồng nhau. `async/await` là cách viết "sạch" hơn, giúp code bất đồng bộ trông như đồng bộ, nhưng không làm đứng hình trang web.

**Phép loại suy:**

*   `async`: Đánh dấu cho JavaScript: "Hàm này là một Người phục vụ đặc biệt, có khả năng chờ."
*   `await`: Lệnh "🧘 Đứng chờ ngay tại đây (nhưng không làm phiền người khác) cho đến khi "Giấy hẹn" reo."

Đây là cùng một yêu cầu GET ở trên, viết lại bằng `async/await`:

```javascript
// Phải đặt code này bên trong một hàm "async"
async function fetchUsers() {
    console.log("Phục vụ (Async): Đang gửi đơn...");
    
    try {
        // 1. (await) Đứng chờ 🧘 cho đến khi "khay thức ăn" (response) về
        const response = await fetch('http://localhost:8080/api/users');

        // 2. Kiểm tra lỗi
        if (!response.ok) {
            throw new Error('Bếp báo lỗi: ' + response.status);
        }

        // 3. (await) Đứng chờ 🧘 lần nữa để "mở màng bọc" (response.json())
        const data = await response.json();

        // 4. Món ăn đã sẵn sàng!
        console.log("Phục vụ (Async): Món đã về!", data);
        
        // Cập nhật HTML (giống như trên)
        const userList = document.getElementById('user-list');
        userList.innerHTML = ''; // Xóa danh sách cũ
        data.forEach(user => {
            const li = document.createElement('li');
            li.textContent = `${user.id}: ${user.name} (${user.email})`;
            userList.appendChild(li);
        });

    } catch (error) {
        // 5. NẾU một trong hai lần "await" thất bại,
        // nó sẽ nhảy vào đây
        console.error("Phục vụ (Async): Thất bại!", error);
    }
}

// Gọi hàm để chạy
fetchUsers();
```

### *3. Cách 2: Gửi Dữ liệu (POST) - "Thêm Món mới vào Menu!"*

Đây là lúc chúng ta thực sự kết nối với API Spring Boot `POST /api/users`. "Người phục vụ" (Fetch) không chỉ hỏi, mà còn phải gửi kèm một "công thức" (dữ liệu JSON) cho "Bếp" (Server).

**Vấn đề:** Mạng Internet (đường dây điện thoại đến Bếp) chỉ có thể gửi văn bản (text). Bạn không thể gửi một "Đối tượng JavaScript" (JavaScript Object). **Giải pháp:** `JSON.stringify()`

**Phép loại suy:** `JSON.stringify()` là hành động "viết ý tưởng (Object) của bạn ra một tờ giấy (String) theo cú pháp JSON" mà "Bếp" có thể đọc được.

Hãy xem cách chúng ta gửi một `newUser` đến Bếp:

```javascript
// 1. Chuẩn bị "công thức" (JS Object)
const newUser = {
    name: "Trần Văn B",
    email: "b@gmail.com"
};

// Hàm này sẽ gửi "công thức" đi
async function createUser(userData) {
    console.log("Phục vụ: Đang gửi 'công thức' món mới...");

    try {
        // 2. Gửi đơn hàng (fetch), lần này với "Tùy chọn" (options)
        const response = await fetch('http://localhost:8080/api/users', {
            
            // 2a. Phương thức: "Đây là đơn TẠO MỚI (POST)"
            method: 'POST', 
            
            // 2b. Tiêu đề: "Ghi chú cho Bếp"
            headers: {
                // "Bếp ơi, 'công thức' (body) tôi gửi kèm là
                // được viết bằng ngôn ngữ JSON nhé!"
                // (Spring Boot @RequestBody cần cái này)
                'Content-Type': 'application/json'
            },
            
            // 2c. Thân (Nội dung chính):
            // "Biến 'công thức' (Object) thành 'tờ giấy' (String)"
            body: JSON.stringify(userData) 
        });

        // 3. Kiểm tra xem Bếp có nhận không
        if (!response.ok) {
            throw new Error('Bếp từ chối công thức: ' + response.status);
        }

        // 4. Nhận lại "món ăn" (User MỚI) mà Bếp vừa tạo
        // (Spring Boot POST API của chúng ta trả về User đã tạo)
        const createdUser = await response.json();

        console.log("Phục vụ: Bếp đã tạo xong món!", createdUser);
        
        // (Bạn có thể gọi lại hàm fetchUsers() ở trên để làm mới DS)
        fetchUsers(); 

    } catch (error) {
        console.error("Phục vụ: Gửi 'công thức' thất bại!", error);
    }
}

// Giả sử bạn có một cái nút (button)
// document.getElementById('btn-add-user').onclick = () => {
//     createUser(newUser);
// };
```

### Tóm tắt nhanh

| Bạn muốn... | `fetch()` làm gì... | Phép loại suy (Peyman) |
| :--- | :--- | :--- |
| Lấy dữ liệu | `fetch('/api/url')` (Mặc định là GET) | "Cho tôi xem món này." |
| Gửi dữ liệu | `fetch('/api/url', { method: 'POST', ... })` | "Thêm món mới này vào menu." |
| Xử lý bất đồng bộ | Dùng `.then().catch()` | Cầm "Giấy hẹn" 🔔 và chờ nó reo. |
| Xử lý (cách tốt hơn) | Dùng `async/await` + `try...catch` | "Đứng chờ" 🧘 tại quầy (nhưng không cản đường). |
| Gửi JSON | `body: JSON.stringify(obj)` | "Viết ý tưởng (Object) ra giấy (String)" |
| Đọc JSON | `const data = await response.json()` | "Mở màng bọc" 🍲 món ăn Bếp đưa ra. |

Giờ đây, "Người phục vụ" (JavaScript) của bạn đã biết đầy đủ cách giao tiếp với "Nhà bếp" (Spring Boot), cho phép bạn xây dựng các ứng dụng web động hoàn chỉnh!
