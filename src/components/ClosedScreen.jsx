function ClosedScreen({ message, restaurant }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="text-center max-w-sm">
        {/* Logo */}
        {restaurant?.logo_url ? (
          <img 
            src={restaurant.logo_url} 
            alt={restaurant.name}
            className="w-24 h-24 object-contain mx-auto mb-6"
          />
        ) : (
          <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🍜</span>
          </div>
        )}

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {restaurant?.name || 'Ristorante'}
        </h1>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
          <span className="text-4xl mb-2 block">😴</span>
          <p className="text-yellow-800 font-medium">
            {message || 'Al momento non accettiamo ordini'}
          </p>
        </div>

        <p className="text-gray-500 text-sm">
          Torna a trovarci più tardi!
        </p>

        {/* Contatti */}
        {restaurant?.phone && (
          <a
            href={`tel:${restaurant.phone}`}
            className="mt-6 inline-flex items-center gap-2 text-orange-500 font-medium"
          >
            📞 Chiamaci: {restaurant.phone}
          </a>
        )}
      </div>
    </div>
  )
}

export default ClosedScreen
