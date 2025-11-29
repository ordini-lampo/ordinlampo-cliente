function ErrorScreen({ message }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="text-center">
        <span className="text-6xl mb-6 block">😢</span>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Oops! Qualcosa è andato storto
        </h1>
        <p className="text-gray-500 mb-6">
          {message || 'Si è verificato un errore durante il caricamento.'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
        >
          Riprova
        </button>
      </div>
    </div>
  )
}

export default ErrorScreen
