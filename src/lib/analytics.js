// ============================================
// 📊 ANALYTICS - Fire-and-forget (mai blocca)
// ============================================

import { getSessionKey } from './sessionKey'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY

export async function sendEvent(eventType, restaurantId, meta = {}) {
  // Guard: se manca qualcosa, esci silenziosamente
  if (!SUPABASE_URL || !SUPABASE_ANON || !restaurantId) return
  
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 2000) // Max 2 secondi
  
  try {
    const body = {
      restaurant_id: restaurantId,
      session_key: getSessionKey(),
      event_type: eventType,
      ref_code: new URLSearchParams(window.location.search).get('ref') || null,
      event_dedup_key: `${eventType}:${getSessionKey()}:${Date.now()}`,
      meta: meta
    }
    
    fetch(`${SUPABASE_URL}/functions/v1/event-ingest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_ANON}`
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      keepalive: true
    }).catch(() => {}) // Ignora errori silenziosamente
    
  } catch (e) {
    // Ignora qualsiasi errore - analytics non deve mai bloccare
  } finally {
    clearTimeout(timeout)
  }
}

// Helper per eventi specifici
export const trackAppOpen = (restaurantId) => sendEvent('app_open', restaurantId)
export const trackCheckoutStart = (restaurantId, bowlsCount) => sendEvent('checkout_start', restaurantId, { bowls_count: bowlsCount })
export const trackWhatsAppClick = (restaurantId, total) => sendEvent('whatsapp_click', restaurantId, { total })
