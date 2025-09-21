'use client';

import { useEffect, useState } from 'react';

export default function AutoRefresh() {
  const [nextRefresh, setNextRefresh] = useState<Date | null>(null);

  useEffect(() => {
    // Вычисляем время следующего обновления (15 минут от текущего времени)
    const calculateNextRefresh = () => {
      const now = new Date();
      const next = new Date(now.getTime() + 15 * 60 * 1000); // +15 минут
      setNextRefresh(next);
      return next;
    };

    // Устанавливаем первое время обновления
    const firstRefresh = calculateNextRefresh();
    
    console.log(`🔄 Auto-refresh scheduled for: ${firstRefresh.toLocaleTimeString()}`);

    // Автоматическое обновление страницы каждые 15 минут (900 секунд)
    // Синхронизировано с ISR revalidate времени
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing page to sync with new data and reset Pacman...');
      
      // Показываем уведомление перед обновлением (опционально)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('OG Lab Menu', {
          body: 'Обновление меню и сброс анимации...',
          icon: '/assets/images/oglab_logo_round.svg'
        });
      }
      
      // Небольшая задержка для плавности
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
      // Обновляем время следующего обновления
      calculateNextRefresh();
    }, 15 * 60 * 1000); // 15 минут в миллисекундах

    // Слушаем серверные изменения (Supabase realtime) и обновляем немедленно
    try {
      // Динамический импорт чтобы не тянуть клиент, если не нужен
      import('@supabase/supabase-js').then(({ createClient }) => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
        if (!url || !key) return
        const sb = createClient(url, key)
        // Слушаем любые изменения в таблице menu_items и theme
        const sub = sb
          .channel('realtime-menu')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => {
            console.log('🟢 Realtime: menu_items changed → hard reload')
            window.location.reload()
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_layout' }, () => {
            console.log('🟢 Realtime: menu_layout changed → hard reload')
            window.location.reload()
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'theme' }, () => {
            console.log('🟢 Realtime: theme changed → hard reload')
            window.location.reload()
          })
          .subscribe()

        // Очистка подписки
        window.addEventListener('beforeunload', () => {
          try { sb.removeChannel(sub) } catch {}
        })
      })
    } catch {}

    // Запрашиваем разрешение на уведомления (опционально)
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Очистка интервала при размонтировании компонента
    return () => {
      clearInterval(refreshInterval);
    };
  }, []);

  // Компонент невидимый, только выполняет логику
  // Можно добавить индикатор времени до следующего обновления в консоль
  useEffect(() => {
    if (!nextRefresh) return;

    const logInterval = setInterval(() => {
      const now = new Date();
      const timeLeft = Math.max(0, nextRefresh.getTime() - now.getTime());
      const minutesLeft = Math.floor(timeLeft / (1000 * 60));
      const secondsLeft = Math.floor((timeLeft % (1000 * 60)) / 1000);
      
      if (timeLeft > 0) {
        console.log(`⏰ Next auto-refresh in: ${minutesLeft}m ${secondsLeft}s`);
      }
    }, 60000); // Логируем каждую минуту

    return () => clearInterval(logInterval);
  }, [nextRefresh]);

  return null;
}
