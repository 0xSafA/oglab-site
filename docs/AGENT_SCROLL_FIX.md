# 📜 Исправление автоскролла агента при загрузке страницы

## Проблема

При загрузке страницы `/feed` (и других страниц с агентом), происходил автоматический скролл вниз к агенту, вместо того чтобы показывать начало страницы. Это особенно раздражало на мобильных устройствах.

### Причина

1. При монтировании компонента `OGLabAgent` загружается история диалогов из LocalStorage
2. Вызывается `setCurrentConversation(conversation)` с загруженной историей
3. Это триггерит `useEffect`, который следит за `currentConversation?.messages.length`
4. Срабатывает `scrollIntoView()` и скроллит к агенту

```typescript
// До исправления
useEffect(() => {
  if (messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}, [currentConversation?.messages.length, loading])
// ↑ Срабатывает ВСЕГДА при изменении количества сообщений, даже при первой загрузке!
```

## Решение

Добавлен флаг `isInitialLoad`, который отслеживает первую загрузку компонента:

### 1. Добавлен state флаг
```typescript
const [isInitialLoad, setIsInitialLoad] = useState(true)
```

### 2. Отключение флага после загрузки истории
```typescript
// После загрузки conversation из localStorage
setCurrentConversation(conversation)
setIsInitialLoad(false) // ← Отключаем флаг ПОСЛЕ первой инициализации
```

### 3. Проверка флага в useEffect автоскролла
```typescript
useEffect(() => {
  if (!isInitialLoad && messagesEndRef.current) {
    // ↑ Скроллим ТОЛЬКО если это не первая загрузка
    messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}, [currentConversation?.messages.length, loading, isInitialLoad])
```

## Дополнительное исправление

Также изменён параметр `block` с `'end'` на `'start'`:

```typescript
// До: block: 'end'  - показывает конец сообщения (последние слова)
// После: block: 'start' - показывает начало сообщения (первые слова)
```

Это важно для длинных ответов на мобильных устройствах - пользователь видит **начало** ответа, а не конец.

## Результат

### До исправления:
- ❌ Загрузка страницы `/feed` → автоскролл вниз к агенту
- ❌ Пользователь не видит контент в начале страницы
- ❌ На мобильном видны только последние слова ответа

### После исправления:
- ✅ Загрузка страницы `/feed` → страница остаётся вверху
- ✅ Агент спокойно ждёт внизу страницы
- ✅ Автоскролл срабатывает **только при новых сообщениях**
- ✅ На мобильном видно **начало** ответа агента

## Сценарии работы

### Сценарий 1: Первая загрузка страницы
```
1. isInitialLoad = true
2. Загрузка истории из localStorage
3. setCurrentConversation() → useEffect триггерится
4. !isInitialLoad = false → НЕ скроллим ✅
5. setIsInitialLoad(false)
```

### Сценарий 2: Пользователь отправляет сообщение
```
1. isInitialLoad = false (уже отключен)
2. Новое сообщение добавляется
3. setCurrentConversation() → useEffect триггерится
4. !isInitialLoad = true → СКРОЛЛИМ к началу нового сообщения ✅
```

### Сценарий 3: Очистка истории (кнопка "Начать новый диалог")
```
1. isInitialLoad = false
2. setCurrentConversation(пустой диалог)
3. useEffect триггерится, но нет messagesEndRef
4. Ничего не происходит ✅
```

## Файлы изменены

- ✅ `src/components/OGLabAgent.tsx`
  - Добавлен флаг `isInitialLoad`
  - Изменён `block: 'end'` → `block: 'start'`
  - Добавлена проверка флага в useEffect

## Совместимость

Изменения полностью обратно совместимы:
- ✅ Работает на всех страницах где используется агент (`/feed`, `/menu`, `/`)
- ✅ Сохраняется функционал автоскролла при новых сообщениях
- ✅ Не влияет на восстановление истории из LocalStorage

---

**Дата:** 5 октября 2025  
**Файл:** `src/components/OGLabAgent.tsx`
