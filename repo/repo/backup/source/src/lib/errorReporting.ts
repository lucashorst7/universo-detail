import { supabase } from './supabase';
interface ReportRuntimeErrorParams { source: string; message: string; stack?: string | null; component_stack?: string | null; route?: string | null; incident_code?: string; actor_id?: string | null; }
export async function reportRuntimeError(params: ReportRuntimeErrorParams): Promise<string | null> {
  try { const { data } = await supabase.rpc('report_runtime_error', { p_incident_code: params.incident_code ?? null, p_actor_id: params.actor_id ?? null, p_source: params.source, p_message: params.message, p_stack: params.stack ?? null, p_component_stack: params.component_stack ?? null, p_route: params.route ?? null }); return data as string | null; } catch { return null; }
}
export function setupGlobalErrorHandlers() {
  window.addEventListener('error', (e) => { reportRuntimeError({ source: 'window.error', message: e.message, stack: e.error?.stack, route: window.location.pathname }); });
  window.addEventListener('unhandledrejection', (e) => { reportRuntimeError({ source: 'unhandledrejection', message: String(e.reason), route: window.location.pathname }); });
}
