import { useEffect, useMemo, useState } from "react";

export default function TimeSlot({
  openingHours,
  specialClosures,
  slotAvailability, // { "YYYY-MM-DD_HH:MM-HH:MM": count }
  selectedSlot,
  setSelectedSlot,
  nextStep,
}) {
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const MAX_ORDERS_PER_SLOT = 6;

  // ----------------------------
  // Utils (bulldozer)
  // ----------------------------
  const toISODateKey = (d) => {
    const dt = new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`; // YYYY-MM-DD
  };

  const safeArray = (x) => (Array.isArray(x) ? x : []);

  const parseHHMM = (hhmm) => {
    const s = String(hhmm || "").trim();
    const [h, m] = s.split(":").map((n) => Number(n));
    if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
    return { h, m };
  };

  const minutesOf = (hhmm) => {
    const p = parseHHMM(hhmm);
    if (!p) return null;
    return p.h * 60 + p.m;
  };

  // Genera slot da 30 min; non crasha se input sporco.
  // Nota: se end <= start, assume "end il giorno dopo" (cross-midnight) e limita max 24h.
  const generateSlots = (startTime, endTime) => {
    const startMin = minutesOf(startTime);
    const endMinRaw = minutesOf(endTime);
    if (startMin == null || endMinRaw == null) return [];

    let endMin = endMinRaw;
    if (endMin <= startMin) endMin += 24 * 60; // attraversa mezzanotte

    const slots = [];
    let cur = startMin;
    const maxEnd = startMin + 24 * 60; // safety
    const endClamp = Math.min(endMin, maxEnd);

    while (cur + 30 <= endClamp) {
      const next = cur + 30;

      const norm = (min) => {
        const m = ((min % (24 * 60)) + (24 * 60)) % (24 * 60);
        const hh = String(Math.floor(m / 60)).padStart(2, "0");
        const mm = String(m % 60).padStart(2, "0");
        return `${hh}:${mm}`;
      };

      const slotStart = norm(cur);
      const slotEnd = norm(next);

      slots.push({
        start: slotStart,
        end: slotEnd,
        value: `${slotStart}-${slotEnd}`,
        label: `${slotStart} - ${slotEnd}`,
        startMinutes: cur, // può essere > 1440 se cross-midnight (ok)
      });

      cur = next;
    }

    return slots;
  };

  const availabilityLoaded = slotAvailability && typeof slotAvailability === "object";

  // ----------------------------
  // Build availableDates (Oggi + Domani)
  // ----------------------------
  useEffect(() => {
    const oh = safeArray(openingHours);
    if (!oh.length) {
      setAvailableDates([]);
      setSelectedDate(null);
      return;
    }

    const closures = safeArray(specialClosures);
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 2; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      const dayOfWeek = date.getDay();
      const dayHours = oh.find((h) => h.day_of_week === dayOfWeek);
      const dateKey = toISODateKey(date);
      const isClosed = closures.some((c) => c.closure_date === dateKey);

      if (dayHours && !dayHours.is_closed && !isClosed) {
        dates.push({
          date,
          dateKey, // ISO
          dateString: date.toLocaleDateString("it-IT"),
          dayName: date.toLocaleDateString("it-IT", { weekday: "long" }),
          dayOfWeek,
          hours: dayHours,
          isToday: i === 0,
          isTomorrow: i === 1,
        });
      }
    }

    setAvailableDates(dates);
  }, [openingHours, specialClosures]);

  // ----------------------------
  // Restore selection from selectedSlot (if present)
  // ----------------------------
  useEffect(() => {
    if (!selectedSlot?.dateKey) return;
    const match = availableDates.find((d) => d.dateKey === selectedSlot.dateKey);
    if (match) setSelectedDate(match);
  }, [availableDates, selectedSlot?.dateKey]);

  // ----------------------------
  // Generate timeSlots for selectedDate
  // ----------------------------
  useEffect(() => {
    if (!selectedDate) {
      setTimeSlots([]);
      setSelectedTime(null);
      return;
    }

    const slots = [];
    const now = new Date();
    const isToday = selectedDate.date.toDateString() === now.toDateString();
    const currentTimeMin = now.getHours() * 60 + now.getMinutes();

    const pushSlots = (period, periodLabel, start, end) => {
      const list = generateSlots(start, end);

      list.forEach((slot) => {
        // Se oggi, nascondi slot già partiti (>= start)
        // NB: slot.startMinutes può essere > 1440 se cross-midnight; per "oggi" ok solo finché non attraversi.
        if (isToday && slot.startMinutes <= 24 * 60 && currentTimeMin >= slot.startMinutes) return;

        const slotKey = `${selectedDate.dateKey}_${slot.value}`;

        // Bulldozer: se availability non ancora caricato, NON dare per disponibile
        const orderCount = availabilityLoaded ? Number(slotAvailability?.[slotKey] ?? 0) : null;
        const isFull =
          orderCount != null ? orderCount >= MAX_ORDERS_PER_SLOT : false;

        slots.push({
          ...slot,
          period,
          periodLabel,
          available: availabilityLoaded ? !isFull : false,
          orderCount: orderCount,
          maxOrders: MAX_ORDERS_PER_SLOT,
          slotKey,
        });
      });
    };

    if (selectedDate.hours?.lunch_enabled) {
      pushSlots("lunch", "Pranzo", selectedDate.hours.lunch_open, selectedDate.hours.lunch_close);
    }
    if (selectedDate.hours?.dinner_enabled) {
      pushSlots("dinner", "Cena", selectedDate.hours.dinner_open, selectedDate.hours.dinner_close);
    }

    setTimeSlots(slots);

    // Se avevi selezionato uno slot e ora è full/non disponibile → reset
    if (selectedTime) {
      const stillOk = slots.find((s) => s.value === selectedTime.value && s.available);
      if (!stillOk) setSelectedTime(null);
    }
  }, [selectedDate, slotAvailability, availabilityLoaded]); // selectedTime gestita sotto per restore

  // ----------------------------
  // Restore selectedTime from selectedSlot after timeSlots exist
  // ----------------------------
  useEffect(() => {
    if (!selectedSlot?.time) return;
    const match = timeSlots.find((s) => s.value === selectedSlot.time);
    if (match) setSelectedTime(match);
  }, [timeSlots, selectedSlot?.time]);

  const lunchSlots = useMemo(() => timeSlots.filter((s) => s.period === "lunch"), [timeSlots]);
  const dinnerSlots = useMemo(() => timeSlots.filter((s) => s.period === "dinner"), [timeSlots]);

  // ----------------------------
  // Actions
  // ----------------------------
  const handleContinue = () => {
    if (!selectedDate || !selectedTime) return;

    const combinedSlot = {
      // Payload coerente lato server:
      dateKey: selectedDate.dateKey,          // YYYY-MM-DD (source of truth)
      dateString: selectedDate.dateString,    // solo UI
      dayName: selectedDate.dayName,
      time: selectedTime.value,               // HH:MM-HH:MM (source of truth)
      timeLabel: selectedTime.label,
      period: selectedTime.period,
    };

    setSelectedSlot(combinedSlot);
    setShowConfirmation(true);
  };

  const handleConfirm = () => {
    setShowConfirmation(false);
    nextStep();
  };

  // ----------------------------
  // UI: Confirmation modal
  // ----------------------------
  if (showConfirmation) {
    const dayLabel = selectedDate?.isToday ? "Oggi" : selectedDate?.isTomorrow ? "Domani" : selectedDate?.dayName;

    const fullDate = selectedDate?.date?.toLocaleDateString("it-IT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }) || "";

    const fullDateCapitalized = fullDate ? fullDate.charAt(0).toUpperCase() + fullDate.slice(1) : "";

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-3xl">📅</span>
            </div>
          </div>

          <h3 className="text-xl font-bold text-center mb-4">Conferma Data e Orario</h3>

          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700 mb-2">{dayLabel}</div>
              <div className="text-xl text-gray-800 font-semibold mb-1">{fullDateCapitalized}</div>
              <div className="text-lg font-semibold text-blue-600 mt-3">
                {selectedTime?.periodLabel}: {selectedTime?.label}
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <p className="text-gray-700">
              Il tuo ordine è programmato per <strong>{fullDateCapitalized}</strong> durante la fascia oraria{" "}
              <strong>{selectedTime?.value}</strong>.
            </p>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">⚠️ Nota Importante:</span> L'orario è indicativo con un margine di{" "}
                <strong>±10 minuti</strong> per traffico intenso o cause di forza maggiore.
              </p>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-3">
              <p className="text-sm text-gray-700">
                Per <strong>RITIRO</strong>: ti avviseremo via WhatsApp quando l'ordine è pronto.
              </p>
              <p className="text-sm text-gray-700 mt-1">
                Per <strong>DELIVERY</strong>: il rider ti contatterà in caso di imprevisti.
              </p>
            </div>
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
    );
  }

  // ----------------------------
  // UI main
  // ----------------------------
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">Quando vuoi ricevere l'ordine?</h2>
      <p className="text-gray-600 mb-6">Scegli il giorno e la fascia oraria</p>

      {/* GIORNI */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3">1. Scegli il giorno</h3>

        {availableDates.length === 0 ? (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Nessun giorno disponibile (oggi/domani). Riprova più tardi o contatta il ristorante.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {availableDates.map((dateObj) => (
              <button
                key={dateObj.dateKey}
                onClick={() => {
                  setSelectedDate(dateObj);
                  setSelectedTime(null);
                }}
                className={`p-6 rounded-xl border-2 transition-all ${
                  selectedDate?.dateKey === dateObj.dateKey
                    ? "border-orange-500 bg-orange-50 shadow-lg"
                    : "border-gray-200 hover:border-orange-300 hover:shadow-md"
                }`}
              >
                <div className="text-2xl font-bold mb-1">
                  {dateObj.isToday ? "🌅 Oggi" : "🌄 Domani"}
                </div>
                <div className="text-sm text-gray-600">{dateObj.dateString}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SLOT */}
      {selectedDate && !availabilityLoaded && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800">
            Sto caricando la disponibilità degli slot… (un secondo)
          </p>
        </div>
      )}

      {selectedDate && availabilityLoaded && lunchSlots.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">2. Scegli l'orario - Pranzo</h3>
          <div className="grid grid-cols-2 gap-2">
            {lunchSlots.map((slot) => (
              <button
                key={slot.slotKey}
                onClick={() => slot.available && setSelectedTime(slot)}
                disabled={!slot.available}
                className={`p-3 rounded-lg border-2 transition ${
                  selectedTime?.value === slot.value
                    ? "border-orange-500 bg-orange-50"
                    : slot.available
                    ? "border-gray-200 hover:border-orange-200"
                    : "border-gray-300 bg-gray-100 cursor-not-allowed opacity-60"
                }`}
              >
                <div className={`font-semibold text-sm ${slot.available ? "text-gray-900" : "text-gray-500"}`}>
                  {slot.label}
                </div>
                {slot.available ? (
                  <div className="text-xs text-green-600 mt-1">
                    {slot.orderCount}/{slot.maxOrders} disponibili
                  </div>
                ) : (
                  <div className="text-xs text-red-600 mt-1 font-semibold">COMPLETO</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedDate && availabilityLoaded && dinnerSlots.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">
            {lunchSlots.length > 0 ? "Oppure scegli - Cena" : "2. Scegli l'orario - Cena"}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {dinnerSlots.map((slot) => (
              <button
                key={slot.slotKey}
                onClick={() => slot.available && setSelectedTime(slot)}
                disabled={!slot.available}
                className={`p-3 rounded-lg border-2 transition ${
                  selectedTime?.value === slot.value
                    ? "border-orange-500 bg-orange-50"
                    : slot.available
                    ? "border-gray-200 hover:border-orange-200"
                    : "border-gray-300 bg-gray-100 cursor-not-allowed opacity-60"
                }`}
              >
                <div className={`font-semibold text-sm ${slot.available ? "text-gray-900" : "text-gray-500"}`}>
                  {slot.label}
                </div>
                {slot.available ? (
                  <div className="text-xs text-green-600 mt-1">
                    {slot.orderCount}/{slot.maxOrders} disponibili
                  </div>
                ) : (
                  <div className="text-xs text-red-600 mt-1 font-semibold">COMPLETO</div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedDate && availabilityLoaded && timeSlots.length === 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            Non ci sono fasce orarie disponibili per questo giorno. Per favore seleziona un altro giorno.
          </p>
        </div>
      )}

      {/* CONTINUA */}
      <button
        onClick={handleContinue}
        disabled={!selectedDate || !selectedTime}
        className={`w-full p-4 rounded-lg font-bold text-lg ${
          selectedDate && selectedTime
            ? "bg-orange-500 text-white hover:bg-orange-600"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {!selectedDate ? "Seleziona un giorno" : !selectedTime ? "Seleziona un orario" : "Continua"}
      </button>
    </div>
  );
}
