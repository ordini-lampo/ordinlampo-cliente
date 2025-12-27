import { useEffect, useMemo, useState } from "react";

export default function TimeSlot({
  openingHours,
  specialClosures,
  slotAvailability,
  selectedSlot,
  setSelectedSlot,
  nextStep,
}) {
  const [timeSlots, setTimeSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const MAX_ORDERS_PER_SLOT = 6;

  // ----------------------------
  // Utils
  // ----------------------------
  const toISODateKey = (d) => {
    const dt = new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
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

  const generateSlots = (startTime, endTime) => {
    const startMin = minutesOf(startTime);
    const endMinRaw = minutesOf(endTime);
    if (startMin == null || endMinRaw == null) return [];

    let endMin = endMinRaw;
    if (endMin <= startMin) endMin += 24 * 60;

    const slots = [];
    let cur = startMin;
    const maxEnd = startMin + 24 * 60;
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
        startMinutes: cur,
      });
      cur = next;
    }
    return slots;
  };

  // ----------------------------
  // BULLDOZER: Auto-select TODAY, generate slots directly
  // ----------------------------
  const todayData = useMemo(() => {
    const oh = safeArray(openingHours);
    const today = new Date();
    const dayOfWeek = today.getDay() === 0 ? 7 : today.getDay(); // 1=Mon, 7=Sun
    
    // Find opening hours for today
    const todayHours = oh.filter((h) => h.day_of_week === dayOfWeek && h.is_active);
    
    return {
      date: today,
      dateKey: toISODateKey(today),
      dateString: today.toLocaleDateString("it-IT"),
      dayName: today.toLocaleDateString("it-IT", { weekday: "long" }),
      hours: todayHours,
      isToday: true,
    };
  }, [openingHours]);

  // ----------------------------
  // Generate timeSlots for TODAY
  // ----------------------------
  useEffect(() => {
    if (!todayData.hours || todayData.hours.length === 0) {
      setTimeSlots([]);
      return;
    }

    const slots = [];
    const now = new Date();
    const currentTimeMin = now.getHours() * 60 + now.getMinutes();

    todayData.hours.forEach((hourBlock) => {
      const period = hourBlock.period || "lunch";
      const periodLabel = period === "lunch" ? "Pranzo" : "Cena";
      const start = hourBlock.opens_at;
      const end = hourBlock.closes_at;

      const list = generateSlots(start, end);

      list.forEach((slot) => {
        // Hide past slots (with 30 min buffer for preparation)
        if (slot.startMinutes <= currentTimeMin + 30) return;

        const slotKey = `${todayData.dateKey}_${slot.value}`;

        slots.push({
          ...slot,
          period,
          periodLabel,
          available: slotAvailability?.[slot.value]?.available ?? true,
          orderCount: slotAvailability?.[slot.value]?.count ?? 0,
          maxOrders: slotAvailability?.[slot.value]?.limit ?? MAX_ORDERS_PER_SLOT,
          slotKey,
        });
      });
    });

    setTimeSlots(slots);
  }, [todayData, slotAvailability]);

  // Restore selectedTime from selectedSlot
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
    if (!selectedTime) return;

    const combinedSlot = {
      dateKey: todayData.dateKey,
      dateString: todayData.dateString,
      dayName: todayData.dayName,
      time: selectedTime.value,
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
    const fullDate = todayData.date.toLocaleDateString("it-IT", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const fullDateCapitalized = fullDate.charAt(0).toUpperCase() + fullDate.slice(1);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-3xl">📅</span>
            </div>
          </div>

          <h3 className="text-xl font-bold text-center mb-4">Conferma Orario</h3>

          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700 mb-2">Oggi</div>
              <div className="text-xl text-gray-800 font-semibold mb-1">{fullDateCapitalized}</div>
              <div className="text-lg font-semibold text-blue-600 mt-3">
                {selectedTime?.periodLabel}: {selectedTime?.label}
              </div>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
              <p className="text-sm text-gray-700">
                <span className="font-semibold">⚠️ Nota:</span> L'orario è indicativo con un margine di{" "}
                <strong>±10 minuti</strong>.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleConfirm}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition shadow-lg"
            >
              ✅ CONFERMO
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
  // UI main - DIRECT SLOTS (no date selection)
  // ----------------------------
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">Scegli l'orario di consegna</h2>
      <p className="text-gray-600 mb-6">
        Oggi, {todayData.dateString}
      </p>

      {timeSlots.length === 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            Non ci sono fasce orarie disponibili per oggi. Il ristorante potrebbe essere chiuso o tutti gli slot sono passati.
          </p>
        </div>
      )}

      {lunchSlots.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">🌞 Pranzo</h3>
          <div className="grid grid-cols-2 gap-2">
            {lunchSlots.map((slot) => (
              <button
                key={slot.slotKey}
                onClick={() => setSelectedTime(slot)}
                className={`p-3 rounded-lg border-2 transition ${
                  selectedTime?.value === slot.value
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-orange-200"
                }`}
              >
                <div className="font-semibold text-sm text-gray-900">{slot.label}</div>
                <div className="text-xs text-green-600 mt-1">Disponibile</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {dinnerSlots.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">🌙 Cena</h3>
          <div className="grid grid-cols-2 gap-2">
            {dinnerSlots.map((slot) => (
              <button
                key={slot.slotKey}
                onClick={() => setSelectedTime(slot)}
                className={`p-3 rounded-lg border-2 transition ${
                  selectedTime?.value === slot.value
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-orange-200"
                }`}
              >
                <div className="font-semibold text-sm text-gray-900">{slot.label}</div>
                <div className="text-xs text-green-600 mt-1">Disponibile</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleContinue}
        disabled={!selectedTime}
        className={`w-full p-4 rounded-lg font-bold text-lg ${
          selectedTime
            ? "bg-orange-500 text-white hover:bg-orange-600"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        {selectedTime ? "Continua" : "Seleziona un orario"}
      </button>
    </div>
  );
}
