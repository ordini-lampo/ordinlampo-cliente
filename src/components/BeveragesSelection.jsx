function BeveragesSelection({ 
  categories, 
  ingredients, 
  selectedBeverages, 
  setSelectedBeverages,
  nextStep 
}) {
  const nonAlcoholicCategory = categories.find(c => c.name === 'bevande_analcoliche')
  const alcoholicCategory = categories.find(c => c.name === 'bevande_alcoliche')
  
  const nonAlcoholicList = ingredients.filter(i => i.category_id === nonAlcoholicCategory?.id)
  const alcoholicList = ingredients.filter(i => i.category_id === alcoholicCategory?.id)

  const updateQuantity = (beverageId, delta) => {
    const currentQty = selectedBeverages[beverageId] || 0
    const newQty = Math.max(0, Math.min(10, currentQty + delta))
    
    if (newQty === 0) {
      const { [beverageId]: removed, ...rest } = selectedBeverages
      setSelectedBeverages(rest)
    } else {
      setSelectedBeverages({ ...selectedBeverages, [beverageId]: newQty })
    }
  }

  const totalBeverages = Object.values(selectedBeverages).reduce((sum, qty) => sum + qty, 0)
  const totalPrice = Object.entries(selectedBeverages).reduce((sum, [id, qty]) => {
    const bev = ingredients.find(i => i.id === parseInt(id))
    return sum + (bev?.price || 0) * qty
  }, 0)

  const BeverageItem = ({ beverage }) => {
    const qty = selectedBeverages[beverage.id] || 0
    
    return (
      <div className={`p-4 rounded-xl border-2 transition-all ${
        qty > 0 ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <p className="font-medium text-gray-800 text-sm">{beverage.name}</p>
          <p className="font-bold text-orange-500">€{parseFloat(beverage.price).toFixed(2)}</p>
        </div>
        
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => updateQuantity(beverage.id, -1)}
            disabled={qty === 0}
            className={`w-10 h-10 rounded-full font-bold text-xl transition-all ${
              qty > 0 
                ? 'bg-orange-500 text-white hover:bg-orange-600' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            -
          </button>
          <span className="text-xl font-bold w-8 text-center">{qty}</span>
          <button
            onClick={() => updateQuantity(beverage.id, 1)}
            disabled={qty >= 10}
            className={`w-10 h-10 rounded-full font-bold text-xl transition-all ${
              qty < 10 
                ? 'bg-orange-500 text-white hover:bg-orange-600' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            +
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        🥤 Vuoi aggiungere delle bevande?
      </h2>
      <p className="text-gray-500 mb-6">
        Opzionale - puoi saltare questo passaggio
      </p>

      {/* Analcolici */}
      {nonAlcoholicList.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span>🥤</span> Analcolici
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {nonAlcoholicList.map(bev => (
              <BeverageItem key={bev.id} beverage={bev} />
            ))}
          </div>
        </div>
      )}

      {/* Alcolici */}
      {alcoholicList.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span>🍺</span> Alcolici
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {alcoholicList.map(bev => (
              <BeverageItem key={bev.id} beverage={bev} />
            ))}
          </div>
        </div>
      )}

      {/* Totale bevande */}
      {totalBeverages > 0 && (
        <div className="p-4 bg-green-50 rounded-xl mb-6">
          <div className="flex justify-between items-center">
            <p className="text-green-700">
              {totalBeverages} bevand{totalBeverages === 1 ? 'a' : 'e'} selezionat{totalBeverages === 1 ? 'a' : 'e'}
            </p>
            <p className="font-bold text-green-700">+€{totalPrice.toFixed(2)}</p>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={nextStep}
          className="flex-1 py-4 rounded-xl font-bold text-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
        >
          Salta
        </button>
        <button
          onClick={nextStep}
          className="flex-1 py-4 rounded-xl font-bold text-lg bg-orange-500 text-white hover:bg-orange-600 transition-all"
        >
          Continua →
        </button>
      </div>
    </div>
  )
}

export default BeveragesSelection
