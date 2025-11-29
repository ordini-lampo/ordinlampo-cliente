function BowlSize({ bowlTypes, selectedBowlType, setSelectedBowlType, nextStep }) {
  const handleSelect = (bowlType) => {
    setSelectedBowlType(bowlType)
    nextStep()
  }

  // Icone per le taglie
  const sizeIcons = {
    'Small': '🥣',
    'Regular': '🍜',
    'Large': '🍲'
  }

  const sizeDescriptions = {
    'Small': 'Perfetta per uno spuntino leggero',
    'Regular': 'La scelta più amata',
    'Large': 'Per i più affamati'
  }

  return (
    <div className="p-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Scegli la taglia della tua bowl
      </h2>
      <p className="text-gray-500 mb-8">
        Tutte le taglie includono gli stessi ingredienti
      </p>

      <div className="space-y-4">
        {bowlTypes.map((bowl) => (
          <button
            key={bowl.id}
            onClick={() => handleSelect(bowl)}
            className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${
              selectedBowlType?.id === bowl.id 
                ? 'border-orange-500 bg-orange-50' 
                : 'border-gray-200 bg-white hover:border-orange-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-4xl">
                  {sizeIcons[bowl.name] || '🥗'}
                </span>
                <div>
                  <h3 className="font-bold text-lg text-gray-800">{bowl.name}</h3>
                  <p className="text-gray-500 text-sm">
                    {bowl.description || sizeDescriptions[bowl.name] || ''}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-2xl text-orange-500">
                  €{parseFloat(bowl.price).toFixed(2)}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export default BowlSize
