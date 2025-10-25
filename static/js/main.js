(function() {
    const toggleButton = document.getElementById('dark-mode-toggle');
    if (!toggleButton) {
        // console.log("Không tìm thấy nút dark mode toggle.");
        return; // Thoát nếu không tìm thấy nút (ví dụ: lỗi gõ ID)
    }

    const lightIcon = toggleButton.querySelector('.light-icon');
    const darkIcon = toggleButton.querySelector('.dark-icon');
    const htmlEl = document.documentElement;

    // Hàm cập nhật icon
    function updateIcon(isDarkMode) {
        if (lightIcon && darkIcon) {
            if (isDarkMode) {
                lightIcon.classList.remove('hidden');
                darkIcon.classList.add('hidden');
            } else {
                lightIcon.classList.add('hidden');
                darkIcon.classList.remove('hidden');
            }
        }
    }

    // Kiểm tra trạng thái đã lưu trong localStorage hoặc trạng thái hệ thống
    let isDarkMode;
    if (localStorage.getItem('color-theme') === 'dark' || 
        (!('color-theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        htmlEl.classList.add('dark');
        isDarkMode = true;
    } else {
        htmlEl.classList.remove('dark');
        isDarkMode = false;
    }
    
    // Cập nhật icon lúc tải trang
    updateIcon(isDarkMode);

    // Xử lý sự kiện click
    toggleButton.addEventListener('click', function() {
        // Đảo ngược trạng thái
        isDarkMode = !isDarkMode;
        
        if (isDarkMode) {
            htmlEl.classList.add('dark');
            localStorage.setItem('color-theme', 'dark');
        } else {
            htmlEl.classList.remove('dark');
            localStorage.setItem('color-theme', 'light');
        }

        // Cập nhật icon
        updateIcon(isDarkMode);
    });

})();

