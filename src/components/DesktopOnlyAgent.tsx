'use client';

import { useState, useEffect } from 'react';
import OGLabAgent from './OGLabAgent';

/**
 * Компонент-обертка для OGLabAgent, который показывается только на десктопах
 * и надежно скрывается на телевизорах и мобильных устройствах
 */
export default function DesktopOnlyAgent() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Проверка 1: User Agent (TV keywords)
    const ua = navigator.userAgent.toLowerCase();
    const tvKeywords = [
      'smart-tv', 'smarttv', 'googletv', 'appletv', 
      'hbbtv', 'pov_tv', 'netcast', 'nettv',
      'web0s', 'webos', // LG
      'tizen', // Samsung
      'viera', 'bravia', // Panasonic, Sony
    ];
    const isTVUserAgent = tvKeywords.some(keyword => ua.includes(keyword));

    // Проверка 2: Очень большой экран (вероятно TV)
    const isVeryLargeScreen = window.screen.width > 1920 || window.innerWidth > 1920;

    // Проверка 3: Pointer type (грубый указатель = пульт или тач)
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

    // Проверка 4: Отсутствие hover (обычно TV)
    const hasNoHover = window.matchMedia('(hover: none)').matches;

    // Показываем только если:
    // - НЕ телевизор по User Agent
    // - НЕ очень большой экран
    // - Есть точный указатель (мышь) ИЛИ есть hover
    const isDesktop = !isTVUserAgent && !isVeryLargeScreen && (!hasCoarsePointer || !hasNoHover);

    setShouldShow(isDesktop);

    // Логирование для отладки (можно убрать в продакшене)
    if (process.env.NODE_ENV === 'development') {
      console.log('🖥️ DesktopOnlyAgent detection:', {
        isTVUserAgent,
        isVeryLargeScreen,
        hasCoarsePointer,
        hasNoHover,
        shouldShow: isDesktop,
        screenWidth: window.screen.width,
        innerWidth: window.innerWidth,
      });
    }
  }, []);

  // Не рендерим ничего на сервере (SSR) или если не должны показывать
  if (!shouldShow) {
    return null;
  }

  return <OGLabAgent compact />;
}
