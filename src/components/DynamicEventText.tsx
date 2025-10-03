'use client'

import { useState, useEffect } from 'react'
import { fetchDynamicSettingsClient } from '@/lib/dynamic-settings'

export default function DynamicEventText() {
  const [eventText, setEventText] = useState('Join us for an unforgettable experience!')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load event text asynchronously
    fetchDynamicSettingsClient().then(settings => {
      if (settings && settings.event_text) {
        setEventText(settings.event_text)
      }
      setIsLoading(false)
    })
  }, [])

  if (isLoading) {
    return (
      <p className="text-center text-gray-600 animate-pulse">
        Loading...
      </p>
    )
  }

  return (
    <p className="text-center text-gray-600">
      {eventText}
    </p>
  )
}


