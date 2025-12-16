// ============================================
// 🔑 SESSION KEY - Persistente e sicuro
// ============================================

export function getSessionKey() {
  try {
    const existing = localStorage.getItem("ol_session_key")
    if (existing && existing.length > 30) return existing
    
    const fresh = crypto.randomUUID() + "-" + crypto.randomUUID()
    localStorage.setItem("ol_session_key", fresh)
    return fresh
  } catch (e) {
    return "temp-" + Math.random().toString(36).substring(2)
  }
}
