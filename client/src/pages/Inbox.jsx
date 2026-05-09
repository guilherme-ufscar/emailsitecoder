import { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useMail } from '../hooks/useMail'
import MessageList from '../components/mail/MessageList'
import MessagePane from '../components/mail/MessagePane'

export default function Inbox() {
  const { activeFolder, loadFolders, setComposeOpen } = useOutletContext()
  const { messages, loading, loadMessages, loadFolders: loadF } = useMail()
  const [selectedMsg, setSelectedMsg] = useState(null)

  useEffect(() => {
    loadMessages(activeFolder || 'INBOX')
    loadF()
  }, [activeFolder])

  return (
    <div className="flex h-full">
      <div className="w-80 border-r border-gray-100 overflow-y-auto shrink-0">
        <MessageList
          messages={messages}
          loading={loading}
          selectedUid={selectedMsg?.uid}
          onSelect={setSelectedMsg}
        />
      </div>
      <div className="flex-1 overflow-hidden">
        <MessagePane
          folder={activeFolder || 'INBOX'}
          uid={selectedMsg?.uid}
          onClose={() => setSelectedMsg(null)}
        />
      </div>
    </div>
  )
}
