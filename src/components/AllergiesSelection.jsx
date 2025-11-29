function AllergiesSelection({ 
  selectedAllergies, 
  setSelectedAllergies,
  customAllergy,
  setCustomAllergy,
  nextStep 
}) {
  const commonAllergies = [
    { id: 'glutine', name: 'Glutine', icon: '🌾' },
    { id: 'lattosio', name: 'Lattosio', icon: '🥛' },
    { id: 'frutta_guscio', name: 'Frutta a guscio', icon: '🥜' },
    { id: 'pesce', name: 'Pesce / Crostacei', icon: '🦐' },
    { id: 'uova', name: 'Uova', icon: '🥚' },
    { id: 'soia', name: 'Soia', icon: '🫘' },
    { id: 'sesamo', name: 'Sesamo', icon: '🌰' },
  ]

  const toggleAllergy = (allergyId) => {
    if (selectedAllergies.includes(allergyId)) {
      setSelectedAllergies(selectedAllergies.filter(a => a !== allergyId))
    } else {
      setSelectedAllergies([...selectedAllergies, allergyId])
    }
  }

  const hasNone = selectedAllergies.includes('nessuna')
  
  const toggleNone = () => {
    if (hasNone) {
      setSelectedAllergies([])
    } else {
      setSelectedAllergies(['nessuna'])
      setCustomAllergy('')
    }
  }

  return (
    <div className="p-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        ⚠️ Allergie o intolleranze?
      </h2>
      <p className="text-gray-500 mb-6">
        Segnalaci eventuali allergie per la tua sicurezza
      </p>

      {/* Nessuna allergia */}
      <button
        onClick={toggleNone}
        className={`w-full p-4 rounded-xl border-2 text-left mb-4 transition-all ${
          hasNone
            ? 'border-green-500 bg-green-50'
            : 'border-gray-200 bg-white hover:border-green-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <p className="font-semibold text-gray-800">Nessuna allergia o intolleranza</p>
        </div>
      </button>

      {/* Lista allergie comuni */}
      {!hasNone && (
        <>
          <p className="text-sm text-gray-500 mb-3">Oppure seleziona le tue allergie:</p>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            {commonAllergies.map((allergy) => {
              const isSelected = selectedAllergies.includes(allergy.id)
              
              return (
                <button
                  key={allergy.id}
                  onClick={() => toggleAllergy(allergy.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 bg-white hover:border-red-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{allergy.icon}</span>
                    <p className="font-medium text-gray-800 text-sm">{allergy.name}</p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Allergia personalizzata */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Altra allergia o intolleranza:
            </label>
            <input
              type="text"
              value={customAllergy}
              onChange={(e) => setCustomAllergy(e.target.value)}
              placeholder="Es: Sedano, Senape..."
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
            />
          </div>
        </>
      )}

      <button
        onClick={nextStep}
        className="w-full mt-8 py-4 rounded-xl font-bold text-lg bg-orange-500 text-white hover:bg-orange-600 transition-all"
      >
        Continua →
      </button>
    </div>
  )
}

export default AllergiesSelection
