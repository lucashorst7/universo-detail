import { useEffect, useState } from 'react'
import { Ban, Check } from 'lucide-react'
import { supabase, isConfigured } from '../../lib/supabase'
import { Spinner, EmptyState } from '../../components/Feedback'
import { Modal, Toast } from '../../components/AdminUI'
import { useAuth } from '../../lib/auth'
import type { UserProfile, BannedUser } from '../../types/database'

export function AdminMembersPage() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [banned, setBanned] = useState<BannedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [banUser, setBanUser] = useState<UserProfile | null>(null)
  const [banReason, setBanReason] = useState('')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const { session } = useAuth()

  async function load() {
    if (!isConfigured) { setLoading(false); return }
    const [u, b] = await Promise.all([
      supabase.from('user_profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('banned_users').select('*').order('created_at', { ascending: false }),
    ])
    setUsers((u.data || []) as UserProfile[])
    setBanned((b.data || []) as BannedUser[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function handleBan() {
    if (!banUser || !session) return
    const { error } = await supabase.from('banned_users').insert({
      user_id: banUser.user_id,
      reason: banReason,
      banned_by: session.user.id,
    })
    if (error) { setToast({ msg: error.message, type: 'error' }); return }
    setToast({ msg: 'Usuário banido!', type: 'success' })
    setBanUser(null)
    setBanReason('')
    load()
  }

  async function handleUnban(userId: string) {
    const { error } = await supabase.from('banned_users').delete().eq('user_id', userId)
    if (error) { setToast({ msg: error.message, type: 'error' }); return }
    setToast({ msg: 'Ban removido!', type: 'success' })
    load()
  }

  if (loading) return <Spinner label="Carregando membros..." />

  const bannedIds = new Set(banned.map((b) => b.user_id))

  return (
    <div>
      <div className="admin-page-head">
        <h1>Membros</h1>
        <p>Gerencie os usuários da comunidade</p>
      </div>
      {users.length === 0 ? (
        <EmptyState title="Nenhum membro" message="Não há usuários registrados." />
      ) : (
        <table className="admin-table">
          <thead><tr><th>Nome</th><th>Status</th><th>Ações</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.display_name}</td>
                <td>{bannedIds.has(u.user_id) ? <span className="badge badge-red">Banido</span> : <span className="badge badge-gold">Ativo</span>}</td>
                <td><div className="row-actions">
                  {bannedIds.has(u.user_id) ? (
                    <button className="btn btn-outline" onClick={() => handleUnban(u.user_id)}><Check size={14} /> Desbanir</button>
                  ) : (
                    <button className="btn btn-danger" onClick={() => setBanUser(u)}><Ban size={14} /> Banir</button>
                  )}
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal open={Boolean(banUser)} onClose={() => setBanUser(null)} title="Banir usuário">
        <div className="admin-form">
          <p style={{ fontSize: 14, color: 'var(--color-text-2)' }}>Banir <strong>{banUser?.display_name}</strong>?</p>
          <div className="form-group">
            <label>Motivo</label>
            <input value={banReason} onChange={(e) => setBanReason(e.target.value)} placeholder="Motivo do banimento" />
          </div>
          <button className="btn btn-danger" onClick={handleBan}>Confirmar banimento</button>
        </div>
      </Modal>
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
