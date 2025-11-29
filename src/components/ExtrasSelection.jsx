import { useState } from 'react'

function ExtrasSelection({ 
  orderType,
  settings,
  wantsCutlery, 
  setWantsCutlery,
  wantsFloorDelivery,
  setWantsFloorDelivery,
  tipAmount,
  setTipAmount,
  nextStep 
}) {
  const tipOptions = settings?.tip_amounts || [1, 2, 3, 5]
  const [customTip, setCustomTip] = useState('')

  const handleCustomTip = (value) => {
    const numValue = parseFloat(value) || 0
    setCustomTip(value)
    setTipAmount(numValue)
  }

  const selectTip = (amount) => {
    setTipAmount(amount)
    setCustomTip('')
  }

  return (
    <div className="p-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        🍴 Extra
      </h2>

      {/* Posate */}
      {settings?.enable_cutlery !== false && (
        <div className="p-4 bg-white rounded-xl border-2 border-gray-200 mb-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🥢</span>
              <p className="font-medium text-gray-800">Desidero le posate</p>
            </div>
            <input
              type="checkbox"
              checked={wantsCutlery}
              onChange={(e) => setWantsCutlery(e.target.checked)}
              className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
            />
          </label>
        </div>
      )}

      {/* Consegna al piano */}
      {orderType === 'delivery' && settings?.enable_floor_delivery && (
        <div className={`p-4 rounded-xl border-2 mb-4 transition-all ${
          wantsFloorDelivery ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white'
        }`}>
          <label className="flex items-center justify-between cursor-pointer">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏠</span>
              <div>
                <p className="font-medium text-gray-800">
                  {settings.floor_delivery_label || 'Consegna al piano'}
                </p>
                <p className="text-sm text-gray-500">
                  Il rider porta l'ordine alla tua porta
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-orange-500">
                +€{parseFloat(settings.floor_delivery_price || 1.50).toFixed(2)}
              </span>
              <input
                type="checkbox"
                checked={wantsFloorDelivery}
                onChange={(e) => setWantsFloorDelivery(e.target.checked)}
                className="w-5 h-5 text-orange-500 rounded focus:ring-orange-500"
              />
            </div>
          </label>
        </div>
      )}

      {/* Mancia rider */}
      {orderType === 'delivery' && settings?.enable_tips !== false && (
        <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">☕</span>
            <div>
              <p className="font-bold text-green-800">Ti va di offrire un caffè?</p>
              <p className="text-sm text-green-700">
                Il tuo rider affronta traffico e meteo per portarti il pokè ancora fresco.
                Se ti fa piacere, un piccolo pensiero lo farà sorridere! 💚
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {tipOptions.map((amount) => (
              <button
                key={amount}
                onClick={() => selectTip(amount)}
                className={`px-4 py-2 rounded-full font-bold transition-all ${
                  tipAmount === amount && !customTip
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-green-700 border border-green-300 hover:bg-green-100'
                }`}
              >
                €{amount}
              </button>
            ))}
            
            {/* Input personalizzato */}
            <div className="flex items-center">
              <span className="text-green-700 mr-1">€</span>
              <input
                type="number"
                value={customTip}
                onChange={(e) => handleCustomTip(e.target.value)}
                placeholder="Altro"
                className="w-20 px-2 py-2 rounded-full border border-green-300 text-center focus:outline-none focus:border-green-500"
                min="0"
                step="0.50"
              />
            </div>
          </div>

          {tipAmount > 0 && (
            <p className="text-sm text-green-700">
              ✓ Mancia: €{tipAmount.toFixed(2)}
            </p>
          )}

          <button
            onClick={() => {
              setTipAmount(0)
              setCustomTip('')
            }}
            className="text-sm text-gray-500 hover:text-gray-700 mt-2"
          >
            No grazie
          </button>
        </div>
      )}

      <button
        onClick={nextStep}
        className="w-full mt-4 py-4 rounded-xl font-bold text-lg bg-orange-500 text-white hover:bg-orange-600 transition-all"
      >
        Continua →
      </button>
    </div>
  )
}

export default ExtrasSelection
