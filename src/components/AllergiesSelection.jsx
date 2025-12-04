import { useState } from 'react'

function AllergiesSelection({ 
  selectedAllergies, 
  setSelectedAllergies,
  customAllergy,
  setCustomAllergy,
  ingredients,
  specificIngredient1,
  setSpecificIngredient1,
  specificIngredient2,
  setSpecificIngredient2,
  nextStep 
}) {
  const [hasAllergies, setHasAllergies] = useState(null) // null | true | false
  const [confirmedNoAllergies, setConfirmedNoAllergies] = useState(false)
  
  const commonAllergies = [
    { id: 'crostacei', name: 'Crostacei', icon: '🦐' },
    { id: 'pesce', name: 'Pesce', icon: '🐟' },
    { id: 'soia', name: 'Soia', icon: '🫘' },
    { id: 'glutine', name: 'Glutine', icon: '🌾' },
    { id: 'lattosio', name: 'Lattosio', icon: '🥛' },
    { id: 'frutta_guscio', name: 'Frutta a guscio', icon: '🥜' },
    { id: 'sesamo', name: 'Sesamo', icon: '🌰' },
    { id: 'uova', name: 'Uova', icon: '🥚' }
  ]
  
  const toggleAllergy = (allergyId) => {
    if (selectedAllergies.includes(allergyId)) {
      setSelectedAllergies(selectedAllergies.filter(a => a !== allergyId))
    } else {
      setSelectedAllergies([...selectedAllergies, allergyId])
    }
  }
  
  const canProceed = () => {
    if (hasAllergies === null) return false // Non ha risposto
    if (hasAllergies === false) return confirmedNoAllergies // Deve confermare
    if (hasAllergies === true) {
      // Deve selezionare almeno una allergia comune O un ingrediente specifico
      return selectedAllergies.length > 0 || specificIngredient1 || specificIngredient2 || customAllergy
    }
    return false
  }
  
  const handleNext = () => {
    // Salva ingredienti specifici se selezionati
    const allAllergies = [...selectedAllergies]
    if (specificIngredient1) allAllergies.push(specificIngredient1)
    if (specificIngredient2) allAllergies.push(specificIngredient2)
    if (customAllergy) allAllergies.push(customAllergy)
    setSelectedAllergies(allAllergies)
    nextStep()
  }
  
  // Ingredienti unici per dropdown
  const allIngredientNames = [...new Set(ingredients.map(i => i.name))].sort()
  
  return (
    <div className="p-6 bg-gray-50 min-h-screen animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        ⚠️ Allergie o intolleranze
      </h2>
      <p className="text-gray-700 mb-6 font-medium">
        Per la tua sicurezza alimentare
      </p>
      
      {/* DOMANDA OBBLIGATORIA */}
      <div className="bg-white p-5 rounded-xl border-2 border-red-500 shadow-lg mb-6">
        <p className="font-bold text-lg text-gray-800 mb-4">
          🔴 Sei allergico o intollerante a qualche ingrediente?
        </p>
        
        <div className="flex gap-4">
          <button
            onClick={() => {
              setHasAllergies(true)
              setConfirmedNoAllergies(false)
            }}
            className={`flex-1 p-4 rounded-xl border-3 font-bold text-lg transition-all ${
              hasAllergies === true
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-300 bg-white text-gray-600 hover:border-red-300'
            }`}
          >
            ⭕ SÌ
          </button>
          
          <button
            onClick={() => {
              setHasAllergies(false)
              setSelectedAllergies([])
              setSpecificIngredient1('')
              setSpecificIngredient2('')
              setCustomAllergy('')
            }}
            className={`flex-1 p-4 rounded-xl border-3 font-bold text-lg transition-all ${
              hasAllergies === false
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-300 bg-white text-gray-600 hover:border-green-300'
            }`}
          >
            ⭕ NO
          </button>
        </div>
      </div>
      
      {/* SE NO: CONFERMA OBBLIGATORIA */}
      {hasAllergies === false && (
        <div className="bg-green-50 p-5 rounded-xl border-2 border-green-500 mb-6 animate-fadeIn">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmedNoAllergies}
              onChange={(e) => setConfirmedNoAllergies(e.target.checked)}
              className="w-6 h-6 mt-1 accent-green-500"
            />
            <div>
              <p className="font-bold text-gray-800 mb-1">
                ✅ Confermo di NON avere allergie o intolleranze
              </p>
              <p className="text-sm text-gray-600">
                Dichiaro sotto la mia responsabilità di non essere allergico o intollerante ad alcun ingrediente
              </p>
            </div>
          </label>
        </div>
      )}
      
      {/* SE SÌ: SELEZIONE ALLERGIE */}
      {hasAllergies === true && (
        <div className="animate-fadeIn space-y-6">
          {/* Allergie comuni */}
          <div>
            <p className="font-semibold text-gray-800 mb-3">
              ☑️ Allergie comuni:
            </p>
            <div className="grid grid-cols-2 gap-3">
              {commonAllergies.map((allergy) => {
                const isSelected = selectedAllergies.includes(allergy.id)
                
                return (
                  <button
                    key={allergy.id}
                    onClick={() => toggleAllergy(allergy.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-300 bg-white hover:border-red-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{allergy.icon}</span>
                      <p className="font-semibold text-gray-800 text-sm">{allergy.name}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
          
          {/* Ingredienti specifici dropdown */}
          <div>
            <p className="font-semibold text-gray-800 mb-3">
              📋 Ingredienti specifici del locale:
            </p>
            
            {/* Dropdown 1 */}
            <div className="mb-3">
              <label className="block text-sm text-gray-600 mb-2">
                Ingrediente specifico #1:
              </label>
              <select
                value={specificIngredient1}
                onChange={(e) => setSpecificIngredient1(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:border-red-500 focus:outline-none font-medium"
              >
                <option value="">-- Seleziona ingrediente --</option>
                {allIngredientNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            
            {/* Dropdown 2 */}
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Ingrediente specifico #2:
              </label>
              <select
                value={specificIngredient2}
                onChange={(e) => setSpecificIngredient2(e.target.value)}
                className="w-full p-3 border-2 border-gray-300 rounded-xl bg-white focus:border-red-500 focus:outline-none font-medium"
              >
                <option value="">-- Seleziona ingrediente --</option>
                {allIngredientNames.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Altra allergia */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ✍️ Altra allergia o intolleranza:
            </label>
            <input
              type="text"
              value={customAllergy}
              onChange={(e) => setCustomAllergy(e.target.value)}
              placeholder="Es: Sedano, Senape, Ananas..."
              className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-red-500 focus:outline-none"
            />
          </div>
        </div>
      )}
      
      {/* Bottone continua */}
      <button
        onClick={handleNext}
        disabled={!canProceed()}
        className={`w-full mt-8 py-4 rounded-xl font-bold text-lg transition-all ${
          canProceed()
            ? 'bg-orange-500 text-white hover:bg-orange-600'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {!canProceed() && hasAllergies === null && '⚠️ Rispondi alla domanda per continuare'}
        {!canProceed() && hasAllergies === false && '⚠️ Conferma assenza allergie'}
        {!canProceed() && hasAllergies === true && '⚠️ Seleziona almeno una allergia'}
        {canProceed() && 'Continua →'}
      </button>
    </div>
  )
}

export default AllergiesSelection
