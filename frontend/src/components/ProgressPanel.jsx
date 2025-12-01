import { useState, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Clock, AlertTriangle, Frown, Smile, Trophy } from 'lucide-react'

const API_URL = 'http://localhost:8000'

export default function ProgressPanel() {
  const [stats, setStats] = useState(null)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [tasksForDate, setTasksForDate] = useState([])
  
  useEffect(() => {
    fetchStats()
  }, [])
  
  useEffect(() => {
    fetchTasksForDate(selectedDate)
  }, [selectedDate])
  
  const generateDateRange = (centerDate) => {
    const dates = []
    for (let i = -3; i <= 3; i++) {
      const date = new Date(centerDate)
      date.setDate(centerDate.getDate() + i)
      dates.push(date)
    }
    return dates
  }
  
  const handlePrevWeek = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(selectedDate.getDate() - 7)
    setSelectedDate(newDate)
  }
  
  const handleNextWeek = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(selectedDate.getDate() + 7)
    setSelectedDate(newDate)
  }
  
  const handleToday = () => {
    setSelectedDate(new Date())
  }
  
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard/stats`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    }
  }
  
  const fetchTasksForDate = async (date) => {
    try {
      const dateStr = date.toISOString().split('T')[0]
      const response = await fetch(`${API_URL}/dashboard/tasks-by-date/${dateStr}`)
      const data = await response.json()
      setTasksForDate(data)
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error)
      setTasksForDate([])
    }
  }
  
  const getCompletionPercentage = () => {
    if (!stats) return 0
    return Math.round(stats.completion_rate * 100)
  }
  
  const getProgressColor = () => {
    const percentage = getCompletionPercentage()
    if (percentage >= 75) return 'stroke-green-500'
    if (percentage >= 50) return 'stroke-yellow-500'
    if (percentage >= 25) return 'stroke-orange-500'
    return 'stroke-red-500'
  }
  
  const CircularProgress = ({ percentage }) => {
    const radius = 70
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (percentage / 100) * circumference
    
    return (
      <div className="relative w-48 h-48 mx-auto">
        <svg className="transform -rotate-90" width="192" height="192">
          {/* Background circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            className="stroke-gray-200"
            strokeWidth="12"
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            className={getProgressColor()}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-4xl font-bold text-gray-800">{percentage}%</span>
          <span className="text-sm text-gray-500">Completo</span>
        </div>
      </div>
    )
  }
  
  const formatDate = (date) => {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  }
  
  const getDayName = (date) => {
    const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB']
    return days[date.getDay()]
  }
  
  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }
  
  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString()
  }
  
  if (!stats) {
    return (
      <div className="w-80 bg-white h-screen sticky top-0 shadow-lg p-6">
        <div className="animate-pulse">Carregando...</div>
      </div>
    )
  }
  
  return (
    <div className="w-80 bg-gradient-to-br from-gray-50 to-gray-100 h-screen sticky top-0 shadow-lg overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* Overall Progress */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Progresso Geral</h3>
          
          <CircularProgress percentage={getCompletionPercentage()} />
          
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total de Tarefas</span>
              <span className="font-semibold">{stats.total_tasks}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Concluídas</span>
              <span className="font-semibold text-green-600">{stats.done_count}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Em Progresso</span>
              <span className="font-semibold text-blue-600">{stats.doing_count}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Backlog</span>
              <span className="font-semibold text-gray-600">{stats.backlog_count}</span>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Resumo</h3>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500">Tarefas Urgentes</div>
                <div className="font-bold text-gray-800">{stats.urgent_tasks}</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500">Horas Restantes</div>
                <div className="font-bold text-gray-800">{stats.total_hours}h</div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Frown className="w-5 h-5 text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-500">Alto Stress</div>
                <div className="font-bold text-gray-800">{stats.high_stress_tasks}</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Date Picker */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              Calendário
            </h3>
            <button
              onClick={handleToday}
              className="text-xs bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1.5 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold shadow-sm"
            >
              Hoje
            </button>
          </div>
          
          <div className="flex items-center justify-between mb-5 bg-gray-50 p-3 rounded-lg">
            <button
              onClick={handlePrevWeek}
              className="p-1.5 hover:bg-white rounded-md transition-all hover:shadow-sm"
              title="Semana anterior"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            
            <span className="text-sm font-bold text-gray-800 uppercase tracking-wide">
              {selectedDate.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
            </span>
            
            <button
              onClick={handleNextWeek}
              className="p-1.5 hover:bg-white rounded-md transition-all hover:shadow-sm"
              title="Próxima semana"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1.5">
            {generateDateRange(selectedDate).map((date, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`aspect-square rounded-lg text-center transition-all transform hover:scale-105 flex flex-col items-center justify-center py-1 px-3 ${
                  isSelected(date)
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg scale-105 ring-2 ring-indigo-300'
                    : isToday(date)
                    ? 'bg-indigo-100 text-indigo-700 font-bold ring-2 ring-indigo-300'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="text-[10px] font-semibold opacity-70 tracking-tight leading-none">{getDayName(date)}</div>
                <div className="text-md font-bold leading-none mt-1">{date.getDate()}</div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Tasks for Selected Date */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-1 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            {formatDate(selectedDate)}
          </h3>
          <p className="text-xs text-gray-500 mb-4">Tarefas com deadline neste dia</p>
          
          {tasksForDate.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-400 text-sm">Nenhuma tarefa para este dia</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasksForDate.map((task) => (
                <div key={task.id} className="group p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border-l-4 border-indigo-500 hover:shadow-md transition-all">
                  <div className="font-semibold text-sm text-gray-800 mb-1">{task.title}</div>
                  {task.description && (
                    <p className="text-xs text-gray-600 mb-2 line-clamp-1">{task.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {task.duration}h
                    </span>
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {(task.importance * 100).toFixed(0)}%
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${
                      task.status === 'done' ? 'bg-green-100 text-green-700' :
                      task.status === 'doing' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {task.status === 'done' ? 'Concluído' : task.status === 'doing' ? 'Fazendo' : 'Backlog'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
