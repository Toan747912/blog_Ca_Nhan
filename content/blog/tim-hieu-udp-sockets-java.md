---
title: "Tìm hiểu UDP Sockets trong Java: Gửi Bưu thiếp Siêu tốc"
date: 2025-10-26
categories: ["Java"]
image: "/images/blog/java-udp.png"
draft: false
weight: 3
---

Bạn đã biết về TCP Sockets—giống như một cuộc gọi điện thoại 📞. Nó đáng tin cậy, có trật tự, nhưng lại "nặng nề" và tốn thời gian thiết lập.

Bây giờ, hãy làm quen với "người anh em" nhanh nhẹn nhưng... hơi cẩu thả của nó: **UDP**.

### *Ý tưởng cốt lõi (Theo phương pháp Peyman): UDP (User Datagram Protocol) giống hệt như việc bạn gửi một tấm **bưu thiếp (postcard)** ✉️.*

*   **Không kết nối:** Bạn không cần gọi điện để "thiết lập cuộc gọi" trước. Bạn chỉ cần viết địa chỉ người nhận lên bưu thiếp và... gửi.
*   **Nhanh và nhẹ:** Không cần "alo", không cần "tạm biệt". Chỉ cần gửi!
*   **Không đáng tin cậy:** Bưu thiếp của bạn có thể bị thất lạc trên đường đi. Bạn sẽ không bao giờ biết trừ khi người nhận gửi lại một tấm bưu thiếp khác.
*   **Không theo thứ tự:** Nếu bạn gửi 3 tấm bưu thiếp (Tin 1, Tin 2, Tin 3), người nhận có thể nhận được chúng theo thứ tự: Tin 2, Tin 3, Tin 1.

UDP là lựa chọn hoàn hảo khi **tốc độ là vua** và việc mất một vài "mẩu tin" không phải là tận thế.

### *Phần 1: So sánh "Sống còn" - TCP vs. UDP*

Hãy đặt cả hai lên bàn cân. Tưởng tượng bạn muốn gửi 100 câu của một câu chuyện cho bạn mình.

|  Tính năng  	| TCP (Cuộc gọi Điện thoại   📞) 	|  UDP (Gửi Bưu thiếp ✉️)  	|
|---	|---	|---	|
|  Thiết lập 	|  **Phải có   kết nối (Connection-Oriented).**<br/>Phải quay số, chờ bên kia nhấc máy   (`accept()`). Mất thời gian.  	|  **Không kết   nối (Connectionless).**<br/>Không cần "alo". Cứ thế gửi. Siêu   nhanh.  	|
|  Độ tin cậy  	|  **Đáng tin cậy.**<br/>Mọi câu nói đều   được đảm bảo đến nơi. Nếu bên kia nghe "hả?", bạn sẽ *tự động nói   lại*.  	|  **Không đáng tin cậy.**<br/>Bưu thiếp   có thể bị mất. Gửi đi là xong, không quan tâm nó đến hay không.  	|
|  **Thứ tự**  	|  **Đảm bảo   thứ tự.**<br/>Gửi "Câu 1, Câu 2" thì bên kia *chắc chắn* nhận   "Câu 1, Câu 2".  	|  **Không đảm   bảo thứ tự.**<br/>Gửi "Bưu thiếp 1, Bưu thiếp 2", bên kia có   thể nhận "Bưu thiếp 2, Bưu thiếp 1".  	|
|  **Trọng lượng**  	|  **Nặng (Heavyweight).**<br/>Cần nhiều   "thủ tục" (header) để quản lý kết nối, thứ tự, kiểm tra lỗi.  	|  **Nhẹ (Lightweight).**<br/>Chỉ cần   "Địa chỉ người gửi, Địa chỉ người nhận, Nội dung". Rất ít thủ   tục.  	|
|  **Ẩn dụ**  	|  Một cuộc gọi   điện thoại có đảm bảo.  	|  Một loạt bưu   thiếp được ném qua hàng rào.  	|
|  **Ví dụ**  	|  Duyệt web (HTTP), Tải file (FTP), Chat (cần   tin cậy).  	|  Game online, Streaming video, Gọi VoIP.  	|
### *Phần 2: Các "Công cụ" UDP trong Java (Bưu điện và Bưu thiếp)*

Với TCP, chúng ta có `ServerSocket` (Tổng đài) và `Socket` (Cuộc gọi). Với UDP, mọi thứ đơn giản hơn. Chúng ta chỉ có 2 thứ:

1.  **`DatagramSocket` (Bưu điện/Hòm thư) 📮:**
    *   Đây là cái hòm thư của bạn. Nó có một địa chỉ (số cổng, ví dụ: 9876).
    *   **Điều thú vị:** Bạn dùng **cùng một** cái hòm thư này để **gửi** bưu thiếp đi (`send()`) và **nhận** bưu thiếp đến (`receive()`).
    *   Nó không phải là "Server" hay "Client". Nó chỉ là một "điểm giao dịch" (socket).

2.  **`DatagramPacket` (Tấm Bưu thiếp) ✉️:**
    *   Đây chính là tấm bưu thiếp (hoặc gói hàng) của bạn.
    *   Một tấm bưu thiếp (Packet) chứa 3 thứ:
        1.  **Nội dung:** Dữ liệu bạn muốn gửi (dưới dạng `byte[]`).
        2.  **Độ dài:** Bạn gửi bao nhiêu byte (vì gói `byte[]` có thể to nhưng bạn chỉ dùng 1 phần).
        3.  **Địa chỉ người nhận:** Gồm **IP và Cổng** (ví dụ: gửi đến máy `192.168.1.10` ở hòm thư `9876`).

### *Phần 3: Xây dựng Ứng dụng "Gửi Bưu thiếp"*

Chúng ta sẽ tạo 2 chương trình:

*   `UDPServer` (Người nhận): Ngồi tại "hòm thư" 9876 và chờ bưu thiếp đến.
*   `UDPClient` (Người gửi): Viết một tấm bưu thiếp và gửi nó đến "hòm thư" 9876.

#### *A. UDPServer.java (Người nhận - Chờ Bưu thiếp)*

**Nhiệm vụ:**

1.  Mở "hòm thư" (`DatagramSocket`) tại cổng 9876.
2.  Chuẩn bị một "cái giỏ rỗng" (`DatagramPacket`) để hứng bưu thiếp.
3.  Ngồi chờ (`receive()`).
4.  Khi có bưu thiếp, đọc nội dung và in ra.

```java
import java.net.DatagramPacket;
import java.net.DatagramSocket;

public class UDPServer {
    public static void main(String[] args) {
        System.out.println("Server (Người nhận) đã khởi động, đang chờ bưu thiếp...");

        try (DatagramSocket socket = new DatagramSocket(9876)) {
            // 1. Mở hòm thư (Socket) ở cổng 9876
            // Dùng try-with-resources để nó tự đóng khi xong

            while (true) { // Chờ mãi mãi
                // 2. Chuẩn bị "cái giỏ rỗng" để hứng bưu thiếp
                // Chúng ta cần một mảng byte đủ lớn.
                byte[] buffer = new byte[1024];
                DatagramPacket packet = new DatagramPacket(buffer, buffer.length);

                // 3. Ngồi chờ (BLOCKING)
                // Dòng này sẽ "treo" chương trình lại cho đến khi
                // có một bưu thiếp (packet) bay vào hòm thư (socket).
                socket.receive(packet);

                // 4. Đã nhận được! Đọc nội dung
                String receivedMessage = new String(
                    packet.getData(),      // Lấy dữ liệu từ bưu thiếp
                    0,                     // Bắt đầu từ byte 0
                    packet.getLength()     // Lấy đúng độ dài thực tế
                );

                System.out.println("Đã nhận được bưu thiếp: '" + receivedMessage + "'");

                // (Tùy chọn) Lấy địa chỉ người gửi để biết ai đã gửi
                // InetAddress senderAddress = packet.getAddress();
                // int senderPort = packet.getPort();
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

**Giải thích (Peyman):**

*   `new DatagramSocket(9876)`: Tôi tuyên bố: "Tôi là chủ sở hữu hòm thư số 9876."
*   `byte[] buffer = new byte[1024]` và `new DatagramPacket(buffer, buffer.length)`: Đây là bước hơi lạ. Bạn phải đưa cho bưu điện một cái **giỏ rỗng** (buffer) và nói "Giỏ này chứa được tối đa 1024 byte". Khi bưu thiếp đến, bưu điện sẽ đặt nó vào cái giỏ này cho bạn.
*   `socket.receive(packet)`: Đây là hành động "Ngồi ở bưu điện và chờ". Chương trình sẽ **dừng lại ở đây** cho đến khi có thư.
*   `new String(packet.getData(), 0, packet.getLength())`: **Rất quan trọng!** `packet.getData()` trả về cả cái giỏ (1024 byte), nhưng bưu thiếp có thể chỉ là 10 byte ("Hello"). `packet.getLength()` cho bạn biết kích thước thật của bưu thiếp. Chúng ta chỉ đọc đúng 10 byte đó thôi.

#### *B. UDPClient.java (Người gửi - Gửi Bưu thiếp)*

**Nhiệm vụ:**

1.  Mở "hòm thư" của chính mình (không cần cổng cụ thể).
2.  Viết nội dung (data).
3.  Tìm địa chỉ người nhận (IP + Port).
4.  Tạo "tấm bưu thiếp" (`DatagramPacket`) có đủ 3 thông tin (nội dung, dài, địa chỉ).
5.  Gửi nó đi (`send()`).

```java
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.util.Scanner;

public class UDPClient {
    public static void main(String[] args) {
        System.out.println("Client (Người gửi) đã khởi động.");

        try (DatagramSocket socket = new DatagramSocket()) { 
            // 1. Mở hòm thư của chính mình.
            // Không cần số cổng (hoặc để số 0), hệ điều hành sẽ tự chọn
            // một cổng ngẫu nhiên cho mình để gửi đi.

            // 2. Lấy địa chỉ người nhận
            InetAddress serverAddress = InetAddress.getByName("localhost");
            int serverPort = 9876; // Phải khớp với hòm thư của Server

            Scanner scanner = new Scanner(System.in);
            while (true) {
                System.out.print("Nhập nội dung bưu thiếp: ");
                String message = scanner.nextLine();

                // 3. Viết nội dung (chuyển String thành byte[])
                byte[] data = message.getBytes();

                // 4. Tạo "tấm bưu thiếp"
                DatagramPacket packet = new DatagramPacket(
                    data,                   // Nội dung
                    data.length,            // Độ dài nội dung
                    serverAddress,          // Địa chỉ IP người nhận
                    serverPort              // Số hòm thư (Cổng) người nhận
                );

                // 5. Gửi đi!
                socket.send(packet);
                System.out.println("-> Đã gửi bưu thiếp!");

                if (message.equals("exit")) break;
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

**Giải thích (Peyman):**

*   `new DatagramSocket()`: Tôi chỉ cần "đến bưu điện" để gửi thư. Tôi không cần đăng ký hòm thư cố định.
*   `InetAddress.getByName("localhost")`: Tìm "địa chỉ nhà" của `localhost` (chính máy này).
*   `new DatagramPacket(data, data.length, serverAddress, serverPort)`: Đây là hành động viết bưu thiếp hoàn chỉnh: Ghi nội dung (`data`), ghi rõ độ dài (`data.length`), và quan trọng nhất là ghi **địa chỉ người nhận** (`serverAddress`, `serverPort`).
*   `socket.send(packet)`: "Bỏ bưu thiếp vào thùng!" 🚀. Xong. Client không quan tâm nó có đến hay không. Nó ngay lập tức quay lại vòng lặp `while` để gửi tấm tiếp theo.

### *Phần 4: Khi nào thì dùng "Bưu thiếp" (UDP)?*

UDP nghe có vẻ "tệ" (mất, sai thứ tự), nhưng nó lại là cứu cánh cho các ứng dụng mà **sự trễ nải (delay) còn tệ hơn là mất dữ liệu**.

*   **Game Online (MMO, Bắn súng) 🎮:**
    *   Tưởng tượng bạn đang chơi game. Vị trí X, Y của bạn thay đổi 60 lần mỗi giây.
    *   Bạn gửi 60 "bưu thiếp" vị trí/giây cho server.
    *   **Kịch bản xấu (UDP):** Bưu thiếp số 3 (vị trí lúc 0.03s) bị mất. **Chả sao cả!** Vì 0.01s sau, bưu thiếp số 4 (vị trí lúc 0.04s) đã đến nơi. Server chỉ cần cập nhật vị trí mới nhất. Người chơi khác chỉ thấy bạn "khựng" nhẹ 1 khung hình.
    *   **Kịch bản thảm họa (TCP):** Bưu thiếp số 3 bị mất. TCP sẽ la lên: "Dừng lại! Tôi mất gói số 3 rồi! Gửi lại cho tôi!" Toàn bộ game của bạn sẽ đứng hình (lag) trong nửa giây chỉ để chờ cái gói tin đã cũ mèm đó. **Tốc độ quan trọng hơn độ chính xác tuyệt đối.**

*   **Streaming Video / Gọi Thoại (Zoom, Discord) 🎥:**
    *   Khi bạn xem video, bạn nhận hàng ngàn mẩu hình ảnh.
    *   Nếu 1 mẩu nhỏ (1 pixel) của 1 khung hình bị mất, bạn có chấp nhận dừng cả bộ phim lại để tải lại 1 pixel đó không? **Không!**
    *   Bạn chấp nhận hình ảnh bị "vỡ" nhẹ (pixelation) trong 1 giây, miễn là video tiếp tục chạy.

**Kết luận:** Dùng **TCP (Điện thoại)** khi bạn cần sự **hoàn hảo** (tải file, gửi email). Dùng **UDP (Bưu thiếp)** khi bạn cần **tốc độ** và chấp nhận sự không hoàn hảo (game, stream).
