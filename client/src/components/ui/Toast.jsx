import { useState, useEffect } from 'react'

let toastFn = null
export function showToast(message, type = 'success') {
  if (toastFn) toastFn({ message, type })
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    toastFn = ({ message, type }) => {
      const id = Date.now()
      setToasts(t => [...t, { id, message, type }])
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
    }
    return () => { toastFn = null }
  }, [])

  const colors = { success: 'bg-green-600', error: 'bg-red-600', info: 'bg-brand-900' }
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map(t => (
        <div key={t.id} className={`${colors[t.type]} text-white px-4 py-3 rounded-xl shadow-lg text-sm max-w-xs animate-fade-in`}>
          {t.message}
        </div>
      ))}
    </div>
  )
}
