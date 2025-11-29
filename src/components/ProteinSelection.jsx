function ProteinSelection({ 
  categories, 
  ingredients, 
  selectedProteins, 
  setSelectedProteins,
  nextStep 
}) {
  const proteinCategory = categories.find(c => c.name === 'proteine')
  const proteinIngredients = ingredients.filter(i => i.category_id === proteinCategory?.id)
  
  const maxProteins = proteinCategory?.max_selections || 2
  const allowDouble = proteinCategory?.allow_double_portion
  const doublePrice = proteinCategory?.double_portion_price || 0

  const toggleProtein = (protein) => {
    const existingIndex = selectedProteins.findIndex(p => p.id === protein.id)
    
    if (existingIndex >= 0) {
      // Rimuovi
      setSelectedProteins(selectedProteins.filter(p => p.id !== protein.id))
    } else if (selectedProteins.length < maxProteins) {
      // Aggiungi
      setSelectedProteins([...selectedProteins, { ...protein, isDouble: false }])
    }
  }

  const toggleDouble = (proteinId) => {
    setSelectedProteins(selectedProteins.map(p => 
      p.id === proteinId ? { ...p, isDouble: !p.isDouble } : p
    ))
  }

  const canProceed = selectedProteins.length >= 1

  return (
    <div className="p-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        🐟 Scegli le tue proteine
      </h2>
      <p className="text-gray-500 mb-6">
        Seleziona fino a {maxProteins} proteine ({selectedProteins.length}/{maxProteins})
      </p>

      <div className="space-y-3">
        {proteinIngredients.map((protein) => {
          const selected = selectedProteins.find(p => p.id === protein.id)
          const isSelected = !!selected
          const isDisabled = !isSelected && selectedProteins.length >= maxProteins
          
          return (
            <div
              key={protein.id}
              className={`p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? 'border-orange-500 bg-orange-50'
                  : isDisabled
                    ? 'border-gray-100 bg-gray-50 opacity-50'
                    : 'border-gray-200 bg-white hover:border-orange-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleProtein(protein)}
                  disabled={isDisabled}
                  className="flex-1 text-left"
                >
                  <p className="font-semibold text-gray-800">{protein.name}</p>
                </button>
                
                {/* Bottone x2 */}
                {isSelected && allowDouble && (
                  <button
                    onClick={() => toggleDouble(protein.id)}
                    className={`ml-3 px-3 py-1 rounded-full text-sm font-bold transition-all ${
                      selected.isDouble
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-pink-100'
                    }`}
                  >
                    ×2 {doublePrice > 0 && `+€${doublePrice.toFixed(2)}`}
                  </button>
                )}
                
                {/* Checkbox visivo */}
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ml-3 ${
                  isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-300'
                }`}>
                  {isSelected && <span className="text-white text-sm">✓</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Bottone continua */}
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

export default ProteinSelection
