import { useState, useCallback } from 'react'
import api from '../lib/api'

export function useMail() {
  const [folders, setFolders] = useState([])
  const [messages, setMessages] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadFolders = useCallback(async () => {
    try {
      const r = await api.get('/mail/folders')
      setFolders(r.data)
    } catch (e) { setError(e.message) }
  }, [])

  const loadMessages = useCallback(async (folder, page = 1) => {
    setLoading(true)
    try {
      const r = await api.get(`/mail/${encodeURIComponent(folder)}`, { params: { page } })
      setMessages(r.data.messages)
      setTotal(r.data.total)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  const fetchMessage = useCallback(async (folder, uid) => {
    const r = await api.get(`/mail/${encodeURIComponent(folder)}/${uid}`)
    return r.data
  }, [])

  const deleteMessage = useCallback(async (folder, uid) => {
    await api.delete(`/mail/${encodeURIComponent(folder)}/${uid}`)
  }, [])

  const moveMessage = useCallback(async (folder, uid, destination) => {
    await api.post('/mail/move', { folder, uid, destination })
  }, [])

  const setRead = useCallback(async (folder, uid, read) => {
    await api.patch(`/mail/${encodeURIComponent(folder)}/${uid}/read`, { read })
  }, [])

  const search = useCallback(async (q) => {
    const r = await api.get('/mail/search', { params: { q } })
    return r.data
  }, [])

  return { folders, messages, total, loading, error, loadFolders, loadMessages, fetchMessage, deleteMessage, moveMessage, setRead, search }
}
