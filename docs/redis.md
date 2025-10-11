# Redis (Upstash) — Каноническое руководство

Это основной документ по Redis: зачем он нам, как мы его используем, ключи/TTL, прогрев, мониторинг, отказы и отладка.

## 1) Назначение

- Ускорение критичных операций (3–5 ms) против БД (100–200 ms)
- Снижение нагрузки на БД на 60–70%
- Кэширование: профили, разговоры, меню, динамические настройки, аналитика, заказы, семантический кэш

## 2) Ключи и TTL (сводно)

```text
user:profile:{userId}           TTL 300s
user:telegram:{telegramId}      TTL 300s
conversation:{conversationId}   TTL 600s
conversations:user:{userId}     TTL 900s
menu:items                      TTL 1800s
settings:dynamic                TTL 3600s
analytics:today                 TTL 300s
analytics:top-products:{days}   TTL 1800s
orders:user:{userId}            TTL 600s
orders:pending                  TTL 60s
orders:today                    TTL 300s
order:status:{orderId}          TTL 120s
semantic:{hash}                 TTL 3600s
```

Источник: `src/lib/redis-client.ts` (Phase 1/2 keys и TTL).

## 3) Паттерны использования

- cacheOrFetch(key, ttl, fetchFn): единый способ кэшировать ответ функции
- Двухуровневый кэш: Redis → Memory → БД (graceful degradation)
- Инвалидация при изменениях (профили, сообщения, статусы заказов)

## 4) Прогрев кэша

- Авто: `warmupCriticalCaches()` при старте (меню, динамические настройки, аналитика)
- Ручной через API: `POST /api/cache {"action":"warmup"}` или `{ "action":"warmup-menu" }`
- CLI: `npm run warmup-cache`

## 5) Мониторинг и операции

- Статус: `GET /api/cache` (available, stats)
- Очистка:
  - Весь кэш: `POST /api/cache {"action":"clear"}` (осторожно)
  - По префиксу: `POST /api/cache {"action":"clear-prefix","prefix":"user:profile:"}`
- Метрики наблюдать: hit rate (>80%), latency, доступность Redis

## 6) Отказоустойчивость

- Если Redis недоступен → fallback на память, потом БД
- Не блокировать пользовательский поток (особенно в стриминге AI)
- Логи: cache HIT/MISS, invalidate события

## 7) Семантический кэш (коротко)

- Redis хранит «горячие» exact ответы, Supabase pgvector — семантические подобия
- Hit-порог ~0.95; популярные запросы поднимаются в Redis

## 8) Траблшутинг

- Redis недоступен: проверить Upstash, сеть; временно жить на memory/DB
- Высокий MISS: добавить прогрев/увеличить TTL для горячих ключей
- Непоследовательные данные: убедиться в инвалидации соответствующих ключей

## 9) Ссылки

- Архитектура (Redis раздел): `docs/system_architecture.md`
- Операционный ранбук: `docs/operations_runbook.md`
- Старые доп. материалы (для деталей реализации):
  - `docs/redis_caching_guide.md`
  - `docs/redis_phase_2_optimizations.md`
  - `docs/redis_phase_2_status.md`
  - `docs/redis_implementation_summary.md`
  - `docs/redis_quick_start_ru.md`
  - `docs/redis_status.md`
