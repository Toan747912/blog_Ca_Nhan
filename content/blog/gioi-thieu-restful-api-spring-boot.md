---
title: "Nâng cấp Đường ống: Giới thiệu REST API và xây dựng API đầu tiên với Spring Boot"
date: 2025-10-26
categories: ["Java"]
image: "/images/blog/java-spring-boot-api.png"
draft: false
weight: 4
---

Ở các bài trước, chúng ta đã học cách "nói chuyện" ở mức độ thấp (Socket). Giờ là lúc để "nâng cấp" lên một kiến trúc cấp cao hơn, nơi chúng ta không còn lo về `InputStream` hay `DatagramPacket`, mà tập trung vào logic nghiệp vụ.

Chào mừng bạn đến với **RESTful API**!

### *1. "Vòi nước" REST là gì?*

REST (REpresentational State Transfer) không phải là một ngôn ngữ hay công cụ. Nó là một **"phong cách thiết kế"** hay một bộ quy tắc để thiết kế các "vòi nước" (API) sao cho chúng thật đơn giản, dễ hiểu và dễ sử dụng.

Hãy tưởng tượng Server của bạn là một **Nhà hàng 5 sao** 🧑‍🍳 và Client (ứng dụng web, app di động) là **Thực khách**.

REST chính là cuốn **Thực đơn (Menu)** 📜 của nhà hàng đó.

Một cuốn thực đơn tốt (RESTful) phải:

*   **Tách biệt (Client-Server):** Người phục vụ (Server) và Thực khách (Client) là hai bên riêng biệt. Thực khách không cần biết bếp (database) hoạt động thế nào, chỉ cần biết gọi món.
*   **Không trạng thái (Stateless):** Đây là quy tắc **VÀNG**. Người phục vụ (Server) bị "mất trí nhớ ngắn hạn". Mỗi lần bạn gọi món (mỗi request), bạn phải cung cấp đầy đủ thông tin.
    *   **Ví dụ tệ (Stateful):** "Cho tôi món như lần trước." -> Server sẽ: "Tôi không nhớ lần trước là gì?!"
    *   **Ví dụ tốt (Stateless):** "Cho tôi 1 suất Phở Bò (ID: 123), giao đến bàn số 5 (Token: abc)."
*   **Lợi ích:** Vì Server không cần "nhớ" bạn, nó có thể dễ dàng phục vụ hàng ngàn thực khách cùng lúc (dễ dàng scale).
*   **Dùng "Tài nguyên" (Resources):** Mọi thứ trong thực đơn đều là một "món ăn" (Tài nguyên).
    *   Tài nguyên là **danh từ**, không phải động từ.
    *   Ví dụ: `/users` (danh sách người dùng), `/products/45` (sản phẩm có ID 45).

### *2. Ngôn ngữ của "Thực đơn" (Các phương thức HTTP)*

HTTP không chỉ có `GET` (tải trang web). Nó là bộ **động từ** 🗣️ mà Thực khách (Client) dùng để ra lệnh cho Người phục vụ (Server) về một "món ăn" (Resource).

| Động từ | Ý nghĩa (Bạn nói với phục vụ) | Ví dụ (Bạn nói với Server) |
| :--- | :--- | :--- |
| **GET (LẤY)** | "Cho tôi XEM thông tin món Phở Bò." | `GET /users/123` (Cho tôi xem thông tin user 123) |
| **POST (TẠO MỚI)** | "THÊM một món Phở Gà mới vào hóa đơn của tôi." | `POST /users` (Tạo một user mới. Dữ liệu user ở trong túi hàng) |
| **PUT (CẬP NHẬT)** | "THAY ĐỔI món Phở Gà (ID 123) này thành Phở Bò, không hành." | `PUT /users/123` (Cập nhật toàn bộ thông tin user 123) |
| **DELETE (XÓA)** | "HỦY món Phở Gà (ID 123) này khỏi hóa đơn." | `DELETE /users/123` (Xóa user 123) |

### *3. Tại sao lại là Spring Boot? (Nhà bếp 5 sao có sẵn)*

Nếu REST là "Thực đơn", thì **Spring Boot** chính là **Hệ thống Nhà bếp 5 sao** 🌟 đã được lắp đặt sẵn mọi thứ:

*   Bạn không cần tự nhóm lửa (Spring Boot có sẵn server Tomcat).
*   Bạn không cần lo về ống nước (Spring Boot tự quản lý HTTP).
*   Bạn không cần lo rửa bát (Spring Boot quản lý vòng đời, dọn dẹp).

Nhiệm vụ của bạn (Lập trình viên) chỉ là một **Đầu bếp**: Tập trung vào việc chế biến món ăn (viết logic nghiệp vụ) mà thôi.

### *4. Hướng dẫn: Xây dựng API "Hello, World!" đầu tiên*

Chúng ta sẽ xây dựng một "vòi nước" (API) mà khi ai đó "vặn" (gọi) nó, nó sẽ "chảy" ra dòng chữ "Hello, World!".

#### *Bước 1: Lấy "Bản thiết kế" Nhà bếp (Spring Initializr)*

Đi đến trang web "kiến trúc sư" của Spring: [start.spring.io](https://start.spring.io)

Điền vào "Bản thiết kế":

*   **Project:** Maven
*   **Language:** Java
*   **Spring Boot:** Chọn một phiên bản ổn định (không có `SNAPSHOT` hay `M`).
*   **Project Metadata:**
    *   **Group:** `com.example` (Tên công ty bạn)
    *   **Artifact:** `hello-api` (Tên dự án của bạn)
*   **Dependencies (Nguyên liệu):** Đây là phần quan trọng nhất. Nhấn **Add Dependencies...** và chọn:
    *   **"Spring Web"**: Đây là gói nguyên liệu bắt buộc để xây dựng nhà bếp (web server, REST).

Nhấn nút **GENERATE**. Bạn sẽ tải về một tệp `hello-api.zip`.

Giải nén tệp zip này ra một thư mục.

#### *Bước 2: Dọn vào Nhà bếp (Mở dự án trong IDE)*

Mở IDE yêu thích của bạn (IntelliJ, Eclipse, VS Code...).

Chọn **Open** (hoặc **Import Project**) và trỏ đến thư mục `hello-api` bạn vừa giải nén.

IDE sẽ mất vài phút để "nhập kho" (tải các thư viện Maven). Hãy kiên nhẫn.

#### *Bước 3: Thuê "Đầu bếp" (Viết `@RestController`)*

Bây giờ, chúng ta sẽ tạo ra "Người đầu bếp" chuyên xử lý các yêu cầu.

Trong cấu trúc dự án, đi đến `src/main/java/com/example/helloapi`.

Tạo một file Java mới tên là `HelloController.java`.

Gõ (hoặc dán) đoạn code sau vào:

```java
package com.example.helloapi;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

// 1. Đánh dấu đây là "Đầu bếp API"
@RestController
public class HelloController {

    // 2. Đăng ký món ăn (Resource)
    @GetMapping("/hello") // Nếu ai đó gọi (GET) món "/hello"
    public String sayHello() {
        
        // 3. Chế biến và trả món
        return "Hello, World!"; 
    }
}
```

**Giải thích (Peyman):**

*   `@RestController`: Đây là cái "nón đầu bếp" 🎓. Bạn nói với Spring: "Này, class này không phải class bình thường. Nó là một Đầu bếp chuyên nhận đơn hàng API. Hãy giao các yêu cầu từ 'Thực đơn' cho nó."
*   `@GetMapping("/hello")`: Đây là hành động bạn ghi món ăn lên "Thực đơn".
    *   **GET:** Món này chỉ để "XEM" (dùng động từ GET).
    *   **"/hello"**: Tên của món ăn trên thực đơn (đường dẫn/resource).
*   `public String sayHello()`: Đây là công thức nấu món `/hello`.
*   `return "Hello, World!";`: Đây là món ăn (dữ liệu) được trả về cho "Thực khách" (trình duyệt). Spring Boot đủ thông minh để tự động "đóng gói" (chuyển thành JSON hoặc text) món ăn này.

#### *Bước 4: Mở cửa Nhà hàng (Chạy ứng dụng)*

Tìm file `HelloApiApplication.java` (file có hàm `main`).

Nhấn chuột phải vào nó và chọn **Run**.

Nhìn vào cửa sổ Console/Terminal. Khi bạn thấy dòng chữ tương tự: `... Tomcat started on port(s): 8080 (http) ...` ... có nghĩa là **Nhà hàng đã mở cửa!** 🎉 Máy chủ của bạn đang lắng nghe ở cổng 8080.

#### *Bước 5: Gọi món (Kiểm tra API)*

Mở trình duyệt web của bạn (Chrome, Firefox...).

Trên thanh địa chỉ, gõ vào "món ăn" bạn vừa tạo: `http://localhost:8080/hello`

Nhấn **Enter**.

**Kết quả:** Bạn sẽ thấy dòng chữ `Hello, World!` xuất hiện ngay trên trình duyệt.

Chúc mừng! Bạn vừa chuyển từ việc "hàn ống nước" (Sockets) sang việc "thiết kế vòi nước" (REST API). Bạn đã xây dựng thành công API đầu tiên của mình mà không cần chạm vào một dòng `InputStream` hay `Socket.accept()` nào cả!