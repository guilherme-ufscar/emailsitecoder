import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useMail } from '../../hooks/useMail'
import ComposeModal from '../mail/ComposeModal'

const titles = {
  '/inbox': 'Inbox',
  '/todos': 'Tarefas',
  '/calendar': 'Agenda',
  '/kanban': 'Kanban',
  '/notes': 'Notas',
  '/contacts': 'Contatos',
  '/settings': 'Configurações',
}

export default function AppShell() {
  const [composeOpen, setComposeOpen] = useState(false)
  const [activeFolder, setActiveFolder] = useState('INBOX')
  const { folders, loadFolders } = useMail()
  const location = useLocation()

  const isInbox = location.pathname === '/inbox'

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar folders={folders} activeFolder={activeFolder} onFolderClick={setActiveFolder} />
      <div className="flex flex-col flex-1 min-w-0">
        <Topbar
          title={titles[location.pathname] || ''}
          onCompose={isInbox ? () => setComposeOpen(true) : undefined}
        />
        <main className="flex-1 overflow-auto">
          <Outlet context={{ activeFolder, setActiveFolder, loadFolders, setComposeOpen }} />
        </main>
      </div>
      <ComposeModal open={composeOpen} onClose={() => setComposeOpen(false)} />
    </div>
  )
}
