import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

interface Props {
  children: ReactNode
  fallbackTitle?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Banda Ecosystem ErrorBoundary] Uncaught runtime error:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null })
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-red-200 p-6 shadow-lg text-center">
            <div className="w-14 h-14 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center text-red-600">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-lg font-bold text-[#081d35] mb-2">
              {this.props.fallbackTitle || 'Terjadi Kendala pada Ruang Kerja Ini'}
            </h3>
            <p className="text-xs text-slate-600 mb-6 leading-relaxed">
              Komponen mengalami kesalahan saat merender tampilan. Anda dapat memuat ulang komponen atau kembali ke Beranda.
            </p>
            {this.state.error && (
              <div className="mb-6 p-3 bg-slate-50 rounded-lg text-left overflow-x-auto text-[11px] font-mono text-red-700 border border-slate-200">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="px-4 py-2 bg-[#081d35] text-amber-300 rounded-xl text-xs font-semibold hover:bg-[#0f2c59] transition-all flex items-center gap-1.5"
              >
                <RefreshCw size={14} />
                <span>Muat Ulang</span>
              </button>
              <button
                type="button"
                onClick={this.handleGoHome}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-all flex items-center gap-1.5"
              >
                <Home size={14} />
                <span>Ke Beranda</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
