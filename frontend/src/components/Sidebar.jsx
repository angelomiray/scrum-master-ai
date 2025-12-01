import { Home, KanbanSquare, Brain, Settings } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

export default function Sidebar() {
    const location = useLocation()

    const menuItems = [
        { icon: Home, label: 'Dashboard', path: '/' },
        { icon: KanbanSquare, label: 'Kanban', path: '/kanban' },
        { icon: Brain, label: 'Priorizar', path: '/priorizar' },
        { icon: Settings, label: 'Tarefas', path: '/tasks' },
    ]

    const isActive = (path) => location.pathname === path

    return (
        <div className="bg-gradient-to-b from-indigo-600 to-indigo-800 text-white shadow-2xl lg:h-screen lg:sticky lg:top-0 flex flex-col">
            
            {/* Logo */}
            <div className="p-6 border-b border-indigo-500/30 flex flex-col items-center text-center space-y-1">
                <Brain className="w-10 h-10" />
                <h1 className="text-2xl font-bold">Scrum Master AI</h1>
                <p className="text-indigo-200 text-sm">Gerenciador Inteligente</p>
            </div>

            {/* Menu */}
            <nav className="p-4 flex-1 flex flex-col space-y-2 overflow-x-auto lg:overflow-x-visible">
                {menuItems.map((item) => {
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 whitespace-nowrap ${
                                isActive(item.path)
                                    ? 'bg-white text-indigo-600 shadow-lg'
                                    : 'hover:bg-indigo-700/50'
                            }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium text-base">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-indigo-500/30 text-center text-xs text-indigo-200">
                v2.0 • Desenvolvido na UFRN
            </div>
        </div>
    )
}
