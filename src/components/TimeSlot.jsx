import { useState, useEffect } from 'react'

export default function TimeSlot({ 
  openingHours, 
  specialClosures,
  selectedSlot, 
  setSelectedSlot, 
  nextStep 
}) {
  const [availableDates, setAvailableDates] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [timeSlots, setTimeSlots] = useState([])
  const [selectedTime, setSelectedTime] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  useEffect(() => {
    if (!openingHours || openingHours.length === 0) return

    const dates = []
    const today = new Date()
    
    // SOLO 2 GIORNI: OGGI + DOMANI
    for (let i = 0; i < 2; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() + i)
      
      const dayOfWeek = date.getDay()
      const dayHours = openingHours.find(h => h.day_of_week === dayOfWeek)
      
      const dateString = date.toISOString().split('T')[0]
      const isClosed = specialClosures?.some(c => c.closure_date === dateString)
      
      if (dayHours && !dayHours.is_closed && !isClosed) {
        dates.push({
          date: date,
          dateString: date.toLocaleDateString('it-IT'),
          dayName: date.toLocaleDateString('it-IT', { weekday: 'long' }),
          dayOfWeek: dayOfWeek,
          hours: dayHours,
          isToday: i === 0,
          isTomorrow: i === 1
        })
      }
    }
    
    setAvailableDates(dates)
  }, [openingHours, specialClosures])

  useEffect(() => {
    if (!selectedDate) {
      setTimeSlots([])
      return
    }

    const slots = []
    const now = new Date()
    const isToday = selectedDate.date.toDateString() === now.toDateString()
    const currentTime = now.getHours() * 60 + now.getMinutes()

    // PRANZO: Confronta con ORA DI FINE
    if (selectedDate.hours.lunch_enabled) {
      const [lunchHour, lunchMin] = selectedDate.hours.lunch_open.split(':').map(Number)
      const [lunchEndHour, lunchEndMin] = selectedDate.hours.lunch_close.split(':').map(Number)
      const lunchEndTime = lunchEndHour * 60 + lunchEndMin
      
      if (!isToday || currentTime < lunchEndTime) {
        slots.push({
          label: `Pranzo (${selectedDate.hours.lunch_open}-${selectedDate.hours.lunch_close})`,
          value: `${selectedDate.hours.lunch_open}-${selectedDate.hours.lunch_close}`,
          period: 'lunch',
          openingTime: selectedDate.hours.lunch_open
        })
      }
    }

    // CENA: Confronta con ORA DI FINE
    if (selectedDate.hours.dinner_enabled) {
      const [dinnerHour, dinnerMin] = selectedDate.hours.dinner_open.split(':').map(Number)
      const [dinnerEndHour, dinnerEndMin] = selectedDate.hours.dinner_close.split(':').map(Number)
      const dinnerEndTime = dinnerEndHour * 60 + dinnerEndMin
      
      if (!isToday || currentTime < dinnerEndTime) {
        slots.push({
          label: `Cena (${selectedDate.hours.dinner_open}-${selectedDate.hours.dinner_close})`,
          value: `${selectedDate.hours.dinner_open}-${selectedDate.hours.dinner_close}`,
          period: 'dinner',
          openingTime: selectedDate.hours.dinner_open
        })
      }
    }

    setTimeSlots(slots)
  }, [selectedDate])

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) return
    
    const combinedSlot = {
      date: selectedDate.date,
      dateString: selectedDate.dateString,
      dayName: selectedDate.dayName,
      time: selectedTime.value,
      timeLabel: selectedTime.label,
      openingTime: selectedTime.openingTime
    }
    
    setSelectedSlot(combinedSlot)
    setShowConfirmation(true)
  }

  const handleConfirm = () => {
    setShowConfirmation(false)
    nextStep()
  }

  if (showConfirmation) {
    const dayLabel = selectedDate.isToday ? 'Oggi' : selectedDate.isTomorrow ? 'Domani' : selectedDate.dayName
    
    const fullDate = selectedDate.date.toLocaleDateString('it-IT', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
    const fullDateCapitalized = fullDate.charAt(0).toUpperCase() + fullDate.slice(1)

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-3xl">📅</span>
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-center mb-4">
            Conferma Data e Orario
          </h3>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700 mb-2">
                {dayLabel}
              </div>
              <div className="text-xl text-gray-800 font-semibold mb-1">
                {fullDateCapitalized}
              </div>
              <div className="text-lg font-semibold text-blue-600 mt-3">
                {selectedTime.label}
              </div>
            </div>
          </div>
          
          <div className="space-y-3 mb-6">
            <p className="text-gray-700">
              Il tuo ordine è programmato per <strong>{fullDateCapitalized}</strong> durante la fascia oraria <strong>{selectedTime.value}</strong>.
            </p>
            
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">ℹ️ Nota:</span> Il locale aprirà alle ore <strong>{selectedTime.openingTime}</strong>. Il tuo ordine sarà preso in carico da quel momento.
              </p>
            </div>
            
            <p className="text-sm text-gray-600">
              Riceverai conferma via WhatsApp con tutti i dettagli.
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleConfirm}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-lg"
            >
              ✅ CONFERMO - Procedi con l'ordine
            </button>
            
            <button
              onClick={() => setShowConfirmation(false)}
              className="w-full bg-gray-200 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-300 transition"
            >
              ← Torna Indietro
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">Quando vuoi ricevere l'ordine?</h2>
      <p className="text-gray-600 mb-6">Scegli il giorno e la fascia oraria</p>
      
      {/* BOTTONI GRANDI OGGI/DOMANI */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">1. Scegli il giorno</h3>
        <div className="grid grid-cols-2 gap-4">
          {availableDates.map((dateObj) => (
            <button
              key={dateObj.dateString}
              onClick={() => {
                setSelectedDate(dateObj)
                setSelectedTime(null)
              }}
              className={`p-6 rounded-xl border-2 transition-all ${
                selectedDate?.dateString === dateObj.dateString
                  ? 'border-orange-500 bg-orange-50 shadow-lg'
                  : 'border-gray-200 hover:border-orange-300 hover:shadow-md'
              }`}
            >
              <div className="text-2xl font-bold mb-1">
                {dateObj.isToday ? '🌅 Oggi' : '🌄 Domani'}
              </div>
              <div className="text-sm text-gray-600">{dateObj.dateString}</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* FASCE ORARIE */}
      {selectedDate && timeSlots.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">2. Scegli la fascia oraria</h3>
          <div className="grid grid-cols-1 gap-3">
            {timeSlots.map((slot) => (
              <button
                key={slot.value}
                onClick={() => setSelectedTime(slot)}
                className={`p-4 rounded-lg border-2 transition ${
                  selectedTime?.value === slot.value
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-orange-200'
                }`}
              >
                <div className="font-semibold text-lg">{slot.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MESSAGGIO NESSUN ORARIO */}
      {selectedDate && timeSlots.length === 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            Non ci sono fasce orarie disponibili per questo giorno. 
            Per favore seleziona un altro giorno.
          </p>
        </div>
      )}
      
      {/* PULSANTE CONTINUA */}
      <button
        onClick={handleContinue}
        disabled={!selectedDate || !selectedTime}
        className={`w-full p-4 rounded-lg font-bold text-lg ${
          selectedDate && selectedTime
            ? 'bg-orange-500 text-white hover:bg-orange-600'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {!selectedDate ? 'Seleziona un giorno' : !selectedTime ? 'Seleziona una fascia oraria' : 'Continua'}
      </button>
    </div>
  )
}
