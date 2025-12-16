// ============================================
// 🛡️ ERROR BOUNDARY - App non crasha MAI
// ============================================

import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md text-center">
            <div className="text-4xl mb-4">😔</div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">
              Qualcosa è andato storto
            </h1>
            <p className="text-gray-600 mb-4">
              Ci scusiamo per l'inconveniente. Ricarica la pagina per riprovare.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-green-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-600"
            >
              Ricarica Pagina
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
