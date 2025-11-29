function DeliveryZone({ locations, selectedZone, setSelectedZone, settings, nextStep }) {
  const handleSelect = (zone) => {
    setSelectedZone(zone)
    nextStep()
  }

  return (
    <div className="p-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        Dove ti troviamo?
      </h2>
      <p className="text-gray-500 mb-8">
        Seleziona la tua zona di consegna
      </p>

      <div className="space-y-3">
        {locations.map((zone) => (
          <button
            key={zone.id}
            onClick={() => handleSelect(zone)}
            className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
              selectedZone?.id === zone.id 
                ? 'border-orange-500 bg-orange-50' 
                : 'border-gray-200 bg-white hover:border-orange-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">{zone.name}</h3>
                {zone.min_order > 0 && (
                  <p className="text-sm text-gray-500">
                    Ordine minimo: €{parseFloat(zone.min_order).toFixed(2)}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-bold text-orange-500">
                  {parseFloat(zone.delivery_fee) > 0 
                    ? `€${parseFloat(zone.delivery_fee).toFixed(2)}` 
                    : 'Gratis'}
                </p>
                <p className="text-xs text-gray-400">consegna</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {locations.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <span className="text-4xl mb-4 block">📍</span>
          <p>Nessuna zona di consegna disponibile al momento</p>
        </div>
      )}
    </div>
  )
}

export default DeliveryZone
