document.addEventListener('DOMContentLoaded', () => {
    // Тема
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');
    const body = document.body;

    // Язык
    const langToggle = document.getElementById('langToggle');
    let currentLang = body.getAttribute('lang') || 'ru';

    // Навигация
    const navToggle = document.getElementById('navToggle');
    const mainNav = document.getElementById('mainNav');

    // Восстановление темы
    if (localStorage.getItem('theme') === 'dark') {
        body.classList.remove('theme-light');
        body.classList.add('theme-dark');
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }

    // Восстановление языка
    if (localStorage.getItem('lang') === 'en') {
        setLang('en');
    }

    // Переключение темы
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('theme-dark');
        body.classList.toggle('theme-light');
        if (body.classList.contains('theme-dark')) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
            localStorage.setItem('theme', 'dark');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
            localStorage.setItem('theme', 'light');
        }
    });

    // Переключение языка
    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'ru' ? 'en' : 'ru';
        setLang(currentLang);
        localStorage.setItem('lang', currentLang);
    });

    // Мобильное меню
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        mainNav.classList.toggle('active');
        body.style.overflow = mainNav.classList.contains('active') ? 'hidden' : '';
    });

    // Закрытие меню при клике на ссылку
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            mainNav.classList.remove('active');
            body.style.overflow = '';
        });
    });

    // Закрытие меню при клике вне его
    document.addEventListener('click', (e) => {
        if (!mainNav.contains(e.target) && !navToggle.contains(e.target) && mainNav.classList.contains('active')) {
            navToggle.classList.remove('active');
            mainNav.classList.remove('active');
            body.style.overflow = '';
        }
    });

    // Закрытие меню при изменении ориентации
    window.addEventListener('orientationchange', () => {
        if (window.innerWidth > 768) {
            navToggle.classList.remove('active');
            mainNav.classList.remove('active');
            body.style.overflow = '';
        }
    });

    function setLang(lang) {
        document.body.setAttribute('lang', lang);
        document.querySelectorAll('.lang-ru').forEach(el => {
            el.style.display = lang === 'ru' ? '' : 'none';
        });
        document.querySelectorAll('.lang-en').forEach(el => {
            el.style.display = lang === 'en' ? '' : 'none';
        });
        
        // Обновляем aria-label для кнопки меню
        navToggle.setAttribute('aria-label', lang === 'ru' ? 'Меню' : 'Menu');
    }

    // Форма
    const form = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const name = form.elements['name'].value.trim();
        const phone = form.elements['phone'].value.trim();
        const message = form.elements['message'].value.trim();

        if (!name || !phone || !message) {
            showMessage(currentLang === 'ru' ? 'Пожалуйста, заполните все поля' : 'Please fill in all fields', 'error');
            return;
        }

        // Показать состояние загрузки
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = currentLang === 'ru' ? 'Отправка...' : 'Sending...';
        submitBtn.disabled = true;

        try {
            await sendToTelegram({
                name,
                phone,
                message
            });
            form.reset();
            showMessage(currentLang === 'ru' ? 'Спасибо! Ваша заявка отправлена.' : 'Thank you! Your request has been sent.', 'success');
        } catch (err) {
            console.error('Ошибка отправки:', err);
            showMessage(currentLang === 'ru' ? 'Ошибка отправки. Попробуйте позже.' : 'Sending failed. Please try again later.', 'error');
        } finally {
            // Восстановить кнопку
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });

    function showMessage(text, type) {
        formMessage.textContent = text;
        formMessage.style.color = type === 'success' ? '#3a7d3a' : '#d9534f';
        formMessage.style.backgroundColor = type === 'success' ? 'rgba(58,125,58,0.1)' : 'rgba(217,83,79,0.1)';
        
        // Автоматическое скрытие сообщения
        setTimeout(() => {
            formMessage.textContent = '';
            formMessage.style.backgroundColor = '';
        }, 5000);
    }

    // Плавная прокрутка для якорных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Lazy loading для изображений
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Оптимизация для touch devices
    let touchStartY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchmove', (e) => {
        // Предотвращаем скролл страницы когда меню открыто
        if (mainNav.classList.contains('active')) {
            e.preventDefault();
        }
    }, { passive: false });

    // Адаптация к изменению размера окна
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (window.innerWidth > 768) {
                navToggle.classList.remove('active');
                mainNav.classList.remove('active');
                body.style.overflow = '';
            }
        }, 250);
    });

    // Улучшенная доступность для клавиатуры
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            navToggle.classList.remove('active');
            mainNav.classList.remove('active');
            body.style.overflow = '';
        }
    });

    // Preload критичных ресурсов
    function preloadCriticalResources() {
        const criticalImages = [
            'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
            'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80'
        ];
        
        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    // Запуск preload когда страница загружена
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', preloadCriticalResources);
    } else {
        preloadCriticalResources();
    }
});

// Fallback для старых браузеров
if (!window.IntersectionObserver) {
    console.warn('IntersectionObserver не поддерживается, lazy loading отключен');
}