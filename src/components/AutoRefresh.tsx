'use client';

import { useEffect, useState } from 'react';

export default function AutoRefresh() {
  const [nextRefresh, setNextRefresh] = useState<Date | null>(null);

  useEffect(() => {
    // Защита от слишком частых перезагрузок
    const lastReloadKey = 'lastReloadTime';
    const minReloadInterval = 5000; // Минимум 5 секунд между перезагрузками
    
    // Проверяем, активен ли агент (не перезагружаем во время диалога)
    const isAgentActive = () => {
      if (typeof document === 'undefined') return false;
      
      // Проверяем, открыт ли агент по различным признакам
      const agentContainer = document.querySelector('[data-agent-active="true"]');
      const agentInput = document.querySelector('[data-agent-input]');
      const hasActiveInput = document.activeElement?.getAttribute('data-agent-input') === 'true';
      
      return !!(agentContainer || agentInput || hasActiveInput);
    };
    
    const safeReload = (source: string) => {
      const now = Date.now();
      const lastReload = parseInt(localStorage.getItem(lastReloadKey) || '0');
      
      // Проверка 1: Слишком частые перезагрузки
      if (now - lastReload < minReloadInterval) {
        console.warn(`🚫 RELOAD BLOCKED: Too frequent reload attempt from ${source}. Last reload was ${now - lastReload}ms ago`);
        return;
      }
      
      // Проверка 2: Агент активен - отложить перезагрузку
      if (isAgentActive()) {
        console.warn(`🚫 RELOAD DELAYED: Agent is active, postponing reload from ${source}`);
        // Попробуем позже (через 30 секунд)
        setTimeout(() => {
          if (!isAgentActive()) {
            safeReload(source + ' (delayed)');
          } else {
            console.log(`🚫 RELOAD STILL BLOCKED: Agent still active`);
          }
        }, 30000);
        return;
      }
      
      localStorage.setItem(lastReloadKey, now.toString());
      console.log(`🔄 RELOAD EXECUTING: ${source}`);
      window.location.reload();
    };

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
      console.log('🔄 RELOAD SOURCE: 15-minute auto-refresh timer');
      
      // Небольшая задержка для плавности
      setTimeout(() => {
        safeReload('15-minute timer');
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
            console.log('🔄 RELOAD SOURCE: Supabase realtime - menu_items changed')
            safeReload('Supabase realtime - menu_items')
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_layout' }, () => {
            console.log('🔄 RELOAD SOURCE: Supabase realtime - menu_layout changed')
            safeReload('Supabase realtime - menu_layout')
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'theme' }, () => {
            console.log('🔄 RELOAD SOURCE: Supabase realtime - theme changed')
            safeReload('Supabase realtime - theme')
          })
          // Админские команды управления экранами
          .on('broadcast', { event: 'soft-refresh' }, () => {
            console.log('🟡 SOFT-REFRESH RECEIVED: Admin broadcast - BUT IGNORING IT (temporarily disabled)')
            console.trace('🔍 SOFT-REFRESH STACK TRACE:')
            // ВРЕМЕННО ОТКЛЮЧЕНО: try { window.dispatchEvent(new Event('softRefresh')) } catch {}
          })
          .on('broadcast', { event: 'hard-refresh' }, () => {
            console.log('🔄 RELOAD SOURCE: Admin broadcast - hard-refresh')
            safeReload('Admin broadcast - hard-refresh')
          })
          .subscribe()

        // Очистка подписки
        window.addEventListener('beforeunload', () => {
          try { sb.removeChannel(sub) } catch {}
        })
      })
    } catch {}

    // ------------------------------
    // Watchdog: детект зависаний и авто-восстановление
    // ------------------------------
    let rafId = 0;
    let lastRafBeat = typeof performance !== 'undefined' ? performance.now() : Date.now();
    let consecutiveStalls = 0;

    // Улучшенная детекция ТВ и медленных устройств
    const detectDeviceType = () => {
      if (typeof navigator === 'undefined' || typeof window === 'undefined') return { isTV: false, isSlowDevice: false };

      const ua = navigator.userAgent;
      
      // Детекция ТВ по User-Agent
      const isTVByUA = ua.includes('TV') || ua.includes('WebOS') || ua.includes('Tizen') || 
                       ua.includes('SmartTV') || ua.includes('BRAVIA') || ua.includes('NetCast');
      
      // Детекция ТВ по характеристикам экрана
      const isTVByScreen = window.innerWidth >= 1920 && window.innerHeight >= 1080 && 
                          (!('ontouchstart' in window)); // ТВ обычно без тач-скрина
      
      // Детекция медленного устройства
      const isSlowDevice = (
        // Старые браузеры или медленные устройства
        !window.requestAnimationFrame ||
        !window.performance ||
        // Низкое разрешение при большом экране (растянутое изображение)
        (window.innerWidth >= 1920 && window.devicePixelRatio < 1.5) ||
        // Мало памяти (если доступно) - проверяем наличие экспериментального API
        (() => {
          const nav = navigator as Navigator & { deviceMemory?: number };
          return 'deviceMemory' in navigator && nav.deviceMemory && nav.deviceMemory <= 2;
        })()
      );

      return {
        isTV: isTVByUA || isTVByScreen,
        isSlowDevice
      };
    };

    const { isTV, isSlowDevice } = detectDeviceType();

    // Адаптивные параметры в зависимости от типа устройства
    const getWatchdogParams = () => {
      if (isTV) {
        // ТВ: очень мягкие параметры, отключаем только если это точно проблемное устройство
        const hasGoodPerformance = window.performance && 
                                  navigator.hardwareConcurrency && 
                                  navigator.hardwareConcurrency >= 4;
        return {
          timeout: 120_000, // 2 минуты
          checkInterval: 30_000, // 30 секунд
          maxStalls: 6,
          enabled: hasGoodPerformance // Включаем только для производительных ТВ
        };
      } else if (isSlowDevice) {
        // Медленные устройства: мягкие параметры
        return {
          timeout: 60_000, // 1 минута
          checkInterval: 20_000, // 20 секунд
          maxStalls: 4,
          enabled: true
        };
      } else {
        // Обычные устройства: стандартные параметры
        return {
          timeout: 30_000, // 30 секунд
          checkInterval: 10_000, // 10 секунд
          maxStalls: 3,
          enabled: true
        };
      }
    };

    const watchdogParams = getWatchdogParams();
    const HEARTBEAT_TIMEOUT_MS = watchdogParams.timeout;
    const CHECK_EVERY_MS = watchdogParams.checkInterval;
    const MAX_CONSECUTIVE_STALLS = watchdogParams.maxStalls;

    // Автоматическое отключение watchdog на основе детекции устройства
    const watchdogDisabled = !watchdogParams.enabled || process.env.NEXT_PUBLIC_DISABLE_WATCHDOG === 'true';

    const rafBeat = () => {
      lastRafBeat = typeof performance !== 'undefined' ? performance.now() : Date.now();
      rafId = requestAnimationFrame(rafBeat);
    };
    // Запускаем пульс rAF
    rafId = requestAnimationFrame(rafBeat);

    console.log(`🐕 Watchdog: TV=${isTV}, slow=${isSlowDevice}, disabled=${watchdogDisabled}, timeout=${HEARTBEAT_TIMEOUT_MS}ms, check=${CHECK_EVERY_MS}ms, maxStalls=${MAX_CONSECUTIVE_STALLS}`);
    console.log(`🐕 Device info: UA=${navigator.userAgent.substring(0, 50)}..., screen=${window.innerWidth}x${window.innerHeight}, cores=${navigator.hardwareConcurrency}`);

    // Периодическая проверка лага главного потока (только если не отключен)
    const watchdogInterval = !watchdogDisabled ? setInterval(() => {
      // Если страница скрыта — пропускаем (браузер может легитимно тормозить таймеры)
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        consecutiveStalls = 0;
        return;
      }

      // КРИТИЧНО: Если агент активен - не проверяем зависания (ввод текста может тормозить поток)
      if (isAgentActive()) {
        consecutiveStalls = 0;
        return;
      }

      // Дополнительные проверки для предотвращения ложных срабатываний
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      const lag = now - lastRafBeat;

      // Проверяем, не находимся ли мы в процессе загрузки или навигации
      const isLoading = typeof document !== 'undefined' && document.readyState !== 'complete';
      
      // Проверяем активность пользователя (если есть анимации, то все работает)
      const hasActiveAnimations = typeof document !== 'undefined' && 
        document.getAnimations && document.getAnimations().length > 0;
      
      // Проверяем, есть ли активный фокус на input/textarea (пользователь печатает)
      const hasActiveInput = typeof document !== 'undefined' && 
        document.activeElement && 
        (document.activeElement.tagName === 'INPUT' || 
         document.activeElement.tagName === 'TEXTAREA' ||
         document.activeElement.getAttribute('contenteditable') === 'true');

      if (lag > HEARTBEAT_TIMEOUT_MS && !isLoading && !hasActiveAnimations && !hasActiveInput) {
        consecutiveStalls += 1;
        console.warn(`⚠️ Watchdog: main thread stall detected: ~${Math.round(lag)}ms (x${consecutiveStalls}) [TV: ${isTV}]`);
        
        if (consecutiveStalls >= MAX_CONSECUTIVE_STALLS) {
          console.warn('🔄 RELOAD SOURCE: Watchdog - repeated main thread stalls detected');
          try {
            // Мягкая попытка отправить маяк (не критично)
            navigator.sendBeacon?.('/api/revalidate');
          } catch {}
          safeReload('Watchdog - main thread stalls');
        }
      } else {
        // Сброс счетчика если все нормально или есть активные анимации
        if (consecutiveStalls > 0 && (lag <= HEARTBEAT_TIMEOUT_MS || hasActiveAnimations || hasActiveInput)) {
          console.log(`✅ Watchdog: lag recovered, resetting stall counter (lag: ${Math.round(lag)}ms, hasAnimations: ${hasActiveAnimations}, hasInput: ${hasActiveInput})`);
        }
        consecutiveStalls = 0;
      }
    }, CHECK_EVERY_MS) : null;

    // Перезагрузка при фатальных ошибках рантайма (только если watchdog включен)
    const onFatal = (e: unknown) => {
      console.error('🔄 RELOAD SOURCE: Fatal error caught by watchdog:', e);
      setTimeout(() => safeReload('Fatal error'), 1000);
    };
    
    // Автопереподключение при потере/возврате сети (только если watchdog включен)
    const onOnline = () => {
      console.log('🔄 RELOAD SOURCE: Network reconnection detected');
      safeReload('Network reconnection');
    };

    if (!watchdogDisabled) {
      window.addEventListener('error', onFatal);
      window.addEventListener('unhandledrejection', onFatal as EventListener);
      window.addEventListener('online', onOnline);
    }

    // Очистка интервалов/листенеров при размонтировании компонента
    return () => {
      clearInterval(refreshInterval);
      if (watchdogInterval) clearInterval(watchdogInterval);
      if (rafId) cancelAnimationFrame(rafId);
      if (!watchdogDisabled) {
        window.removeEventListener('error', onFatal);
        window.removeEventListener('unhandledrejection', onFatal as EventListener);
        window.removeEventListener('online', onOnline);
      }
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
