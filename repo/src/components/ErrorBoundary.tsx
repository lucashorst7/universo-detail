import { Component, type ReactNode } from 'react';
import { reportRuntimeError } from '../lib/errorReporting';
interface Props { children: ReactNode; } interface State { hasError: boolean; }
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  static getDerivedStateFromError(): State { return { hasError: true }; }
  componentDidCatch(error: Error, info: { componentStack?: string }) { reportRuntimeError({ source: 'react-error-boundary', message: error.message, stack: error.stack, component_stack: info.componentStack, route: window.location.pathname }); }
  render() { if (this.state.hasError) return <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-ink-950 text-center"><h1 className="text-2xl font-bold text-white">Ops! Algo deu errado.</h1><p className="text-gray-400">O erro foi reportado. Tente recarregar a página.</p><button onClick={() => window.location.reload()} className="rounded-lg bg-gold-500 px-6 py-2.5 text-sm font-semibold text-ink-950">Recarregar</button></div>; return this.props.children; }
}
