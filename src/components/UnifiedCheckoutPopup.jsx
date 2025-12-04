import { useState } from 'react'

export default function UnifiedCheckoutPopup({ 
  customerData, 
  orderType,
  restaurant,
  onConfirm, 
  onCancel 
}) {
  const [confirmedData, setConfirmedData] = useState(false)
  const [confirmedWhatsApp, setConfirmedWhatsApp] = useState(false)
  const [rating, setRating] = useState(null)
  const [comment, setComment] = useState('')

  const canProceed = confirmedData && confirmedWhatsApp && rating

  const handleConfirm = async () => {
    if (!canProceed) {
      alert('⚠️ Completa tutti i passaggi obbligatori!')
      return
    }

    if (rating && comment.trim()) {
      const feedbackData = {
        restaurant: restaurant?.name || 'Sconosciuto',
        rating: rating === 1 ? 'Scontento 😞' : rating === 2 ? 'Contento 😊' : 'Felice 😄',
        comment: comment.trim(),
        timestamp: new Date().toISOString()
      }

      try {
        await fetch('https://formspree.io/f/YOUR_FORM_ID', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: 'ordini-lampo@proton.me',
            subject: `Feedback Ordini-Lampo - ${feedbackData.restaurant}`,
            message: `
Ristorante: ${feedbackData.restaurant}
Gradimento: ${feedbackData.rating}
Commento: ${feedbackData.comment}
Data: ${new Date(feedbackData.timestamp).toLocaleString('it-IT')}
            `
          })
        })
      } catch (err) {
        console.error('Errore invio feedback:', err)
      }
    }

    onConfirm()
  }

  const handleShare = () => {
    const text = `Ho appena ordinato da ${restaurant?.name} con Ordini-Lampo! 🍜 Commissioni zero, solo buon cibo! Prova: ${window.location.origin}?r=${restaurant?.slug}`
    
    if (navigator.share) {
      navigator.share({
        title: 'Ordini-Lampo',
        text: text,
        url: `${window.location.origin}?r=${restaurant?.slug}`
      })
    } else {
      navigator.clipboard.writeText(text)
      alert('✅ Link copiato! Condividilo con i tuoi amici!')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fadeIn">
        
        {/* HEADER */}
        <div className="bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 p-8 text-white text-center rounded-t-2xl">
          <div className="w-20 h-20 bg-white bg-opacity-20 backdrop-blur-md rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-5xl">🚀</span>
          </div>
          <h2 className="text-3xl font-bold mb-2">Ultimo Passo!</h2>
          <p className="text-orange-100">Conferma e il tuo ordine sarà pronto 🎉</p>
        </div>

        <div className="p-6 space-y-4">
          
          {/* SEZIONE 1: VERIFICA DATI */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-5 border-l-4 border-blue-500">
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                checked={confirmedData}
                onChange={(e) => setConfirmedData(e.target.checked)}
                className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">📋</span>
                  <h3 className="text-lg font-bold text-blue-900">1. Verifica i tuoi dati</h3>
                </div>
                <div className="bg-white bg-opacity-60 rounded-lg p-3 text-sm space-y-1">
                  <p className="text-gray-800"><strong>📞</strong> {customerData.phone}</p>
                  <p className="text-gray-800"><strong>👤</strong> {customerData.name} {customerData.surname}</p>
                  {orderType === 'delivery' && (
                    <p className="text-gray-800"><strong>📍</strong> {customerData.address} {customerData.civic}, {customerData.city}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SEZIONE 2: WHATSAPP REMINDER */}
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-5 border-l-4 border-yellow-500">
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                checked={confirmedWhatsApp}
                onChange={(e) => setConfirmedWhatsApp(e.target.checked)}
                className="mt-1 w-5 h-5 text-yellow-600 rounded focus:ring-yellow-500"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">📱</span>
                  <h3 className="text-lg font-bold text-yellow-900">2. Importante: Conferma su WhatsApp</h3>
                </div>
                <div className="bg-yellow-200 bg-opacity-50 rounded-lg p-3">
                  <p className="text-yellow-900 font-semibold mb-2">
                    🔴 Quando si apre WhatsApp:
                  </p>
                  <p className="text-yellow-800 text-lg font-bold">
                    PREMI "INVIO" per completare l'ordine!
                  </p>
                  <p className="text-xs text-yellow-700 mt-2">
                    Senza questo il locale non riceverà il tuo ordine
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* SEZIONE 3: GRADIMENTO APP */}
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-5 border-l-4 border-green-500">
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">⭐</span>
                <h3 className="text-lg font-bold text-green-900">3. Come è stata l'esperienza? *</h3>
              </div>
            </div>
            
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setRating(1)}
                className={`flex flex-col items-center p-4 rounded-xl transition-all transform hover:scale-105 ${
                  rating === 1 
                    ? 'bg-white shadow-lg ring-2 ring-green-500' 
                    : 'bg-white bg-opacity-60 hover:bg-white'
                }`}
              >
                <span className="text-5xl mb-2">😞</span>
                <span className="text-xs font-medium text-gray-700">Scontento</span>
              </button>
              
              <button
                onClick={() => setRating(2)}
                className={`flex flex-col items-center p-4 rounded-xl transition-all transform hover:scale-105 ${
                  rating === 2 
                    ? 'bg-white shadow-lg ring-2 ring-green-500' 
                    : 'bg-white bg-opacity-60 hover:bg-white'
                }`}
              >
                <span className="text-5xl mb-2">😊</span>
                <span className="text-xs font-medium text-gray-700">Contento</span>
              </button>
              
              <button
                onClick={() => setRating(3)}
                className={`flex flex-col items-center p-4 rounded-xl transition-all transform hover:scale-105 ${
                  rating === 3 
                    ? 'bg-white shadow-lg ring-2 ring-green-500' 
                    : 'bg-white bg-opacity-60 hover:bg-white'
                }`}
              >
                <span className="text-5xl mb-2">😄</span>
                <span className="text-xs font-medium text-gray-700">Felice</span>
              </button>
            </div>
          </div>

          {/* SEZIONE 4: FEEDBACK OPZIONALE */}
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-5 border-l-4 border-purple-500">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">💭</span>
              <h3 className="text-lg font-bold text-purple-900">4. Vuoi dirci qualcosa? (opzionale)</h3>
            </div>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 100))}
              placeholder="Il tuo feedback ci aiuta a migliorare..."
              className="w-full p-3 border-2 border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none bg-white"
              rows="3"
              maxLength="100"
            />
            <p className="text-xs text-purple-600 text-right mt-1">
              {comment.length}/100 caratteri
            </p>
          </div>

          {/* SEZIONE 5: CONDIVIDI */}
          <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-xl p-5 border-l-4 border-pink-500">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🎁</span>
              <h3 className="text-lg font-bold text-pink-900">5. Condividi con gli amici!</h3>
            </div>
            <button
              onClick={handleShare}
              className="w-full bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold py-3 rounded-lg hover:from-pink-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02]"
            >
              🎉 Condividi Ordini-Lampo
            </button>
            <p className="text-xs text-pink-700 text-center mt-2">
              Aiuta i tuoi amici a scoprire ordini senza commissioni!
            </p>
          </div>

        </div>

        {/* FOOTER: PULSANTI */}
        <div className="p-6 bg-gray-50 rounded-b-2xl space-y-3">
          <button
            onClick={handleConfirm}
            disabled={!canProceed}
            className={`w-full py-5 rounded-xl font-bold text-lg shadow-lg transition-all transform ${
              canProceed
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 hover:shadow-xl hover:scale-[1.02]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {canProceed ? '✅ CONFERMA E APRI WHATSAPP' : '⚠️ Completa i passaggi obbligatori'}
          </button>
          
          <button
            onClick={onCancel}
            className="w-full bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-50 transition"
          >
            ← Torna al riepilogo
          </button>
        </div>

      </div>
    </div>
  )
}
