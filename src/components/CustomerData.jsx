import { useState } from 'react'

// FIX: Componente spostato FUORI per evitare perdita di focus
const InputField = ({ label, field, value, onChange, error, type = 'text', placeholder, required = true }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value || ''}
      onChange={(e) => onChange(field, e.target.value)}
      placeholder={placeholder}
      className={`w-full p-3 border-2 rounded-xl focus:outline-none transition-colors ${
        error 
          ? 'border-red-500 focus:border-red-500' 
          : 'border-gray-200 focus:border-orange-500'
      }`}
    />
    {error && (
      <p className="mt-1 text-sm text-red-500">{error}</p>
    )}
  </div>
)

function CustomerData({ 
  orderType,
  locations,
  customerData, 
  setCustomerData,
  previousCustomer,
  nextStep 
}) {
  const [errors, setErrors] = useState({})

  const updateField = (field, value) => {
    setCustomerData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length < 10 || cleaned.length > 13) return false
    return true 
  }

  const validate = () => {
    const newErrors = {}
    
    if (!customerData.name?.trim()) newErrors.name = 'Inserisci il nome'
    if (!customerData.surname?.trim()) newErrors.surname = 'Inserisci il cognome'
    
    if (!customerData.phone?.trim()) {
      newErrors.phone = 'Inserisci il numero di telefono'
    } else if (!validatePhone(customerData.phone)) {
      newErrors.phone = 'Numero non valido'
    }
    
    if (orderType === 'delivery') {
      if (!customerData.address?.trim()) newErrors.address = 'Inserisci la via'
      if (!customerData.civic?.trim()) newErrors.civic = 'Inserisci il numero civico'
      if (!customerData.city?.trim()) newErrors.city = 'Seleziona la città'
      if (!customerData.doorbell?.trim()) newErrors.doorbell = 'Inserisci il nome sul citofono'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validate()) {
      nextStep()
    }
  }

  const loadPreviousData = () => {
    if (previousCustomer) {
      setCustomerData(prev => ({
        ...prev,
        name: previousCustomer.name || '',
        surname: previousCustomer.surname || '',
        phone: previousCustomer.phone || '',
        address: previousCustomer.default_address || '',
        civic: previousCustomer.default_civic || '',
        city: previousCustomer.default_city || '',
        doorbell: previousCustomer.default_doorbell || '',
      }))
    }
  }

  return (
    <div className="p-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        👤 I tuoi dati
      </h2>
      <p className="text-gray-500 mb-6">
        {orderType === 'delivery' 
          ? 'Dove ti portiamo l\'ordine?' 
          : 'Come ti chiamiamo quando è pronto?'}
      </p>

      {previousCustomer && (
        <button
          onClick={loadPreviousData}
          className="w-full p-3 mb-6 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
        >
          📋 Usa i dati dell'ultimo ordine
        </button>
      )}

      <div className="grid grid-cols-2 gap-3">
        <InputField 
          label="Nome" 
          field="name" 
          value={customerData.name}
          onChange={updateField}
          error={errors.name}
          placeholder="Mario" 
        />
        <InputField 
          label="Cognome" 
          field="surname" 
          value={customerData.surname}
          onChange={updateField}
          error={errors.surname}
          placeholder="Rossi" 
        />
      </div>

      <InputField 
        label="Telefono (WhatsApp)" 
        field="phone" 
        type="tel"
        value={customerData.phone}
        onChange={updateField}
        error={errors.phone}
        placeholder="333 1234567" 
      />

      {orderType === 'delivery' && (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <InputField 
                label="Via/Piazza" 
                field="address" 
                value={customerData.address}
                onChange={updateField}
                error={errors.address}
                placeholder="Via Roma" 
              />
            </div>
            <InputField 
              label="N°" 
              field="civic" 
              value={customerData.civic}
              onChange={updateField}
              error={errors.civic}
              placeholder="25" 
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Città <span className="text-red-500">*</span>
            </label>
            <select
              value={customerData.city || ''}
              onChange={(e) => updateField('city', e.target.value)}
              className={`w-full p-3 border-2 rounded-xl focus:outline-none transition-colors bg-white ${
                errors.city 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-gray-200 focus:border-orange-500'
              }`}
            >
              <option value="">Seleziona zona...</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.name}>{loc.name}</option>
              ))}
            </select>
            {errors.city && (
              <p className="mt-1 text-sm text-red-500">{errors.city}</p>
            )}
          </div>

          <InputField 
            label="Nome sul citofono" 
            field="doorbell" 
            value={customerData.doorbell}
            onChange={updateField}
            error={errors.doorbell}
            placeholder="Es: Rossi M." 
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note per il rider (Opzionale)
            </label>
            <input
              type="text"
              value={customerData.notesAddress || ''}
              onChange={(e) => updateField('notesAddress', e.target.value)}
              placeholder="Es: 2° piano, scala B"
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
            />
          </div>
        </>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Note per l'ordine (Opzionale)
        </label>
        <textarea
          value={customerData.notesOrder || ''}
          onChange={(e) => updateField('notesOrder', e.target.value)}
          placeholder="Es: Poco piccante, senza cipolla..."
          rows={2}
          className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none resize-none"
        />
      </div>

      <button
        onClick={handleNext}
        className="w-full mt-4 py-4 rounded-xl font-bold text-lg bg-orange-500 text-white hover:bg-orange-600 transition-all shadow-md"
      >
        Continua →
      </button>
    </div>
  )
}

export default CustomerData
