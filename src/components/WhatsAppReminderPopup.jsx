export default function WhatsAppReminderPopup({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 animate-fadeIn">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
            <span className="text-3xl">📱</span>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-center mb-4 text-gray-800">
          ⚠️ Ultimo passo importante!
        </h3>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <p className="text-gray-800 font-semibold mb-2">
            Quando si aprirà WhatsApp:
          </p>
          <p className="text-gray-700 text-lg">
            🔴 <strong>PREMI "INVIO"</strong> per completare e inviare l'ordine al locale!
          </p>
        </div>
        
        <p className="text-sm text-gray-600 text-center mb-6">
          Senza questo passaggio il locale non riceverà il tuo ordine.
        </p>
        
        <div className="space-y-3">
          <button
            onClick={onConfirm}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 rounded-lg hover:from-green-600 hover:to-green-700 transition shadow-lg"
          >
            ✅ HO CAPITO - Apri WhatsApp
          </button>
          
          <button
            onClick={onCancel}
            className="w-full bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 transition"
          >
            ← Torna indietro
          </button>
        </div>
      </div>
    </div>
  )
}
