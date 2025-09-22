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
          // Админские команды управления экранами
          .on('broadcast', { event: 'soft-refresh' }, () => {
            console.log('🟡 Admin broadcast: soft-refresh → dispatch softRefresh event')
            try { window.dispatchEvent(new Event('softRefresh')) } catch {}
          })
          .on('broadcast', { event: 'hard-refresh' }, () => {
            console.log('🔴 Admin broadcast: hard-refresh → hard reload')
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

    // ------------------------------
    // Watchdog: детект зависаний и авто-восстановление
    // ------------------------------
    let rafId = 0;
    let lastRafBeat = typeof performance !== 'undefined' ? performance.now() : Date.now();
    let consecutiveStalls = 0;

    const HEARTBEAT_TIMEOUT_MS = 15_000; // если rAF не тикает > 15с — считаем фризом
    const CHECK_EVERY_MS = 5_000; // проверяем раз в 5с
    const MAX_CONSECUTIVE_STALLS = 2; // 2 подряд проверки → перезагрузка

    const rafBeat = () => {
      lastRafBeat = typeof performance !== 'undefined' ? performance.now() : Date.now();
      rafId = requestAnimationFrame(rafBeat);
    };
    // Запускаем пульс rAF
    rafId = requestAnimationFrame(rafBeat);

    // Периодическая проверка лага главного потока
    const watchdogInterval = setInterval(() => {
      // Если страница скрыта — пропускаем (браузер может легитимно тормозить таймеры)
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        consecutiveStalls = 0;
        return;
      }

      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const lag = now - lastRafBeat;

      if (lag > HEARTBEAT_TIMEOUT_MS) {
        consecutiveStalls += 1;
        console.warn(`⚠️ Watchdog: main thread stall detected: ~${Math.round(lag)}ms (x${consecutiveStalls})`);
        if (consecutiveStalls >= MAX_CONSECUTIVE_STALLS) {
          console.warn('🔁 Watchdog: forcing reload due to repeated stalls');
          try {
            // Мягкая попытка отправить маяк (не критично)
            navigator.sendBeacon?.('/api/revalidate');
          } catch {}
          window.location.reload();
        }
      } else {
        consecutiveStalls = 0;
      }
    }, CHECK_EVERY_MS);

    // Перезагрузка при фатальных ошибках рантайма
    const onFatal = (e: unknown) => {
      console.error('💥 Fatal error caught by watchdog:', e);
      setTimeout(() => window.location.reload(), 1000);
    };
    window.addEventListener('error', onFatal);
    window.addEventListener('unhandledrejection', onFatal as EventListener);

    // Автопереподключение при потере/возврате сети
    const onOnline = () => {
      console.log('🌐 Online — refreshing to recover connections');
      window.location.reload();
    };
    window.addEventListener('online', onOnline);

    // Очистка интервалов/листенеров при размонтировании компонента
    return () => {
      clearInterval(refreshInterval);
      if (watchdogInterval) clearInterval(watchdogInterval);
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('error', onFatal);
      window.removeEventListener('unhandledrejection', onFatal as EventListener);
      window.removeEventListener('online', onOnline);
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
