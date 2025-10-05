/**
 * Audio Recording Utility
 * Handles browser audio recording with MediaRecorder API
 */

export type RecordingState = 'idle' | 'recording' | 'processing';

// Максимальная длительность записи (30 секунд)
export const MAX_RECORDING_DURATION_MS = 30 * 1000;
export const MAX_RECORDING_DURATION_SEC = 30;

export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private maxDurationTimer: NodeJS.Timeout | null = null;
  private onMaxDurationReached?: () => void;
  private keepStreamAlive: boolean = true; // Сохраняем stream между записями

  /**
   * Проверяет, поддерживает ли браузер запись аудио
   */
  static isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  /**
   * Проверяет статус разрешения на использование микрофона
   */
  static async checkMicrophonePermission(): Promise<'granted' | 'denied' | 'prompt'> {
    if (!navigator.permissions || !navigator.permissions.query) {
      // Permissions API не поддерживается (Safari iOS)
      return 'prompt';
    }

    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return result.state;
    } catch (error) {
      console.warn('Unable to check microphone permission:', error);
      return 'prompt';
    }
  }

  /**
   * Устанавливает callback для события достижения максимальной длительности
   */
  setOnMaxDurationReached(callback: () => void): void {
    this.onMaxDurationReached = callback;
  }

  /**
   * Запрашивает разрешение на микрофон и начинает запись
   */
  async startRecording(): Promise<void> {
    if (!AudioRecorder.isSupported()) {
      throw new Error('Запись аудио не поддерживается в этом браузере');
    }

    try {
      // Проверяем, есть ли уже активный stream (переиспользуем для избежания повторного запроса)
      if (!this.stream || !this.stream.active) {
        console.log('🎤 Requesting microphone access...');
        
        // Запрашиваем доступ к микрофону
        this.stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          } 
        });
        
        console.log('✅ Microphone access granted');
      } else {
        console.log('📦 Reusing existing microphone stream');
      }

      // Определяем поддерживаемый MIME-тип
      const mimeType = this.getSupportedMimeType();
      
      // Создаём MediaRecorder
      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType,
        audioBitsPerSecond: 128000, // 128 kbps для качественной записи
      });

      this.audioChunks = [];

      // Собираем аудио-чанки
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          console.log(`📦 Audio chunk received: ${event.data.size} bytes`);
        }
      };

      // Начинаем запись с таймслайсом 100ms для регулярного сбора данных
      this.mediaRecorder.start(100);
      console.log('🎤 Recording started with 100ms timeslice');

      // Устанавливаем таймер на максимальную длительность (30 секунд)
      this.maxDurationTimer = setTimeout(() => {
        console.warn('⏱️ Maximum recording duration reached (30s), auto-stopping...');
        if (this.onMaxDurationReached) {
          this.onMaxDurationReached();
        }
      }, MAX_RECORDING_DURATION_MS);

    } catch (error) {
      console.error('Error starting recording:', error);
      const errorMessage = error instanceof Error && error.name === 'NotAllowedError'
        ? 'Доступ к микрофону запрещён. Разрешите доступ в настройках браузера.'
        : 'Не удалось получить доступ к микрофону. Проверьте настройки.';
      throw new Error(errorMessage);
    }
  }

  /**
   * Останавливает запись и возвращает аудио blob
   */
  async stopRecording(): Promise<Blob> {
    if (!this.mediaRecorder) {
      throw new Error('No active recording');
    }

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
        const audioBlob = new Blob(this.audioChunks, { type: mimeType });
        
        const sizeKB = audioBlob.size / 1024;
        console.log(`🎤 Recording stopped: ${sizeKB.toFixed(2)} KB`);
        
        // Проверка минимального размера (меньше 1 KB = слишком короткая запись)
        if (audioBlob.size < 1024) {
          console.warn('⚠️ Recording too short:', sizeKB.toFixed(2), 'KB');
          this.cleanup();
          reject(new Error('Запись слишком короткая. Говорите дольше (минимум 1 секунда).'));
          return;
        }
        
        // Очищаем ресурсы
        this.cleanup();
        
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Определяет поддерживаемый MIME-тип для записи
   */
  private getSupportedMimeType(): string {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    return 'audio/webm'; // fallback
  }

  /**
   * Очищает ресурсы
   */
  private cleanup(): void {
    // Очищаем таймер максимальной длительности
    if (this.maxDurationTimer) {
      clearTimeout(this.maxDurationTimer);
      this.maxDurationTimer = null;
    }
    
    // Закрываем stream только если keepStreamAlive = false
    // Иначе сохраняем stream для следующей записи (избегаем повторных запросов разрешения)
    if (!this.keepStreamAlive && this.stream) {
      console.log('🔇 Closing microphone stream');
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    this.mediaRecorder = null;
  }

  /**
   * Полностью освобождает все ресурсы включая stream
   * Вызывается при размонтировании компонента
   */
  destroy(): void {
    if (this.maxDurationTimer) {
      clearTimeout(this.maxDurationTimer);
      this.maxDurationTimer = null;
    }
    
    if (this.stream) {
      console.log('🔇 Destroying microphone stream');
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    this.mediaRecorder = null;
  }

  /**
   * Проверяет, идёт ли запись
   */
  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}

/**
 * Отправляет аудио на сервер для транскрипции
 * @param audioBlob - аудио blob
 * @param language - язык аудио (ISO-639-1 код: ru, en, th, fr, de, he, it)
 */
export async function transcribeAudio(audioBlob: Blob, language = 'en'): Promise<string> {
  // Валидация размера
  if (audioBlob.size === 0) {
    throw new Error('Запись слишком короткая. Попробуйте говорить дольше.');
  }
  
  // Минимум 1 KB (примерно 1 секунда речи)
  if (audioBlob.size < 1024) {
    throw new Error('Запись слишком короткая. Говорите минимум 1 секунду.');
  }
  
  if (audioBlob.size > 25 * 1024 * 1024) {
    throw new Error('Запись слишком длинная (макс 25 МБ).');
  }
  
  const formData = new FormData();
  
  // Определяем расширение файла на основе MIME-типа
  const extension = audioBlob.type.includes('webm') ? 'webm' 
    : audioBlob.type.includes('mp4') ? 'mp4'
    : audioBlob.type.includes('ogg') ? 'ogg'
    : 'wav';
  
  formData.append('audio', audioBlob, `recording.${extension}`);
  formData.append('language', language); // Передаём язык для лучшей точности транскрипции

  console.log(`🎤 Sending audio for transcription: ${(audioBlob.size / 1024).toFixed(2)} KB, language: ${language}`);

  const response = await fetch('/api/agent/whisper', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Не удалось распознать речь');
  }

  const data = await response.json();
  
  if (!data.text || data.text.trim().length === 0) {
    throw new Error('Не удалось распознать речь. Попробуйте говорить чётче.');
  }
  
  console.log(`✅ Transcription received: "${data.text.substring(0, 50)}..."`);
  
  return data.text;
}
