function IngredientsSelection({ 
  categories, 
  ingredients, 
  selectedIngredients, 
  setSelectedIngredients,
  nextStep 
}) {
  const ingredientCategory = categories.find(c => c.name === 'ingredienti')
  const ingredientsList = ingredients.filter(i => i.category_id === ingredientCategory?.id)
  
  const maxIngredients = ingredientCategory?.max_selections || 4
  const allowDouble = ingredientCategory?.allow_double_portion
  const doublePrice = ingredientCategory?.double_portion_price || 0

  const toggleIngredient = (ingredient) => {
    const existingIndex = selectedIngredients.findIndex(i => i.id === ingredient.id)
    
    if (existingIndex >= 0) {
      setSelectedIngredients(selectedIngredients.filter(i => i.id !== ingredient.id))
    } else if (selectedIngredients.length < maxIngredients) {
      setSelectedIngredients([...selectedIngredients, { ...ingredient, isDouble: false }])
    }
  }

  const toggleDouble = (ingredientId) => {
    setSelectedIngredients(selectedIngredients.map(i => 
      i.id === ingredientId ? { ...i, isDouble: !i.isDouble } : i
    ))
  }

  const canProceed = selectedIngredients.length >= 1

  return (
    <div className="p-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        🥗 Scegli i tuoi ingredienti
      </h2>
      <p className="text-gray-500 mb-6">
        Seleziona fino a {maxIngredients} ingredienti ({selectedIngredients.length}/{maxIngredients})
      </p>

      <div className="grid grid-cols-2 gap-3">
        {ingredientsList.map((ingredient) => {
          const selected = selectedIngredients.find(i => i.id === ingredient.id)
          const isSelected = !!selected
          const isDisabled = !isSelected && selectedIngredients.length >= maxIngredients
          
          return (
            <div
              key={ingredient.id}
              className={`relative p-3 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-orange-500 bg-orange-50'
                  : isDisabled
                    ? 'border-gray-100 bg-gray-50 opacity-50'
                    : 'border-gray-200 bg-white hover:border-orange-300'
              }`}
            >
              {/* Badge x2 */}
              {selected?.isDouble && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  ×2
                </span>
              )}
              
              <button
                onClick={() => toggleIngredient(ingredient)}
                disabled={isDisabled}
                className="w-full text-left"
              >
                <p className="font-medium text-gray-800 text-sm">{ingredient.name}</p>
              </button>
              
              {/* Bottone x2 */}
              {isSelected && allowDouble && (
                <button
                  onClick={() => toggleDouble(ingredient.id)}
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

export default IngredientsSelection
