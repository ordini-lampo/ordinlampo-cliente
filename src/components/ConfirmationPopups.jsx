function ConfirmationPopups({ type, phone, onConfirm, onCancel }) {
  if (type === 'phone') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-fadeIn">
          <div className="text-center mb-6">
            <span className="text-5xl mb-4 block">📱</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Conferma numero di telefono
            </h3>
            <p className="text-gray-500 mb-4">
              Il tuo ordine verrà inviato a questo numero:
            </p>
            <p className="text-2xl font-bold text-orange-500 bg-orange-50 py-3 rounded-xl">
              {phone}
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={onConfirm}
              className="w-full py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-colors"
            >
              ✓ Sì, è corretto
            </button>
            <button
              onClick={onCancel}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              ← Modifica numero
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'order') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full animate-fadeIn shadow-2xl">
          <div className="text-center mb-4">
            <span className="text-5xl mb-4 block">🚀</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Tutto pronto!
            </h3>
            <p className="text-gray-600 mb-4">
              Cliccando "Invia" si aprirà WhatsApp con il riepilogo.
              <br/><strong className="text-orange-600">Ricordati di premere il tasto invio nella chat!</strong>
            </p>
            
            {/* FIX: Manleva Responsabilità */}
            <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-500 text-left mb-4 border border-gray-100">
              <strong>⚠️ Nota:</strong> Con l'invio dell'ordine, il cliente accetta che gli orari di consegna sono stimati (±20 min). Il ristorante non è responsabile per ritardi dovuti a cause di forza maggiore (meteo, traffico, incidenti).
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={onConfirm}
              className="w-full py-4 bg-[#25D366] text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:bg-[#128C7E] transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Invia su WhatsApp
            </button>
            <button
              onClick={onCancel}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              ← Torna al riepilogo
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default ConfirmationPopups
