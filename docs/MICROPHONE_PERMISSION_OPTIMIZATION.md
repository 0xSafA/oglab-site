# 🎤 Оптимизация работы с разрешениями микрофона

## Проблема

Браузер каждый раз запрашивал разрешение на использование микрофона при каждом нажатии кнопки голосового ввода, даже если пользователь уже давал разрешение ранее.

### Причины:
1. **MediaStream закрывался после каждой записи** - при вызове `stream.getTracks().forEach(track => track.stop())` мы полностью освобождали ресурсы
2. **Новый запрос при каждом startRecording()** - каждый раз вызывался `getUserMedia()` без проверки наличия активного stream
3. **Отсутствие проверки разрешений** - не использовался Permissions API для проверки статуса

## Решение

### 1. Переиспользование MediaStream

**Файл:** `src/lib/audio-recorder.ts`

#### Добавлено:
```typescript
private keepStreamAlive: boolean = true; // Сохраняем stream между записями
```

#### Логика в `startRecording()`:
```typescript
// Проверяем, есть ли уже активный stream (переиспользуем для избежания повторного запроса)
if (!this.stream || !this.stream.active) {
  console.log('🎤 Requesting microphone access...');
  this.stream = await navigator.mediaDevices.getUserMedia({ ... });
  console.log('✅ Microphone access granted');
} else {
  console.log('📦 Reusing existing microphone stream');
}
```

Теперь stream **НЕ закрывается** после каждой записи, а переиспользуется!

### 2. Permissions API

Добавлен метод для проверки статуса разрешения **ДО** запроса:

```typescript
static async checkMicrophonePermission(): Promise<'granted' | 'denied' | 'prompt'> {
  if (!navigator.permissions || !navigator.permissions.query) {
    return 'prompt'; // Safari iOS не поддерживает
  }

  try {
    const result = await navigator.permissions.query({ name: 'microphone' });
    return result.state;
  } catch (error) {
    return 'prompt';
  }
}
```

### 3. Правильная очистка ресурсов

#### `cleanup()` - вызывается после каждой записи
- **НЕ закрывает** stream если `keepStreamAlive = true`
- Закрывает только `MediaRecorder`

#### `destroy()` - вызывается при размонтировании компонента
- **Полностью освобождает** все ресурсы включая stream
- Вызывается в `useEffect` cleanup

```typescript
useEffect(() => {
  return () => {
    if (recorderRef.current) {
      recorderRef.current.destroy() // ← Полная очистка
    }
  }
}, [locale])
```

### 4. Визуальный индикатор разрешения

**Файл:** `src/components/OGLabAgent.tsx`

Добавлен state для отслеживания статуса:
```typescript
const [microphonePermission, setMicrophonePermission] = 
  useState<'granted' | 'denied' | 'prompt'>('prompt')
```

#### Проверка при инициализации:
```typescript
useEffect(() => {
  if (isSupported) {
    AudioRecorder.checkMicrophonePermission().then(permission => {
      setMicrophonePermission(permission)
      if (permission === 'granted') {
        console.log('✅ Microphone permission already granted')
      }
    })
  }
}, [locale])
```

#### Визуальный индикатор:
- 🟢 **Зелёная точка** в правом верхнем углу кнопки микрофона
- **Зелёная обводка** кнопки когда разрешение дано
- Появляется только когда `microphonePermission === 'granted'`

```tsx
{microphonePermission === 'granted' && recordingState === 'idle' && (
  <div 
    className="absolute rounded-full bg-green-500 -right-1 -top-1 h-2.5 w-2.5"
    title="Разрешение на микрофон дано"
  />
)}
```

## Результат

### До оптимизации:
- ❌ Браузер запрашивает разрешение при каждом нажатии
- ❌ Stream закрывается после каждой записи
- ❌ Пользователь не видит статус разрешения
- 😤 Раздражающий UX

### После оптимизации:
- ✅ Разрешение запрашивается **только один раз**
- ✅ Stream переиспользуется между записями
- ✅ Пользователь видит зелёный индикатор
- ✅ Проверка разрешений через Permissions API
- 🎉 Плавный UX без лишних попапов

## Совместимость с браузерами

| Браузер | Permissions API | MediaStream reuse | Работает |
|---------|-----------------|-------------------|----------|
| Chrome 90+ | ✅ | ✅ | ✅ |
| Firefox 90+ | ✅ | ✅ | ✅ |
| Safari 15+ | ⚠️ (частично) | ✅ | ✅ |
| Safari iOS | ❌ | ✅ | ✅ |
| Edge 90+ | ✅ | ✅ | ✅ |

**Примечание:** Safari iOS не поддерживает Permissions API, но переиспользование stream всё равно работает!

## Логи в консоли

### Первая запись (новый запрос):
```
🎤 Requesting microphone access...
✅ Microphone access granted
✅ Microphone permission already granted
```

### Последующие записи (переиспользование):
```
📦 Reusing existing microphone stream
```

### При размонтировании компонента:
```
🔇 Destroying microphone stream
```

## Рекомендации

1. **HTTPS обязателен** - браузеры не запоминают разрешения на HTTP (кроме localhost)
2. **Не изменяйте `keepStreamAlive`** - это оптимальная настройка
3. **Тестируйте на разных браузерах** - Safari iOS ведёт себя по-особенному

## Дальнейшие улучшения

Возможные оптимизации:
- [ ] Показывать подсказку при `denied` статусе с инструкцией по разрешению
- [ ] Анимация зелёного индикатора при первом получении разрешения
- [ ] Кнопка "сбросить разрешение" для тестирования
- [ ] Мониторинг изменения разрешений через `navigator.permissions.addEventListener()`
