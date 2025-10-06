'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { AudioRecorder, transcribeAudio, type RecordingState, MAX_RECORDING_DURATION_SEC } from '@/lib/audio-recorder'
import {
  getOrCreateUserProfile,
  startConversation,
  addMessageToConversation,
  updateCurrentConversation,
  buildUserContext,
  getPersonalizedGreeting,
  clearUserProfile,
  saveUserProfile,
  discardCurrentConversation,
  type UserProfile,
  type Conversation,
} from '@/lib/user-profile'

// Поддерживаемые языки агента
const SUPPORTED_LANGUAGES = ['ru', 'en', 'th', 'fr', 'de', 'he', 'it'] as const

// Функция для рендера markdown (жирный текст)
function renderMarkdown(text: string) {
  // Заменяем **текст** на <strong>текст</strong>
  const parts = text.split(/(\*\*.*?\*\*)/g);
  
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const content = part.slice(2, -2);
      return <strong key={i} className="font-bold text-[#536C4A]">{content}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

interface OGLabAgentProps {
  compact?: boolean; // компактный режим для страницы меню
}

export default function OGLabAgent({ compact = false }: OGLabAgentProps) {
  const t = useTranslations('HomePage')
  const locale = useLocale() // получаем текущую локаль из next-intl
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [useStock, setUseStock] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cachePrefetched, setCachePrefetched] = useState(false)
  
  // User Profile & Conversation
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null)
  const [greeting, setGreeting] = useState<string>('')
  const [showStats, setShowStats] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true) // Флаг для первой загрузки
  const [showHistory, setShowHistory] = useState(false) // Показывать ли историю
  
  // Voice recording state
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [isRecordingSupported, setIsRecordingSupported] = useState(false)
  const [recordingDuration, setRecordingDuration] = useState(0) // в секундах
  const recorderRef = useRef<AudioRecorder | null>(null)
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Ref для скролла к контейнеру агента (при отправке сообщения)
  const agentContainerRef = useRef<HTMLElement | null>(null)
  // Ref для скролла к последнему сообщению
  const lastMessageRef = useRef<HTMLDivElement | null>(null)

  // Инициализация при монтировании
  useEffect(() => {
    // Проверяем поддержку записи аудио
    const isSupported = AudioRecorder.isSupported()
    setIsRecordingSupported(isSupported)
    recorderRef.current = new AudioRecorder()
    
    // Проверяем статус разрешения микрофона
    if (isSupported) {
      AudioRecorder.checkMicrophonePermission().then(permission => {
        if (permission === 'granted') {
          console.log('✅ Microphone permission already granted')
        }
      })
    }
    
    return () => {
      // Очищаем таймер записи при размонтировании
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current)
      }
      
      // Полностью освобождаем ресурсы микрофона при размонтировании
      if (recorderRef.current) {
        recorderRef.current.destroy()
      }
    }
  }, [locale])

  useEffect(() => {
    // Загружаем или создаём профиль пользователя
    const profile = getOrCreateUserProfile()
    
    // Определяем язык на основе локали браузера
    const detectedLanguage: 'ru' | 'en' | 'th' | 'fr' | 'de' | 'he' | 'it' = SUPPORTED_LANGUAGES.includes(locale as typeof SUPPORTED_LANGUAGES[number]) 
      ? locale as typeof SUPPORTED_LANGUAGES[number]
      : 'en'
    
    // Сохраняем язык в профиле если его нет
    if (!profile.preferences.language) {
      profile.preferences.language = detectedLanguage
      // Сохраняем обновлённый профиль в LocalStorage
      saveUserProfile(profile)
    }
    
    setUserProfile(profile)
    
    // Показываем персонализированное приветствие на языке пользователя
    const userLanguage = profile.preferences.language || detectedLanguage
    const personalGreeting = getPersonalizedGreeting(profile, userLanguage)
    setGreeting(personalGreeting)
    
    console.log('👋 Greeting generated:', {
      userLanguage,
      detectedLanguage,
      isNewUser: profile.totalConversations === 0,
      greeting: personalGreeting.substring(0, 50) + '...',
    })
    
    // Загружаем последний диалог или начинаем новый
    // conversations[0] = самый свежий диалог (обновлённые диалоги перемещаются в начало)
    console.log('📚 Total conversations saved:', profile.conversations.length)
    if (profile.conversations.length > 0) {
      console.log('📋 All conversation IDs:', profile.conversations.map(c => ({ 
        id: c.id.substring(0, 15) + '...', 
        messages: c.messages.length,
        lastUpdated: new Date(c.lastUpdated).toLocaleString()
      })))
    }
    
    let conversation: Conversation
    if (profile.conversations.length > 0 && profile.conversations[0].messages.length > 0) {
      // Продолжаем последний (самый свежий) диалог
      conversation = profile.conversations[0]
      console.log('📝 Continuing last conversation:', conversation.id.substring(0, 20) + '... with', conversation.messages.length, 'messages')
    } else {
      // Начинаем новый диалог
      conversation = startConversation()
      console.log('✨ Starting new conversation:', conversation.id.substring(0, 20) + '...')
    }
    setCurrentConversation(conversation)
    
    // Отключаем флаг первой загрузки асинхронно, в следующем тике event loop
    // Это позволяет браузеру завершить первый рендер без скролла
    setTimeout(() => {
      setIsInitialLoad(false)
    }, 0)
    
    console.log('👤 User profile loaded:', {
      userId: profile.userId,
      visits: profile.totalConversations,
      totalMessages: profile.totalMessages,
      daysSinceFirst: Math.floor((Date.now() - profile.firstVisit.getTime()) / (1000 * 60 * 60 * 24)),
      language: userLanguage,
      detectedLocale: locale,
      hasConversations: profile.conversations.length > 0,
    })
  }, [locale])

  // Сохранение при закрытии/перезагрузке страницы (используем ref для актуальных значений)
  const currentConversationRef = useRef(currentConversation)
  const userProfileRef = useRef(userProfile)
  
  useEffect(() => {
    currentConversationRef.current = currentConversation
  }, [currentConversation])
  
  useEffect(() => {
    userProfileRef.current = userProfile
  }, [userProfile])

  useEffect(() => {
    const handleBeforeUnload = () => {
      const conv = currentConversationRef.current
      const prof = userProfileRef.current
      
      if (conv && conv.messages.length > 0 && prof) {
        updateCurrentConversation(prof, conv)
        console.log('💾 Saving on page unload:', conv.id, 'with', conv.messages.length, 'messages')
      }
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  // Автоматический скролл с минимальными прыжками
  useEffect(() => {
    if (showHistory && !isInitialLoad && lastMessageRef.current && currentConversation?.messages.length) {
      const lastMessage = currentConversation.messages[currentConversation.messages.length - 1];
      
      if (lastMessage.role === 'user') {
        // Своё сообщение → 'nearest' = минимальный скролл (только если не видно)
        lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      } else {
        // Ответ агента → скролл к началу (чтобы видеть начало ответа)
        lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [currentConversation?.messages.length, isInitialLoad, showHistory, currentConversation?.messages])

  // Prefetch кэша меню при первом вводе (прогрев кэша)
  const prefetchMenuCache = useCallback(async () => {
    if (cachePrefetched) return; // Уже прогрели
    
    try {
      console.log('🔥 Prefetching menu cache...');
      const response = await fetch('/api/agent/chat', { method: 'HEAD' });
      const cacheStatus = response.headers.get('X-Cache-Status');
      const itemsCount = response.headers.get('X-Items-Count');
      console.log('✅ Menu cache prefetched:', cacheStatus, `(${itemsCount} items)`);
      setCachePrefetched(true);
    } catch (err) {
      console.error('⚠️ Failed to prefetch cache:', err);
      // Не критично, просто не будет prefetch
    }
  }, [cachePrefetched])

  // Функция для отправки сообщения (используется и для текста, и для голоса)
  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || !currentConversation || !userProfile) return
    
    setLoading(true)
    setError(null)
    setGreeting('') // скрываем приветствие после первого сообщения
    setShowHistory(true) // показываем историю при отправке сообщения
    
    // Добавляем вопрос пользователя в диалог
    const userMessage = { role: 'user' as const, content: messageText }
    let updatedConversation = addMessageToConversation(currentConversation, userMessage)
    setCurrentConversation(updatedConversation)
    
    try {
      // Строим user context
      const userContext = buildUserContext(userProfile)
      
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          conversationHistory: updatedConversation.messages.slice(-12).map(m => ({
            role: m.role,
            content: m.content,
          })),
          useStock,
          userContext,
          isReturningUser: userProfile.totalConversations > 0,
          language: userProfile.preferences.language || 'ru',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response')
      }

      // Добавляем ответ ассистента
      const assistantMessage = {
        role: 'assistant' as const,
        content: data.reply,
        suggestedProducts: data.suggestedProducts || [],
        productCards: data.productCards || [],
      }
      
      updatedConversation = addMessageToConversation(updatedConversation, assistantMessage)
      setCurrentConversation(updatedConversation)
      
      // Сохраняем обновлённый диалог в профиль после каждого сообщения (без увеличения счётчиков)
      const updatedProfile = updateCurrentConversation(userProfile, updatedConversation)
      setUserProfile(updatedProfile)
      
    } catch (err) {
      console.error('Chat error:', err)
      setError(err instanceof Error ? err.message : 'Что-то пошло не так')
      
      // Показываем fallback ответ
      const fallbackMessage = {
        role: 'assistant' as const,
        content: 'Извини, у меня технические проблемы 😔 Попробуй еще раз или обратись к живому бадтендеру в диспенсари.',
      }
      updatedConversation = addMessageToConversation(updatedConversation, fallbackMessage)
      setCurrentConversation(updatedConversation)
    } finally {
      setLoading(false)
    }
  }, [currentConversation, userProfile, useStock])

  const ask = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!question.trim()) return
    
    // Сохраняем текст и очищаем поле ввода
    const messageText = question
    setQuestion('')
    
    // Отправляем сообщение
    await sendMessage(messageText)
  }

  const clearHistory = () => {
    if (!userProfile || !currentConversation) return
    
    // Удаляем текущий диалог из профиля (но сохраняем preferences)
    console.log('🗑️ Discarding current conversation:', currentConversation.id, 'with', currentConversation.messages.length, 'messages')
    const updatedProfile = discardCurrentConversation(userProfile, currentConversation)
    setUserProfile(updatedProfile)
    
    // Начинаем новый чистый диалог
    const newConversation = startConversation()
    setCurrentConversation(newConversation)
    
    // Очищаем состояние UI
    setGreeting('') // НЕ показываем приветствие - пусть будет чистый лист
    setError(null) // Очищаем ошибки
    setQuestion('') // Очищаем поле ввода
    setLoading(false) // Сбрасываем состояние загрузки
    setShowHistory(false) // Скрываем историю
    
    console.log('🆕 New clean conversation started:', newConversation.id)
    console.log('📚 Remaining conversations in profile:', updatedProfile.conversations.length)
  }
  
  const resetProfile = () => {
    if (confirm(t('agentResetConfirm'))) {
      clearUserProfile()
      window.location.reload()
    }
  }

  // Голосовой ввод - начало записи
  const startRecording = async () => {
    if (!recorderRef.current || recordingState !== 'idle') return

    try {
      setError(null)
      await recorderRef.current.startRecording()
      setRecordingState('recording')
      setRecordingDuration(0)
      
      // Прогреваем кэш пока пользователь говорит
      if (!cachePrefetched) {
        prefetchMenuCache()
      }
      
      // Запускаем таймер для отображения длительности
      durationTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1)
      }, 1000)
      
    } catch (err) {
      console.error('Recording error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Не удалось начать запись'
      
      setError(errorMessage)
      setRecordingState('idle')
      setRecordingDuration(0)
      
      // Очистить таймер если он был запущен
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current)
        durationTimerRef.current = null
      }
    }
  }

  // Голосовой ввод - остановка записи и транскрипция
  const stopRecording = useCallback(async () => {
    if (!recorderRef.current || recordingState !== 'recording') return

    // Останавливаем таймер длительности
    if (durationTimerRef.current) {
      clearInterval(durationTimerRef.current)
      durationTimerRef.current = null
    }

    try {
      // Останавливаем запись и получаем аудио blob
      const audioBlob = await recorderRef.current.stopRecording()
      
      // Показываем состояние обработки ПОСЛЕ остановки записи
      setRecordingState('processing')
      setError(null) // Очищаем предыдущие ошибки
      
      // Определяем язык на основе локали или профиля
      const userLanguage = userProfile?.preferences.language || locale || 'en'
      console.log(`🎤 Transcribing with language: ${userLanguage}`)
      
      // Отправляем на транскрипцию с указанием языка
      const transcribedText = await transcribeAudio(audioBlob, userLanguage)
      
      // Сбрасываем состояние записи
      setRecordingState('idle')
      setRecordingDuration(0)
      
      // Автоматически отправляем транскрибированное сообщение
      console.log('🎤 Auto-sending voice message:', transcribedText)
      await sendMessage(transcribedText)
      
    } catch (err) {
      console.error('Transcription error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Ошибка транскрипции';
      setError(errorMessage)
      setRecordingState('idle')
      setRecordingDuration(0)
    }
  }, [recordingState, userProfile, locale, sendMessage])

  // Устанавливаем callback для автоматической остановки (после объявления stopRecording)
  useEffect(() => {
    if (recorderRef.current) {
      recorderRef.current.setOnMaxDurationReached(() => {
        console.log('⏱️ Max duration reached, stopping recording...')
        stopRecording()
      })
    }
  }, [stopRecording])

  // Toggle для голосового ввода (клик для начала/остановки)
  const handleVoiceButtonClick = () => {
    if (recordingState === 'idle') {
      startRecording()
    } else if (recordingState === 'recording') {
      stopRecording()
    }
  }

  return (
    <section 
      ref={agentContainerRef}
      data-agent-active="true"
      className={`rounded-3xl bg-white/80 shadow-xl ring-1 ring-[#B0BF93]/50 overflow-hidden ${
        compact ? 'p-2.5 lg:p-3' : 'p-4 lg:p-6'
      }`}
    >
      <div className={`flex items-center justify-between gap-2 ${compact ? 'mb-2' : 'mb-3 lg:mb-4'}`}>
        <div className="flex items-center gap-2 lg:gap-3">
          <h2 className={`font-bold text-[#3D4D37] ${compact ? 'text-base lg:text-lg' : 'text-xl lg:text-2xl'}`}>{t('agentTitle')}</h2>
          {!compact && userProfile && userProfile.totalConversations > 0 && (
            <button
              onClick={() => setShowStats(!showStats)}
              className="rounded-full bg-[#536C4A]/10 px-3 py-1.5 text-sm font-semibold text-[#536C4A] hover:bg-[#536C4A]/20 transition-colors"
              title="Показать статистику"
            >
              👤 Визит #{userProfile.totalConversations + 1}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className={`inline-flex items-center gap-2 rounded-full bg-[#F4F8F0] text-[#2F3A24] ring-1 ring-[#B0BF93]/60 ${
            compact ? 'px-2 py-1' : 'px-3 py-1.5'
          }`}>
            <input
              type="checkbox"
              checked={useStock}
              onChange={(e) => setUseStock(e.target.checked)}
              className={compact ? 'h-3 w-3 accent-[#536C4A]' : 'h-4 w-4 accent-[#536C4A]'}
            />
            <span className={compact ? 'text-[10px]' : 'text-xs lg:text-sm'}>{t('agentSuggestFromStock')}</span>
          </label>
          {currentConversation && currentConversation.messages.length > 0 && (
            <button
              onClick={clearHistory}
              className={`rounded-full bg-[#536C4A]/10 flex items-center justify-center text-[#536C4A] hover:bg-[#536C4A]/20 transition-colors font-bold ${
                compact ? 'w-6 h-6 text-sm' : 'w-8 h-8 text-lg'
              }`}
              title="Начать новый диалог"
            >
              +
            </button>
          )}
        </div>
      </div>

      {/* User Stats */}
      {showStats && userProfile && (
        <div className="mb-4 rounded-2xl bg-gradient-to-br from-[#F4F8F0] to-[#F7FBF3] p-4 ring-1 ring-[#B0BF93]/30">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#536C4A]">📊 Ваша статистика</h3>
            <button
              onClick={() => setShowStats(false)}
              className="text-xs text-[#536C4A]/60 hover:text-[#536C4A]"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="bg-white/80 rounded-lg p-2">
              <div className="text-[#536C4A]/60">Визитов</div>
              <div className="text-lg font-bold text-[#536C4A]">{userProfile.totalConversations}</div>
            </div>
            <div className="bg-white/80 rounded-lg p-2">
              <div className="text-[#536C4A]/60">Сообщений</div>
              <div className="text-lg font-bold text-[#536C4A]">{userProfile.totalMessages}</div>
            </div>
            <div className="bg-white/80 rounded-lg p-2">
              <div className="text-[#536C4A]/60">С нами</div>
              <div className="text-lg font-bold text-[#536C4A]">
                {Math.floor((Date.now() - userProfile.firstVisit.getTime()) / (1000 * 60 * 60 * 24))}д
              </div>
            </div>
            <div className="bg-white/80 rounded-lg p-2">
              <div className="text-[#536C4A]/60">Уровень</div>
              <div className="text-lg font-bold text-[#536C4A]">
                {userProfile.preferences.experienceLevel === 'beginner' ? '🌱' : 
                 userProfile.preferences.experienceLevel === 'expert' ? '🌳' : '🌿'}
              </div>
            </div>
          </div>
          {userProfile.preferences.favoriteStrains && userProfile.preferences.favoriteStrains.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#B0BF93]/20">
              <div className="text-xs text-[#536C4A]/60 mb-1">Ранее рекомендовал:</div>
              <div className="flex flex-wrap gap-1">
                {userProfile.preferences.favoriteStrains.slice(0, 5).map((strain, i) => (
                  <span key={i} className="text-xs bg-white/80 rounded-full px-2 py-0.5 text-[#536C4A]">
                    {strain}
                  </span>
                ))}
              </div>
            </div>
          )}
          <button
            onClick={resetProfile}
            className="mt-3 w-full text-xs text-red-500 hover:text-red-600 opacity-50 hover:opacity-100 transition-opacity"
          >
            🗑️ Сбросить историю
          </button>
        </div>
      )}

      {/* Персонализированное приветствие */}
      {!compact && greeting && (!currentConversation || currentConversation.messages.length === 0) && (
        <div className="mb-3 lg:mb-4 rounded-2xl bg-gradient-to-br from-[#536C4A]/10 to-[#B0BF93]/10 p-3 lg:p-4 border border-[#B0BF93]/30">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 lg:w-10 lg:h-10 flex-shrink-0">
              <svg width="100%" height="100%" viewBox="0 0 164 164" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="81.537" cy="81.536" rx="76.03" ry="76.03" fill="rgb(83,108,74)" stroke="black" strokeWidth="0.48"/>
                <path d="M140.821,49.101L95.18,49.101C94.364,49.101 93.6,49.166 92.887,49.284C92.114,49.411 91.395,49.601 90.726,49.834C90.096,50.055 89.509,50.338 88.967,50.681C88.429,51.022 87.94,51.422 87.502,51.879L87.487,51.893C87.026,52.336 86.625,52.824 86.286,53.356C85.946,53.89 85.665,54.474 85.443,55.108C85.218,55.749 85.044,56.443 84.922,57.185C84.798,57.934 84.727,58.731 84.707,59.571L84.709,72.745C84.727,73.606 84.798,74.413 84.921,75.169C85.044,75.92 85.218,76.616 85.443,77.258C85.663,77.888 85.95,78.468 86.295,79.005C86.64,79.542 87.044,80.036 87.496,80.491C88.412,81.414 89.515,82.133 90.812,82.616C92.074,83.085 93.527,83.334 95.18,83.334L140.821,83.334L140.821,63.039L127.019,63.039L120.722,69.336L134.348,69.336L134.348,77.037L95.944,77.037C95.571,77.037 95.212,77.01 94.87,76.955C94.523,76.9 94.203,76.818 93.91,76.71C93.612,76.6 93.337,76.466 93.086,76.31C92.829,76.15 92.599,75.968 92.396,75.765C91.986,75.355 91.679,74.851 91.476,74.253C91.28,73.677 91.182,73.017 91.182,72.275L91.182,60.218C91.182,59.458 91.284,58.788 91.481,58.204C91.685,57.601 91.991,57.094 92.389,56.678C92.797,56.253 93.301,55.929 93.908,55.713C94.493,55.505 95.17,55.397 95.944,55.397L134.525,55.397L140.821,49.101Z" fill="white"/>
                <path d="M33.428,55.397L71.15,55.397C71.892,55.397 72.552,55.495 73.128,55.691C73.723,55.893 74.227,56.2 74.638,56.611L74.64,56.613C75.05,57.023 75.356,57.533 75.559,58.141C75.755,58.727 75.853,59.4 75.853,60.16L75.853,72.275C75.853,73.017 75.755,73.677 75.56,74.253C75.358,74.848 75.05,75.353 74.639,75.764C74.439,75.966 74.212,76.147 73.958,76.308C73.711,76.464 73.442,76.597 73.149,76.708C72.858,76.817 72.542,76.9 72.204,76.955C71.868,77.009 71.516,77.037 71.15,77.037L33.428,77.037C33.062,77.037 32.71,77.009 32.374,76.955C32.036,76.9 31.72,76.817 31.43,76.708C31.137,76.597 30.867,76.464 30.62,76.308C30.366,76.147 30.139,75.966 29.939,75.764C29.528,75.353 29.221,74.848 29.019,74.253C28.823,73.677 28.725,73.017 28.725,72.275L28.725,60.16C28.725,59.4 28.823,58.727 29.019,58.141C29.222,57.533 29.528,57.023 29.938,56.613L29.94,56.611C30.351,56.2 30.855,55.893 31.451,55.691C32.027,55.495 32.686,55.397 33.428,55.397ZM32.722,83.334L71.856,83.334C73.505,83.334 74.954,83.084 76.213,82.616C77.511,82.133 78.616,81.413 79.54,80.489C80.453,79.576 81.148,78.488 81.613,77.216L81.613,77.214C82.085,75.924 82.327,74.438 82.327,72.745L82.327,59.571C82.327,57.898 82.087,56.425 81.616,55.145C81.15,53.877 80.456,52.794 79.542,51.887C79.087,51.434 78.596,51.031 78.061,50.686C77.526,50.341 76.948,50.055 76.319,49.834C75.652,49.601 74.93,49.412 74.156,49.284C73.439,49.166 72.673,49.101 71.856,49.101L32.722,49.101C31.906,49.101 31.139,49.166 30.422,49.284C29.648,49.412 28.927,49.601 28.259,49.834C27.63,50.055 27.052,50.341 26.518,50.686C25.982,51.031 25.491,51.434 25.036,51.887C24.123,52.794 23.429,53.877 22.963,55.145C22.492,56.425 22.252,57.898 22.252,59.571L22.252,72.745C22.252,74.438 22.493,75.924 22.965,77.214L22.965,77.216C23.431,78.488 24.126,79.576 25.038,80.489C25.962,81.413 27.068,82.133 28.365,82.616C29.624,83.084 31.073,83.334 32.722,83.334Z" fill="white"/>
                <path d="M38.881,60.098L38.881,69.575C38.881,70.176 38.998,70.605 39.232,70.862C39.49,71.096 39.919,71.213 40.519,71.213L45.059,71.213L45.059,74.138L40.309,74.138C39.505,74.138 38.827,74.052 38.269,73.885C37.711,73.717 37.259,73.46 36.916,73.109C36.565,72.765 36.307,72.309 36.139,71.744C35.972,71.178 35.886,70.503 35.886,69.715L35.886,60.098L38.881,60.098ZM51.002,69.043C50.511,69.043 50.144,69.137 49.902,69.324C49.653,69.511 49.528,69.788 49.528,70.155L49.528,71.213L53.869,71.213L53.869,69.043L51.002,69.043ZM53.869,67.118C53.869,66.939 53.837,66.767 53.775,66.607C53.713,66.447 53.619,66.323 53.494,66.229C53.245,66.042 52.878,65.948 52.394,65.948L46.521,65.948L49.446,63.023L53.225,63.023L53.225,63.035C54.372,63.097 55.245,63.374 55.846,63.866C56.524,64.427 56.864,65.266 56.864,66.381L56.864,74.138L53.869,74.138L53.869,72.079L51.81,74.138L46.521,74.138L46.521,70.453C46.521,68.23 47.875,67.118 50.581,67.118L53.869,67.118ZM64.211,71.213C64.695,71.213 65.066,71.12 65.323,70.932C65.557,70.753 65.681,70.476 65.697,70.102L65.697,67.06C65.681,66.685 65.557,66.408 65.323,66.229C65.066,66.042 64.691,65.948 64.207,65.948L62.8,65.948C62.308,65.948 61.938,66.042 61.696,66.229C61.446,66.408 61.322,66.685 61.322,67.06L61.329,73.272L63.389,71.213L64.211,71.213ZM58.327,58.928L61.322,58.928L61.322,65.082L63.389,63.023L64.621,63.023C67.335,63.023 68.692,64.135 68.692,66.358L68.692,70.78C68.692,71.896 68.353,72.734 67.671,73.296C66.992,73.857 65.974,74.138 64.625,74.138L58.327,74.138L58.327,58.928Z" fill="rgb(176,191,147)"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm lg:text-base text-[#2F3A24] font-medium">{greeting}</p>
              {userProfile && userProfile.preferences.preferredEffects && userProfile.preferences.preferredEffects.length > 0 && (
                <p className="text-xs lg:text-sm text-[#536C4A]/70 mt-1 lg:mt-2">
                  Помню, тебе нравится: {userProfile.preferences.preferredEffects.join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {(!currentConversation || currentConversation.messages.length === 0) && (
        <p className={`text-[#2F3A24]/70 ${compact ? 'mb-2 text-[10px]' : 'mb-3 lg:mb-4 text-xs lg:text-sm'}`}>
        {t('agentDescription')}
      </p>
      )}

      {/* Кнопка показа скрытой истории */}
      {!showHistory && currentConversation && currentConversation.messages.length > 0 && (
        <div className={compact ? 'mb-2' : 'mb-3 lg:mb-4'}>
          <button
            onClick={() => setShowHistory(true)}
            className="w-full rounded-xl bg-[#536C4A]/10 px-4 py-2.5 text-sm font-medium text-[#536C4A] hover:bg-[#536C4A]/20 transition-colors flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18"/>
            </svg>
            {t('agentShowHistory')} ({currentConversation.messages.length} {
              currentConversation.messages.length === 1 ? t('agentMessage') :
              currentConversation.messages.length < 5 ? t('agentMessages2') :
              t('agentMessages5')
            })
          </button>
        </div>
      )}

      {/* История сообщений */}
      {/* Показываем историю только после отправки первого сообщения или по клику */}
      {showHistory && currentConversation && currentConversation.messages.length > 0 && (
        <div 
          key={currentConversation.id}
          className={`overflow-y-auto pr-2 ${
            compact 
              ? 'mb-2 max-h-40 space-y-1.5' 
              : 'mb-3 lg:mb-4 max-h-60 lg:max-h-64 space-y-2 lg:space-y-3'
          }`}
        >
          {currentConversation.messages.map((msg, idx) => {
            const isLastMessage = idx === currentConversation.messages.length - 1;
            return (
            <div
              key={idx}
              ref={isLastMessage ? lastMessageRef : null}
              className={`rounded-2xl ${
                compact ? 'p-2' : 'p-3 lg:p-4'
              } ${
                msg.role === 'user'
                  ? 'bg-gradient-to-br from-[#536C4A]/10 to-[#B0BF93]/10 ml-4 lg:ml-8'
                  : 'bg-[#F4F8F0] ring-1 ring-[#B0BF93]/50 mr-4 lg:mr-8'
              }`}
            >
              <div className={`font-semibold uppercase tracking-wide text-[#536C4A] ${
                compact ? 'text-[10px] mb-0.5' : 'text-xs mb-1 lg:mb-1.5'
              }`}>
                {msg.role === 'user' ? 'Вы' : 'OG Lab Agent'}
              </div>
              <div className={`text-[#2F3A24] whitespace-pre-wrap leading-relaxed ${
                compact ? 'text-xs' : 'text-sm'
              }`}>
                {renderMarkdown(msg.content)}
              </div>
              
              {/* Показываем карточки продуктов */}
              {msg.productCards && msg.productCards.length > 0 && (
                <div className={compact ? 'mt-1.5 space-y-1' : 'mt-3 lg:mt-4 space-y-2 lg:space-y-2.5'}>
                  {msg.productCards.map((product, i) => (
                    <div
                      key={i}
                      className={`rounded-xl bg-white ring-1 ring-[#B0BF93]/40 hover:ring-[#B0BF93] transition-all hover:shadow-md ${
                        compact ? 'p-2' : 'p-3 lg:p-4'
                      }`}
                    >
                      <div className={`flex items-start justify-between ${compact ? 'gap-2' : 'gap-3'}`}>
                        <div className="flex-1 min-w-0">
                          <div className={`flex items-center gap-2 ${compact ? 'mb-1' : 'mb-1.5'}`}>
                            {/* Индикатор типа */}
                            {product.type && (
                              <span
                                className={`rounded-full flex-shrink-0 ${
                                  compact ? 'w-2 h-2' : 'w-3 h-3'
                                } ${
                                  product.type.toLowerCase() === 'indica'
                                    ? 'bg-indigo-500'
                                    : product.type.toLowerCase() === 'sativa'
                                    ? 'bg-orange-500'
                                    : 'bg-blue-500'
                                }`}
                              />
                            )}
                            <h4 className={`font-bold text-[#2F3A24] truncate ${
                              compact ? 'text-xs' : 'text-sm'
                            }`}>
                              {product.name}
                            </h4>
                            {product.isOur && (
                              <svg className={`text-[#536C4A] flex-shrink-0 ${
                                compact ? 'w-3 h-3' : 'w-4 h-4'
                              }`} viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                              </svg>
                            )}
                          </div>
                          <div className={`text-[#536C4A]/70 ${
                            compact ? 'text-[10px] mb-1' : 'text-xs mb-2'
                          }`}>
                            {product.category}
                            {product.type && ` • ${product.type}`}
                          </div>
                          {/* Эффекты и вкусы */}
                          {(product.effects || product.flavors) && (
                            <div className={`text-[#2F3A24]/60 space-y-0.5 ${
                              compact ? 'text-[10px]' : 'text-xs'
                            }`}>
                              {product.effects && (
                                <div>💫 {product.effects}</div>
                              )}
                              {product.flavors && (
                                <div>🌿 {product.flavors}</div>
                              )}
                            </div>
                          )}
                        </div>
                        {/* THC/CBG */}
                        {(product.thc || product.cbg) && (
                          <div className="text-right flex-shrink-0">
                            <div className={`font-semibold text-[#536C4A] ${
                              compact ? 'text-xs' : 'text-sm'
                            }`}>
                              {product.thc ? `${product.thc}%` : product.cbg ? `${product.cbg}%` : ''}
                            </div>
                            <div className={compact ? 'text-[10px] text-gray-500' : 'text-xs text-gray-500'}>
                              {product.thc ? 'THC' : 'CBG'}
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Цены */}
                      {(product.price_1g || product.price_5g || product.price_20g) && (
                        <div className={`flex border-t border-[#B0BF93]/20 ${
                          compact ? 'gap-1.5 mt-1.5 pt-1.5' : 'gap-2 lg:gap-3 mt-2 lg:mt-3 pt-2 lg:pt-3'
                        }`}>
                          {product.price_1g && (
                            <div className="flex-1 text-center">
                              <div className={compact ? 'text-[10px] text-gray-500' : 'text-xs text-gray-500'}>1G</div>
                              <div className={`font-bold text-[#536C4A] ${compact ? 'text-xs' : 'text-sm'}`}>{product.price_1g}฿</div>
                            </div>
                          )}
                          {product.price_5g && (
                            <div className="flex-1 text-center">
                              <div className={compact ? 'text-[10px] text-gray-500' : 'text-xs text-gray-500'}>5G+</div>
                              <div className={`font-bold text-[#536C4A] ${compact ? 'text-xs' : 'text-sm'}`}>{product.price_5g}฿</div>
                            </div>
                          )}
                          {product.price_20g && (
                            <div className="flex-1 text-center">
                              <div className={compact ? 'text-[10px] text-gray-500' : 'text-xs text-gray-500'}>20G+</div>
                              <div className={`font-bold text-[#536C4A] ${compact ? 'text-xs' : 'text-sm'}`}>{product.price_20g}฿</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            );
          })}
          
          {/* Индикатор загрузки */}
          {loading && (
            <div className={`rounded-2xl bg-[#F4F8F0] ring-1 ring-[#B0BF93]/50 mr-4 lg:mr-8 ${
              compact ? 'p-2' : 'p-3 lg:p-4'
            }`}>
              <div className={`flex items-center text-[#536C4A] ${compact ? 'gap-2' : 'gap-3'}`}>
                <div className={`border-2 border-[#536C4A] border-t-transparent rounded-full animate-spin ${
                  compact ? 'w-4 h-4' : 'w-5 h-5 lg:w-6 lg:h-6'
                }`}></div>
                <span className={compact ? 'text-xs' : 'text-sm'}>Думаю...</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Индикатор записи */}
      {recordingState === 'recording' && (
        <div className={`rounded-xl bg-red-50 border border-red-200 ${
          compact ? 'p-2 mb-2' : 'p-3 mb-3'
        }`}>
          <div className={`flex items-center justify-between ${
            compact ? 'text-xs' : 'text-sm'
          }`}>
            <div className="flex items-center gap-2 text-red-600 font-semibold">
              <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              {t('agentRecording')}
            </div>
            <div className={`font-mono font-semibold ${
              recordingDuration >= (MAX_RECORDING_DURATION_SEC - 5) ? 'text-red-600' : 'text-red-500'
            }`}>
              {recordingDuration}с / {MAX_RECORDING_DURATION_SEC}с
            </div>
          </div>
        </div>
      )}

      {/* Форма ввода */}
      <form onSubmit={ask} className="w-full">
        <div className={`flex items-center rounded-2xl bg-white/80 shadow-sm focus-within:border-[#536C4A] w-full overflow-hidden ${
          compact ? 'gap-1.5 border border-[#B0BF93]/60 px-2 py-1' : 'gap-2 border-2 border-[#B0BF93]/60 px-3 py-2'
        }`}>
          <input
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value)
              // Прогреваем кэш при первом вводе символа
              if (!cachePrefetched && e.target.value.length === 1) {
                prefetchMenuCache()
              }
            }}
            placeholder={t('agentPlaceholder')}
            disabled={loading}
            data-agent-input="true"
            className={`min-w-0 flex-1 bg-transparent text-[#2F3A24] outline-none placeholder:text-[#2F3A24]/40 disabled:opacity-50 ${
              compact ? 'px-1 py-1 text-base' : 'px-2 py-2 text-base lg:text-base'
            }`}
          />
          {isRecordingSupported && (
          <button
            type="button"
              aria-label={
                recordingState === 'recording' ? t('agentRecordingStopShort')
                : recordingState === 'processing' ? t('agentProcessing')
                : t('agentVoiceInput')
              }
              disabled={loading || recordingState === 'processing'}
              onClick={handleVoiceButtonClick}
              className={`grid shrink-0 place-items-center rounded-full shadow-sm transition-all disabled:opacity-50 ${
                compact ? 'h-7 w-7' : 'h-10 w-10'
              } ${
                recordingState === 'recording'
                  ? 'bg-red-500 text-white ring-2 ring-red-300 animate-pulse scale-110'
                  : recordingState === 'processing'
                  ? 'bg-yellow-500 text-white ring-2 ring-yellow-300'
                  : 'bg-white text-[#2F3A24] ring-1 ring-[#B0BF93]/60 hover:bg-[#F4F8F0]'
              }`}
              title={
                recordingState === 'idle' ? t('agentRecordingStart')
                : recordingState === 'recording' ? t('agentRecordingStop')
                : ''
              }
            >
            {recordingState === 'processing' ? (
              <svg className="animate-spin" width={compact ? '14' : '20'} height={compact ? '14' : '20'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
          <svg width={compact ? '14' : '20'} height={compact ? '14' : '20'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10a7 7 0 0 1-14 0" />
            <path d="M12 19v4" />
          </svg>
            )}
          </button>
          )}
          <button
            type="submit"
            aria-label={t('agentSend')}
            disabled={loading || !question.trim()}
            className={`grid shrink-0 place-items-center rounded-full bg-gradient-to-r from-[#536C4A] to-[#B0BF93] text-white shadow-lg transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
              compact ? 'h-7 w-7' : 'h-10 w-10'
            }`}
          >
            <svg width={compact ? '14' : '20'} height={compact ? '14' : '20'} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5" />
              <path d="m5 12 7-7 7 7" />
            </svg>
          </button>
        </div>
      </form>

      {/* Ошибка */}
      {error && (
        <div className={`rounded-xl bg-red-50 text-red-600 ${
          compact ? 'mt-2 p-2 text-xs' : 'mt-3 p-4 text-sm lg:text-base'
        }`}>
          ❌ {error}
        </div>
      )}

      {/* Подсказка для новых пользователей */}
      {!compact && currentConversation && currentConversation.messages.length === 0 && !greeting && isRecordingSupported && (
        <div className="mt-4">
          <div className="flex items-center gap-2 text-xs lg:text-sm text-[#536C4A]/70">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10a7 7 0 0 1-14 0" />
              <path d="M12 19v4" />
            </svg>
              <span>{t('agentRecordingHint', { max: MAX_RECORDING_DURATION_SEC })}</span>
          </div>
        </div>
      )}
    </section>
  )
}


