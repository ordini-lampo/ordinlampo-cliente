function SauceSelection({ 
  categories, 
  ingredients, 
  selectedSauces, 
  setSelectedSauces,
  nextStep 
}) {
  const sauceCategory = categories.find(c => c.name === 'salse')
  const saucesList = ingredients.filter(i => i.category_id === sauceCategory?.id)
  
  const maxSauces = sauceCategory?.max_selections || 2

  const toggleSauce = (sauce) => {
    const existingIndex = selectedSauces.findIndex(s => s.id === sauce.id)
    
    if (existingIndex >= 0) {
      setSelectedSauces(selectedSauces.filter(s => s.id !== sauce.id))
    } else if (selectedSauces.length < maxSauces) {
      setSelectedSauces([...selectedSauces, sauce])
    }
  }

  const canProceed = selectedSauces.length >= 1

  return (
    <div className="p-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        🥢 Scegli le tue salse
      </h2>
      <p className="text-gray-500 mb-6">
        Seleziona fino a {maxSauces} salse ({selectedSauces.length}/{maxSauces})
      </p>

      <div className="grid grid-cols-2 gap-3">
        {saucesList.map((sauce) => {
          const isSelected = selectedSauces.some(s => s.id === sauce.id)
          const isDisabled = !isSelected && selectedSauces.length >= maxSauces
          
          return (
            <button
              key={sauce.id}
              onClick={() => toggleSauce(sauce)}
              disabled={isDisabled}
              className={`p-4 rounded-xl border-2 transition-all text-center ${
                isSelected
                  ? 'border-orange-500 bg-orange-50'
                  : isDisabled
                    ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 bg-white hover:border-orange-300'
              }`}
            >
              <p className="font-medium text-gray-800 text-sm">{sauce.name}</p>
            </button>
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

export default SauceSelection
