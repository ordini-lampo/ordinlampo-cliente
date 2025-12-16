import { useState, useEffect, useCallback } from 'react'
import { trackAppOpen, trackCheckoutStart, trackWhatsAppClick } from './lib/analytics'

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
import UnifiedCheckoutPopup from './components/UnifiedCheckoutPopup'

// Componenti UI
import LiveSummary from './components/LiveSummary'
import StepIndicator from './components/StepIndicator'
import LoadingScreen from './components/LoadingScreen'
import ErrorScreen from './components/ErrorScreen'
import ClosedScreen from './components/ClosedScreen'

// ============================================
// 🔧 CONFIG - Edge Function URL
// ============================================
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY

// ============================================
// 🛡️ PATCH 1: Session Key BULLDOZER (mai "unknown")
// ============================================
function getSessionKeySafe() {
  try {
    const k = localStorage.getItem("ol_session_key")
    if (k && k.length > 20) return k
    const fresh =
      (crypto?.randomUUID?.() ?? String(Date.now())) +
      "-" +
      Math.random().toString(16).slice(2)
    localStorage.setItem("ol_session_key", fresh)
    return fresh
  } catch {
    return "fallback-" + Date.now() + "-" + Math.random().toString(16).slice(2)
  }
}

// ============================================
// 🛡️ PATCH 2: Dedup Key Generator
// ============================================
function newDedupKey() {
  return "chk_" + Date.now() + "_" + Math.random().toString(16).slice(2)
}

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
  const [showUnifiedCheckout, setShowUnifiedCheckout] = useState(false)
  
  // ============================================
  // 🛡️ PATCH 2: Dedup Key State (anti doppio ordine)
  // ============================================
  const [checkoutDedupKey, setCheckoutDedupKey] = useState(null)
  
  // ============================================
  // STATE - Ordine
  // ============================================
  const [orderType, setOrderType] = useState(null)
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
  const [specificIngredient1, setSpecificIngredient1] = useState('')
  const [specificIngredient2, setSpecificIngredient2] = useState('')
  
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
    ...(currentBowlIndex === 0 ? [{ id: 'time-slot', name: 'Orario', component: TimeSlot }] : []),
    { id: 'allergies', name: '⚠️ Allergie', component: AllergiesSelection, condition: () => settings?.enable_allergies && currentBowlIndex === 0 },
    { id: 'bowl-size', name: 'Taglia', component: BowlSize },
    { id: 'base', name: 'Base', component: BaseSelection },
    { id: 'proteins', name: 'Proteine', component: ProteinSelection },
    { id: 'ingredients', name: 'Ingredienti', component: IngredientsSelection },
    { id: 'sauces', name: 'Salse', component: SauceSelection },
    { id: 'toppings', name: 'Topping', component: ToppingSelection },
    { id: 'beverages', name: 'Bevande', component: BeveragesSelection },
    { id: 'backup', name: 'Riserva', component: BackupIngredient, condition: () => settings?.enable_backup_ingredient },
    { id: 'customer', name: 'Dati', component: CustomerData },
    { id: 'extras', name: 'Extra', component: ExtrasSelection },
    { id: 'discount', name: 'Sconto', component: DiscountCode },
    { id: 'payment', name: 'Pagamento', component: PaymentMethod },
    { id: 'summary', name: 'Riepilogo', component: OrderSummary }
  ]
  
  // Filtra steps attivi
  const activeSteps = steps.filter(step => !step.condition || step.condition())

  // ============================================
  // 🛡️ PATCH 4: Fail-fast se mancano env
  // ============================================
  useEffect(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON) {
      setError("Configurazione mancante. Contatta il supporto.")
      console.error("MISSING ENV: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY")
    }
  }, [])

  // ============================================
  // 🛡️ PATCH 3: Clamp step (anti schermo vuoto)
  // ============================================
  useEffect(() => {
    if (currentStep < 0 || currentStep >= activeSteps.length) {
      setCurrentStep(0)
    }
  }, [activeSteps.length, currentStep])

  // ============================================
  // 🛡️ PATCH 2: Dedup key stabile per checkout
  // ============================================
  useEffect(() => {
    if (showUnifiedCheckout && !checkoutDedupKey) {
      setCheckoutDedupKey(newDedupKey())
    }
    if (!showUnifiedCheckout) {
      setCheckoutDedupKey(null)
    }
  }, [showUnifiedCheckout, checkoutDedupKey])

  // ============================================
  // CARICAMENTO DATI INIZIALE
  // ============================================
  useEffect(() => {
    loadRestaurantData()
  }, [])

  // 🛡️ LOCAL STORAGE SAVER - Salva carrello automaticamente
  useEffect(() => {
    if (bowls.length > 0) {
      localStorage.setItem("ordinlampo_bowls", JSON.stringify(bowls))
    }
  }, [bowls])

  // 🛡️ LOCAL STORAGE COMPLETO - Salva TUTTO in tempo reale
  useEffect(() => {
    if (selectedProteins.length > 0) {
      localStorage.setItem("ordinlampo_proteins", JSON.stringify(selectedProteins))
    }
  }, [selectedProteins])

  useEffect(() => {
    if (selectedIngredients.length > 0) {
      localStorage.setItem("ordinlampo_ingredients", JSON.stringify(selectedIngredients))
    }
  }, [selectedIngredients])

  useEffect(() => {
    if (selectedSauces.length > 0) {
      localStorage.setItem("ordinlampo_sauces", JSON.stringify(selectedSauces))
    }
  }, [selectedSauces])

  useEffect(() => {
    if (selectedToppings.length > 0) {
      localStorage.setItem("ordinlampo_toppings", JSON.stringify(selectedToppings))
    }
  }, [selectedToppings])

  useEffect(() => {
    if (selectedBowlType) {
      localStorage.setItem("ordinlampo_bowltype", JSON.stringify(selectedBowlType))
    }
  }, [selectedBowlType])

  useEffect(() => {
    if (selectedBases.length > 0) {
      localStorage.setItem("ordinlampo_bases", JSON.stringify(selectedBases))
    }
  }, [selectedBases])

  useEffect(() => {
    localStorage.setItem("ordinlampo_halfhalf", JSON.stringify(isHalfHalf))
  }, [isHalfHalf])

  useEffect(() => {
    if (selectedAllergies.length > 0) {
      localStorage.setItem("ordinlampo_allergies", JSON.stringify(selectedAllergies))
    }
  }, [selectedAllergies])

  useEffect(() => {
    if (specificIngredient1) {
      localStorage.setItem("ordinlampo_specific1", specificIngredient1)
    }
  }, [specificIngredient1])

  useEffect(() => {
    if (specificIngredient2) {
      localStorage.setItem("ordinlampo_specific2", specificIngredient2)
    }
  }, [specificIngredient2])

  useEffect(() => {
    if (orderType) {
      localStorage.setItem("ordinlampo_ordertype", orderType)
    }
  }, [orderType])

  useEffect(() => {
    if (selectedZone) {
      localStorage.setItem("ordinlampo_zone", JSON.stringify(selectedZone))
    }
  }, [selectedZone])

  useEffect(() => {
    if (currentStep > 0) {
      localStorage.setItem("ordinlampo_step", currentStep.toString())
    }
  }, [currentStep])

  useEffect(() => {
    if (backupOption) {
      localStorage.setItem("ordinlampo_backup", backupOption)
    }
  }, [backupOption])

  useEffect(() => {
    if (selectedSlot) {
      localStorage.setItem("ordinlampo_slot", JSON.stringify(selectedSlot))
    }
  }, [selectedSlot])

  useEffect(() => {
    if (paymentMethod) {
      localStorage.setItem("ordinlampo_payment", paymentMethod)
    }
  }, [paymentMethod])

  useEffect(() => {
    if (Object.keys(selectedBeverages).length > 0) {
      localStorage.setItem("ordinlampo_beverages", JSON.stringify(selectedBeverages))
    }
  }, [selectedBeverages])

  useEffect(() => {
    if (customerData.phone || customerData.name) {
      localStorage.setItem("ordinlampo_customer", JSON.stringify(customerData))
    }
  }, [customerData])

  // 🛡️ LOCAL STORAGE LOADER - Ripristina tutto al caricamento
  useEffect(() => {
    const savedBowls = localStorage.getItem("ordinlampo_bowls")
    const savedBeverages = localStorage.getItem("ordinlampo_beverages")
    const savedCustomer = localStorage.getItem("ordinlampo_customer")
    const savedProteins = localStorage.getItem("ordinlampo_proteins")
    const savedIngredients = localStorage.getItem("ordinlampo_ingredients")
    const savedSauces = localStorage.getItem("ordinlampo_sauces")
    const savedToppings = localStorage.getItem("ordinlampo_toppings")
    const savedBowlType = localStorage.getItem("ordinlampo_bowltype")
    const savedBases = localStorage.getItem("ordinlampo_bases")
    const savedHalfHalf = localStorage.getItem("ordinlampo_halfhalf")
    const savedAllergies = localStorage.getItem("ordinlampo_allergies")
    const savedSpecific1 = localStorage.getItem("ordinlampo_specific1")
    const savedSpecific2 = localStorage.getItem("ordinlampo_specific2")
    const savedOrderType = localStorage.getItem("ordinlampo_ordertype")
    const savedZone = localStorage.getItem("ordinlampo_zone")
    const savedStep = localStorage.getItem("ordinlampo_step")
    const savedBackup = localStorage.getItem("ordinlampo_backup")
    const savedSlot = localStorage.getItem("ordinlampo_slot")
    const savedPayment = localStorage.getItem("ordinlampo_payment")
    
    if (savedBowls) {
      try { setBowls(JSON.parse(savedBowls)) } catch(e) {}
    }
    if (savedBeverages) {
      try { setSelectedBeverages(JSON.parse(savedBeverages)) } catch(e) {}
    }
    if (savedCustomer) {
      try { setCustomerData(prev => ({...prev, ...JSON.parse(savedCustomer)})) } catch(e) {}
    }
    if (savedProteins) {
      try { setSelectedProteins(JSON.parse(savedProteins)) } catch(e) {}
    }
    if (savedIngredients) {
      try { setSelectedIngredients(JSON.parse(savedIngredients)) } catch(e) {}
    }
    if (savedSauces) {
      try { setSelectedSauces(JSON.parse(savedSauces)) } catch(e) {}
    }
    if (savedToppings) {
      try { setSelectedToppings(JSON.parse(savedToppings)) } catch(e) {}
    }
    if (savedBowlType) {
      try { setSelectedBowlType(JSON.parse(savedBowlType)) } catch(e) {}
    }
    if (savedBases) {
      try { setSelectedBases(JSON.parse(savedBases)) } catch(e) {}
    }
    if (savedHalfHalf) {
      try { setIsHalfHalf(JSON.parse(savedHalfHalf)) } catch(e) {}
    }
    if (savedAllergies) {
      try { setSelectedAllergies(JSON.parse(savedAllergies)) } catch(e) {}
    }
    if (savedSpecific1) {
      setSpecificIngredient1(savedSpecific1)
    }
    if (savedSpecific2) {
      setSpecificIngredient2(savedSpecific2)
    }
    if (savedOrderType) {
      setOrderType(savedOrderType)
    }
    if (savedZone) {
      try { setSelectedZone(JSON.parse(savedZone)) } catch(e) {}
    }
    if (savedStep) {
      try { setCurrentStep(parseInt(savedStep)) } catch(e) {}
    }
    if (savedBackup) {
      setBackupOption(savedBackup)
    }
    if (savedSlot) {
      try { setSelectedSlot(JSON.parse(savedSlot)) } catch(e) {}
    }
    if (savedPayment) {
      setPaymentMethod(savedPayment)
    }
  }, [])

  // ============================================
  // 🚀 BULLDOZER: loadRestaurantData via Edge Function
  // ============================================
  const loadRestaurantData = async () => {
    try {
      setLoading(true)
      
      const urlParams = new URLSearchParams(window.location.search)
      const slug = (urlParams.get('r') || 'pokenjoy-sanremo').trim()
      
      // 🚀 1 SOLA CHIAMATA invece di 8 query!
      const res = await fetch(
        SUPABASE_URL + "/functions/v1/get-restaurant-bundle?slug=" + encodeURIComponent(slug),
        {
          method: "GET",
          headers: {
            "Authorization": "Bearer " + SUPABASE_ANON,
          },
        }
      )

      const data = await res.json()

      if (!res.ok) {
        console.error("Bundle load failed:", data)
        throw new Error(data?.error || "Errore caricamento ristorante")
      }

      // Set state (tutto in un colpo!)
      setRestaurant(data.restaurant)
      setSettings(data.settings || {})
      setLocations(data.locations || [])
      setBowlTypes(data.bowl_types || [])
      setCategories(data.categories || [])
      setIngredients(data.ingredients || [])
      setOpeningHours(data.opening_hours || [])
      setSpecialClosures(data.special_closures || [])
      setDiscountCodes(data.discount_codes || [])

      // Analytics
      trackAppOpen(data.restaurant.id)

      // Carica cliente precedente via Edge
      loadPreviousCustomer(data.restaurant.id)
      
    } catch (err) {
      console.error('Errore caricamento:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // 🚀 BULLDOZER: loadPreviousCustomer via Edge Function
  // ============================================
  const loadPreviousCustomer = async (restaurantId) => {
    try {
      const savedPhone = localStorage.getItem("ordinlampo_phone_" + restaurantId)
      const savedPhoneHash = localStorage.getItem("ordinlampo_phonehash_" + restaurantId)
      if (!savedPhone && !savedPhoneHash) return

      const body = {
        restaurant_id: restaurantId,
        ...(savedPhoneHash ? { phone_hash: savedPhoneHash } : { phone: savedPhone }),
      }

      const res = await fetch(SUPABASE_URL + "/functions/v1/customer-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + SUPABASE_ANON,
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) return

      setPreviousCustomer(data.customer || null)
      setPreviousOrder(data.last_order_data || null)

      // Cache hash per le prossime volte
      if (data.phone_hash) {
        localStorage.setItem("ordinlampo_phonehash_" + restaurantId, data.phone_hash)
      }
    } catch {
      // Best-effort: non rompere mai l'app
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
    
    const PROTEIN_EXTRA_PRICE = 2.50
    bowl.proteins?.forEach(p => {
      if (p.extraPortions && p.extraPortions > 0) {
        price += p.extraPortions * PROTEIN_EXTRA_PRICE
      }
      if (p.isDouble) {
        const proteinCategory = categories.find(c => c.name === 'proteine')
        price += proteinCategory?.double_portion_price || 0
      }
    })
    
    const proteinCategory = categories.find(c => c.name === 'proteine')
    if (proteinCategory) {
      const extraProteins = (bowl.proteins?.length || 0) - proteinCategory.max_selections
      if (extraProteins > 0) price += extraProteins * (proteinCategory.extra_price || 0)
    }
    
    const INGREDIENT_EXTRA_PRICE = 1.50
    bowl.ingredients?.forEach(i => {
      if (i.extraPortions && i.extraPortions > 0) {
        price += i.extraPortions * INGREDIENT_EXTRA_PRICE
      }
      if (i.isDouble) {
        const ingredientsCategory = categories.find(c => c.name === 'ingredienti')
        price += ingredientsCategory?.double_portion_price || 0
      }
    })
    
    const ingredientsCategory = categories.find(c => c.name === 'ingredienti')
    if (ingredientsCategory) {
      const extraIngredients = (bowl.ingredients?.length || 0) - ingredientsCategory.max_selections
      if (extraIngredients > 0) price += extraIngredients * (ingredientsCategory.extra_price || 0)
    }
    
    const SAUCE_EXTRA_PRICE = 0.80
    bowl.sauces?.forEach(s => {
      if (s.extraPortions && s.extraPortions > 0) {
        price += s.extraPortions * SAUCE_EXTRA_PRICE
      }
    })
    
    const sauceCategory = categories.find(c => c.name === 'salse')
    if (sauceCategory) {
      const extraSauces = (bowl.sauces?.length || 0) - sauceCategory.max_selections
      if (extraSauces > 0) price += extraSauces * (sauceCategory.extra_price || 0)
    }
    
    const TOPPING_EXTRA_PRICE = 2.00
    bowl.toppings?.forEach(t => {
      if (t.extraPortions && t.extraPortions > 0) {
        price += t.extraPortions * TOPPING_EXTRA_PRICE
      }
      if (t.isDouble) {
        const toppingCategory = categories.find(c => c.name === 'topping')
        price += toppingCategory?.double_portion_price || 0
      }
    })
    
    const toppingCategory = categories.find(c => c.name === 'topping')
    if (toppingCategory) {
      const extraToppings = (bowl.toppings?.length || 0) - toppingCategory.max_selections
      if (extraToppings > 0) price += extraToppings * (toppingCategory.extra_price || 0)
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
    const currentBowlPrice = currentBowlIndex >= bowls.length ? calculateBowlPrice({
      bowlType: selectedBowlType,
      proteins: selectedProteins,
      ingredients: selectedIngredients,
      sauces: selectedSauces,
      toppings: selectedToppings
    }) : 0
    
    const savedBowlsPrice = bowls.reduce((sum, bowl) => sum + calculateBowlPrice(bowl), 0)
    const beveragesPrice = calculateBeveragesPrice()
    
    return currentBowlPrice + savedBowlsPrice + beveragesPrice
  }, [bowls, currentBowlIndex, selectedBowlType, selectedProteins, selectedIngredients, selectedSauces, selectedToppings, calculateBowlPrice, calculateBeveragesPrice])

  const calculateTotal = useCallback(() => {
    let total = calculateSubtotal()
    
    if (orderType === 'delivery' && selectedZone) {
      total += parseFloat(selectedZone.delivery_fee) || 0
    }
    
    if (wantsFloorDelivery && settings?.floor_delivery_price) {
      total += parseFloat(settings.floor_delivery_price) || 0
    }
    
    if (appliedDiscount) {
      if (appliedDiscount.discount_type === 'percentage') {
        total -= total * (appliedDiscount.discount_value / 100)
      } else {
        total -= appliedDiscount.discount_value
      }
    }
    
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
      setSelection(selection.filter(s => s.id !== ingredient.id))
    } else if (selection.length < maxCount || maxCount === 99) {
      setSelection([...selection, { ...ingredient, isDouble: false }])
    }
  }
  
  const toggleDoublePortions = (ingredientId, selection, setSelection) => {
    setSelection(selection.map(s => 
      s.id === ingredientId ? { ...s, isDouble: !s.isDouble } : s
    ))
  }

  // ============================================
  // 🚀 INVIO ORDINE - BULLDOZER (via Edge Function)
  // ============================================
  const sendWhatsAppOrder = async () => {
    if (!restaurant?.id) return

    const payload = {
      restaurant_id: restaurant.id,
      session_key: getSessionKeySafe(),
      client_dedup_key: checkoutDedupKey || newDedupKey(),
      order_type: orderType,
      selected_slot: selectedSlot,
      customer_data: customerData,
      cart_payload: {
        bowls,
        selectedBowlType,
        selectedBases,
        isHalfHalf,
        selectedProteins,
        selectedIngredients,
        selectedSauces,
        selectedToppings,
        selectedBeverages,
        backupOption,
        backupIngredient,
        selectedAllergies,
        customAllergy,
        wantsCutlery,
        wantsFloorDelivery,
        tipAmount,
        appliedDiscount,
        paymentMethod,
        selectedZone,
      },
      client_totals: {
        total: calculateTotal(),
        subtotal: calculateSubtotal(),
        delivery_fee: orderType === "delivery" && selectedZone ? Number(selectedZone.delivery_fee || 0) : 0,
        discount_amount: appliedDiscount?.discount_value || 0,
      },
    }

    try {
      const response = await fetch(SUPABASE_URL + "/functions/v1/finalize-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + SUPABASE_ANON,
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error("Finalize order error:", result)
        alert("Errore durante l'invio dell'ordine. Riprova.")
        return
      }

      // Salva telefono e hash per ordini futuri
      localStorage.setItem("ordinlampo_phone_" + restaurant.id, customerData.phone)
      if (result.phone_hash) {
        localStorage.setItem("ordinlampo_phonehash_" + restaurant.id, result.phone_hash)
      }

      // Track analytics (fire-and-forget)
      trackWhatsAppClick(restaurant.id, calculateTotal())

      // Apri WhatsApp con URL dal server
      window.open(result.whatsapp_url, "_blank")

    } catch (err) {
      console.error("Errore invio ordine:", err)
      alert("Errore di connessione. Controlla la tua rete e riprova.")
    }
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
      <main className={"max-w-lg mx-auto " + (currentStep > 0 ? "pb-32" : "")}>
        {CurrentStepComponent && (
          <CurrentStepComponent
            restaurant={restaurant}
            settings={settings}
            locations={locations}
            bowlTypes={bowlTypes}
            categories={categories}
            ingredients={ingredients}
            openingHours={openingHours}
            discountCodes={discountCodes}
            
            orderType={orderType}
            setOrderType={setOrderType}
            selectedZone={selectedZone}
            setSelectedZone={setSelectedZone}
            
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
            
            selectedBeverages={selectedBeverages}
            setSelectedBeverages={setSelectedBeverages}
            
            backupOption={backupOption}
            setBackupOption={setBackupOption}
            backupIngredient={backupIngredient}
            setBackupIngredient={setBackupIngredient}
            
            selectedAllergies={selectedAllergies}
            setSelectedAllergies={setSelectedAllergies}
            customAllergy={customAllergy}
            setCustomAllergy={setCustomAllergy}
            specificIngredient1={specificIngredient1}
            setSpecificIngredient1={setSpecificIngredient1}
            specificIngredient2={specificIngredient2}
            setSpecificIngredient2={setSpecificIngredient2}
            
            selectedSlot={selectedSlot}
            setSelectedSlot={setSelectedSlot}
            
            customerData={customerData}
            setCustomerData={setCustomerData}
            previousCustomer={previousCustomer}
            previousOrder={previousOrder}
            
            wantsCutlery={wantsCutlery}
            setWantsCutlery={setWantsCutlery}
            wantsFloorDelivery={wantsFloorDelivery}
            setWantsFloorDelivery={setWantsFloorDelivery}
            tipAmount={tipAmount}
            setTipAmount={setTipAmount}
            
            appliedDiscount={appliedDiscount}
            setAppliedDiscount={setAppliedDiscount}
            
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            
            toggleIngredient={toggleIngredient}
            toggleDoublePortions={toggleDoublePortions}
            calculateBowlPrice={calculateBowlPrice}
            calculateSubtotal={calculateSubtotal}
            calculateTotal={calculateTotal}
            addNewBowl={addNewBowl}
            editBowl={editBowl}
            deleteBowl={deleteBowl}
            
            nextStep={nextStep}
            prevStep={prevStep}
            goToStep={goToStep}
            activeSteps={activeSteps}
            
            setShowUnifiedCheckout={setShowUnifiedCheckout}
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

      {/* Unified Checkout Popup */}
      {showUnifiedCheckout && (
        <UnifiedCheckoutPopup
          customerData={customerData}
          orderType={orderType}
          restaurant={restaurant}
          onConfirm={sendWhatsAppOrder}
          onCancel={() => setShowUnifiedCheckout(false)}
        />
      )}
    </div>
  )
}

export default App
