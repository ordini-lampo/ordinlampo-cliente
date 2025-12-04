function BackupIngredient({ 
  categories,
  ingredients,
  backupOption, 
  setBackupOption,
  backupIngredient,
  setBackupIngredient,
  nextStep 
}) {
  const ingredientCategory = categories.find(c => c.name === 'ingredienti')
  const availableIngredients = ingredients.filter(i => i.category_id === ingredientCategory?.id)
  
  return (
    <div className="p-6 min-h-screen pb-48 animate-fadeIn">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        🔄 Ingrediente di riserva
      </h2>
      <p className="text-gray-500 mb-6">
        Se un ingrediente non fosse disponibile, come preferisci procedere?
      </p>
      
      <div className="space-y-3">
        {/* Opzione 1: Chef */}
        <button
          onClick={() => {
            setBackupOption('chef_choice')
            setBackupIngredient(null)
          }}
          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
            backupOption === 'chef_choice'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 bg-white hover:border-orange-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">👨‍🍳</span>
            <div>
              <p className="font-semibold text-gray-800">Sostituire a discrezione dello chef</p>
              <p className="text-sm text-gray-500">Lo chef sceglierà un ingrediente simile</p>
            </div>
          </div>
        </button>
        
        {/* Opzione 2: Contattami */}
        <button
          onClick={() => {
            setBackupOption('contact_me')
            setBackupIngredient(null)
          }}
          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
            backupOption === 'contact_me'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 bg-white hover:border-orange-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📞</span>
            <div>
              <p className="font-semibold text-gray-800">Contattarmi prima di procedere</p>
              <p className="text-sm text-gray-500">Ti chiameremo per decidere insieme</p>
            </div>
          </div>
        </button>
        
        {/* Opzione 3: Ingrediente specifico */}
        <button
          onClick={() => setBackupOption('specific')}
          className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
            backupOption === 'specific'
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 bg-white hover:border-orange-300'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🥗</span>
            <div>
              <p className="font-semibold text-gray-800">Usa questo ingrediente riserva</p>
              <p className="text-sm text-gray-500">Scegli tu l'alternativa</p>
            </div>
          </div>
        </button>
        
        {/* Dropdown ingrediente specifico */}
        {backupOption === 'specific' && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl animate-fadeIn">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleziona ingrediente riserva:
            </label>
            <select
              value={backupIngredient?.id || ''}
              onChange={(e) => {
                const ing = availableIngredients.find(i => i.id === parseInt(e.target.value))
                setBackupIngredient(ing || null)
              }}
              className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
            >
              <option value="">Seleziona...</option>
              {availableIngredients.map(ing => (
                <option key={ing.id} value={ing.id}>{ing.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      <button
        onClick={nextStep}
        disabled={backupOption === 'specific' && !backupIngredient}
        className={`w-full mt-8 py-4 rounded-xl font-bold text-lg transition-all ${
          backupOption && (backupOption !== 'specific' || backupIngredient)
            ? 'bg-orange-500 text-white hover:bg-orange-600'
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        Continua →
      </button>
    </div>
  )
}

export default BackupIngredient
