import fs from 'fs'
import path from 'path'

const logFile = path.join(process.cwd(), 'debug.log')

export function debugLog(message: string, data?: unknown) {
  const timestamp = new Date().toISOString()
  const logEntry = `[${timestamp}] ${message}${data ? ` | ${JSON.stringify(data)}` : ''}\n`
  
  // Log to console
  console.log(`🔐 ${message}`, data || '')
  
  // Log to file (only on server)
  if (typeof window === 'undefined') {
    try {
      fs.appendFileSync(logFile, logEntry)
    } catch (error) {
      console.error('Failed to write to debug log:', error)
    }
  }
}

export function clearDebugLog() {
  if (typeof window === 'undefined') {
    try {
      fs.writeFileSync(logFile, `# Debug Log cleared at ${new Date().toISOString()}\n`)
    } catch (error) {
      console.error('Failed to clear debug log:', error)
    }
  }
}
