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
  private audioContext: AudioContext | null = null;

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
   * Конвертация Blob в WAV 16kHz mono
   */
  private async ensureAudioContext(): Promise<AudioContext> {
    if (!this.audioContext) {
      const SampleRate = 16000;
      // Safari использует webkitAudioContext
      const Ctx: typeof AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new Ctx({ sampleRate: SampleRate });
    }
    return this.audioContext;
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

    if (this.audioContext) {
      try { this.audioContext.close(); } catch {}
      this.audioContext = null;
    }
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
 * Whisper теперь авто-определяет язык, подсказка языка не отправляется.
 * @param audioBlob - аудио blob
 */
export async function transcribeAudio(audioBlob: Blob): Promise<string> {
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
  
  console.log(`🎤 Source audio: ${(audioBlob.size / 1024).toFixed(2)} KB, type=${audioBlob.type || 'unknown'}`);

  // Преобразуем в WAV 16kHz mono для лучшей совместимости
  let uploadBlob: Blob = audioBlob;
  try {
    uploadBlob = await convertToWav16kMono(audioBlob);
    console.log(
      `🎧 Converted to WAV16k mono: ${(uploadBlob.size / 1024).toFixed(2)} KB, type=${uploadBlob.type}`
    );
  } catch (e) {
    console.warn('⚠️ WAV conversion failed, sending original blob:', e);
  }

  const formData = new FormData();
  const extension = uploadBlob.type.includes('wav') ? 'wav'
    : uploadBlob.type.includes('webm') ? 'webm'
    : uploadBlob.type.includes('mp4') ? 'mp4'
    : uploadBlob.type.includes('ogg') ? 'ogg'
    : 'wav';
  formData.append('audio', uploadBlob, `recording.${extension}`);

  console.log(`📤 Sending audio for transcription: ${(uploadBlob.size / 1024).toFixed(2)} KB, ext=.${extension}`);

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

// -------- Helpers: WAV encoding --------
async function convertToWav16kMono(input: Blob): Promise<Blob> {
  // Decode using an AudioContext, resample to 16k mono, and encode WAV
  const arrayBuffer = await input.arrayBuffer();
  const OfflineCtx = (window as any).OfflineAudioContext || (window as any).webkitOfflineAudioContext;

  // First decode at native sample rate
  const tmpCtx = new (window as any).AudioContext();
  const decoded = await tmpCtx.decodeAudioData(arrayBuffer.slice(0));
  try { tmpCtx.close(); } catch {}

  // Prepare resampling to 16k mono
  const targetSampleRate = 16000;
  const numChannels = 1;
  const lengthSeconds = decoded.duration;
  const frameCount = Math.ceil(lengthSeconds * targetSampleRate);
  const offlineCtx = new OfflineCtx(targetSampleRate, frameCount, targetSampleRate);

  // Downmix to mono
  const source = offlineCtx.createBufferSource();
  const monoBuffer = offlineCtx.createBuffer(numChannels, decoded.length, decoded.sampleRate);
  // Mix all channels into channel 0
  const tmp = new Float32Array(decoded.length);
  for (let ch = 0; ch < decoded.numberOfChannels; ch++) {
    const data = decoded.getChannelData(ch);
    for (let i = 0; i < data.length; i++) {
      tmp[i] += data[i] / decoded.numberOfChannels;
    }
  }
  monoBuffer.copyToChannel(tmp, 0, 0);
  source.buffer = monoBuffer;

  const dest = offlineCtx.createDestination();
  source.connect(dest);
  source.start(0);
  const rendered = await offlineCtx.startRendering();

  // Get mono data
  const mono = rendered.getChannelData(0);
  const wavBuffer = encodeWav(mono, targetSampleRate);
  return new Blob([wavBuffer], { type: 'audio/wav' });
}

function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const bytesPerSample = 2; // 16-bit PCM
  const blockAlign = 1 * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  // RIFF header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');

  // fmt chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // bits per sample

  // data chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // PCM samples
  floatTo16BitPCM(view, 44, samples);
  return buffer;
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

function floatTo16BitPCM(view: DataView, offset: number, input: Float32Array) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, input[i]));
    s = s < 0 ? s * 0x8000 : s * 0x7fff;
    view.setInt16(offset, s, true);
  }
}
