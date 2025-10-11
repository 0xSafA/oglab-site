# ADR-008 — CMS: мультиязычные статьи, AEO/GEO, форум/FAQ, кросс‑постинг и комплаенс

## Статус
Proposed

## Контекст

Нужна единая CMS для создания и публикации уникального, индексируемого AI‑слоями контента, с мультиязычной редактурой, SEO/AEO/GEO-разметкой, форумом (UGC), FAQ, кросс‑постингом во внешние источники (Reddit, Medium и др.), автоматическими переводами/улучшениями (AI), проверкой уникальности и учётом вклада авторов для последующей оплаты. Медиа (карусели) должны храниться согласно ADR‑005 (Cloudflare R2 + CDN, загрузка через UploadThing). Документация консолидируется в каталоге `docs/`.

Ключевые цели:
- Быстро создавать структурированный контент, который попадает в AI Overviews/ответы (AEO) и локальную выдачу (GEO/Maps).
- Централизованный редактор с вкладками по локалям и кнопками: «Translate», «Improve», «Fit to compliance».
- Форум с модерацией, FAQ как отдельный тип и как встраиваемый блок.
- Кросс‑постинг: подготовка адаптаций и публикация в Medium/Reddit и др. с каноникалом/UTM.
- Проверка уникальности, авторские метрики/отчёты и база для выплат.

## Решение (вкратце)

- Frontend: Next.js (App Router), Admin UI с вкладками локалей (7+), Markdown/MDX редактор, предпросмотр, JSON‑LD предпросмотр.
- Backend/данные: Supabase (Postgres + RLS), pgvector/pg_trgm для семантики/похожести, Redis/pgvector семантический кеш (см. `src/lib/semantic-cache.ts`).
- Медиа: UploadThing → Cloudflare R2/CDN per ADR‑005; галереи/карусели привязаны к материалам.
- AI‑операции: OpenAI/совместимые провайдеры для перевода, улучшения качества, комплаенс‑перефразирования; очередь задач/ретраи. У нас есть в .env OPENAI_API_KEY.
- SEO/AEO/GEO: JSON‑LD шаблоны (Article, FAQPage, QAPage, LocalBusiness), hreflang, canonical, OG/Twitter, динамический sitemap и Search Console ping, NAP‑согласованность.
- Форум/FAQ: модерация, репутация, «лучший ответ», структурированная разметка для Q&A/FAQ.
- Кросс‑постинг: генерация и публикация адаптаций для Reddit/Medium; «Fit to compliance» удаляет/заменяет запрещённые термины и перефразирует без упоминаний каннабиса.
- Отчётность по авторам: объёмы/статусы/метрики по периодам, экспорт.
- - Стартовые локали: `en, ru, th, de, fr, it, he`.


## Область

Включает: модели данных, RLS/безопасность, UX админки, AI‑флоу, медиа‑пайплайн, SEO/AEO/GEO, форум/FAQ, кросс‑постинг, комплаенс‑фильтрацию, уникальность, отчёты. Не включает: полный DevOps пайплайн HLS (в ADR‑005), email‑маркетинг (см. ADR‑004 RSS/подписки).

## Модели данных (Supabase/Postgres)

Основные сущности:
- Article (канонический материал)
- ArticleTranslation (локализованный контент + SEO/AEO поля)
- Media и ArticleGallery (+ GalleryItems) — карусели
- FAQ и FAQTranslation
- ForumThread / ForumPost / Vote / Tag
- PostShares / PostShareMetrics (кросс‑посты) — совместимо с ADR‑004
- ExternalAccount (учётки Reddit/Medium)
- GuestPostLink (пара «Гостевая статья → Статья‑приёмник на сайте»)
- AuthorStats (материализованные представления)

Пример схем (сокращённо):

```sql
-- Типы
create type locale as enum ('en','ru','th','de','fr','it','he');
create type translation_source as enum ('ai','human');
create type review_status as enum ('needs_review','approved');
create type content_kind as enum ('article','faq','forum','video','caption','guest_post');

-- Статьи
create table articles (
  id uuid primary key default gen_random_uuid(),
  kind content_kind not null default 'article',
  slug_base text not null,                   -- базовый слаг (EN или глобальный)
  author_user_id uuid references auth.users(id),
  short_answer text,                         -- 1–2 предложения (AEO answer snippet)
  tldr text,                                 -- TL;DR блок
  sources jsonb,                             -- список источников/ссылок
  geo_tags text[],                           -- гео‑метки (Samui, Phuket...)
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_articles_published_at on articles(published_at);
create index idx_articles_geo_tags on articles using gin (geo_tags);

-- Переводы
create table article_translations (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references articles(id) on delete cascade,
  locale locale not null,
  title text not null,
  slug text not null,
  excerpt text,
  body_md text,
  seo_title text,
  seo_description text,
  og_image_url text,
  translation_source translation_source not null default 'human',
  review_status review_status not null default 'needs_review',
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(article_id, locale)
);
create index idx_article_translations_slug on article_translations(slug);

-- Медиа (см. ADR‑005) + галереи
create table media (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  type text not null,                         -- image/video
  size_bytes bigint,
  owner_user_id uuid references auth.users(id),
  created_at timestamptz default now()
);

create table article_galleries (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references articles(id) on delete cascade,
  title text,
  created_at timestamptz default now()
);

create table article_gallery_items (
  id uuid primary key default gen_random_uuid(),
  gallery_id uuid not null references article_galleries(id) on delete cascade,
  media_id uuid not null references media(id) on delete restrict,
  alt_localized jsonb,                        -- {"en":"...","ru":"..."}
  sort_order int default 0
);
create index idx_gallery_items_gallery on article_gallery_items(gallery_id);

-- FAQ
create table faqs (
  id uuid primary key default gen_random_uuid(),
  article_id uuid references articles(id) on delete set null, -- можно встраивать в статью
  created_at timestamptz default now()
);

create table faq_translations (
  id uuid primary key default gen_random_uuid(),
  faq_id uuid not null references faqs(id) on delete cascade,
  locale locale not null,
  question text not null,
  answer_md text not null,
  unique(faq_id, locale)
);

-- Форум (упрощённо)
create table forum_threads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  author_user_id uuid references auth.users(id),
  locale locale,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  best_post_id uuid
);

create table forum_posts (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references forum_threads(id) on delete cascade,
  author_user_id uuid references auth.users(id),
  body_md text not null,
  is_approved boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_forum_posts_thread on forum_posts(thread_id);

create table forum_votes (
  post_id uuid not null references forum_posts(id) on delete cascade,
  voter_user_id uuid not null references auth.users(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  primary key (post_id, voter_user_id)
);

-- Кросс‑посты (см. ADR‑004 post_shares / post_share_metrics)
-- используем post_translation_id → article_translations.id

-- Аккаунты внешних платформ
create table external_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('reddit','medium')),
  access_token text not null,                 -- хранить шифрованно/через KMS/Secrets Manager
  refresh_token text,
  expires_at timestamptz,
  created_at timestamptz default now()
);

-- Пара «гостевая → приёмник»
create table guest_post_links (
  guest_article_id uuid primary key references articles(id) on delete cascade,
  receiver_article_id uuid not null references articles(id) on delete cascade
);

-- Вьюхи/метрики для авторов (пример)
create materialized view author_stats as
select
  a.author_user_id as user_id,
  count(a.*) filter (where a.is_published) as published_articles,
  count(at.*) filter (where at.is_published) as published_translations,
  sum(length(coalesce(at.body_md,''))) as total_chars,
  date_trunc('month', coalesce(at.published_at, a.published_at)) as period
from articles a
left join article_translations at on at.article_id = a.id
group by 1,5;
```

Индексы/расширения:
- pg_trgm для `slug`, `title` (fuzzy‑поиск/уникальность)
- pgvector (см. `semantic-cache.ts`) для семантической похожести

## RLS и роли

Роли: `admin`, `editor`, `author`, `moderator`, `user`, `anon`.
- `articles`/`article_translations`:
  - `author` создаёт/правит черновики своих статей до публикации.
  - `editor` редактирует всё, утверждает (`review_status='approved'`), публикует.
  - `admin` полный доступ.
  - `anon/user` — чтение только опубликованного (`is_published=true`).
- `forum_posts` — создавать могут `user` с базовой репутацией; премодерация (`is_approved=false` → модератор утверждает).
- `external_accounts` — доступ владельцу и `admin`.
- Медиа — владелец/админ; чтение по подписанным URL/публичным политикам (см. ADR‑005).

Примеры политик (упрощённо):
```sql
alter table articles enable row level security;
create policy read_published_articles on articles
  for select using (is_published = true);
create policy manage_own_drafts on articles
  for all using (auth.uid() = author_user_id and is_published = false);

alter table article_translations enable row level security;
create policy read_published_translations on article_translations
  for select using (is_published = true);
create policy manage_translations_drafts on article_translations
  for all using (
    exists(
      select 1 from articles a
      where a.id = article_id
        and (a.author_user_id = auth.uid() or exists(select 1 from user_roles ur where ur.user_id = auth.uid() and ur.role in ('editor','admin')))
    )
  );
```

## UX админки

- Вкладки локалей (7+): `en, ru, th, de, fr, it, he`.
- Кнопки:
  - «Translate all» — создаёт/обновляет переводы по всем локалям (`translation_source='ai'`, статус `needs_review`).
  - «Improve all» — улучшение качества стиля/структуры, соблюдение глоссария.
  - «Fit to compliance» — подготовка к Reddit/Medium: замена/удаление запрещённых слов, перефраз без упоминаний каннабиса, добавление дисклеймеров.
- Поля: `title`, `slug`, `short_answer`, `tldr`, `body_md`, `seo_title`, `seo_description`, OG‑изображение, `sources`, `geo_tags`.
- JSON‑LD предпросмотр (Article/FAQPage/QAPage/LocalBusiness); rich‑snippet preview.
- Галерея: UploadThing кнопка/дропзона, сортировка, локализованные alt.
- Кросс‑постинг: вкладка «Cross‑post» — генерация адаптаций, предпросмотр, планирование/публикация, статусы.
- Предпросмотр по токену (черновики).
- Ввод учётных данных для Reddit/Medium (OAuth/токены) в настройках пользователя/организации.

## AI флоу (перевод/улучшение/комплаенс)

- Переводы: prompt‑шаблоны per локаль, глоссарий (бренд/термины), `translation_source='ai'` до ревью.
- Улучшение: answer‑first стиль, H2/H3, списки/таблицы, краткие резюме.
- Комплаенс: словарь табу‑терминов (cannabis/weed/ganja/mj и т.п.) → эвфемизмы/нейтральные формулировки; профили ограничений платформ.
- Rate limit/квоты, батчи, повтор при сбое, журнал операций и дифф‑история.

## SEO / AEO / Local GEO

- JSON‑LD генератор: Article (headline/author/date/description), FAQPage, QAPage (форум, видимые ответы), LocalBusiness (локальные лендинги), VideoObject (для видео).
- Hreflang/`x-default` для всех локалей; canonical.
- OG/Twitter карточки; локализованные alt.
- Sitemap: динамический с alternates; ping Search Console при публикации.
- llms.txt / ai.txt (политики для LLM/ботов) — опционально.
- NAP‑согласованность, связка с GBP/Apple/Bing; GEO‑лендинги (статьи с `geo_tags` или отдельные `geo_pages` в будущем релизе).
- Форматы «answer box»: краткий ответ (1–3 предложения), списки шагов, таблицы, TL;DR.

## Форум и модерация

- Треды/посты, голоса/репутация; «лучший ответ» фиксируется в треде и попадает в QAPage JSON‑LD.
- Премодерация новых пользователей; анти‑спам эвристики; «низкокачественный UGC» скрывается от индекса.
- Лучшие ответы экспортируются в FAQ/Article.

## Кросс‑постинг (Reddit, Medium)

- Учётки/токены через `external_accounts` (OAuth), безопасность: шифрование секретов, ограничение прав.
- Адаптации сохраняются в `post_shares` (см. ADR‑004), с каноникалом (Medium) и UTM.
- Кнопки: «Create drafts», «Fit to compliance», «Schedule/Publish», «Fetch metrics».
- Пара «гостевая → приёмник»: при создании `guest_post` одновременно создаём/связываем `receiver`‑статью на сайте (таблица `guest_post_links`). Контент приёмника — расширенная экспертная версия (AI на основе гостевой) с внутренними ссылками/кластеризацией.

## Проверка уникальности

- Внутренняя: семантическая похожесть (pgvector) + триграммы (pg_trgm) — дубликаты слугов/заголовков/пассажей.
- Внешняя (опц.): интеграция с антиплагиат‑API (Copyleaks/Originality.ai) при финальной публикации.
- Гейтинг публикации: если «similarity» выше порога — требовать правку/подтверждение.
- UI: «unique / similar (score) / needs revision», ссылки на конфликтующие фрагменты.

## Метрики и отчёты по авторам

- `author_stats` (MV) + дашборды: кол‑во материалов/переводов, объём символов/слов, статус ревью/публикаций, CTR кросс‑постов, вклад по периодам.
- Экспорт CSV.

## E‑E‑A‑T и профили авторов

- Расширяем профиль автора (в `profiles` или отдельной `author_profiles`): `display_name`, `bio`, `credentials` (строки/ссылки на сертификации/опыт), `photo_url`, `links` (ORCID/LinkedIn/сайт), `verified_at`.
- Редакторский след (editorial review trail): таблица `editorial_reviews` с `article_id|translation_id`, `reviewer_user_id`, `notes`, `approved_at`, `changeset` (jsonb). Отображаем «Reviewed by …». Это усиливает доверие (E‑E‑A‑T).
- Карточка автора на странице: byline, квалификация, ссылка на профиль, список источников/цитат.

## Фоновые задачи / планировщик

- Очереди: Translate/Improve/Compliance, UniquenessCheck (pgvector/pg_trgm), Sitemap+SearchConsole ping, Cross‑post Schedule/Publish, MetricsSync (внешние метрики), ForumModeration (auto‑approve по репутации), Media processing (миниатюры/alt‑извлечение).
- Ретраи с экспоненциальной задержкой, дедупликация задач, лимиты per user/org, телеметрия и алерты на сбои.

## Политики индексации и дубликатов

- Черновики и неутверждённые переводы → `noindex, nofollow`, приватный предпросмотр по токену.
- Форум: до `is_approved=true` и при низкой репутации автора — `noindex`; удаление структурированной разметки для таких тредов.
- Кросс‑постинг: для Medium — `rel=canonical` на оригинал; избегаем индексирования дублей, canonical на сайт.
- Изменение слуга → авто‑редирект и переиздание sitemap.

## AEO‑мониторинг и качество ответа

- Трекинг rich results/Search Console API: мониторинг Coverage/Enhancements, отчёты по Article/FAQ/QAPage.
- Полуручной мониторинг AI Overviews/Perplexity: список запросов, периодические проверки, журнал цитирований/упоминаний.
- Автотесты «answer‑box»: проверка наличия краткого ответа, списков/таблиц, валидной JSON‑LD разметки на каждой публикации.

## Выплаты авторам и отчётность

- Тарифная матрица: ставка за 1000 знаков/слов, множители за локали/тип (guide/FAQ/forum summary), бонусы за метрики (CTR, публикации на внешних площадках).
- Процесс: автор → редактор (approve) → публикация → отчёт за период (CSV) → бухгалтерия/выплата. Логируем утверждения/изменения.

## Миграции и schema‑dump

- Все изменения схемы — миграции в `supabase/` + обязательный dump (см. `docs/schem_dump_guide.md`).
- Обновлять `supabase/db-schema.sql` после каждой миграции; PR должен содержать миграции и обновлённый дамп.

## Видео и YouTube/VideoObject

- Для видео‑контента храним связку: YouTube ID/URL, локальные медиа (если требуется), превью, таймкоды. Генерируем JSON‑LD `VideoObject` и связываем со страницей статьи.
- Рекомендации при публикации на YouTube: первые строки описания — ссылка на каноническую страницу, GEO‑упоминания, UTM‑метки; дублирование описания как статьи (или раздела) в CMS.

## Таксономия и связанные материалы

- Категории/теги и кластеры для E‑E‑A‑T и внутренней перелинковки.
- Таблицы (упрощённо):
```sql
create table categories (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null
);
create table tags (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null
);
create table article_tags (
  article_id uuid not null references articles(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  primary key(article_id, tag_id)
);
```
- Блок «Похожие материалы»: AI‑подсказки + ручной оверрайд.

## Версионирование и ревизии

- История изменений перевода с возможностью отката:
```sql
create table article_translation_revisions (
  id uuid primary key default gen_random_uuid(),
  translation_id uuid not null references article_translations(id) on delete cascade,
  editor_user_id uuid references auth.users(id),
  body_md text,
  seo_title text,
  seo_description text,
  created_at timestamptz default now()
);
```
- В админке — «Revision history» и сравнение диффов.

## Комплаенс‑правила и глоссарий

- Управляемые словари: запрещённые термины и замены per платформа.
```sql
create table compliance_rule_sets (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('reddit','medium')),
  rules jsonb not null                       -- { banned:[], replacements:{from:to}, notes:[] }
);
create table glossary_terms (
  id uuid primary key default gen_random_uuid(),
  term text not null,
  preferred_translation jsonb                -- {"en":"...","ru":"..."}
);
```
- UI для редактирования глоссария + предпросмотр «до/после» санитайза.

## Безопасность контента и антиспам

- Санитизация Markdown→HTML (allowlist, XSS‑guard), авто‑линкование только по allowlist доменов.
- PII‑детектор (телефоны/адреса) для UGC; токсичность/брань → модерация.
- reCAPTCHA/hCaptcha для гостей; rate‑limiting на создание постов/комментов.

## Расписание публикаций

- Статусы и планирование во времени/таймзонах:
```sql
create type article_status as enum ('draft','in_review','approved','scheduled','published','archived');
alter table articles add column status article_status not null default 'draft';
alter table article_translations add column scheduled_at timestamptz;
```
- В админке — выбор таймзоны и эмбарго до `scheduled_at`.

## Линк‑чекер и медиа‑валидатор

- Фоновая проверка внешних/внутренних ссылок на 404/redirect chain.
- Проверка наличия alt для изображений; предупреждения в админке.

## Слаги и редиректы

- Транслитерация с учётом локали, уникальность per locale; история редиректов:
```sql
create table url_redirects (
  id uuid primary key default gen_random_uuid(),
  from_path text unique not null,
  to_path text not null,
  created_at timestamptz default now()
);
```
- Автодобавление редиректа при изменении `slug`.

## Доступность (a11y)

- Обязательные alt‑тексты, корректная иерархия заголовков, контраст; предпросмотр Lighthouse/a11y.

## Аналитика и атрибуция

- Интеграция с существующим `analytics-db.ts`: просмотры, глубина чтения, время на странице; разбивка по локалям/источникам (UTM).
- Отчёты на уровне статьи/автора/локали; экспорт.

## HowTo/Recipe схемы (опционально)

- Поддержка JSON‑LD `HowTo` для пошаговых гайдов; расширяет AEO.

## Webhooks

- Хуки «после публикации/обновления»: инвалидация кэша/ISR, ping Search Console, отправка в интеграции (Telegram/email, если нужно).

## Импорт/экспорт контента

- Импорт Markdown/CSV для массового завоза; экспорт статей/переводов в Markdown/JSON для бэкапа/миграций.

## Открытые вопросы

- Список сабреддитов/тегов и правила для каждого.
- Провайдер внешней уникальности (если нужен).
- Модель выплат авторам (ставки за 1k слов, бонусы за метрики?).
- Какой провайдер фоновых очередей/планировщика используем (Cron/Vercel cron, Supabase cron, отдельный воркер)?
- Стратегия индексации для разделов форума (глобально/по разделам/по репутации).

## Ссылки

- ADR‑004: мультиязычная CMS и кросс‑постинг
- ADR‑005: хранение медиа (R2/CDN, UploadThing)
- `src/lib/semantic-cache.ts` — семантический кеш (pgvector/Redis)
- `docs/schem_dump_guide.md` — процесс выгрузки схемы
- Google: `Article`, `FAQPage`, `QAPage`, `LocalBusiness`, `VideoObject` JSON‑LD
- Reddit/Medium API и правила площадок
