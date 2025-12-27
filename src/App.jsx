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

const WORKER_URL = 'https://ordini-lampo-api.ordini-lampo.workers.dev'
// SUPABASE_ANON non più necessario - Worker pubblico

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

function newDedupKey() {
  return "chk_" + Date.now() + "_" + Math.random().toString(16).slice(2)
}

function App() {
  const [restaurant, setRestaurant] = useState(null)
  const [settings, setSettings] = useState(null)
  const [locations, setLocations] = useState([])
  const [bowlTypes, setBowlTypes] = useState([])
  const [categories, setCategories] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [openingHours, setOpeningHours] = useState([])
  const [specialClosures, setSpecialClosures] = useState([])
  const [discountCodes, setDiscountCodes] = useState([])
  const [slotAvailability, setSlotAvailability] = useState({})
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isClosed, setIsClosed] = useState(false)
  const [closedMessage, setClosedMessage] = useState('')
  
  const [currentStep, setCurrentStep] = useState(0)
  const [showUnifiedCheckout, setShowUnifiedCheckout] = useState(false)
  const [checkoutDedupKey, setCheckoutDedupKey] = useState(null)
  
  const [orderType, setOrderType] = useState(null)
  const [selectedZone, setSelectedZone] = useState(null)
  
  const [bowls, setBowls] = useState([])
  const [currentBowlIndex, setCurrentBowlIndex] = useState(0)
  
  const [selectedBowlType, setSelectedBowlType] = useState(null)
  const [selectedBases, setSelectedBases] = useState([])
  const [isHalfHalf, setIsHalfHalf] = useState(false)
  const [selectedProteins, setSelectedProteins] = useState([])
  const [selectedIngredients, setSelectedIngredients] = useState([])
  const [selectedSauces, setSelectedSauces] = useState([])
  const [selectedToppings, setSelectedToppings] = useState([])
  
  const [selectedBeverages, setSelectedBeverages] = useState({})
  
  const [backupOption, setBackupOption] = useState('chef_choice')
  const [backupIngredient, setBackupIngredient] = useState(null)
  
  const [selectedAllergies, setSelectedAllergies] = useState([])
  const [customAllergy, setCustomAllergy] = useState('')
  const [specificIngredient1, setSpecificIngredient1] = useState('')
  const [specificIngredient2, setSpecificIngredient2] = useState('')
  
  const [selectedSlot, setSelectedSlot] = useState(null)
  
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
  
  const [wantsCutlery, setWantsCutlery] = useState(false)
  const [wantsFloorDelivery, setWantsFloorDelivery] = useState(false)
  const [tipAmount, setTipAmount] = useState(0)
  
  const [appliedDiscount, setAppliedDiscount] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState(null)
  
  const [previousCustomer, setPreviousCustomer] = useState(null)
  const [previousOrder, setPreviousOrder] = useState(null)

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
  
  const activeSteps = steps.filter(step => !step.condition || step.condition())

  useEffect(() => {
    if (false) {
      setError("Configurazione mancante. Contatta il supporto.")
      // Worker URL hardcoded
    }
  }, [])

  useEffect(() => {
    if (currentStep < 0 || currentStep >= activeSteps.length) {
      setCurrentStep(0)
    }
  }, [activeSteps.length, currentStep])

  useEffect(() => {
    if (showUnifiedCheckout && !checkoutDedupKey) {
      setCheckoutDedupKey(newDedupKey())
    }
    if (!showUnifiedCheckout) {
      setCheckoutDedupKey(null)
    }
  }, [showUnifiedCheckout, checkoutDedupKey])

  useEffect(() => {
    loadRestaurantData()
  }, [])

  useEffect(() => {
    if (bowls.length > 0) {
      localStorage.setItem("ordinlampo_bowls", JSON.stringify(bowls))
    }
  }, [bowls])

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

  const loadRestaurantData = async () => {
    try {
      setLoading(true)
      
      const urlParams = new URLSearchParams(window.location.search)
  const slug = urlParams.get('r')?.trim()
if (!slug) {
  throw new Error("URL non valido. Usa ?r=nome-ristorante")
}
      
      const res = await fetch(
        WORKER_URL + "/poke/" + encodeURIComponent(slug) + "/bundle",
        {
          method: "GET",
          headers: {
            
          },
        }
      )

      const data = await res.json()
      if (!res.ok) {
        console.error("Bundle load failed:", data)
        throw new Error(data?.error || "Errore caricamento ristorante")
      }

      setRestaurant(data.data.restaurant)
      setSettings(data.data.settings || {})
      setLocations(data.data.locations || [])
      setBowlTypes(data.data.bowl_types || [])
      setCategories(data.data.categories || [])
      setIngredients(data.data.ingredients || [])
      setOpeningHours(data.data.opening_hours || [])
      setSpecialClosures(data.data.special_closures || [])
      setDiscountCodes(data.data.discount_codes || [])

      trackAppOpen(data.data.restaurant.id)

      try {
        const todayDate = new Date().toISOString().slice(0, 10);
        const availRes = await fetch(WORKER_URL + "/poke/" + slug + "/slots?date=" + todayDate);
        const availData = await availRes.json();
        if (availData?.availability) {
          setSlotAvailability(availData.availability);
        }
      } catch (err) {
        console.log("Slot availability non disponibile:", err)
      }

      loadPreviousCustomer(data.data.restaurant.id)
      
    } catch (err) {
      console.error('Errore caricamento:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadPreviousCustomer = async (restaurantId) => {
    try {
      const savedPhone = localStorage.getItem("ordinlampo_phone_" + restaurantId)
      const savedPhoneHash = localStorage.getItem("ordinlampo_phonehash_" + restaurantId)
      if (!savedPhone && !savedPhoneHash) return

      const body = {
        restaurant_id: restaurantId,
        ...(savedPhoneHash ? { phone_hash: savedPhoneHash } : { phone: savedPhone }),
      }

      const res = await fetch(WORKER_URL + "/poke/" + slug + "/customer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) return

      setPreviousCustomer(data.customer || null)
      setPreviousOrder(data.last_order_data || null)

      if (data.phone_hash) {
        localStorage.setItem("ordinlampo_phonehash_" + restaurantId, data.phone_hash)
      }
    } catch {
    }
  }

  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < activeSteps.length) {
      setCurrentStep(stepIndex)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  
  const nextStep = () => goToStep(currentStep + 1)
  const prevStep = () => goToStep(currentStep - 1)

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

  const sendWhatsAppOrder = async () => {
    const slug = new URLSearchParams(window.location.search).get('r')?.trim();
    if (!restaurant?.id) return
    // Transform to Worker format
    const customer_name = (customerData.name + " " + customerData.surname).trim();
    const customer_phone = customerData.phone.startsWith("+") ? customerData.phone : "+39" + customerData.phone;
    const delivery_address = customerData.address + " " + customerData.civic + ", " + customerData.city;
    const delivery_time = selectedSlot?.time?.split("-")[0] || "19:00";
    
    // Build bowls array for Worker
    const workerBowls = [{
      bowl_type_id: selectedBowlType?.id,
      bowl_type_name: selectedBowlType?.name || "Regular",
      base: selectedBases.map(b => ({ name: b.name })),
      proteine: selectedProteins.map(p => ({ name: p.name, qty: p.quantity || 1 })),
      verdure: selectedIngredients.map(i => ({ name: i.name, qty: i.quantity || 1 })),
      salse: selectedSauces.map(s => ({ name: s.name, qty: s.quantity || 1 })),
      toppings: selectedToppings.map(t => ({ name: t.name, qty: t.quantity || 1 })),
      extras_total: 0
    }];
    
    // Allergie string
    const allergieList = [...(selectedAllergies || []).map(a => a.name), customAllergy].filter(Boolean);
    
    const payload = {
      customer_name,
      customer_phone,
      delivery_address,
      citofono: customerData.doorbell,
      location_id: selectedZone?.id,
      delivery_time,
      delivery_date: selectedSlot?.dateKey,
      payment_method: paymentMethod || "Contanti",
      posate_richieste: wantsCutlery,
      consegna_piano: wantsFloorDelivery,
      allergie: allergieList.join(", "),
      riserva: backupOption === "chef" ? "Lascia decidere allo chef" : backupIngredient?.name || "",
      mancia: tipAmount,
      note: customerData.notesOrder,
      bowls: workerBowls
    };
    try {
      const response = await fetch(WORKER_URL + "/poke/" + slug + "/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        console.error("Finalize order error:", result)
        alert("Errore durante l'invio dell'ordine. Riprova.")
        return
      }

      localStorage.setItem("ordinlampo_phone_" + restaurant.id, customerData.phone)
      if (result.phone_hash) {
        localStorage.setItem("ordinlampo_phonehash_" + restaurant.id, result.phone_hash)
      }

      trackWhatsAppClick(restaurant.id, calculateTotal())

      window.open(result.whatsapp?.deeplink, "_blank")

    } catch (err) {
      console.error("Errore invio ordine:", err)
      alert("Errore di connessione. Controlla la tua rete e riprova.")
    }
  }

  if (loading) return <LoadingScreen />
  if (error) return <ErrorScreen message={error} />
  if (isClosed) return <ClosedScreen message={closedMessage} restaurant={restaurant} />

  const CurrentStepComponent = activeSteps[currentStep]?.component

  return (
    <div className="min-h-screen bg-gray-50">
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
            specialClosures={specialClosures}
            discountCodes={discountCodes}
            slotAvailability={slotAvailability}
            
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
