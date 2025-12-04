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
    <div className="fixed bottom-0 left-0 right-0 z-50 max-w-lg mx-auto bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 border-t-4 border-yellow-500 shadow-2xl">
      {/* GLOW EFFECT */}
      <div className="absolute inset-0 bg-gradient-to-r from-orange-400/20 via-red-400/20 to-pink-400/20 blur-xl -z-10"></div>
      
      {/* Header collassabile */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center justify-between relative z-10 transition-all active:scale-95"
      >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg border-2 border-white/40">
            <span className="text-xl drop-shadow-lg">🍜</span>
          </div>
          <div className="text-left">
            <p className="font-bold text-white text-base drop-shadow-md">
              {bowlCount} bowl{bowlCount !== 1 ? 's' : ''}
              {totalBeverages > 0 && ` + ${totalBeverages} bev.`}
            </p>
            <p className="text-xs text-white/90 font-medium drop-shadow">
              🔥 {totalItems} element{totalItems === 1 ? 'o' : 'i'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-white/80 font-semibold uppercase tracking-wider drop-shadow">
              Totale
            </p>
            <p className="font-black text-2xl text-yellow-300 drop-shadow-[0_2px_8px_rgba(255,215,0,0.5)] tracking-tight">
              €{calculateTotal().toFixed(2)}
            </p>
          </div>
          <div className={`w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-transform ${expanded ? 'rotate-180' : ''}`}>
            <span className="text-white text-sm font-bold drop-shadow">▲</span>
          </div>
        </div>
      </button>
      
      {/* Dettagli espansi */}
      {expanded && (
        <div className="px-4 pb-3 max-h-60 overflow-y-auto border-t-2 border-white/20 animate-fadeIn backdrop-blur-sm bg-white/10">
          {/* Bowls */}
          {[...bowls, currentBowl?.bowlType ? currentBowl : null].filter(Boolean).map((bowl, idx) => (
            <div key={idx} className="py-2 border-b border-white/10">
              <p className="font-bold text-white text-sm drop-shadow">
                🍜 Bowl {bowl.bowlType?.name}
              </p>
              <p className="text-xs text-white/80 drop-shadow">
                {bowl.bases?.map(b => b.name).join(', ')}
                {bowl.proteins?.length > 0 && ` • ${bowl.proteins.map(p => p.name).join(', ')}`}
              </p>
            </div>
          ))}
          
          {/* Bevande */}
          {totalBeverages > 0 && (
            <div className="py-2 border-b border-white/10">
              <p className="font-bold text-white text-sm drop-shadow">🥤 Bevande</p>
              <p className="text-xs text-white/80 drop-shadow">
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
            <div className="py-2 flex justify-between text-xs">
              <span className="text-white/90 font-medium drop-shadow">Consegna ({selectedZone.name})</span>
              <span className="text-white font-bold drop-shadow">€{parseFloat(selectedZone.delivery_fee).toFixed(2)}</span>
            </div>
          )}
          
          {/* Consegna al piano */}
          {wantsFloorDelivery && (
            <div className="py-2 flex justify-between text-xs">
              <span className="text-white/90 font-medium drop-shadow">Consegna al piano</span>
              <span className="text-white font-bold drop-shadow">€{parseFloat(settings?.floor_delivery_price || 1.50).toFixed(2)}</span>
            </div>
          )}
          
          {/* Sconto */}
          {appliedDiscount && (
            <div className="py-2 flex justify-between text-xs">
              <span className="text-green-300 font-bold drop-shadow">Sconto {appliedDiscount.code}</span>
              <span className="text-green-300 font-bold drop-shadow">
                -{appliedDiscount.discount_type === 'percentage' 
                  ? `${appliedDiscount.discount_value}%` 
                  : `€${appliedDiscount.discount_value.toFixed(2)}`}
              </span>
            </div>
          )}
          
          {/* Mancia */}
          {tipAmount > 0 && (
            <div className="py-2 flex justify-between text-xs">
              <span className="text-white/90 font-medium drop-shadow">💚 Mancia rider</span>
              <span className="text-white font-bold drop-shadow">€{tipAmount.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default LiveSummary
