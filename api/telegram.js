// api/telegram.js - БЕЗОПАСНАЯ ВЕРСИЯ
export default async function handler(req, res) {
  // Разрешаем CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Обрабатываем preflight запрос
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Обрабатываем только POST запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, phone, service, message } = req.body;
    
    // Проверяем обязательные поля
    if (!name || !phone) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Имя и телефон обязательны' 
      });
    }

    // ПОЛУЧАЕМ ТОКЕНЫ ИЗ ПЕРЕМЕННЫХ ОКРУЖЕНИЯ VERCEL
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    // Проверяем наличие переменных окружения
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error('Missing Telegram environment variables');
      return res.status(500).json({ 
        status: 'error', 
        message: 'Server configuration error' 
      });
    }

    const text = `📌 Новая заявка с сайта:\n\n👤 Имя: ${name}\n📞 Телефон: ${phone}\n✂️ Услуга: ${service}\n💬 Сообщение: ${message || 'Без дополнительных пожеланий'}\n\n🌐 Источник: Демо-сайт барбершопа`;

    // Отправляем в Telegram (ИСПОЛЬЗУЕМ ПЕРЕМЕННЫЕ ОКРУЖЕНИЯ)
    const telegramResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: text,
        parse_mode: 'HTML'
      })
    });

    const result = await telegramResponse.json();

    if (result.ok) {
      res.status(200).json({ 
        status: 'success', 
        message: 'Заявка отправлена!' 
      });
    } else {
      console.error('Telegram API error:', result);
      res.status(500).json({ 
        status: 'error', 
        message: 'Ошибка отправки в Telegram' 
      });
    }

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Внутренняя ошибка сервера' 
    });
  }
}
