function BaseSelection({ 
  categories, 
  ingredients, 
  selectedBases, 
  setSelectedBases,
  isHalfHalf,
  setIsHalfHalf,
  nextStep 
}) {
  const baseCategory = categories.find(c => c.name === 'base')
  const baseIngredients = ingredients.filter(i => i.category_id === baseCategory?.id)
  
  const maxBases = isHalfHalf ? 2 : 1

  const toggleBase = (base) => {
    const existingIndex = selectedBases.findIndex(b => b.id === base.id)
    
    if (existingIndex >= 0) {
      // Rimuovi
      setSelectedBases(selectedBases.filter(b => b.id !== base.id))
    } else if (selectedBases.length < maxBases) {
      // Aggiungi
      setSelectedBases([...selectedBases, base])
    }
  }

  const canProceed = selectedBases.length >= 1 && 
                     (!isHalfHalf || selectedBases.length === 2)

  const handleNext = () => {
    if (canProceed) {
      nextStep()
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        🍚 Scegli la tua base
      </h2>
      
      {/* Toggle 50/50 - SUPER VISIBILE */}
      {baseCategory?.allow_half_half && (
        <div className={`mb-6 p-4 rounded-lg border-3 transition-all ${
          isHalfHalf 
            ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-500 shadow-lg' 
            : 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-400'
        }`}>
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🔀</span>
              <div>
                <p className="font-bold text-xl text-gray-800">Mix 50/50</p>
                <p className="text-sm text-gray-600 font-medium">Due basi diverse nella stessa bowl!</p>
              </div>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={isHalfHalf}
                onChange={(e) => {
                  setIsHalfHalf(e.target.checked)
                  if (!e.target.checked && selectedBases.length > 1) {
                    setSelectedBases([selectedBases[0]])
                  }
                }}
                className="sr-only"
              />
             <div className={`w-20 h-10 rounded-md transition-all shadow-md ${
                isHalfHalf ? 'bg-green-500' : 'bg-gray-400'
              }`}>
                <div className={`w-8 h-8 bg-white rounded shadow-lg transform transition-all mt-1 flex items-center justify-center text-lg ${
                  isHalfHalf ? 'translate-x-11' : 'translate-x-1'
                }`}>
                  {isHalfHalf ? '✓' : ''}
                </div>
              </div>
            </div>
          </label>
        </div>
      )}
      
     <p className="text-gray-700 mb-6 font-medium">
        {isHalfHalf 
          ? `Seleziona 2 basi (${selectedBases.length}/2)` 
          : `Seleziona 1 base (${selectedBases.length}/1)`}
      </p>

     <div className="grid grid-cols-2 gap-4">
        {baseIngredients.map((base) => {
          const isSelected = selectedBases.some(b => b.id === base.id)
          const isDisabled = !isSelected && selectedBases.length >= maxBases
          
          return (
            <button
              key={base.id}
              onClick={() => toggleBase(base)}
              disabled={isDisabled}
              className={`p-3 rounded-lg border-2 transition-all text-center ${
                isSelected
                  ? 'border-orange-500 bg-orange-50'
                  : isDisabled
                    ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                    : 'border-gray-200 bg-white hover:border-orange-300'
              }`}
            >
              <p className="font-semibold text-gray-800">{base.name}</p>
              {isSelected && isHalfHalf && (
                <span className="text-xs text-orange-500">(50/50)</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Bottone continua */}
      <button
        onClick={handleNext}
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

export default BaseSelection
