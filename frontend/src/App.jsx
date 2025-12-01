import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import ProgressPanel from './components/ProgressPanel'
import Dashboard from './components/Dashboard'
import TaskList from './components/TaskList'
import TaskForm from './components/TaskForm'
import PrioritizedView from './components/PrioritizedView'
import KanbanBoard from './components/KanbanBoard'

function App() {
  return (
    <Router>
      <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50">
        {/* Coluna 1: Sidebar/Navbar */}
        <div className="lg:w-64 lg:flex-shrink-0">
          <Sidebar />
        </div>
        
        {/* Coluna 2: Conteúdo Principal */}
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tasks" element={<TaskList />} />
            <Route path="/tasks/new" element={<TaskForm />} />
            <Route path="/priorizar" element={<PrioritizedView />} />
            <Route path="/kanban" element={<KanbanBoard />} />
          </Routes>
        </div>
        
        {/* Coluna 3: Progress Panel */}
        <div className="hidden xl:block xl:w-80 xl:flex-shrink-0">
          <ProgressPanel />
        </div>
      </div>
    </Router>
  )
}

export default App
