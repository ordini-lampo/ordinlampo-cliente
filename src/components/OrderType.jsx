function OrderType({ orderType, setOrderType, settings, nextStep }) {
  const handleSelect = (type) => {
    setOrderType(type)
    nextStep()
  }

  return (
    <div className="p-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Come preferisci ricevere il tuo ordine?
      </h2>
      <p className="text-gray-500 mb-8">
        Seleziona una delle opzioni disponibili
      </p>

      <div className="space-y-4">
        {/* Consegna a domicilio */}
        {settings?.enable_delivery !== false && (
          <button
            onClick={() => handleSelect('delivery')}
            className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
              orderType === 'delivery' 
                ? 'border-orange-500 bg-orange-50' 
                : 'border-gray-200 bg-white hover:border-orange-300'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">🛵</span>
              <div>
                <h3 className="font-bold text-lg text-gray-800">Consegna a domicilio</h3>
                <p className="text-gray-500 text-sm">Ti portiamo il tuo pokè direttamente a casa</p>
              </div>
            </div>
          </button>
        )}

        {/* Ritiro al locale */}
        {settings?.enable_pickup !== false && (
          <button
            onClick={() => handleSelect('pickup')}
            className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
              orderType === 'pickup' 
                ? 'border-orange-500 bg-orange-50' 
                : 'border-gray-200 bg-white hover:border-orange-300'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl">🥡</span>
              <div>
                <h3 className="font-bold text-lg text-gray-800">Ritiro al locale</h3>
                <p className="text-gray-500 text-sm">Passa a ritirare quando è pronto</p>
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  )
}

export default OrderType
