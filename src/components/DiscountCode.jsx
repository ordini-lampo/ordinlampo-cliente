import { useState } from 'react'

function DiscountCode({ 
  discountCodes,
  appliedDiscount, 
  setAppliedDiscount,
  calculateSubtotal,
  nextStep 
}) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  const applyCode = () => {
    setError('')
    setChecking(true)
    
    const codeUpper = code.toUpperCase().trim()
    const foundCode = discountCodes.find(dc => 
      dc.code.toUpperCase() === codeUpper && dc.is_active
    )
    
    setTimeout(() => {
      setChecking(false)
      
      if (!foundCode) {
        setError('Codice non valido')
        return
      }
      
      // Verifica scadenza
      if (foundCode.valid_until && new Date(foundCode.valid_until) < new Date()) {
        setError('Codice scaduto')
        return
      }
      
      // Verifica inizio validità
      if (foundCode.valid_from && new Date(foundCode.valid_from) > new Date()) {
        setError('Codice non ancora valido')
        return
      }
      
      // Verifica max utilizzi
      if (foundCode.max_uses && foundCode.current_uses >= foundCode.max_uses) {
        setError('Codice esaurito')
        return
      }
      
      // Verifica ordine minimo
      const subtotal = calculateSubtotal()
      if (foundCode.min_order && subtotal < foundCode.min_order) {
        setError(`Ordine minimo €${foundCode.min_order.toFixed(2)} per questo codice`)
        return
      }
      
      setAppliedDiscount(foundCode)
    }, 500)
  }

  const removeCode = () => {
    setAppliedDiscount(null)
    setCode('')
    setError('')
  }

  const calculateDiscountAmount = () => {
    if (!appliedDiscount) return 0
    
    const subtotal = calculateSubtotal()
    
    if (appliedDiscount.discount_type === 'percentage') {
      return subtotal * (appliedDiscount.discount_value / 100)
    } else {
      return Math.min(appliedDiscount.discount_value, subtotal)
    }
  }

  return (
    <div className="p-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        🎁 Hai un codice sconto?
      </h2>
      <p className="text-gray-500 mb-6">
        Inserisci il codice per applicare lo sconto
      </p>

      {!appliedDiscount ? (
        <>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase())
                setError('')
              }}
              placeholder="CODICE2025"
              className={`flex-1 p-3 border-2 rounded-xl uppercase focus:outline-none ${
                error ? 'border-red-500' : 'border-gray-200 focus:border-orange-500'
              }`}
            />
            <button
              onClick={applyCode}
              disabled={!code.trim() || checking}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                code.trim() && !checking
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {checking ? '...' : 'Applica'}
            </button>
          </div>
          
          {error && (
            <p className="text-sm text-red-500 mb-4">❌ {error}</p>
          )}
        </>
      ) : (
        <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-green-700">
                ✅ {appliedDiscount.code}
              </p>
              <p className="text-sm text-green-600">
                {appliedDiscount.discount_type === 'percentage'
                  ? `${appliedDiscount.discount_value}% di sconto`
                  : `€${appliedDiscount.discount_value.toFixed(2)} di sconto`}
              </p>
              <p className="text-sm font-bold text-green-700 mt-1">
                Risparmi: €{calculateDiscountAmount().toFixed(2)}
              </p>
            </div>
            <button
              onClick={removeCode}
              className="text-red-500 hover:text-red-700 p-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-6">
        <button
          onClick={nextStep}
          className="flex-1 py-4 rounded-xl font-bold text-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
        >
          Salta
        </button>
        <button
          onClick={nextStep}
          className="flex-1 py-4 rounded-xl font-bold text-lg bg-orange-500 text-white hover:bg-orange-600 transition-all"
        >
          Continua →
        </button>
      </div>
    </div>
  )
}

export default DiscountCode
