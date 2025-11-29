import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase'

// Componenti Step
import Welcome from './components/Welcome'
import OrderType from './components/OrderType'
import DeliveryZone from './components/DeliveryZone'
import BowlSize from './components/BowlSize'
import BaseSelection from './components/BaseSelection'
import ProteinSelection from './components/ProteinSelection'
import IngredientsSelection from './components/IngredientsSelection'
import SauceSelection from './components/SauceSelection'
import ToppingSelection from './components/ToppingSelection'
import BeveragesSelection from './components/BeveragesSelection'
import BackupIngredient from './components/BackupIngredient'
import AllergiesSelection from './components/AllergiesSelection'
import TimeSlot from './components/TimeSlot'
import CustomerData from './components/CustomerData'
import ExtrasSelection from './components/ExtrasSelection'
import DiscountCode from './components/DiscountCode'
import PaymentMethod from './components/PaymentMethod'
import OrderSummary from './components/OrderSummary'
import ConfirmationPopups from './components/ConfirmationPopups'

// Componenti UI
import LiveSummary from './components/LiveSummary'
import StepIndicator from './components/StepIndicator'
import LoadingScreen from './components/LoadingScreen'
import ErrorScreen from './components/ErrorScreen'
import ClosedScreen from './components/ClosedScreen'

function App() {
  // ============================================
  // STATE - Dati Ristorante
  // ============================================
  const [restaurant, setRestaurant] = useState(null)
  const [settings, setSettings] = useState(null)
  const [locations, setLocations] = useState([])
  const [bowlTypes, setBowlTypes] = useState([])
  const [categories, setCategories] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [openingHours, setOpeningHours] = useState([])
  const [specialClosures, setSpecialClosures] = useState([])
  const [discountCodes, setDiscountCodes] = useState([])
  
  // ============================================
  // STATE - Caricamento
  // ============================================
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isClosed, setIsClosed] = useState(false)
  const [closedMessage, setClosedMessage] = useState('')
  
  // ============================================
  // STATE - Navigazione
  // ============================================
  const [currentStep, setCurrentStep] = useState(0)
  const [showConfirmPhone, setShowConfirmPhone] = useState(false)
  const [showConfirmOrder, setShowConfirmOrder] = useState(false)
  
  // ============================================
  // STATE - Ordine
  // ============================================
  const [orderType, setOrderType] = useState(null) // 'delivery' | 'pickup'
  const [selectedZone, setSelectedZone] = useState(null)
  
  // Multi-bowl support
  const [bowls, setBowls] = useState([])
  const [currentBowlIndex, setCurrentBowlIndex] = useState(0)
  
  // Bowl corrente
  const [selectedBowlType, setSelectedBowlType] = useState(null)
  const [selectedBases, setSelectedBases] = useState([])
  const [isHalfHalf, setIsHalfHalf] = useState(false)
  const [selectedProteins, setSelectedProteins] = useState([])
  const [selectedIngredients, setSelectedIngredients] = useState([])
  const [selectedSauces, setSelectedSauces] = useState([])
  const [selectedToppings, setSelectedToppings] = useState([])
  
  // Bevande
  const [selectedBeverages, setSelectedBeverages] = useState({})
  
  // Ingrediente riserva
  const [backupOption, setBackupOption] = useState('chef_choice')
  const [backupIngredient, setBackupIngredient] = useState(null)
  
  // Allergie
  const [selectedAllergies, setSelectedAllergies] = useState([])
  const [customAllergy, setCustomAllergy] = useState('')
  
  // Fascia oraria
  const [selectedSlot, setSelectedSlot] = useState(null)
  
  // Dati cliente
  const [customerData, setCustomerData] = useState({
    name: '',
    surname: '',
    phone: '',
    address: '',
    civic: '',
    city: '',
    doorbell: '',
    notesOrder: '',
    notesAddress: ''
  })
  
  // Extras
  const [wantsCutlery, setWantsCutlery] = useState(false)
  const [wantsFloorDelivery, setWantsFloorDelivery] = useState(false)
  const [tipAmount, setTipAmount] = useState(0)
  
  // Sconto
  const [appliedDiscount, setAppliedDiscount] = useState(null)
  
  // Pagamento
  const [paymentMethod, setPaymentMethod] = useState(null)
  
  // ============================================
  // STATE - Cliente precedente
  // ============================================
  const [previousCustomer, setPreviousCustomer] = useState(null)
  const [previousOrder, setPreviousOrder] = useState(null)

  // ============================================
  // DEFINIZIONE STEPS
  // ============================================
  const steps = [
    { id: 'welcome', name: 'Benvenuto', component: Welcome },
    { id: 'order-type', name: 'Tipo Ordine', component: OrderType },
    { id: 'delivery-zone', name: 'Zona', component: DeliveryZone, condition: () => orderType === 'delivery' },
    { id: 'bowl-size', name: 'Taglia', component: BowlSize },
    { id: 'base', name: 'Base', component: BaseSelection },
    { id: 'proteins', name: 'Proteine', component: ProteinSelection },
    { id: 'ingredients', name: 'Ingredienti', component: IngredientsSelection },
    { id: 'sauces', name: 'Salse', component: SauceSelection },
    { id: 'toppings', name: 'Topping', component: ToppingSelection },
    { id: 'beverages', name: 'Bevande', component: BeveragesSelection },
    { id: 'backup', name: 'Riserva', component: BackupIngredient, condition: () => settings?.enable_backup_ingredient },
    { id: 'allergies', name: 'Allergie', component: AllergiesSelection, condition: () => settings?.enable_allergies },
    { id: 'time-slot', name: 'Orario', component: TimeSlot },
    { id: 'customer', name: 'Dati', component: CustomerData },
    { id: 'extras', name: 'Extra', component: ExtrasSelection },
    { id: 'discount', name: 'Sconto', component: DiscountCode },
    { id: 'payment', name: 'Pagamento', component: PaymentMethod },
    { id: 'summary', name: 'Riepilogo', component: OrderSummary }
  ]
  
  // Filtra steps attivi
  const activeSteps = steps.filter(step => !step.condition || step.condition())

  // ============================================
  // CARICAMENTO DATI INIZIALE
  // ============================================
  useEffect(() => {
    loadRestaurantData()
  }, [])

  const loadRestaurantData = async () => {
    try {
      setLoading(true)
      
      // Ottieni slug da URL o usa default
      const urlParams = new URLSearchParams(window.location.search)
      const slug = urlParams.get('r') || 'pokenjoy-sanremo'
      
      // Carica ristorante
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()
      
      if (restaurantError) throw new Error('Ristorante non trovato')
      setRestaurant(restaurantData)
      
      // Carica settings
      const { data: settingsData } = await supabase
        .from('restaurant_settings')
        .select('*')
        .eq('restaurant_id', restaurantData.id)
        .single()
      setSettings(settingsData || {})
      
      // Carica locations
      const { data: locationsData } = await supabase
        .from('locations')
        .select('*')
        .eq('restaurant_id', restaurantData.id)
        .eq('is_active', true)
        .order('sort_order')
      setLocations(locationsData || [])
      
      // Carica tipi bowl
      const { data: bowlTypesData } = await supabase
        .from('bowl_types')
        .select('*')
        .eq('restaurant_id', restaurantData.id)
        .eq('is_active', true)
        .order('sort_order')
      setBowlTypes(bowlTypesData || [])
      
      // Carica categorie ingredienti
      const { data: categoriesData } = await supabase
        .from('ingredient_categories')
        .select('*')
        .eq('restaurant_id', restaurantData.id)
        .eq('is_active', true)
        .order('sort_order')
      setCategories(categoriesData || [])
      
      // Carica ingredienti
      const { data: ingredientsData } = await supabase
        .from('ingredients')
        .select('*')
        .eq('restaurant_id', restaurantData.id)
        .eq('is_active', true)
        .eq('is_available', true)
        .order('sort_order')
      setIngredients(ingredientsData || [])
      
      // Carica orari apertura
      const { data: hoursData } = await supabase
        .from('opening_hours')
        .select('*')
        .eq('restaurant_id', restaurantData.id)
        .order('day_of_week')
      setOpeningHours(hoursData || [])
      
      // Carica chiusure speciali
      const { data: closuresData } = await supabase
        .from('special_closures')
        .select('*')
        .eq('restaurant_id', restaurantData.id)
        .gte('closure_date', new Date().toISOString().split('T')[0])
      setSpecialClosures(closuresData || [])
      
      // Carica codici sconto attivi
      const { data: codesData } = await supabase
        .from('discount_codes')
        .select('*')
        .eq('restaurant_id', restaurantData.id)
        .eq('is_active', true)
      setDiscountCodes(codesData || [])
      
      // Verifica se ristorante accetta ordini
      if (!restaurantData.accept_orders) {
        setIsClosed(true)
        setClosedMessage('Il ristorante non accetta ordini al momento.')
        return
      }
      
      // Verifica orari apertura
      const closureCheck = checkIfClosed(hoursData, closuresData)
      if (closureCheck.closed) {
        setIsClosed(true)
        setClosedMessage(closureCheck.message)
        return
      }
      
      // Carica cliente precedente (se presente in localStorage)
      loadPreviousCustomer(restaurantData.id)
      
    } catch (err) {
      console.error('Errore caricamento:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // VERIFICA ORARI APERTURA
  // ============================================
  const checkIfClosed = (hours, closures) => {
    const now = new Date()
    const today = now.toISOString().split('T')[0]
    const dayOfWeek = now.getDay()
    const currentTime = now.toTimeString().slice(0, 5)
    
    // Verifica chiusure speciali
    const specialClosure = closures?.find(c => c.closure_date === today)
    if (specialClosure) {
      return { 
        closed: true, 
        message: specialClosure.reason || 'Oggi siamo chiusi per chiusura speciale.' 
      }
    }
    
    // Verifica orario giornaliero
    const todayHours = hours?.find(h => h.day_of_week === dayOfWeek)
    if (!todayHours || todayHours.is_closed) {
      return { 
        closed: true, 
        message: 'Oggi siamo chiusi. Riapriamo domani!' 
      }
    }
    
    // Verifica se siamo in orario
    const inLunch = todayHours.lunch_enabled && 
                    currentTime >= todayHours.lunch_open && 
                    currentTime <= todayHours.lunch_close
    
    const inDinner = todayHours.dinner_enabled && 
                     currentTime >= todayHours.dinner_open && 
                     currentTime <= todayHours.dinner_close
    
    if (!inLunch && !inDinner) {
      // Determina prossima apertura
      let nextOpen = ''
      if (currentTime < todayHours.lunch_open && todayHours.lunch_enabled) {
        nextOpen = `alle ${todayHours.lunch_open}`
      } else if (currentTime < todayHours.dinner_open && todayHours.dinner_enabled) {
        nextOpen = `alle ${todayHours.dinner_open}`
      } else {
        nextOpen = 'domani'
      }
      
      return { 
        closed: true, 
        message: `Siamo chiusi! Riapriamo ${nextOpen}` 
      }
    }
    
    return { closed: false }
  }

  // ============================================
  // CLIENTE PRECEDENTE
  // ============================================
  const loadPreviousCustomer = async (restaurantId) => {
    try {
      const savedPhone = localStorage.getItem(`ordinlampo_phone_${restaurantId}`)
      if (!savedPhone) return
      
      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('phone', savedPhone)
        .single()
      
      if (customerData) {
        setPreviousCustomer(customerData)
        if (customerData.last_order_data) {
          setPreviousOrder(customerData.last_order_data)
        }
      }
    } catch (err) {
      console.log('Nessun cliente precedente trovato')
    }
  }

  // ============================================
  // NAVIGAZIONE
  // ============================================
  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < activeSteps.length) {
      setCurrentStep(stepIndex)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  
  const nextStep = () => goToStep(currentStep + 1)
  const prevStep = () => goToStep(currentStep - 1)

  // ============================================
  // CALCOLO PREZZI
  // ============================================
  const calculateBowlPrice = useCallback((bowl) => {
    if (!bowl) return 0
    
    let price = bowl.bowlType?.price || 0
    
    // Extra proteine
    const proteinCategory = categories.find(c => c.name === 'proteine')
    if (proteinCategory) {
      bowl.proteins?.forEach(p => {
        if (p.isDouble) price += proteinCategory.double_portion_price || 0
      })
      const extraProteins = (bowl.proteins?.length || 0) - proteinCategory.max_selections
      if (extraProteins > 0) price += extraProteins * proteinCategory.extra_price
    }
    
    // Extra ingredienti
    const ingredientsCategory = categories.find(c => c.name === 'ingredienti')
    if (ingredientsCategory) {
      bowl.ingredients?.forEach(i => {
        if (i.isDouble) price += ingredientsCategory.double_portion_price || 0
      })
      const extraIngredients = (bowl.ingredients?.length || 0) - ingredientsCategory.max_selections
      if (extraIngredients > 0) price += extraIngredients * ingredientsCategory.extra_price
    }
    
    // Extra salse
    const sauceCategory = categories.find(c => c.name === 'salse')
    if (sauceCategory) {
      const extraSauces = (bowl.sauces?.length || 0) - sauceCategory.max_selections
      if (extraSauces > 0) price += extraSauces * sauceCategory.extra_price
    }
    
    // Extra topping
    const toppingCategory = categories.find(c => c.name === 'topping')
    if (toppingCategory) {
      bowl.toppings?.forEach(t => {
        if (t.isDouble) price += toppingCategory.double_portion_price || 0
      })
      const extraToppings = (bowl.toppings?.length || 0) - toppingCategory.max_selections
      if (extraToppings > 0) price += extraToppings * toppingCategory.extra_price
    }
    
    return price
  }, [categories])

  const calculateBeveragesPrice = useCallback(() => {
    let price = 0
    Object.entries(selectedBeverages).forEach(([ingredientId, quantity]) => {
      const beverage = ingredients.find(i => i.id === parseInt(ingredientId))
      if (beverage) {
        price += beverage.price * quantity
      }
    })
    return price
  }, [selectedBeverages, ingredients])

  const calculateSubtotal = useCallback(() => {
    // Prezzo bowl corrente (se non ancora salvata)
    const currentBowlPrice = currentBowlIndex >= bowls.length ? calculateBowlPrice({
      bowlType: selectedBowlType,
      proteins: selectedProteins,
      ingredients: selectedIngredients,
      sauces: selectedSauces,
      toppings: selectedToppings
    }) : 0
    
    // Prezzo bowls salvate
    const savedBowlsPrice = bowls.reduce((sum, bowl) => sum + calculateBowlPrice(bowl), 0)
    
    // Prezzo bevande
    const beveragesPrice = calculateBeveragesPrice()
    
    return currentBowlPrice + savedBowlsPrice + beveragesPrice
  }, [bowls, currentBowlIndex, selectedBowlType, selectedProteins, selectedIngredients, selectedSauces, selectedToppings, calculateBowlPrice, calculateBeveragesPrice])

  const calculateTotal = useCallback(() => {
    let total = calculateSubtotal()
    
    // Consegna
    if (orderType === 'delivery' && selectedZone) {
      total += parseFloat(selectedZone.delivery_fee) || 0
    }
    
    // Consegna al piano
    if (wantsFloorDelivery && settings?.floor_delivery_price) {
      total += parseFloat(settings.floor_delivery_price) || 0
    }
    
    // Sconto
    if (appliedDiscount) {
      if (appliedDiscount.discount_type === 'percentage') {
        total -= total * (appliedDiscount.discount_value / 100)
      } else {
        total -= appliedDiscount.discount_value
      }
    }
    
    // Mancia (aggiunta dopo per non influenzare sconto)
    total += tipAmount
    
    return Math.max(0, total)
  }, [calculateSubtotal, orderType, selectedZone, wantsFloorDelivery, settings, appliedDiscount, tipAmount])

  // ============================================
  // GESTIONE BOWL
  // ============================================
  const saveCurrentBowl = () => {
    const currentBowl = {
      bowlType: selectedBowlType,
      bases: selectedBases,
      isHalfHalf,
      proteins: selectedProteins,
      ingredients: selectedIngredients,
      sauces: selectedSauces,
      toppings: selectedToppings
    }
    
    if (currentBowlIndex >= bowls.length) {
      setBowls([...bowls, currentBowl])
    } else {
      const updatedBowls = [...bowls]
      updatedBowls[currentBowlIndex] = currentBowl
      setBowls(updatedBowls)
    }
  }
  
  const addNewBowl = () => {
    saveCurrentBowl()
    setCurrentBowlIndex(bowls.length + 1)
    resetBowlSelections()
    goToStep(activeSteps.findIndex(s => s.id === 'bowl-size'))
  }
  
  const editBowl = (index) => {
    saveCurrentBowl()
    const bowl = bowls[index]
    setSelectedBowlType(bowl.bowlType)
    setSelectedBases(bowl.bases)
    setIsHalfHalf(bowl.isHalfHalf)
    setSelectedProteins(bowl.proteins)
    setSelectedIngredients(bowl.ingredients)
    setSelectedSauces(bowl.sauces)
    setSelectedToppings(bowl.toppings)
    setCurrentBowlIndex(index)
    goToStep(activeSteps.findIndex(s => s.id === 'bowl-size'))
  }
  
  const deleteBowl = (index) => {
    const updatedBowls = bowls.filter((_, i) => i !== index)
    setBowls(updatedBowls)
    if (currentBowlIndex >= updatedBowls.length) {
      setCurrentBowlIndex(Math.max(0, updatedBowls.length - 1))
    }
  }
  
  const resetBowlSelections = () => {
    setSelectedBowlType(null)
    setSelectedBases([])
    setIsHalfHalf(false)
    setSelectedProteins([])
    setSelectedIngredients([])
    setSelectedSauces([])
    setSelectedToppings([])
  }

  // ============================================
  // SELEZIONE INGREDIENTI
  // ============================================
  const toggleIngredient = (ingredient, selection, setSelection, maxCount, allowDouble = false) => {
    const existingIndex = selection.findIndex(s => s.id === ingredient.id)
    
    if (existingIndex >= 0) {
      // Già selezionato - rimuovi
      setSelection(selection.filter(s => s.id !== ingredient.id))
    } else if (selection.length < maxCount || maxCount === 99) {
      // Aggiungi se sotto il limite
      setSelection([...selection, { ...ingredient, isDouble: false }])
    }
  }
  
  const toggleDoublePortions = (ingredientId, selection, setSelection) => {
    setSelection(selection.map(s => 
      s.id === ingredientId ? { ...s, isDouble: !s.isDouble } : s
    ))
  }

  // ============================================
  // INVIO ORDINE
  // ============================================
  const generateWhatsAppMessage = () => {
    const now = new Date()
    const dateStr = now.toLocaleDateString('it-IT')
    const timeStr = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
    const orderNumber = String(Math.floor(Math.random() * 9999)).padStart(4, '0')
    
    let msg = `🍜 NUOVO ORDINE #${orderNumber}\n`
    msg += `${restaurant.name.toUpperCase()}\n\n\n`
    
    // Gestione ordine
    msg += `⏱️ GESTIONE ORDINE\n`
    msg += `📥 Ricevuto: ${dateStr} ore ${timeStr}\n\n\n`
    
    // Tipo ordine
    if (orderType === 'delivery') {
      msg += `🛵 CONSEGNA A DOMICILIO\n`
      msg += `Fascia richiesta: ${selectedSlot}\n\n`
    } else {
      msg += `🥡 RITIRO AL LOCALE\n`
      msg += `Fascia richiesta: ${selectedSlot}\n\n`
    }
    
    // Tutte le bowl
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
    
    allBowls.forEach((bowl, idx) => {
      if (allBowls.length > 1) {
        msg += `━━━ BOWL ${idx + 1} (${bowl.bowlType.name}) ━━━\n\n`
      }
      
      // Base
      msg += `🍚 BASE (${bowl.bases.length})\n`
      bowl.bases.forEach(b => {
        msg += `→ ${b.name}${bowl.isHalfHalf && bowl.bases.length > 1 ? ' (50/50)' : ''}\n`
      })
      msg += `\n`
      
      // Proteine
      msg += `🐟 PROTEINE (${bowl.proteins.length})\n`
      bowl.proteins.forEach(p => {
        const doubleText = p.isDouble ? ' ×2' : ''
        const priceText = p.isDouble ? ` (+€${categories.find(c => c.name === 'proteine')?.double_portion_price?.toFixed(2) || '0.00'})` : ''
        msg += `→ ${p.name}${doubleText}${priceText}\n`
      })
      msg += `\n`
      
      // Ingredienti
      msg += `🥗 INGREDIENTI (${bowl.ingredients.length})\n`
      bowl.ingredients.forEach(i => {
        const doubleText = i.isDouble ? ' ×2' : ''
        const priceText = i.isDouble ? ` (+€${categories.find(c => c.name === 'ingredienti')?.double_portion_price?.toFixed(2) || '0.00'})` : ''
        msg += `→ ${i.name}${doubleText}${priceText}\n`
      })
      msg += `\n`
      
      // Salse
      msg += `🥢 SALSE (${bowl.sauces.length})\n`
      bowl.sauces.forEach(s => {
        msg += `→ ${s.name}\n`
      })
      msg += `\n`
      
      // Topping
      msg += `✨ TOPPING (${bowl.toppings.length})\n`
      bowl.toppings.forEach(t => {
        const doubleText = t.isDouble ? ' ×2' : ''
        const priceText = t.isDouble ? ` (+€${categories.find(c => c.name === 'topping')?.double_portion_price?.toFixed(2) || '0.00'})` : ''
        msg += `→ ${t.name}${doubleText}${priceText}\n`
      })
      msg += `\n`
    })
    
    // Bevande
    const beveragesList = Object.entries(selectedBeverages).filter(([_, qty]) => qty > 0)
    if (beveragesList.length > 0) {
      const totalBeverages = beveragesList.reduce((sum, [_, qty]) => sum + qty, 0)
      msg += `🥤 BEVANDE (${totalBeverages})\n`
      beveragesList.forEach(([id, qty]) => {
        const bev = ingredients.find(i => i.id === parseInt(id))
        if (bev) {
          msg += `→ ${bev.name} ×${qty} - €${(bev.price * qty).toFixed(2)}\n`
        }
      })
      msg += `\n`
    }
    
    // Riserva
    if (settings?.enable_backup_ingredient) {
      msg += `🔄 RISERVA: `
      if (backupOption === 'chef_choice') {
        msg += `Sostituire a discrezione dello chef\n`
      } else if (backupOption === 'contact_me') {
        msg += `Contattarmi prima di procedere\n`
      } else if (backupIngredient) {
        msg += `${backupIngredient.name}\n`
      }
      msg += `\n`
    }
    
    // Allergie
    if (selectedAllergies.length > 0 || customAllergy) {
      msg += `⚠️ ALLERGIE: `
      const allergiesList = [...selectedAllergies]
      if (customAllergy) allergiesList.push(customAllergy)
      msg += allergiesList.join(', ') + '\n\n'
    }
    
    // Extra
    const extras = []
    if (wantsCutlery) extras.push('Posate: Sì')
    if (wantsFloorDelivery) extras.push(`Consegna al piano: Sì (+€${settings?.floor_delivery_price?.toFixed(2) || '1.50'})`)
    
    if (extras.length > 0) {
      msg += `🍴 EXTRA\n`
      extras.forEach(e => msg += `→ ${e}\n`)
      msg += `\n`
    }
    
    // Cliente
    msg += `👤 CLIENTE\n`
    msg += `${customerData.name} ${customerData.surname} | ${customerData.phone}\n`
    
    if (orderType === 'delivery') {
      msg += `${customerData.address} ${customerData.civic}, ${customerData.city}\n`
      msg += `Citofono: ${customerData.doorbell}\n`
    }
    
    if (customerData.notesOrder) {
      msg += `📝 ${customerData.notesOrder}\n`
    }
    if (customerData.notesAddress) {
      msg += `📍 ${customerData.notesAddress}\n`
    }
    msg += `\n`
    
    // Pagamento
    msg += `💳 PAGAMENTO: `
    if (paymentMethod === 'cash') msg += `Contanti alla consegna\n`
    else if (paymentMethod === 'card') msg += `Carta alla consegna (POS)\n`
    else msg += `Già pagato\n`
    msg += `\n`
    
    // Conteggio
    msg += `📊 CONTEGGIO\n`
    let totalItems = 0
    allBowls.forEach(bowl => {
      totalItems += bowl.bases.length + bowl.proteins.length + bowl.ingredients.length + bowl.sauces.length + bowl.toppings.length
    })
    totalItems += beveragesList.reduce((sum, [_, qty]) => sum + qty, 0)
    
    msg += `→ Bowl: ${allBowls.length}\n`
    msg += `→ Bevande: ${beveragesList.reduce((sum, [_, qty]) => sum + qty, 0)}\n`
    msg += `────────────\n`
    msg += `TOTALE ELEMENTI: ${totalItems}\n\n`
    
    // Prezzo
    msg += `💰 PREZZO\n`
    allBowls.forEach((bowl, idx) => {
      const bowlPrice = calculateBowlPrice(bowl)
      msg += `→ Bowl ${allBowls.length > 1 ? idx + 1 : ''} ${bowl.bowlType.name}: €${bowl.bowlType.price.toFixed(2)}\n`
    })
    
    if (calculateBeveragesPrice() > 0) {
      msg += `→ Bevande: +€${calculateBeveragesPrice().toFixed(2)}\n`
    }
    
    if (orderType === 'delivery' && selectedZone) {
      msg += `→ Consegna: +€${parseFloat(selectedZone.delivery_fee).toFixed(2)}\n`
    }
    
    if (wantsFloorDelivery) {
      msg += `→ Consegna al piano: +€${settings?.floor_delivery_price?.toFixed(2) || '1.50'}\n`
    }
    
    if (appliedDiscount) {
      const discountText = appliedDiscount.discount_type === 'percentage' 
        ? `${appliedDiscount.discount_value}%` 
        : `€${appliedDiscount.discount_value.toFixed(2)}`
      msg += `→ Sconto ${appliedDiscount.code}: -${discountText}\n`
    }
    
    if (tipAmount > 0) {
      msg += `→ Mancia rider: +€${tipAmount.toFixed(2)}\n`
    }
    
    msg += `────────────\n`
    msg += `DA PAGARE: €${calculateTotal().toFixed(2)}\n`
    
    if (tipAmount > 0) {
      msg += `(di cui €${tipAmount.toFixed(2)} mancia rider)\n`
    }
    
    return msg
  }
  
  const sendWhatsAppOrder = async () => {
    const message = generateWhatsAppMessage()
    const whatsappUrl = `https://wa.me/${restaurant.whatsapp_number}?text=${encodeURIComponent(message)}`
    
    // 🛡️ VALVOLA SICUREZZA: Blocca ordini troppo lunghi per WhatsApp
    const encodedLength = encodeURIComponent(message).length
    if (encodedLength > 1800) {
      alert("⚠️ L'ordine è troppo lungo per WhatsApp!\n\nPer favore:\n1. Riduci le note ordine\n2. Oppure dividi in due ordini separati\n\nGrazie!")
      return // NON aprire WhatsApp
    }
    
    // Salva ordine in database
    try {
      // Salva/aggiorna cliente
      const { data: customerRecord } = await supabase
        .from('customers')
        .upsert({
          restaurant_id: restaurant.id,
          phone: customerData.phone,
          name: customerData.name,
          surname: customerData.surname,
          default_address: customerData.address,
          default_city: customerData.city,
          default_civic: customerData.civic,
          default_doorbell: customerData.doorbell,
          allergies: selectedAllergies,
          last_order_data: {
            bowlType: selectedBowlType,
            bases: selectedBases,
            proteins: selectedProteins,
            ingredients: selectedIngredients,
            sauces: selectedSauces,
            toppings: selectedToppings
          }
        }, { 
          onConflict: 'restaurant_id,phone',
          ignoreDuplicates: false 
        })
        .select()
        .single()
      
      // Salva in localStorage per ordini futuri
      localStorage.setItem(`ordinlampo_phone_${restaurant.id}`, customerData.phone)
      
      // Incrementa contatore slot
      if (selectedSlot) {
        await supabase.rpc('increment_slot_count', {
          p_restaurant_id: restaurant.id,
          p_slot_date: new Date().toISOString().split('T')[0],
          p_slot_time: selectedSlot
        })
      }
      
    } catch (err) {
      console.error('Errore salvataggio ordine:', err)
    }
    
    // Apri WhatsApp
    window.open(whatsappUrl, '_blank')
  }

  // ============================================
  // RENDER
  // ============================================
  if (loading) return <LoadingScreen />
  if (error) return <ErrorScreen message={error} />
  if (isClosed) return <ClosedScreen message={closedMessage} restaurant={restaurant} />

  const CurrentStepComponent = activeSteps[currentStep]?.component

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      {currentStep > 0 && (
        <header className="sticky top-0 z-40 bg-white shadow-sm">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
            <button 
              onClick={prevStep}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              ←
            </button>
            <div className="text-center">
              <p className="text-sm text-gray-500">{activeSteps[currentStep]?.name}</p>
              <p className="text-xs text-gray-400">{currentStep + 1} di {activeSteps.length}</p>
            </div>
            <div className="w-10" />
          </div>
          <StepIndicator steps={activeSteps} currentStep={currentStep} />
        </header>
      )}

      {/* Main Content */}
      <main className={`max-w-lg mx-auto ${currentStep > 0 ? 'pb-32' : ''}`}>
        {CurrentStepComponent && (
          <CurrentStepComponent
            // Dati ristorante
            restaurant={restaurant}
            settings={settings}
            locations={locations}
            bowlTypes={bowlTypes}
            categories={categories}
            ingredients={ingredients}
            openingHours={openingHours}
            discountCodes={discountCodes}
            
            // Stato ordine
            orderType={orderType}
            setOrderType={setOrderType}
            selectedZone={selectedZone}
            setSelectedZone={setSelectedZone}
            
            // Bowl
            bowls={bowls}
            currentBowlIndex={currentBowlIndex}
            selectedBowlType={selectedBowlType}
            setSelectedBowlType={setSelectedBowlType}
            selectedBases={selectedBases}
            setSelectedBases={setSelectedBases}
            isHalfHalf={isHalfHalf}
            setIsHalfHalf={setIsHalfHalf}
            selectedProteins={selectedProteins}
            setSelectedProteins={setSelectedProteins}
            selectedIngredients={selectedIngredients}
            setSelectedIngredients={setSelectedIngredients}
            selectedSauces={selectedSauces}
            setSelectedSauces={setSelectedSauces}
            selectedToppings={selectedToppings}
            setSelectedToppings={setSelectedToppings}
            
            // Bevande
            selectedBeverages={selectedBeverages}
            setSelectedBeverages={setSelectedBeverages}
            
            // Backup
            backupOption={backupOption}
            setBackupOption={setBackupOption}
            backupIngredient={backupIngredient}
            setBackupIngredient={setBackupIngredient}
            
            // Allergie
            selectedAllergies={selectedAllergies}
            setSelectedAllergies={setSelectedAllergies}
            customAllergy={customAllergy}
            setCustomAllergy={setCustomAllergy}
            
            // Fascia oraria
            selectedSlot={selectedSlot}
            setSelectedSlot={setSelectedSlot}
            
            // Dati cliente
            customerData={customerData}
            setCustomerData={setCustomerData}
            previousCustomer={previousCustomer}
            previousOrder={previousOrder}
            
            // Extras
            wantsCutlery={wantsCutlery}
            setWantsCutlery={setWantsCutlery}
            wantsFloorDelivery={wantsFloorDelivery}
            setWantsFloorDelivery={setWantsFloorDelivery}
            tipAmount={tipAmount}
            setTipAmount={setTipAmount}
            
            // Sconto
            appliedDiscount={appliedDiscount}
            setAppliedDiscount={setAppliedDiscount}
            
            // Pagamento
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            
            // Funzioni
            toggleIngredient={toggleIngredient}
            toggleDoublePortions={toggleDoublePortions}
            calculateBowlPrice={calculateBowlPrice}
            calculateSubtotal={calculateSubtotal}
            calculateTotal={calculateTotal}
            addNewBowl={addNewBowl}
            editBowl={editBowl}
            deleteBowl={deleteBowl}
            
            // Navigazione
            nextStep={nextStep}
            prevStep={prevStep}
            goToStep={goToStep}
            activeSteps={activeSteps}
            
            // Conferma
            setShowConfirmPhone={setShowConfirmPhone}
          />
        )}
      </main>

      {/* Live Summary (Mobile) */}
      {currentStep >= activeSteps.findIndex(s => s.id === 'bowl-size') && 
       currentStep < activeSteps.findIndex(s => s.id === 'summary') && (
        <LiveSummary
          bowls={bowls}
          currentBowl={{
            bowlType: selectedBowlType,
            bases: selectedBases,
            proteins: selectedProteins,
            ingredients: selectedIngredients,
            sauces: selectedSauces,
            toppings: selectedToppings
          }}
          selectedBeverages={selectedBeverages}
          ingredients={ingredients}
          categories={categories}
          orderType={orderType}
          selectedZone={selectedZone}
          wantsFloorDelivery={wantsFloorDelivery}
          settings={settings}
          tipAmount={tipAmount}
          appliedDiscount={appliedDiscount}
          calculateTotal={calculateTotal}
        />
      )}

      {/* Popup Conferma Telefono */}
      {showConfirmPhone && (
        <ConfirmationPopups
          type="phone"
          phone={customerData.phone}
          onConfirm={() => {
            setShowConfirmPhone(false)
            setShowConfirmOrder(true)
          }}
          onCancel={() => setShowConfirmPhone(false)}
        />
      )}

      {/* Popup Conferma Ordine */}
      {showConfirmOrder && (
        <ConfirmationPopups
          type="order"
          onConfirm={() => {
            setShowConfirmOrder(false)
            sendWhatsAppOrder()
          }}
          onCancel={() => setShowConfirmOrder(false)}
        />
      )}
    </div>
  )
}

export default App
