(function() {
    
document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const lightIcon = document.querySelector('.light-icon');
    const darkIcon = document.querySelector('.dark-icon');
    const html = document.documentElement;

    // Hàm cập nhật giao diện và lưu lựa chọn
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            html.classList.add('dark');
            darkIcon.classList.remove('hidden');
            lightIcon.classList.add('hidden');
        } else {
            html.classList.remove('dark');
            lightIcon.classList.remove('hidden');
            darkIcon.classList.add('hidden');
        }
        localStorage.setItem('theme', theme);
    };

    // Kiểm tra khi tải trang:
    // 1. Ưu tiên lựa chọn đã lưu trong localStorage.
    // 2. Nếu không có, kiểm tra cài đặt của hệ điều hành.
    // 3. Mặc định là chế độ sáng.
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (prefersDark) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }

    // Lắng nghe sự kiện click vào nút bấm
    darkModeToggle.addEventListener('click', () => {
        const currentTheme = html.classList.contains('dark') ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    });

    // --- PDF Modal Logic ---
    const modal = document.getElementById('pdf-modal');
    if (modal) {
        const closeModalBtn = document.getElementById('close-modal');
        const pdfIframe = document.getElementById('pdf-iframe');
        const modalTitle = document.getElementById('pdf-modal-title');
        const certificateItems = document.querySelectorAll('.certificate-item');

        certificateItems.forEach(item => {
            item.addEventListener('click', () => {
                const pdfSrc = item.getAttribute('data-pdf-src');
                const certTitle = item.querySelector('h3').textContent;
                
                if (pdfSrc && pdfIframe) {
                    pdfIframe.setAttribute('src', pdfSrc);
                    modalTitle.textContent = certTitle;
                    modal.classList.remove('hidden');
                    modal.classList.add('flex');
                }
            });
        });

        const closeModal = () => {
            if (modal && pdfIframe) {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
                pdfIframe.setAttribute('src', ''); // Clear src to stop video/pdf loading
            }
        };

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeModal);
        }

        // Close modal when clicking outside the content
        modal.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
                closeModal();
            }
        });
    }
});

})();