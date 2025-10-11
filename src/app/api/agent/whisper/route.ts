import { NextRequest } from 'next/server';
import OpenAI from 'openai';

// Инициализация OpenAI клиента
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Ответ от API
interface TranscriptionResponse {
  text: string;
  language?: string;
  duration?: number;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Получаем FormData с аудиофайлом
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    const language = (formData.get('language') as string) || '';

    if (!audioFile) {
      return Response.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Валидация размера файла
    const minSize = 1024; // 1 KB минимум
    const maxSize = 25 * 1024 * 1024; // 25 MB максимум
    
    if (audioFile.size < minSize) {
      console.warn(`⚠️ Audio too small: ${(audioFile.size / 1024).toFixed(2)} KB`);
      return Response.json(
        { error: 'Recording too short. Speak longer (min 1 second).' },
        { status: 400 }
      );
    }
    
    if (audioFile.size > maxSize) {
      return Response.json(
        { error: 'Audio file too large (max 25 MB)' },
        { status: 400 }
      );
    }

    console.log(`🎤 Transcribing: ${audioFile.name}, ${(audioFile.size / 1024).toFixed(2)} KB, ` +
      `mime=${audioFile.type || 'unknown'}, langHint=${language || 'auto'}`);

    // Вызываем Whisper API
    // Allow Whisper to auto-detect language by omitting the language hint if not explicitly set
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      // language: language || undefined, // omit to auto-detect
      translate: false, // do not force translation to English
      response_format: 'verbose_json',
    });

    const duration = Date.now() - startTime;

    console.log(`✅ Transcribed in ${duration}ms: langDetected=${transcription.language || 'unknown'} -> ` +
      `${transcription.text.substring(0, 100)}`);

    // Возвращаем результат
    const response: TranscriptionResponse = {
      text: transcription.text,
      language: transcription.language,
      duration,
    };

    return Response.json(response, { 
      status: 200,
      headers: {
        'X-Response-Time': `${duration}ms`,
      }
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Whisper error after ${duration}ms:`, error);

    // Обработка ошибок OpenAI
    if (error instanceof OpenAI.APIError) {
      const errorMessage = error.message.includes('API key')
        ? 'OpenAI API key not configured. Contact support.'
        : error.message.includes('quota')
        ? 'API quota exceeded. Try again later.'
        : 'Transcription service error. Try again.';
      
      console.error('OpenAI API Error:', {
        status: error.status,
        message: error.message,
        type: error.type,
      });
      
      return Response.json(
        { 
          error: errorMessage,
          text: '',
        },
        { status: 500 }
      );
    }

    // Общая ошибка
    return Response.json(
      { 
        error: 'Failed to recognize speech. Try again.',
        text: '',
      },
      { status: 500 }
    );
  }
}

// GET endpoint для проверки статуса
export async function GET() {
  return Response.json({
    status: 'ok',
    service: 'OG Lab Agent - Whisper (Optimized)',
    model: 'whisper-1',
    maxFileSize: '25 MB',
    supportedFormats: ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'],
  });
}
