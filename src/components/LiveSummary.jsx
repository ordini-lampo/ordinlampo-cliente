import { useState } from 'react'

function LiveSummary({
  bowls,
  currentBowl,
  selectedBeverages,
  ingredients,
  categories,
  orderType,
  selectedZone,
  wantsFloorDelivery,
  settings,
  tipAmount,
  appliedDiscount,
  calculateTotal
}) {
  const [expanded, setExpanded] = useState(false)

  // Conta elementi totali
  const countBowlItems = (bowl) => {
    if (!bowl) return 0
    return (bowl.bases?.length || 0) +
           (bowl.proteins?.length || 0) +
           (bowl.ingredients?.length || 0) +
           (bowl.sauces?.length || 0) +
           (bowl.toppings?.length || 0)
  }

  const totalBowlItems = bowls.reduce((sum, b) => sum + countBowlItems(b), 0) + 
                         (currentBowl?.bowlType ? countBowlItems(currentBowl) : 0)
  
  const totalBeverages = Object.values(selectedBeverages).reduce((sum, qty) => sum + qty, 0)
  const totalItems = totalBowlItems + totalBeverages

  const bowlCount = bowls.length + (currentBowl?.bowlType ? 1 : 0)

  return (
    <div className="summary-fixed bg-white border-t border-gray-200">
      {/* Header collassabile */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-xl">🍜</span>
          </div>
          <div className="text-left">
            <p className="font-bold text-gray-800">
              {bowlCount} bowl{bowlCount !== 1 ? 's' : ''}
              {totalBeverages > 0 && ` + ${totalBeverages} bevand${totalBeverages === 1 ? 'a' : 'e'}`}
            </p>
            <p className="text-sm text-gray-500">
              {totalItems} element{totalItems === 1 ? 'o' : 'i'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <p className="font-bold text-xl text-orange-500">
            €{calculateTotal().toFixed(2)}
          </p>
          <span className={`transition-transform ${expanded ? 'rotate-180' : ''}`}>
            ▲
          </span>
        </div>
      </button>

      {/* Dettagli espansi */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 animate-fadeIn">
          {/* Bowls */}
          {[...bowls, currentBowl?.bowlType ? currentBowl : null].filter(Boolean).map((bowl, idx) => (
            <div key={idx} className="py-2 border-b border-gray-50">
              <p className="font-medium text-gray-800">
                🍜 Bowl {bowl.bowlType?.name}
              </p>
              <p className="text-xs text-gray-500">
                {bowl.bases?.map(b => b.name).join(', ')}
                {bowl.proteins?.length > 0 && ` • ${bowl.proteins.map(p => p.name).join(', ')}`}
              </p>
            </div>
          ))}

          {/* Bevande */}
          {totalBeverages > 0 && (
            <div className="py-2 border-b border-gray-50">
              <p className="font-medium text-gray-800">🥤 Bevande</p>
              <p className="text-xs text-gray-500">
                {Object.entries(selectedBeverages)
                  .filter(([_, qty]) => qty > 0)
                  .map(([id, qty]) => {
                    const bev = ingredients.find(i => i.id === parseInt(id))
                    return bev ? `${bev.name} ×${qty}` : null
                  })
                  .filter(Boolean)
                  .join(', ')}
              </p>
            </div>
          )}

          {/* Consegna */}
          {orderType === 'delivery' && selectedZone && parseFloat(selectedZone.delivery_fee) > 0 && (
            <div className="py-2 flex justify-between text-sm">
              <span className="text-gray-600">Consegna ({selectedZone.name})</span>
              <span className="text-gray-800">€{parseFloat(selectedZone.delivery_fee).toFixed(2)}</span>
            </div>
          )}

          {/* Consegna al piano */}
          {wantsFloorDelivery && (
            <div className="py-2 flex justify-between text-sm">
              <span className="text-gray-600">Consegna al piano</span>
              <span className="text-gray-800">€{parseFloat(settings?.floor_delivery_price || 1.50).toFixed(2)}</span>
            </div>
          )}

          {/* Sconto */}
          {appliedDiscount && (
            <div className="py-2 flex justify-between text-sm text-green-600">
              <span>Sconto {appliedDiscount.code}</span>
              <span>
                -{appliedDiscount.discount_type === 'percentage' 
                  ? `${appliedDiscount.discount_value}%` 
                  : `€${appliedDiscount.discount_value.toFixed(2)}`}
              </span>
            </div>
          )}

          {/* Mancia */}
          {tipAmount > 0 && (
            <div className="py-2 flex justify-between text-sm">
              <span className="text-gray-600">Mancia rider</span>
              <span className="text-gray-800">€{tipAmount.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default LiveSummary
