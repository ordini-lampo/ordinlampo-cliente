import { useState } from 'react'

function Welcome({ 
  restaurant, 
  previousCustomer, 
  previousOrder, 
  nextStep,
  setCustomerData,
  setSelectedBowlType,
  setSelectedBases,
  setSelectedProteins,
  setSelectedIngredients,
  setSelectedSauces,
  setSelectedToppings,
  bowlTypes
}) {
  const [showReorder, setShowReorder] = useState(!!previousOrder)

  const handleReorder = () => {
    if (previousOrder) {
      // Precompila dati cliente
      if (previousCustomer) {
        setCustomerData({
          name: previousCustomer.name || '',
          surname: previousCustomer.surname || '',
          phone: previousCustomer.phone || '',
          address: previousCustomer.default_address || '',
          civic: previousCustomer.default_civic || '',
          city: previousCustomer.default_city || '',
          doorbell: previousCustomer.default_doorbell || '',
          notesOrder: '',
          notesAddress: ''
        })
      }
      
      // Precompila ordine precedente
      if (previousOrder.bowlType) {
        const bowlType = bowlTypes.find(b => b.id === previousOrder.bowlType.id)
        if (bowlType) setSelectedBowlType(bowlType)
      }
      if (previousOrder.bases) setSelectedBases(previousOrder.bases)
      if (previousOrder.proteins) setSelectedProteins(previousOrder.proteins)
      if (previousOrder.ingredients) setSelectedIngredients(previousOrder.ingredients)
      if (previousOrder.sauces) setSelectedSauces(previousOrder.sauces)
      if (previousOrder.toppings) setSelectedToppings(previousOrder.toppings)
    }
    nextStep()
  }

  const handleNewOrder = () => {
    nextStep()
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-fadeIn">
      {/* Logo */}
      <div className="mb-8">
        {restaurant.logo_url ? (
          <img 
            src={restaurant.logo_url} 
            alt={restaurant.name}
            className="w-32 h-32 object-contain"
          />
        ) : (
          <div className="w-32 h-32 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-4xl">🍜</span>
          </div>
        )}
      </div>

      {/* Nome ristorante */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
        {restaurant.name}
      </h1>
      
      <p className="text-gray-500 mb-8 text-center">
        Ordina il tuo pokè in pochi tap!
      </p>

      {/* Ordine precedente */}
      {showReorder && previousOrder && (
        <div className="w-full max-w-sm mb-6 p-4 bg-orange-50 rounded-2xl border-2 border-orange-200">
          <p className="text-sm text-orange-700 mb-3 flex items-center gap-2">
            <span>🕐</span>
            <span>Ordina di nuovo?</span>
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Il tuo ultimo ordine: <strong>{previousOrder.bowlType?.name}</strong>
          </p>
          <button
            onClick={handleReorder}
            className="w-full py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
          >
            Sì, stesso ordine!
          </button>
          <button
            onClick={() => setShowReorder(false)}
            className="w-full py-2 text-gray-500 text-sm mt-2"
          >
            No, nuovo ordine
          </button>
        </div>
      )}

      {/* Bottone inizia */}
      {!showReorder && (
        <button
          onClick={handleNewOrder}
          className="w-full max-w-sm py-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
        >
          Inizia l'ordine 🚀
        </button>
      )}

      {/* Info */}
      <div className="mt-8 flex gap-6 text-gray-400 text-sm">
        <div className="flex items-center gap-1">
          <span>⏱️</span>
          <span>2 min</span>
        </div>
        <div className="flex items-center gap-1">
          <span>📱</span>
          <span>Via WhatsApp</span>
        </div>
        <div className="flex items-center gap-1">
          <span>💳</span>
          <span>Paga alla consegna</span>
        </div>
      </div>

      {/* Powered by */}
      {restaurant.show_ordinlampo_branding && (
        <p className="mt-12 text-xs text-gray-300">
          Powered by Ordinlampo
        </p>
      )}
    </div>
  )
}

export default Welcome
