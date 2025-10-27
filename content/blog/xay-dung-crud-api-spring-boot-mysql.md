---
title: "Xây dựng Kho hàng API: CRUD hoàn chỉnh với Spring Boot & MySQL"
date: 2025-10-26
categories: ["Java"]
image: "/images/blog/spring-boot-mysql.png"
draft: false
weight: 5
---

Ở bài trước, chúng ta đã xây dựng một "Nhà hàng" (Spring Boot) với một "Người phục vụ" (@RestController) chỉ biết nói "Hello, World!".

Giờ là lúc nâng cấp! Một nhà hàng thực thụ cần có một **"Kho hàng" (Pantry)** 🗄️ (chính là Cơ sở dữ liệu MySQL) để lưu trữ, thêm, sửa, và xóa "nguyên liệu" (dữ liệu).

Chúng ta sẽ xây dựng một hệ thống quản lý "Người dùng" (User) với đầy đủ 4 hoạt động:

*   **C**reate (Thêm một người dùng mới)
*   **R**ead (Xem một hoặc tất cả người dùng)
*   **U**pdate (Cập nhật thông tin người dùng)
*   **D**elete (Xóa một người dùng)

### *1. Phép loại suy Cốt lõi: Đội ngũ "Back of House"*

Để nhà hàng chạy trơn tru, chúng ta không thể để "Người phục vụ" chạy thẳng vào kho lấy đồ. Chúng ta cần một đội ngũ chuyên nghiệp, mỗi người một việc:

*   **`@RestController` (Bồi bàn 💁):**
    *   Vẫn là người duy nhất nói chuyện với "Thực khách" (Client).
    *   Nhận yêu cầu (HTTP Request) và chuyển đơn hàng vào cho Bếp trưởng.

*   **`@Service` (Bếp trưởng 🧑‍🍳):**
    *   Đây là "não" của hệ thống.
    *   Nhận đơn từ "Bồi bàn".
    *   Xử lý tất cả logic nghiệp vụ (ví dụ: "Kiểm tra xem email này đã tồn tại chưa?", "Mật khẩu có đủ mạnh không?").
    *   Ra lệnh cho "Quản kho" để lấy hoặc cất đồ.

*   **`@Repository` (Quản kho 🗃️):**
    *   Đây là người duy nhất được phép "chạm" vào kho hàng.
    *   Nhận lệnh đơn giản từ "Bếp trưởng" (e.g., "Lấy hộp 5", "Cất hộp này").
    *   Anh ta không cần biết tại sao, chỉ biết làm thế nào để lấy/cất (chạy lệnh SQL).

*   **`@Entity` (Hộp đựng Nguyên liệu 📦):**
    *   Là "khuôn mẫu" cho một "hộp" hàng trong kho.
    *   Ví dụ, một hộp `User` phải có 3 nhãn: `id`, `name`, và `email`.

*   **MySQL (Kho hàng Vật lý 🗄️):**
    *   Nơi tất cả các "Hộp đựng" (Entity) được lưu trữ vật lý.

### *2. Bước 1: Chuẩn bị "Nguyên liệu" và "Địa chỉ Kho"*

Chúng ta cần báo cho "Nhà bếp" (Spring Boot) 2 thứ: (1) "Công cụ quản lý kho" và (2) "Địa chỉ kho".

#### *A. Thêm "Nguyên liệu" (Dependencies)*

Mở file `pom.xml` của bạn (file "danh sách nguyên liệu" của Maven) và thêm 2 "nguyên liệu" mới này vào trong thẻ `<dependencies>`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>

<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <scope>runtime</scope>
</dependency>
```
(Đừng quên `Spring Web` mà chúng ta đã thêm ở bài trước nhé!)

#### *B. Ghi "Địa chỉ Kho" (Config)*

Mở file `src/main/resources/application.properties` (Cuốn sổ tay của nhà hàng) và dán "địa chỉ kho" của bạn vào:

```properties
# Địa chỉ kho (Database URL)
# jdbc:mysql://localhost:3306/db_name
# (Hãy thay db_name bằng tên database của bạn. Bạn phải tự tạo DB này trước.)
spring.datasource.url=jdbc:mysql://localhost:3306/user_management_db

# Tên đăng nhập và mật khẩu vào kho
spring.datasource.username=root
spring.datasource.password=password_cua_ban

# (Phần này là "phép thuật" của JPA)
# Tự động cập nhật "kho" (DB) dựa trên "hộp đựng" (Entity)
spring.jpa.hibernate.ddl-auto=update
# Cho phép xem các lệnh SQL mà "Quản kho" đang chạy
spring.jpa.show-sql=true
```

### *3. Bước 2: Thiết kế "Hộp đựng" (Tạo Model `@Entity`)*

Chúng ta cần định nghĩa xem một "hộp" `User` trông như thế nào.

Tạo một package mới tên là `model` (hoặc `entity`) và tạo file `User.java`:

```java
package com.example.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

// 1. Báo rằng đây là một "Hộp đựng" sẽ được cất vào kho
@Entity
public class User {

    // 2. Đây là "nhãn ID" duy nhất trên hộp
    @Id
    // 3. Bảo "Quản kho" tự động dán nhãn ID tăng dần (1, 2, 3...)
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Các "nhãn" thông tin khác trên hộp
    private String name;
    private String email;

    // Cần 1 constructor rỗng và các getters/setters
    // (Bạn có thể tự động sinh chúng bằng IDE)
    public User() {
    }
    
    // Getters and Setters...
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
```

### *4. Bước 3: Thuê "Quản kho" (Tạo `@Repository`)*

Đây là phần kỳ diệu nhất. Chúng ta sẽ "thuê" một "Quản kho" chuyên nghiệp từ Spring Data JPA.

Tạo package mới tên là `repository` và tạo file `UserRepository.java`:

```java
package com.example.demo.repository;

import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// 1. Đánh dấu đây là "Quản kho"
@Repository
// 2. Đây là một "Bản hợp đồng" thuê Quản kho
public interface UserRepository extends JpaRepository<User, Long> {
    // ... để trống!
}
```

**Giải thích (Peyman):**

*   `public interface UserRepository...`: Chúng ta chỉ cần tạo một "bản hợp đồng" (interface).
*   `extends JpaRepository<User, Long>`: Đây là điều khoản: "Tôi muốn thuê một Quản kho (`JpaRepository`) chuyên nghiệp. Anh ta phải chuyên về "hộp" `User`, và "nhãn ID" của hộp đó là kiểu `Long`."

Và... **XONG!** 🎩✨

Chỉ bằng một dòng này, Spring Data JPA sẽ tự động viết code và đưa cho "Quản kho" của bạn tất cả các kỹ năng cơ bản:

*   `save(user)` (Cất/Cập nhật hộp)
*   `findById(id)` (Tìm hộp theo ID)
*   `findAll()` (Lấy tất cả các hộp)
*   `deleteById(id)` (Hủy hộp theo ID)

Bạn không cần viết một dòng SQL nào!

### *5. Bước 4: Thuê "Bếp trưởng" (Tạo `@Service`)*

Đây là "não". "Bếp trưởng" sẽ xử lý logic và ra lệnh cho "Quản kho".

Tạo package mới tên là `service` và tạo file `UserService.java`:

```java
package com.example.demo.service;

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

// 1. Đánh dấu đây là "Bếp trưởng"
@Service
public class UserService {

    // 2. "Gọi" (tiêm) anh "Quản kho" vào để sai việc
    @Autowired
    private UserRepository userRepository;

    // --- Các phương thức CRUD ---

    // CREATE
    public User createUser(User user) {
        // (Logic nghiệp vụ có thể thêm ở đây, ví dụ: kiểm tra email)
        return userRepository.save(user); // "Quản kho, cất cái này!"
    }

    // READ (All)
    public List<User> getAllUsers() {
        return userRepository.findAll(); // "Quản kho, lấy hết!"
    }

    // READ (One by ID)
    public User getUserById(Long id) {
        // "Quản kho, tìm hộp ID này!"
        // orElse(null) nghĩa là "Nếu không tìm thấy thì trả về null"
        return userRepository.findById(id).orElse(null);
    }

    // UPDATE
    public User updateUser(Long id, User userDetails) {
        // 1. Tìm hộp cũ
        User user = userRepository.findById(id).orElse(null);
        if (user != null) {
            // 2. Đây là logic: Cập nhật thông tin từ hộp mới
            user.setName(userDetails.getName());
            user.setEmail(userDetails.getEmail());
            // 3. "Quản kho, cất lại hộp đã cập nhật!"
            return userRepository.save(user);
        }
        return null; // Không tìm thấy
    }

    // DELETE
    public void deleteUser(Long id) {
        // "Quản kho, hủy hộp ID này!"
        userRepository.deleteById(id);
    }
}
```

### *6. Bước 5: Cập nhật "Thực đơn" (Tạo `@RestController`)*

Cuối cùng, chúng ta dạy cho "Bồi bàn" cách nhận 4 loại đơn hàng CRUD.

Tạo package `controller` và file `UserController.java`:

```java
package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// 1. Đánh dấu đây là "Bồi bàn" API
@RestController
// 2. Tất cả "món" này đều bắt đầu bằng "/api/users"
@RequestMapping("/api/users")
public class UserController {

    // 3. "Gọi" (tiêm) "Bếp trưởng" vào để chuyển đơn
    @Autowired
    private UserService userService;

    // 1. CREATE (POST /api/users)
    // Thực khách (Client) gửi yêu cầu TẠO MỚI
    @PostMapping
    public User createUser(@RequestBody User user) {
        // "@RequestBody" = Lấy "món" (dữ liệu JSON) từ yêu cầu của khách
        return userService.createUser(user); // Chuyển đơn cho Bếp trưởng
    }

    // 2. READ All (GET /api/users)
    // Thực khách muốn XEM toàn bộ thực đơn
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers(); // Chuyển đơn cho Bếp trưởng
    }

    // 3. READ One (GET /api/users/{id})
    // Thực khách muốn XEM món số {id}
    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        // "@PathVariable" = Lấy "số món" (id) từ đường dẫn
        return userService.getUserById(id); // Chuyển đơn cho Bếp trưởng
    }

    // 4. UPDATE (PUT /api/users/{id})
    // Thực khách muốn THAY ĐỔI món số {id}
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        return userService.updateUser(id, userDetails); // Chuyển đơn
    }

    // 5. DELETE (DELETE /api/users/{id})
    // Thực khách muốn HỦY món số {id}
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id); // Chuyển đơn
    }
}
```

### Tổng kết

Bạn đã làm được! 🚀

Hãy chạy lại ứng dụng (file `...Application.java`). Giờ đây, "Nhà hàng" của bạn đã có một hệ thống "Kho hàng" hoàn chỉnh:

Bạn có thể dùng **Postman** (hoặc công cụ khác) để:

*   **POST** đến `http://localhost:8080/api/users` (với JSON) để tạo User.
*   **GET** từ `http://localhost:8080/api/users` để xem tất cả.
*   **GET** từ `http://localhost:8080/api/users/1` để xem User 1.
*   **PUT** đến `http://localhost:8080/api/users/1` (với JSON) để sửa.
*   **DELETE** đến `http://localhost:8080/api/users/1` để xóa.

Bạn đã xây dựng một API RESTful CRUD hoàn chỉnh, và quan trọng nhất là bạn đã tổ chức code của mình theo một kiến trúc 4 lớp (Controller, Service, Repository, Entity) sạch sẽ, chuyên nghiệp, và dễ bảo trì.
