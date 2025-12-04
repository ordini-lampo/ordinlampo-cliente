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
  const EXTRA_PORTION_PRICE = 2.50 // Prezzo hardcoded porzione extra
  
  const toggleProtein = (protein) => {
    const existingIndex = selectedProteins.findIndex(p => p.id === protein.id)
    
    if (existingIndex >= 0) {
      setSelectedProteins(selectedProteins.filter(p => p.id !== protein.id))
    } else if (selectedProteins.length < maxProteins) {
      setSelectedProteins([...selectedProteins, { ...protein, extraPortions: 0 }])
    }
  }
  
  const updateExtraPortions = (proteinId, change) => {
    setSelectedProteins(selectedProteins.map(p => {
      if (p.id === proteinId) {
        const newValue = Math.max(0, Math.min(5, p.extraPortions + change))
        return { ...p, extraPortions: newValue }
      }
      return p
    }))
  }
  
  const canProceed = selectedProteins.length >= 1
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        🐟 Scegli le tue proteine
      </h2>
      <p className="text-gray-700 mb-6 font-medium">
        Seleziona fino a {maxProteins} proteine ({selectedProteins.length}/{maxProteins})
      </p>
      
      <div className="space-y-4">
        {proteinIngredients.map((protein) => {
          const selected = selectedProteins.find(p => p.id === protein.id)
          const isSelected = !!selected
          const isDisabled = !isSelected && selectedProteins.length >= maxProteins
          const extraTotal = selected ? selected.extraPortions * EXTRA_PORTION_PRICE : 0
          
          return (
            <div key={protein.id} className="space-y-2">
              {/* BOX 1: SELEZIONE PROTEINA */}
              <button
                onClick={() => toggleProtein(protein)}
                disabled={isDisabled}
                className={`w-full p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : isDisabled
                      ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                      : 'border-gray-300 bg-white hover:border-blue-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-bold text-gray-800 text-lg">{protein.name}</p>
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                    isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-400'
                  }`}>
                    {isSelected && <span className="text-white font-bold">✓</span>}
                  </div>
                </div>
              </button>
              
              {/* BOX 2: COUNTER PORZIONI EXTRA */}
              {isSelected && (
                <div className="p-4 rounded-xl border-2 border-orange-400 bg-orange-50">
                  <p className="text-sm font-semibold text-gray-700 mb-3">
                    🍱 Porzioni extra (€{EXTRA_PORTION_PRICE.toFixed(2)} cad.)
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateExtraPortions(protein.id, -1)}
                        disabled={selected.extraPortions === 0}
                        className={`w-12 h-12 rounded-lg font-bold text-2xl transition-all ${
                          selected.extraPortions === 0
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-orange-500 text-white hover:bg-orange-600 shadow-md'
                        }`}
                      >
                        −
                      </button>
                      
                      <div className="w-16 h-12 bg-white rounded-lg border-2 border-orange-300 flex items-center justify-center">
                        <span className="text-2xl font-bold text-gray-800">
                          {selected.extraPortions}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => updateExtraPortions(protein.id, 1)}
                        disabled={selected.extraPortions === 5}
                        className={`w-12 h-12 rounded-lg font-bold text-2xl transition-all ${
                          selected.extraPortions === 5
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-orange-500 text-white hover:bg-orange-600 shadow-md'
                        }`}
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Totale extra:</p>
                      <p className="text-xl font-bold text-orange-600">
                        €{extraTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  {selected.extraPortions > 0 && (
                    <p className="text-xs text-gray-600 mt-2 text-center">
                      {selected.extraPortions} × €{EXTRA_PORTION_PRICE.toFixed(2)} = €{extraTotal.toFixed(2)}
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
