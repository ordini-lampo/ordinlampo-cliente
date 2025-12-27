function ToppingSelection({ 
  categories, 
  ingredients, 
  selectedToppings, 
  setSelectedToppings,
  nextStep 
}) {
  const toppingCategory = categories.find(c => c.code === 'topping')
  const toppingsList = ingredients.filter(i => i.category_id === toppingCategory?.id)
  
  const maxToppings = toppingCategory?.max_selections || 2
  const EXTRA_PORTION_PRICE = 2.00
  
  const toggleTopping = (topping) => {
    const existingIndex = selectedToppings.findIndex(t => t.id === topping.id)
    
    if (existingIndex >= 0) {
      setSelectedToppings(selectedToppings.filter(t => t.id !== topping.id))
    } else if (selectedToppings.length < maxToppings) {
      setSelectedToppings([...selectedToppings, { ...topping, extraPortions: 0 }])
    }
  }
  
  const updateExtraPortions = (toppingId, change) => {
    setSelectedToppings(selectedToppings.map(t => {
      if (t.id === toppingId) {
        const newValue = Math.max(0, Math.min(5, t.extraPortions + change))
        return { ...t, extraPortions: newValue }
      }
      return t
    }))
  }
  
  const canProceed = true
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        ✨ Scegli i tuoi topping
      </h2>
      <p className="text-gray-700 mb-2 font-medium">
        Seleziona fino a {maxToppings} topping ({selectedToppings.length}/{maxToppings})
      </p>
      <p className="text-sm text-gray-600 mb-6">
        Puoi anche proseguire senza selezionare topping
      </p>
      
      <div className="grid grid-cols-2 gap-4">
        {toppingsList.map((topping) => {
          const selected = selectedToppings.find(t => t.id === topping.id)
          const isSelected = !!selected
          const isDisabled = !isSelected && selectedToppings.length >= maxToppings
          const extraTotal = selected ? selected.extraPortions * EXTRA_PORTION_PRICE : 0
          
          return (
            <div key={topping.id} className="space-y-2">
              <button
                onClick={() => toggleTopping(topping)}
                disabled={isDisabled}
                className={`w-full p-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : isDisabled
                      ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                      : 'border-gray-300 bg-white hover:border-blue-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-gray-800 text-sm">{topping.name}</p>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
                  }`}>
                    {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                  </div>
                </div>
              </button>
              
              {isSelected && (
                <div className="p-2 rounded-lg border-2 border-orange-400 bg-orange-50">
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    🍱 Extra (€{EXTRA_PORTION_PRICE.toFixed(2)})
                  </p>
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => updateExtraPortions(topping.id, -1)}
                      disabled={selected.extraPortions === 0}
                      className={`w-8 h-8 rounded-md font-bold text-lg transition-all ${
                        selected.extraPortions === 0
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-orange-500 text-white hover:bg-orange-600'
                      }`}
                    >
                      −
                    </button>
                    
                    <div className="flex-1 h-8 bg-white rounded-md border-2 border-orange-300 flex items-center justify-center">
                      <span className="text-lg font-bold text-gray-800">
                        {selected.extraPortions}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => updateExtraPortions(topping.id, 1)}
                      disabled={selected.extraPortions === 5}
                      className={`w-8 h-8 rounded-md font-bold text-lg transition-all ${
                        selected.extraPortions === 5
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-orange-500 text-white hover:bg-orange-600'
                      }`}
                    >
                      +
                    </button>
                  </div>
                  
                  {selected.extraPortions > 0 && (
                    <p className="text-xs text-orange-600 font-bold mt-1 text-center">
                      €{extraTotal.toFixed(2)}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      <button
        onClick={nextStep}
        className="w-full mt-8 py-4 rounded-xl font-bold text-lg bg-orange-500 text-white hover:bg-orange-600 transition-all"
      >
        Continua →
      </button>
    </div>
  )
}

export default ToppingSelection
