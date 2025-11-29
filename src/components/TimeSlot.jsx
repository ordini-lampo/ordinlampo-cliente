import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function TimeSlot({ 
  restaurant,
  settings,
  openingHours,
  selectedSlot, 
  setSelectedSlot,
  nextStep 
}) {
  const [slotCounts, setSlotCounts] = useState({})
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const currentTime = now.toTimeString().slice(0, 5)
  const dayOfWeek = now.getDay()
  
  const todayHours = openingHours.find(h => h.day_of_week === dayOfWeek)
  
  // Genera fasce orarie
  const generateSlots = (start, end, prefix) => {
    const slots = []
    const [startH, startM] = start.split(':').map(Number)
    const [endH, endM] = end.split(':').map(Number)
    
    let currentH = startH
    let currentM = startM
    
    while (currentH < endH || (currentH === endH && currentM < endM)) {
      const nextM = currentM + 30
      const nextH = currentM + 30 >= 60 ? currentH + 1 : currentH
      const nextMNormalized = nextM >= 60 ? nextM - 60 : nextM
      
      const slotStart = `${String(currentH).padStart(2, '0')}:${String(currentM).padStart(2, '0')}`
      const slotEnd = `${String(nextH).padStart(2, '0')}:${String(nextMNormalized).padStart(2, '0')}`
      
      slots.push({
        id: `${prefix}-${slotStart}`,
        label: `${prefix} ${slotStart}-${slotEnd}`,
        time: slotStart,
        isPast: slotStart < currentTime
      })
      
      currentH = nextH
      currentM = nextMNormalized
    }
    
    return slots
  }

  const lunchSlots = todayHours?.lunch_enabled 
    ? generateSlots(
        todayHours.lunch_open || settings?.lunch_start || '11:00',
        todayHours.lunch_close || settings?.lunch_end || '15:30',
        '🍽️ PRANZO'
      )
    : []
  
  const dinnerSlots = todayHours?.dinner_enabled
    ? generateSlots(
        todayHours.dinner_open || settings?.dinner_start || '18:00',
        todayHours.dinner_close || settings?.dinner_end || '23:30',
        '🌙 CENA'
      )
    : []

  // Carica conteggio slot
  useEffect(() => {
    const loadSlotCounts = async () => {
      if (!settings?.enable_slot_limit) {
        setLoading(false)
        return
      }
      
      const { data } = await supabase
        .from('order_slots')
        .select('slot_time, orders_count')
        .eq('restaurant_id', restaurant.id)
        .eq('slot_date', today)
      
      const counts = {}
      data?.forEach(s => {
        counts[s.slot_time] = s.orders_count
      })
      setSlotCounts(counts)
      setLoading(false)
    }
    
    loadSlotCounts()
  }, [restaurant.id, today, settings?.enable_slot_limit])

  const maxPerSlot = settings?.max_orders_per_slot || 10

  const SlotButton = ({ slot }) => {
    const count = slotCounts[slot.time] || 0
    const isFull = settings?.enable_slot_limit && count >= maxPerSlot
    const isDisabled = slot.isPast || isFull
    const isSelected = selectedSlot === slot.label
    
    return (
      <button
        onClick={() => !isDisabled && setSelectedSlot(slot.label)}
        disabled={isDisabled}
        className={`p-3 rounded-xl border-2 text-center transition-all ${
          isSelected
            ? 'border-orange-500 bg-orange-50'
            : isDisabled
              ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
              : 'border-gray-200 bg-white hover:border-orange-300'
        }`}
      >
        <p className="font-medium text-sm text-gray-800">
          {slot.time}
        </p>
        {isFull && (
          <p className="text-xs text-red-500">Esaurito</p>
        )}
        {slot.isPast && (
          <p className="text-xs text-gray-400">Passato</p>
        )}
      </button>
    )
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    )
  }

  return (
    <div className="p-6 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        ⏰ Quando vuoi ricevere l'ordine?
      </h2>
      <p className="text-gray-500 mb-2">
        Seleziona la fascia oraria preferita
      </p>
      
      {/* Disclaimer */}
      <div className="p-3 bg-yellow-50 rounded-xl mb-6 text-sm text-yellow-700">
        <p>
          ⚠️ Si adotterà ogni sforzo per soddisfare la richiesta. 
          Tuttavia eventuali ritardi non imputabili al ristoratore potrebbero sporadicamente verificarsi.
        </p>
      </div>

      {/* Pranzo */}
      {lunchSlots.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-gray-700 mb-3">🍽️ PRANZO</h3>
          <div className="grid grid-cols-3 gap-2">
            {lunchSlots.map(slot => (
              <SlotButton key={slot.id} slot={slot} />
            ))}
          </div>
        </div>
      )}

      {/* Cena */}
      {dinnerSlots.length > 0 && (
        <div className="mb-6">
          <h3 className="font-bold text-gray-700 mb-3">🌙 CENA</h3>
          <div className="grid grid-cols-3 gap-2">
            {dinnerSlots.map(slot => (
              <SlotButton key={slot.id} slot={slot} />
            ))}
          </div>
        </div>
      )}

      <button
        onClick={nextStep}
        disabled={!selectedSlot}
        className={`w-full mt-4 py-4 rounded-xl font-bold text-lg transition-all ${
          selectedSlot
            ? 'bg-orange-500 text-white hover:bg-orange-600'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        Continua →
      </button>
    </div>
  )
}

export default TimeSlot
