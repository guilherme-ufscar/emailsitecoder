export default function SendMethodBadge({ method }) {
  if (!method) return null
  return method === 'resend'
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">&#10003; Enviado via Resend</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">&#10003; Enviado via SMTP</span>
}
