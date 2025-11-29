function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-orange-200 rounded-full animate-spin border-t-orange-500" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-3xl">🍜</span>
        </div>
      </div>
      <p className="mt-6 text-gray-600 font-medium">Caricamento menu...</p>
    </div>
  )
}

export default LoadingScreen
