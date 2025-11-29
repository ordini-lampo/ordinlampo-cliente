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
    <div className="p-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        🍚 Scegli la tua base
      </h2>
      
      {/* Toggle 50/50 */}
      {baseCategory?.allow_half_half && (
        <div className="mb-6 p-4 bg-purple-50 rounded-xl">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-semibold text-purple-700">Opzione 50/50</p>
              <p className="text-sm text-purple-600">Scegli due basi diverse!</p>
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
              <div className={`w-14 h-8 rounded-full transition-colors ${
                isHalfHalf ? 'bg-purple-500' : 'bg-gray-300'
              }`}>
                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform mt-1 ${
                  isHalfHalf ? 'translate-x-7' : 'translate-x-1'
                }`} />
              </div>
            </div>
          </label>
        </div>
      )}

      <p className="text-gray-500 mb-6">
        {isHalfHalf 
          ? `Seleziona 2 basi (${selectedBases.length}/2)` 
          : `Seleziona 1 base (${selectedBases.length}/1)`}
      </p>

      <div className="grid grid-cols-2 gap-3">
        {baseIngredients.map((base) => {
          const isSelected = selectedBases.some(b => b.id === base.id)
          const isDisabled = !isSelected && selectedBases.length >= maxBases
          
          return (
            <button
              key={base.id}
              onClick={() => toggleBase(base)}
              disabled={isDisabled}
              className={`p-4 rounded-xl border-2 transition-all text-center ${
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
