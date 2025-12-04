import { useState } from 'react'

export default function FeedbackPopup({ restaurant, onClose }) {
  const [rating, setRating] = useState(null)
  const [comment, setComment] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!rating) {
      alert('Per favore seleziona un gradimento!')
      return
    }

    const feedbackData = {
      restaurant: restaurant?.name || 'Sconosciuto',
      rating: rating === 1 ? 'Scontento' : rating === 2 ? 'Contento' : 'Felice',
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
Commento: ${feedbackData.comment || 'Nessun commento'}
Data: ${new Date(feedbackData.timestamp).toLocaleString('it-IT')}
          `
        })
      })
    } catch (err) {
      console.error('Errore invio feedback:', err)
    }

    setSubmitted(true)
    setTimeout(() => onClose(), 2000)
  }

  const handleShare = () => {
    const text = `Ho appena ordinato da ${restaurant?.name} con Ordini-Lampo! 🍜 Niente commissioni, solo buon cibo! Prova anche tu: ${window.location.origin}?r=${restaurant?.slug}`
    
    if (navigator.share) {
      navigator.share({
        title: 'Ordini-Lampo',
        text: text,
        url: `${window.location.origin}?r=${restaurant?.slug}`
      })
    } else {
      navigator.clipboard.writeText(text)
      alert('Link copiato! Condividilo con i tuoi amici!')
    }
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-green-600 mb-2">
            Grazie per il tuo feedback!
          </h3>
          <p className="text-gray-600">
            Il tuo ordine è stato inviato con successo!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 animate-fadeIn">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
            <span className="text-3xl">⭐</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-center mb-2 text-gray-800">
          Come è stata la tua esperienza?
        </h3>
        
        <p className="text-sm text-gray-600 text-center mb-6">
          Il tuo feedback ci aiuta a migliorare!
        </p>
        
        <div className="flex justify-center gap-6 mb-6">
          <button
            onClick={() => setRating(1)}
            className={`flex flex-col items-center p-4 rounded-xl transition ${
              rating === 1 ? 'bg-red-50 border-2 border-red-500' : 'hover:bg-gray-50'
            }`}
          >
            <span className="text-5xl mb-2">😞</span>
            <span className="text-xs text-gray-600">Scontento</span>
          </button>
          
          <button
            onClick={() => setRating(2)}
            className={`flex flex-col items-center p-4 rounded-xl transition ${
              rating === 2 ? 'bg-yellow-50 border-2 border-yellow-500' : 'hover:bg-gray-50'
            }`}
          >
            <span className="text-5xl mb-2">😊</span>
            <span className="text-xs text-gray-600">Contento</span>
          </button>
          
          <button
            onClick={() => setRating(3)}
            className={`flex flex-col items-center p-4 rounded-xl transition ${
              rating === 3 ? 'bg-green-50 border-2 border-green-500' : 'hover:bg-gray-50'
            }`}
          >
            <span className="text-5xl mb-2">😄</span>
            <span className="text-xs text-gray-600">Felice</span>
          </button>
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vuoi aggiungere un commento? (opzionale)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 100))}
            placeholder="Dicci cosa ne pensi..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows="3"
            maxLength="100"
          />
          <p className="text-xs text-gray-500 text-right mt-1">
            {comment.length}/100 caratteri
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-lg"
          >
            ✅ Invia Feedback
          </button>
          
          <button
            onClick={handleShare}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition"
          >
            🎁 Condividi con un amico
          </button>
          
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 transition"
          >
            Salta
          </button>
        </div>
      </div>
    </div>
  )
}
