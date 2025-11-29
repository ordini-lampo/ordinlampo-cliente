function ToppingSelection({ 
  categories, 
  ingredients, 
  selectedToppings, 
  setSelectedToppings,
  nextStep 
}) {
  const toppingCategory = categories.find(c => c.name === 'topping')
  const toppingsList = ingredients.filter(i => i.category_id === toppingCategory?.id)
  
  const maxToppings = toppingCategory?.max_selections || 2
  const allowDouble = toppingCategory?.allow_double_portion
  const doublePrice = toppingCategory?.double_portion_price || 0

  const toggleTopping = (topping) => {
    const existingIndex = selectedToppings.findIndex(t => t.id === topping.id)
    
    if (existingIndex >= 0) {
      setSelectedToppings(selectedToppings.filter(t => t.id !== topping.id))
    } else if (selectedToppings.length < maxToppings) {
      setSelectedToppings([...selectedToppings, { ...topping, isDouble: false }])
    }
  }

  const toggleDouble = (toppingId) => {
    setSelectedToppings(selectedToppings.map(t => 
      t.id === toppingId ? { ...t, isDouble: !t.isDouble } : t
    ))
  }

  const canProceed = selectedToppings.length >= 1

  return (
    <div className="p-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        ✨ Scegli i tuoi topping
      </h2>
      <p className="text-gray-500 mb-6">
        Seleziona fino a {maxToppings} topping ({selectedToppings.length}/{maxToppings})
      </p>

      <div className="grid grid-cols-2 gap-3">
        {toppingsList.map((topping) => {
          const selected = selectedToppings.find(t => t.id === topping.id)
          const isSelected = !!selected
          const isDisabled = !isSelected && selectedToppings.length >= maxToppings
          
          return (
            <div
              key={topping.id}
              className={`relative p-3 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-orange-500 bg-orange-50'
                  : isDisabled
                    ? 'border-gray-100 bg-gray-50 opacity-50'
                    : 'border-gray-200 bg-white hover:border-orange-300'
              }`}
            >
              {selected?.isDouble && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  ×2
                </span>
              )}
              
              <button
                onClick={() => toggleTopping(topping)}
                disabled={isDisabled}
                className="w-full text-left"
              >
                <p className="font-medium text-gray-800 text-sm">{topping.name}</p>
              </button>
              
              {isSelected && allowDouble && (
                <button
                  onClick={() => toggleDouble(topping.id)}
                  className={`mt-2 w-full py-1 rounded-lg text-xs font-bold transition-all ${
                    selected.isDouble
                      ? 'bg-pink-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-pink-100'
                  }`}
                >
                  ×2 {doublePrice > 0 && `+€${doublePrice.toFixed(2)}`}
                </button>
              )}
            </div>
          )
        })}
      </div>

      <button
        onClick={nextStep}
        disabled={!canProceed}
        className={`w-full mt-8 py-4 rounded-xl font-bold text-lg transition-all ${
          canProceed
            ? 'bg-orange-500 text-white hover:bg-orange-600'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        Continua →
      </button>
    </div>
  )
}

export default ToppingSelection
