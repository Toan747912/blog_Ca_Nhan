---
title: "Xây dựng Ứng dụng Chat Hai chiều (Client-Server) với Java Sockets"
date: 2025-10-26
categories: ["Java"]
image: "/images/blog/java-tcp-chat.png"
draft: false
weight: 2
---

***<span class="text-green">Bạn đã bao giờ tự hỏi làm thế nào các ứng dụng như Messenger, Zalo hay game online có thể gửi tin nhắn qua lại ngay lập tức?</span>*** 🚀

Hôm nay, chúng ta sẽ lột trần "phép thuật" đó. Chúng ta sẽ xây dựng một hệ thống điện thoại tư nhân đơn giản chỉ bằng Java.

***Ý tưởng cốt lõi (Theo phương pháp Peyman):*** Để hai máy tính nói chuyện, chúng ta cần thiết lập một cuộc gọi điện thoại 📞.

*   ***Server (Máy chủ):*** Là người trực tổng đài. Người này không gọi cho ai cả. Họ cắm điện thoại vào, mở đường dây (ví dụ: máy lẻ 1234), và chờ người khác gọi đến.
*   ***Client (Máy khách):*** Là người chủ động gọi điện. Người này nhấc máy lên, bấm đúng số của tổng đài (địa chỉ IP) và đúng số máy lẻ (Port) để kết nối.

Khi kết nối thành công, một "cuộc gọi" (Socket) được thiết lập. Trong cuộc gọi này:

*   Bạn nói vào ***Micrô*** (đó là `OutputStream` - Luồng ra).
*   Bạn nghe từ ***Loa*** (đó là `InputStream` - Luồng vào).

Chúng ta sẽ xây dựng cả hai bên: Tổng đài (Server) và Người gọi (Client).

### ***Phần 1: Xây dựng Server (👷 "Người trực tổng đài")***

Nhiệm vụ của Server là:

1.  Mở một "Cổng" (Port) và lắng nghe.
2.  Khi có Client gọi đến, "nhấc máy" (chấp nhận kết nối).
3.  Cầm lấy "Mic" và "Loa" để chuẩn bị nói chuyện.

#### ***Bước 1.1: Mở Tổng đài (Lớp `ServerSocket`)***

Việc đầu tiên Server cần làm là nói với hệ điều hành: "Này, tôi muốn nhận các cuộc gọi đến ở cổng số 9999."

```java
import java.net.ServerSocket;
import java.net.Socket;

public class ChatServer {
    public static void main(String[] args) {
        try {
            // 1. Mở tổng đài ở cổng 9999
            int port = 9999;
            ServerSocket serverSocket = new ServerSocket(port);
            System.out.println("Server đang chạy và lắng nghe ở cổng " + port);

            // ... (Các bước tiếp theo)

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

***Giải thích (Peyman):***

*   `ServerSocket serverSocket = new ServerSocket(port);`
    *   ***Analogy:*** Đây chính là hành động bạn cắm điện thoại tổng đài vào ổ điện. Bạn chưa nói chuyện, bạn chỉ mới sẵn sàng nhận cuộc gọi. Con số `9999` là số máy lẻ mà bạn chọn. Bất kỳ Client nào muốn nói chuyện với bạn đều phải quay số này.

#### ***Bước 1.2: Chờ và Nhấc máy (Hàm `accept()`)***

Tổng đài đã mở. Giờ người trực tổng đài phải ngồi... chờ.

```java
// Thêm vào sau dòng ServerSocket...
try {
    // ...
    System.out.println("Đang chờ Client kết nối...");

    // 2. Chờ ai đó gọi đến. Dòng này sẽ "treo" (block)
    Socket clientSocket = serverSocket.accept();

    System.out.println("Client đã kết nối từ: " + clientSocket.getInetAddress());

    // ... (Các bước tiếp theo)

} catch (Exception e) {
    e.printStackTrace();
}
```

***Giải thích (Peyman):***

*   `Socket clientSocket = serverSocket.accept();`
    *   ***Analogy:*** Đây là hành động quan trọng nhất. `accept()` có nghĩa là "chấp nhận". Dòng code này sẽ dừng chương trình của bạn lại (giống như người trực tổng đài ngồi im nhìn vào bảng điện thoại).
    *   Chương trình sẽ chờ... cho đến khi... ***Reng! Reng!*** 🔔
    *   Khi có một Client gọi đến cổng 9999, hàm `accept()` sẽ "nhấc máy".
    *   Và nó trả về một thứ cực kỳ quan trọng: một đối tượng `Socket`.

***Khoan, tại sao lại là `Socket`?***

*   `ServerSocket` (Tổng đài) không trực tiếp nói chuyện. Nhiệm vụ của nó chỉ là lắng nghe và nối máy.
*   `Socket` (Cuộc gọi) mới là thứ dùng để nói chuyện. `clientSocket` chính là cuộc gọi riêng mà tổng đài vừa kết nối cho bạn với vị khách đó.

#### ***Bước 1.3: Lấy "Mic" và "Loa" (Streams)***

OK, đã kết nối. Giờ chúng ta cần phương tiện để nói và nghe qua cái `clientSocket` này.

```java
import java.io.InputStream;
import java.io.OutputStream;
// ... (Thêm các import này ở đầu file)

// ...
try {
    // ...
    System.out.println("Client đã kết nối...");
    Socket clientSocket = serverSocket.accept();

    // 3. Lấy luồng vào (Loa) và luồng ra (Mic)
    InputStream input = clientSocket.getInputStream();
    OutputStream output = clientSocket.getOutputStream();

    // ... (Bước 4: Nói chuyện)

} catch (Exception e) {
    e.printStackTrace();
}
```

***Giải thích (Peyman):***

*   `clientSocket.getInputStream()`: Đây là hành động "cầm lấy cái Loa 🔈". Bất cứ thứ gì Client nói (gửi), chúng ta sẽ nghe (đọc) được từ cái `input` này.
*   `clientSocket.getOutputStream()`: Đây là hành động "cầm lấy cái Micrô 🎤". Bất cứ thứ gì chúng ta nói (viết) vào cái `output` này, Client sẽ nghe (đọc) được.

Server đã sẵn sàng! Giờ chúng ta qua xây dựng Client.

### ***Phần 2: Xây dựng Client (📞 "Người gọi điện")***

Nhiệm vụ của Client đơn giản hơn:

1.  Biết địa chỉ và cổng của Server.
2.  Chủ động "quay số" để kết nối.
3.  Cầm lấy "Mic" và "Loa".

#### ***Bước 2.1: Quay số (Lớp `Socket`)***

Client không cần `ServerSocket`, vì Client không lắng nghe. Client hành động.

```java
import java.net.Socket;
import java.io.InputStream;
import java.io.OutputStream;

public class ChatClient {
    public static void main(String[] args) {
        try {
            // 1. Quay số đến Server
            String serverAddress = "localhost"; // Hoặc "127.0.0.1"
            int serverPort = 9999;
            Socket socket = new Socket(serverAddress, serverPort);

            System.out.println("Đã kết nối tới Server!");

            // 2. Lấy luồng vào (Loa) và luồng ra (Mic)
            InputStream input = socket.getInputStream();
            OutputStream output = socket.getOutputStream();

            // ... (Bước 3: Nói chuyện)

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
```

***Giải thích (Peyman):***

*   `Socket socket = new Socket("localhost", 9999);`
    *   ***Analogy:*** Đây chính là hành động nhấc máy và bấm số.
    *   `"localhost"`: Là "số điện thoại" của Server. `localhost` là một tên đặc biệt, có nghĩa là "chính máy tính này". (Vì chúng ta đang chạy cả Server và Client trên cùng 1 máy để thử). Nếu Server ở máy khác, bạn sẽ điền IP của máy đó, ví dụ `192.168.1.50`.
    *   `9999`: Là "số máy lẻ" (Port) mà Server đang lắng nghe. Phải khớp 100% với số trên `ServerSocket`.

Ngay khi dòng code này chạy, nó sẽ tìm đến Server. Server đang chờ ở `accept()` sẽ "nhấc máy". Và ***Bùm!*** 💥 Kết nối được thiết lập.

Lúc này, cả Server và Client đều có "Mic" (`OutputStream`) và "Loa" (`InputStream`).

### ***Phần 3: Cuộc hội thoại Hai chiều (Nói và Nghe)***

Đây là phần thú vị nhất. Chúng ta có "Loa" và "Mic", nhưng chúng chỉ hiểu "ngôn ngữ máy" (bytes). Chúng ta chat bằng văn bản (String).

***Vấn đề:*** Làm sao để dịch `String` (chữ) của chúng ta thành `byte` (để "nói vào Mic") và dịch `byte` (từ "Loa") ngược lại thành `String`?

***Giải pháp:*** Chúng ta thuê "Trợ lý".

*   ***Để Gửi tin (Nói):*** Chúng ta dùng `PrintWriter`. Nó sẽ dịch `String` của bạn thành byte và gửi đi.
*   ***Để Nhận tin (Nghe):*** Chúng ta dùng `BufferedReader` và `InputStreamReader`. Cặp đôi này sẽ hứng byte từ "Loa", dịch chúng thành chữ, và ghép lại thành câu hoàn chỉnh.

#### Bước 3.1: Gửi Dữ liệu (Dùng `PrintWriter` ✍️)

Hãy tưởng tượng `PrintWriter` là người trợ lý ghi chép. Bạn đưa cho anh ta một câu (String), anh ta sẽ mã hóa nó và hét vào Mic (`OutputStream`).

```java
// Thêm import:
import java.io.PrintWriter;

// ...
// Lấy Mic
OutputStream output = socket.getOutputStream();

// Thuê "Trợ lý Ghi" gắn vào Mic
// true (autoFlush) nghĩa là: "Nói xong câu nào gửi đi ngay lập tức!"
PrintWriter writer = new PrintWriter(output, true);

// Gửi tin nhắn đầu tiên
writer.println("Xin chào Server, tôi là Client!");
```

***Giải thích (Peyman):***

*   `new PrintWriter(output, true)`: Chúng ta "gắn" Trợ lý `PrintWriter` vào cái Mic `output`.
*   `true` (autoFlush): ***CỰC KỲ QUAN TRỌNG***. Nó nghĩa là "Gửi đi ngay!". Nếu bạn để là `false` (mặc định), `PrintWriter` sẽ... lười biếng. Nó sẽ gom nhiều câu của bạn lại (để tiết kiệm) rồi mới gửi đi một cục. Nhưng đây là chat, chúng ta muốn gửi ngay!
*   `writer.println(...)`: Đây là hành động "Nói!". `println` tiện lợi vì nó tự động thêm dấu xuống dòng (Enter) vào cuối, báo hiệu cho bên kia biết là "hết câu".

#### Bước 3.2: Đọc Dữ liệu (Dùng `BufferedReader` 🎧)

Bây giờ là "Nghe". Việc này cần 2 trợ lý:

1.  `InputStreamReader`: Anh chàng này đứng sát "Loa" (`input`), nhặt từng byte và dịch thành ký tự (ví dụ: 'a', 'b', 'c').
2.  `BufferedReader`: Anh chàng này thông minh hơn. Anh ta đứng sau `InputStreamReader`, lấy các ký tự đó và đệm (buffer) chúng lại, cho đến khi nào gặp dấu xuống dòng (Enter), anh ta sẽ gộp tất cả lại thành một `String` (một câu hoàn chỉnh) và đưa cho bạn.

```java
// Thêm import:
import java.io.BufferedReader;
import java.io.InputStreamReader;

// ...
// Lấy Loa
InputStream input = socket.getInputStream();

// Thuê "Trợ lý Đọc"
// Bọc từ trong ra ngoài: input -> InputStreamReader -> BufferedReader
BufferedReader reader = new BufferedReader(new InputStreamReader(input));

// Chờ nghe một câu...
// Dòng này lại "treo" (block) cho đến khi có tin nhắn!
String line = reader.readLine();

System.out.println("Tin nhắn nhận được: " + line);
```

***Giải thích (Peyman):***

*   `reader.readLine()`: Tương tự `accept()`, đây là một hàm ***blocking***. Nó sẽ ngồi im, "ghé tai vào Loa", và chờ... chờ...
*   Khi `PrintWriter` ở bên kia dùng `println()` gửi một câu, `readLine()` sẽ nhận được nó, trả về câu đó dưới dạng `String` (ví dụ: "Xin chào Server, tôi là Client!"), và chương trình tiếp tục chạy.

### ***Phần 4: Vấn đề Cực lớn (Và Giải pháp)***

Chúng ta đã có đủ công cụ. Giờ hãy thử ghép chúng lại.

Nếu Server làm thế này:

1.  Đọc tin nhắn từ Client (`reader.readLine()`)
2.  In ra màn hình.
3.  Gõ trả lời (`writer.println()`)

Client cũng làm thế này:

1.  Gõ gửi tin nhắn (`writer.println()`)
2.  Chờ Server trả lời (`reader.readLine()`)
3.  In ra màn hình.

Bạn thấy vấn đề không? Nó giống như hai người dùng bộ đàm (walkie-talkie). Một người phải nói "Over!" (Hết) thì người kia mới được nói. Cả hai không thể nói cùng một lúc.

Nếu cả hai cùng chạy `reader.readLine()` (cùng ghé tai vào Loa), cả hai sẽ cùng chờ... và không ai nói cả! 😵 Đây gọi là ***Deadlock***.

***Giải pháp (Đây là bí mật của ứng dụng chat):*** Chúng ta cần ***Đa luồng (Threading)***. Nghe có vẻ đáng sợ, nhưng ý tưởng rất đơn giản:

Hãy tưởng tượng bạn (chương trình chính) phân thân ra làm hai.

*   ***Bản thể 1 (Luồng chính - Main Thread):*** Chỉ làm một việc: Chờ bạn gõ phím. Khi bạn gõ xong và Enter, nó dùng `PrintWriter` (Mic) để gửi đi.
*   ***Bản thể 2 (Luồng mới - New Thread):*** Chỉ làm một việc: Chạy một vòng lặp vĩnh viễn `while(true)`, liên tục "ghé tai vào Loa" (`reader.readLine()`). Hễ nghe được gì, nó lập tức in ra màn hình.

Bằng cách này, bạn có thể vừa gõ tin nhắn của mình (ở Luồng 1) trong khi vẫn nhận được tin nhắn của người khác (ở Luồng 2) ngay lập tức. Đó mới là chat!

### ***Phần 5: Code Hoàn chỉnh (Ghép tất cả lại)***

Đây là code cuối cùng cho một ứng dụng chat 2 chiều thực sự.

#### 📁 ChatServer.java (Tổng đài)

```java
import java.io.*;
import java.net.ServerSocket;
import java.net.Socket;
import java.util.Scanner;

public class ChatServer {

    public static void main(String[] args) {
        try (ServerSocket serverSocket = new ServerSocket(9999)) {
            System.out.println("Server đang chờ kết nối ở cổng 9999...");
            Socket clientSocket = serverSocket.accept();
            System.out.println("Client đã kết nối!");

            // Cầm lấy "Loa" và "Mic"
            BufferedReader reader = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
            PrintWriter writer = new PrintWriter(clientSocket.getOutputStream(), true);

            // Bắt đầu "Luồng Nghe" (Bản thể 2)
            // Chúng ta tạo một "nhân viên" mới chỉ để nghe
            Thread listenThread = new Thread(() -> {
                try {
                    String clientMessage;
                    while ((clientMessage = reader.readLine()) != null) {
                        System.out.println("Client nói: " + clientMessage);
                    }
                } catch (IOException e) {
                    System.out.println("Client đã ngắt kết nối.");
                }
            });
            listenThread.start(); // Cho "nhân viên" bắt đầu làm việc

            // Luồng chính (Bản thể 1) dùng để "Nói"
            Scanner consoleScanner = new Scanner(System.in);
            String serverMessage;
            while (true) {
                serverMessage = consoleScanner.nextLine();
                writer.println(serverMessage); // Gửi đi
            }

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

#### 📁 ChatClient.java (Người gọi)

Code của Client gần như giống hệt Server, chỉ khác ở bước kết nối ban đầu.

```java
import java.io.*;
import java.net.Socket;
import java.util.Scanner;

public class ChatClient {

    public static void main(String[] args) {
        try (Socket socket = new Socket("localhost", 9999)) {
            System.out.println("Đã kết nối tới Server!");

            // Cầm lấy "Loa" và "Mic"
            BufferedReader reader = new BufferedReader(new InputStreamReader(socket.getInputStream()));
            PrintWriter writer = new PrintWriter(socket.getOutputStream(), true);

            // Bắt đầu "Luồng Nghe" (Bản thể 2)
            Thread listenThread = new Thread(() -> {
                try {
                    String serverMessage;
                    while ((serverMessage = reader.readLine()) != null) {
                        System.out.println("Server nói: " + serverMessage);
                    }
                } catch (IOException e) {
                    System.out.println("Server đã ngắt kết nối.");
                }
            });
            listenThread.start(); // Cho "nhân viên" bắt đầu làm việc

            // Luồng chính (Bản thể 1) dùng để "Nói"
            Scanner consoleScanner = new Scanner(System.in);
            String clientMessage;
            while (true) {
                clientMessage = consoleScanner.nextLine();
                writer.println(clientMessage); // Gửi đi
            }

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

### Cách chạy thử

1.  Mở 2 cửa sổ terminal (hoặc 2 tab trong IDE của bạn).
2.  Biên dịch cả 2 file: `javac ChatServer.java` và `javac ChatClient.java`.
3.  ***Cửa sổ 1:*** Chạy Server trước: `java ChatServer`
    *   Bạn sẽ thấy: `Server đang chờ kết nối ở cổng 9999...`
4.  ***Cửa sổ 2:*** Chạy Client: `java ChatClient`
    *   Bạn sẽ thấy: `Đã kết nối tới Server!`
    *   Đồng thời, Cửa sổ 1 sẽ hiển thị: `Client đã kết nối!`

Bây giờ, hãy gõ bất cứ thứ gì vào một cửa sổ và nhấn Enter. Nó sẽ xuất hiện ngay lập tức ở cửa sổ bên kia!

Bạn đã làm được rồi đó! Bạn vừa xây dựng một ứng dụng chat hai chiều từ con số 0, hiểu rõ từng bước một. 🎉