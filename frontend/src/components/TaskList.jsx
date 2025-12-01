import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trash2, Plus, Clock, AlertCircle, Inbox, Rocket, CheckCircle2, FileText } from 'lucide-react'
import { ConfirmModal } from './Modal'

const API_URL = 'http://localhost:8000'

export default function TaskList() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`)
      const data = await response.json()
      setTasks(data)
      setLoading(false)
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error)
      setLoading(false)
    }
  }

  const confirmDelete = (task) => {
    setTaskToDelete(task)
    setShowDeleteModal(true)
  }

  const deleteTask = async () => {
    if (!taskToDelete) return

    try {
      const response = await fetch(`${API_URL}/tasks/${taskToDelete.id}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== taskToDelete.id))
      }
    } catch (error) {
      console.error('Erro:', error)
    }
    
    setShowDeleteModal(false)
    setTaskToDelete(null)
  }

  const getStatusBadge = (status) => {
    const badges = {
      backlog: { color: 'bg-gray-100 text-gray-700', label: 'Backlog', icon: <Inbox className="w-3 h-3" /> },
      doing: { color: 'bg-blue-100 text-blue-700', label: 'Em Progresso', icon: <Rocket className="w-3 h-3" /> },
      done: { color: 'bg-green-100 text-green-700', label: 'Concluído', icon: <CheckCircle2 className="w-3 h-3" /> }
    }
    return badges[status] || badges.backlog
  }

  const getUrgencyColor = (deadline) => {
    if (deadline <= 1) return 'border-red-500'
    if (deadline <= 3) return 'border-yellow-500'
    return 'border-green-500'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Carregando...</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-800">Gerenciar Tarefas</h2>
          <p className="text-gray-600 mt-1">Organize e acompanhe todas as suas tarefas</p>
        </div>
        <button
          onClick={() => navigate('/tasks/new')}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center gap-2 shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Nova Tarefa
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-md">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-indigo-600" />
          </div>
          <p className="text-gray-500 text-lg mb-4">Nenhuma tarefa cadastrada ainda.</p>
          <button
            onClick={() => navigate('/tasks/new')}
            className="text-indigo-600 hover:text-indigo-800 font-semibold"
          >
            Criar primeira tarefa →
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => {
            const statusBadge = getStatusBadge(task.status)
            return (
              <div
                key={task.id}
                className={`bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all border-l-4 ${getUrgencyColor(task.deadline)}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-semibold text-gray-800 flex-1">
                    {task.title}
                  </h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${statusBadge.color} flex items-center gap-1`}>
                    {statusBadge.icon}
                    {statusBadge.label}
                  </span>
                </div>
                
                {task.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {task.description}
                  </p>
                )}
                
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>Deadline: {task.deadline} dias</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Duração: {task.duration}h</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="bg-purple-50 p-2 rounded">
                      <div className="text-xs text-purple-600">Importância</div>
                      <div className="font-semibold text-purple-700">
                        {(task.importance * 100).toFixed(0)}%
                      </div>
                    </div>
                    <div className="bg-orange-50 p-2 rounded">
                      <div className="text-xs text-orange-600">Stress</div>
                      <div className="font-semibold text-orange-700">
                        {(task.stress * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => confirmDelete(task)}
                  className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center gap-2 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </button>
              </div>
            )
          })}
        </div>
      )}
      
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={deleteTask}
        title="Excluir Tarefa"
        message={`Tem certeza que deseja excluir "${taskToDelete?.title}"? Esta ação não pode ser desfeita.`}
        confirmText="Sim, Excluir"
        confirmColor="red"
      />
    </div>
  )
}
