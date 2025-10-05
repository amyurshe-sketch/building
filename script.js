document.addEventListener('DOMContentLoaded', () => {
    // Тема
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('i');
    const body = document.body;

    // Язык
    const langToggle = document.getElementById('langToggle');
    let currentLang = body.getAttribute('lang') || 'ru';

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

    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'ru' ? 'en' : 'ru';
        setLang(currentLang);
        localStorage.setItem('lang', currentLang);
    });

    function setLang(lang) {
        document.body.setAttribute('lang', lang);
        document.querySelectorAll('.lang-ru').forEach(el => {
            el.style.display = lang === 'ru' ? '' : 'none';
        });
        document.querySelectorAll('.lang-en').forEach(el => {
            el.style.display = lang === 'en' ? '' : 'none';
        });
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

        // Отправка в Telegram через api/telegram.js
        try {
            await sendToTelegram({
                name,
                phone,
                message
            });
            form.reset();
            showMessage(currentLang === 'ru' ? 'Спасибо! Ваша заявка отправлена.' : 'Thank you! Your request has been sent.', 'success');
        } catch (err) {
            showMessage(currentLang === 'ru' ? 'Ошибка отправки. Попробуйте позже.' : 'Sending failed. Please try again later.', 'error');
        }
    });

    function showMessage(text, type) {
        formMessage.textContent = text;
        formMessage.style.color = type === 'success' ? '#3a7d3a' : '#d9534f';
        setTimeout(() => {
            formMessage.textContent = '';
        }, 4000);
    }
});