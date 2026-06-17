import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.svg'
import { Inbox, CheckSquare, Calendar, LayoutDashboard, StickyNote, Users, Settings, Folder, LogOut } from 'lucide-react'

const navItems = [
  { to: '/inbox',    label: 'Inbox',    Icon: Inbox },
  { to: '/todos',    label: 'Tarefas',  Icon: CheckSquare },
  { to: '/calendar', label: 'Agenda',   Icon: Calendar },
  { to: '/kanban',   label: 'Kanban',   Icon: LayoutDashboard },
  { to: '/notes',    label: 'Notas',    Icon: StickyNote },
  { to: '/contacts', label: 'Contatos', Icon: Users },
  { to: '/settings', label: 'Config',   Icon: Settings },
]

export default function Sidebar({ folders = [], activeFolder, onFolderClick }) {
  const { user, logout } = useAuth()
  return (
    <aside className="w-56 bg-brand-900 text-white flex flex-col h-full shrink-0">
      <div className="px-4 py-5 border-b border-brand-800">
        <img src={logo} alt="Logo" className="h-8 brightness-0 invert" />
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-sm transition-colors ${isActive ? 'bg-brand-800 text-white' : 'text-brand-100 hover:bg-brand-800 hover:text-white'}`
            }
          >
            <Icon size={16} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
        {folders.length > 0 && (
          <div className="mt-4 px-4">
            <p className="text-xs text-brand-300 uppercase tracking-wider mb-1">Pastas</p>
            {folders.map(f => (
              <button
                key={f.path}
                onClick={() => onFolderClick?.(f.path)}
                className={`w-full text-left flex items-center gap-2 px-2 py-1.5 text-sm rounded transition-colors ${activeFolder === f.path ? 'bg-brand-800 text-white' : 'text-brand-200 hover:bg-brand-800 hover:text-white'}`}
              >
                <Folder size={14} strokeWidth={1.75} />
                <span className="truncate">{f.name}</span>
              </button>
            ))}
          </div>
        )}
      </nav>
      <div className="px-4 py-3 border-t border-brand-800">
        <p className="text-xs text-brand-300 truncate mb-2">{user?.email}</p>
        <button onClick={logout} className="flex items-center gap-1.5 text-xs text-brand-300 hover:text-white transition-colors">
          <LogOut size={13} strokeWidth={1.75} />
          Sair
        </button>
      </div>
    </aside>
  )
}
