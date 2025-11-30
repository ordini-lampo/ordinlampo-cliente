function OrderSummary({ 
  restaurant,
  settings,
  orderType,
  selectedZone,
  bowls,
  currentBowlIndex,
  selectedBowlType,
  selectedBases,
  isHalfHalf,
  selectedProteins,
  selectedIngredients,
  selectedSauces,
  selectedToppings,
  selectedBeverages,
  ingredients,
  categories,
  backupOption,
  backupIngredient,
  selectedAllergies,
  customAllergy,
  selectedSlot,
  customerData,
  wantsCutlery,
  wantsFloorDelivery,
  tipAmount,
  appliedDiscount,
  paymentMethod,
  calculateBowlPrice,
  calculateTotal,
  addNewBowl,
  editBowl,
  deleteBowl,
  goToStep,
  activeSteps,
  setShowConfirmPhone
}) {
  // Costruisci lista bowl completa
  const allBowls = [...bowls]
  if (currentBowlIndex >= bowls.length && selectedBowlType) {
    allBowls.push({
      bowlType: selectedBowlType,
      bases: selectedBases,
      isHalfHalf,
      proteins: selectedProteins,
      ingredients: selectedIngredients,
      sauces: selectedSauces,
      toppings: selectedToppings
    })
  }

  // Calcola totale bevande
  const beveragesList = Object.entries(selectedBeverages).filter(([_, qty]) => qty > 0)
  const beveragesTotal = beveragesList.reduce((sum, [id, qty]) => {
    const bev = ingredients.find(i => i.id === parseInt(id))
    return sum + (bev?.price || 0) * qty
  }, 0)

  // Helper per navigare a sezione specifica
  const goToSection = (sectionId) => {
    const stepIndex = activeSteps.findIndex(s => s.id === sectionId)
    if (stepIndex >= 0) goToStep(stepIndex)
  }

  // Metodo pagamento label
  const paymentLabel = {
    cash: 'Contanti alla consegna',
    card: 'Carta alla consegna (POS)',
    prepaid: 'Già pagato'
  }

  return (
    <div className="p-6 animate-fadeIn pb-32">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        📋 Riepilogo ordine
      </h2>

      {/* Tipo ordine */}
      <div 
        className="p-4 bg-gray-50 rounded-xl mb-4 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => goToSection('order-type')}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{orderType === 'delivery' ? '🛵' : '🥡'}</span>
            <div>
              <p className="font-bold text-gray-800">
                {orderType === 'delivery' ? 'Consegna a domicilio' : 'Ritiro al locale'}
              </p>
              {orderType === 'delivery' && selectedZone && (
                <p className="text-sm text-gray-500">{selectedZone.name}</p>
              )}
            </div>
          </div>
          <span className="text-gray-400">✏️</span>
        </div>
      </div>

      {/* Fascia oraria */}
      <div 
        className="p-4 bg-gray-50 rounded-xl mb-4 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => goToSection('time-slot')}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏰</span>
            <div>
              <p className="font-bold text-gray-800">Fascia oraria</p>
              <p className="text-sm text-gray-500">{selectedSlot}</p>
            </div>
          </div>
          <span className="text-gray-400">✏️</span>
        </div>
      </div>

      {/* Bowl */}
      {allBowls.map((bowl, idx) => (
        <div key={idx} className="p-4 bg-orange-50 rounded-xl mb-4 border-2 border-orange-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-orange-800">
              🍜 Bowl {allBowls.length > 1 ? idx + 1 : ''} - {bowl.bowlType?.name}
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => editBowl(idx)}
                className="text-orange-600 hover:text-orange-800"
              >
                ✏️
              </button>
              {allBowls.length > 1 && (
                <button 
                  onClick={() => deleteBowl(idx)}
                  className="text-red-500 hover:text-red-700"
                >
                  🗑️
                </button>
              )}
            </div>
          </div>

          {/* Base */}
          <div className="mb-2">
            <p className="text-sm font-medium text-gray-600">🍚 Base:</p>
            <p className="text-sm text-gray-800">
              {bowl.bases?.map(b => b.name).join(bowl.isHalfHalf ? ' + ' : ', ')}
              {bowl.isHalfHalf && ' (50/50)'}
            </p>
          </div>

          {/* Proteine */}
          <div className="mb-2">
            <p className="text-sm font-medium text-gray-600">🐟 Proteine:</p>
            <p className="text-sm text-gray-800">
              {bowl.proteins?.map(p => `${p.name}${p.isDouble ? ' ×2' : ''}`).join(', ')}
            </p>
          </div>

          {/* Ingredienti */}
          <div className="mb-2">
            <p className="text-sm font-medium text-gray-600">🥗 Ingredienti:</p>
            <p className="text-sm text-gray-800">
              {bowl.ingredients?.map(i => `${i.name}${i.isDouble ? ' ×2' : ''}`).join(', ')}
            </p>
          </div>

          {/* Salse */}
          <div className="mb-2">
            <p className="text-sm font-medium text-gray-600">🥢 Salse:</p>
            <p className="text-sm text-gray-800">
              {bowl.sauces?.map(s => s.name).join(', ')}
            </p>
          </div>

          {/* Topping */}
          <div className="mb-2">
            <p className="text-sm font-medium text-gray-600">✨ Topping:</p>
            <p className="text-sm text-gray-800">
              {bowl.toppings?.map(t => `${t.name}${t.isDouble ? ' ×2' : ''}`).join(', ')}
            </p>
          </div>

          {/* Prezzo bowl */}
          <div className="mt-3 pt-3 border-t border-orange-200">
            <p className="text-right font-bold text-orange-700">
              €{calculateBowlPrice(bowl).toFixed(2)}
            </p>
          </div>
        </div>
      ))}

      {/* Aggiungi altra bowl */}
      <button
        onClick={addNewBowl}
        className="w-full p-4 border-2 border-dashed border-orange-300 rounded-xl text-orange-500 font-medium hover:bg-orange-50 transition-colors mb-4"
      >
        + Aggiungi altra bowl
      </button>

      {/* Bevande */}
      {beveragesList.length > 0 && (
        <div 
          className="p-4 bg-blue-50 rounded-xl mb-4 cursor-pointer hover:bg-blue-100 transition-colors"
          onClick={() => goToSection('beverages')}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="font-bold text-blue-800">🥤 Bevande</p>
            <span className="text-gray-400">✏️</span>
          </div>
          {beveragesList.map(([id, qty]) => {
            const bev = ingredients.find(i => i.id === parseInt(id))
            return bev ? (
              <p key={id} className="text-sm text-gray-700">
                → {bev.name} ×{qty} - €{(bev.price * qty).toFixed(2)}
              </p>
            ) : null
          })}
          <p className="text-right font-bold text-blue-700 mt-2">
            €{beveragesTotal.toFixed(2)}
          </p>
        </div>
      )}

      {/* Allergie */}
      {(selectedAllergies.length > 0 || customAllergy) && (
        <div className="p-4 bg-red-50 rounded-xl mb-4">
          <p className="font-bold text-red-800">⚠️ Allergie</p>
          <p className="text-sm text-gray-700">
            {[...selectedAllergies, customAllergy].filter(Boolean).join(', ')}
          </p>
        </div>
      )}

      {/* Ingrediente riserva */}
      {backupOption && (
        <div className="p-4 bg-gray-50 rounded-xl mb-4">
          <p className="font-bold text-gray-800">🔄 Ingrediente riserva</p>
          <p className="text-sm text-gray-700">
            {backupOption === 'chef_choice' && 'Sostituire a discrezione dello chef'}
            {backupOption === 'contact_me' && 'Contattarmi prima di procedere'}
            {backupOption === 'specific' && backupIngredient?.name}
          </p>
        </div>
      )}

      {/* Extra */}
      {(wantsCutlery || wantsFloorDelivery) && (
        <div className="p-4 bg-gray-50 rounded-xl mb-4">
          <p className="font-bold text-gray-800">🍴 Extra</p>
          {wantsCutlery && <p className="text-sm text-gray-700">→ Posate: Sì</p>}
          {wantsFloorDelivery && (
            <p className="text-sm text-gray-700">
              → Consegna al piano: +€{parseFloat(settings?.floor_delivery_price || 1.50).toFixed(2)}
            </p>
          )}
        </div>
      )}

      {/* Cliente */}
      <div 
        className="p-4 bg-gray-50 rounded-xl mb-4 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => goToSection('customer')}
      >
        <div className="flex items-center justify-between mb-2">
          <p className="font-bold text-gray-800">👤 Dati cliente</p>
          <span className="text-gray-400">✏️</span>
        </div>
        <p className="text-sm text-gray-700">
          {customerData.name} {customerData.surname}
        </p>
        <p className="text-sm text-gray-700">{customerData.phone}</p>
        {orderType === 'delivery' && (
          <>
            <p className="text-sm text-gray-700">
              {customerData.address} {customerData.civic}, {customerData.city}
            </p>
            <p className="text-sm text-gray-700">Citofono: {customerData.doorbell}</p>
          </>
        )}
      </div>

      {/* Pagamento */}
      <div className="p-4 bg-gray-50 rounded-xl mb-4">
        <p className="font-bold text-gray-800">💳 Pagamento</p>
        <p className="text-sm text-gray-700">{paymentLabel[paymentMethod]}</p>
      </div>

      {/* Totale */}
      <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200 mb-6">
        <h3 className="font-bold text-green-800 mb-3">💰 Riepilogo prezzo</h3>
        
        {allBowls.map((bowl, idx) => (
          <div key={idx} className="flex justify-between text-sm text-gray-700 mb-1">
            <span>Bowl {allBowls.length > 1 ? idx + 1 : ''} {bowl.bowlType?.name}</span>
            <span>€{calculateBowlPrice(bowl).toFixed(2)}</span>
          </div>
        ))}
        
        {beveragesTotal > 0 && (
          <div className="flex justify-between text-sm text-gray-700 mb-1">
            <span>Bevande</span>
            <span>€{beveragesTotal.toFixed(2)}</span>
          </div>
        )}
        
        {orderType === 'delivery' && selectedZone && parseFloat(selectedZone.delivery_fee) > 0 && (
          <div className="flex justify-between text-sm text-gray-700 mb-1">
            <span>Consegna</span>
            <span>€{parseFloat(selectedZone.delivery_fee).toFixed(2)}</span>
          </div>
        )}
        
        {wantsFloorDelivery && (
          <div className="flex justify-between text-sm text-gray-700 mb-1">
            <span>Consegna al piano</span>
            <span>€{parseFloat(settings?.floor_delivery_price || 1.50).toFixed(2)}</span>
          </div>
        )}
        
        {appliedDiscount && (
          <div className="flex justify-between text-sm text-green-600 mb-1">
            <span>Sconto {appliedDiscount.code}</span>
            <span>
              -{appliedDiscount.discount_type === 'percentage' 
                ? `${appliedDiscount.discount_value}%` 
                : `€${appliedDiscount.discount_value.toFixed(2)}`}
            </span>
          </div>
        )}
        
        {tipAmount > 0 && (
          <div className="flex justify-between text-sm text-gray-700 mb-1">
            <span>Mancia rider</span>
            <span>€{tipAmount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="border-t border-green-300 mt-2 pt-2">
          <div className="flex justify-between font-bold text-lg text-green-800">
            <span>TOTALE</span>
            <span>€{calculateTotal().toFixed(2)}</span>
          </div>
          {tipAmount > 0 && (
            <p className="text-xs text-gray-500 text-right">
              (di cui €{tipAmount.toFixed(2)} mancia rider)
            </p>
          )}
        </div>
      </div>

      {/* Bottone conferma */}
      <button
        onClick={() => setShowConfirmPhone(true)}
        className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
      >
        Conferma ordine →
      </button>
    </div>
  )
}

export default OrderSummary
