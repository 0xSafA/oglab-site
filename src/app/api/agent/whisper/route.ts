import { NextRequest, NextResponse } from 'next/server';
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
  try {
    // Получаем FormData с аудиофайлом
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Валидация размера файла
    const minSize = 1024; // 1 KB минимум
    const maxSize = 25 * 1024 * 1024; // 25 MB максимум
    
    if (audioFile.size < minSize) {
      console.warn(`⚠️ Audio file too small: ${(audioFile.size / 1024).toFixed(2)} KB`);
      return NextResponse.json(
        { error: 'Запись слишком короткая. Говорите дольше (минимум 1 секунда).' },
        { status: 400 }
      );
    }
    
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: 'Audio file is too large (max 25 MB)' },
        { status: 400 }
      );
    }

    console.log(`🎤 Transcribing audio: ${audioFile.name}, size: ${(audioFile.size / 1024).toFixed(2)} KB, type: ${audioFile.type}`);

    // Вызываем Whisper API
    const startTime = Date.now();
    
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'ru', // можно оставить undefined для авто-определения
      response_format: 'verbose_json', // получаем больше информации
    });

    const duration = Date.now() - startTime;

    console.log('✅ Transcription completed:', {
      text: transcription.text.substring(0, 100),
      language: transcription.language,
      duration: `${duration}ms`,
    });

    // Возвращаем результат
    const response: TranscriptionResponse = {
      text: transcription.text,
      language: transcription.language,
      duration,
    };

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('❌ Error in /api/agent/whisper:', error);

    // Обработка ошибок OpenAI
    if (error instanceof OpenAI.APIError) {
      const errorMessage = error.message.includes('API key')
        ? 'OpenAI API key not configured. Please contact support.'
        : error.message.includes('quota')
        ? 'API quota exceeded. Please try again later.'
        : 'Transcription service error. Please try again.';
      
      console.error('OpenAI API Error:', {
        status: error.status,
        message: error.message,
        type: error.type,
      });
      
      return NextResponse.json(
        { 
          error: errorMessage,
          text: '',
        },
        { status: 500 }
      );
    }

    // Общая ошибка
    return NextResponse.json(
      { 
        error: 'Не удалось распознать речь. Попробуйте ещё раз.',
        text: '',
      },
      { status: 500 }
    );
  }
}

// GET endpoint для проверки статуса
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'OG Lab Agent - Whisper',
    model: 'whisper-1',
    maxFileSize: '25 MB',
    supportedFormats: ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm'],
  });
}
