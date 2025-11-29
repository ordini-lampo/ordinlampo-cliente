function PaymentMethod({ 
  settings,
  paymentMethod, 
  setPaymentMethod,
  nextStep 
}) {
  const handleSelect = (method) => {
    setPaymentMethod(method)
    nextStep()
  }

  const paymentOptions = [
    {
      id: 'cash',
      name: 'Contanti alla consegna',
      icon: '💵',
      description: 'Paga in contanti al rider',
      enabled: settings?.enable_cash !== false
    },
    {
      id: 'card',
      name: 'Carta alla consegna (POS)',
      icon: '💳',
      description: 'Paga con carta al rider',
      enabled: settings?.enable_card !== false
    },
    {
      id: 'prepaid',
      name: 'Già pagato',
      icon: '✅',
      description: 'Satispay, bonifico o altro',
      enabled: settings?.enable_prepaid !== false
    }
  ]

  const availableOptions = paymentOptions.filter(opt => opt.enabled)

  return (
    <div className="p-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        💳 Come preferisci pagare?
      </h2>
      <p className="text-gray-500 mb-6">
        Seleziona il metodo di pagamento
      </p>

      <div className="space-y-3">
        {availableOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
              paymentMethod === option.id
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 bg-white hover:border-orange-300'
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="text-3xl">{option.icon}</span>
              <div>
                <p className="font-semibold text-gray-800">{option.name}</p>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {availableOptions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Nessun metodo di pagamento disponibile</p>
        </div>
      )}
    </div>
  )
}

export default PaymentMethod
