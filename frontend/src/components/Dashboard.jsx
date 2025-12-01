import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { TrendingUp, Clock, AlertTriangle, Brain, Zap, Play, SkipForward, Star } from 'lucide-react'

const API_URL = 'http://localhost:8000'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [timeline, setTimeline] = useState([])
  const [nextAction, setNextAction] = useState(null)
  const [highStressMode, setHighStressMode] = useState(false)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchData()
  }, [])
  
  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, timelineRes, stressRes] = await Promise.all([
        fetch(`${API_URL}/dashboard/stats`),
        fetch(`${API_URL}/dashboard/timeline`),
        fetch(`${API_URL}/dashboard/high-stress-mode`)
      ])
      
      const statsData = await statsRes.json()
      const timelineData = await timelineRes.json()
      const stressData = await stressRes.json()
      
      setStats(statsData)
      setTimeline(timelineData)
      setHighStressMode(stressData.high_stress_mode)
      
      // Tenta buscar próxima ação
      try {
        const nextRes = await fetch(`${API_URL}/agent/next-action`)
        if (nextRes.ok) {
          const nextData = await nextRes.json()
          setNextAction(nextData)
        }
      } catch (e) {
        console.log('Nenhuma tarefa disponível para sugestão')
      }
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }
  
  const handleStartTask = async () => {
    if (!nextAction) return
    
    try {
      await fetch(`${API_URL}/tasks/${nextAction.task.id}/status?status=doing`, {
        method: 'PATCH'
      })
      alert('Tarefa iniciada! Boa sorte!')
      fetchData()
    } catch (error) {
      console.error('Erro ao iniciar tarefa:', error)
    }
  }
  
  const handleIgnoreSuggestion = async () => {
    if (!nextAction) return
    
    try {
      await fetch(`${API_URL}/agent/ignore/${nextAction.task.id}`, {
        method: 'POST'
      })
      alert('Preferência registrada! O agente vai aprender com suas escolhas.')
      fetchData()
    } catch (error) {
      console.error('Erro ao ignorar sugestão:', error)
    }
  }
  
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600">Visão geral das suas tarefas e progresso</p>
        </div>
        
        {highStressMode && (
          <div className="bg-red-100 border-2 border-red-500 rounded-lg px-4 py-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-700 font-semibold">Modo Alto Estresse Ativo</span>
          </div>
        )}
      </div>
      
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          title="Taxa de Conclusão"
          value={`${(stats.completion_rate * 100).toFixed(0)}%`}
          color="green"
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          title="Horas Restantes"
          value={`${stats.total_hours}h`}
          color="blue"
        />
        <StatCard
          icon={<AlertTriangle className="w-6 h-6" />}
          title="Tarefas Urgentes"
          value={stats.urgent_tasks}
          color="red"
        />
        <StatCard
          icon={<Brain className="w-6 h-6" />}
          title="Em Progresso"
          value={stats.doing_count}
          color="purple"
        />
      </div>
      
      {/* Next Action Suggestion */}
      {nextAction && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-6 h-6" />
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  O que fazer agora?
                </h2>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mt-4">
                <h3 className="text-xl font-semibold mb-2">{nextAction.task.title}</h3>
                <p className="text-indigo-100 mb-3">{nextAction.reason}</p>
                
                <div className="flex gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {nextAction.task.duration}h
                  </span>
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {nextAction.task.deadline} dias
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" /> {(nextAction.task.importance * 100).toFixed(0)}%
                  </span>
                  <span>Termina às {nextAction.estimated_finish_time}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleStartTask}
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Começar Agora
            </button>
            <button
              onClick={handleIgnoreSuggestion}
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/30 transition-colors flex items-center gap-2"
            >
              <SkipForward className="w-4 h-4" />
              Ignorar (Agente Aprende)
            </button>
          </div>
        </div>
      )}
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Timeline de Deadlines</h3>
          
          {timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeline}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis />
                <Tooltip labelFormatter={formatDate} />
                <Line type="monotone" dataKey="total_hours" stroke="#8b5cf6" strokeWidth={2} name="Horas" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-400 py-12">Nenhum deadline próximo</p>
          )}
        </div>
        
        {/* Hours Distribution */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Distribuição de Horas</h3>
          
          {timeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={timeline.slice(0, 7)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatDate} />
                <YAxis />
                <Tooltip labelFormatter={formatDate} />
                <Bar dataKey="total_hours" fill="#3b82f6" name="Horas" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-400 py-12">Sem dados disponíveis</p>
          )}
        </div>
      </div>
      
      {/* Upcoming Tasks */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Próximas Tarefas Importantes</h3>
        
        {timeline.length > 0 ? (
          <div className="space-y-4">
            {timeline.slice(0, 5).map((day, index) => (
              <div key={index} className="border-l-4 border-indigo-500 pl-4 py-2">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-gray-800">{formatDate(day.date)}</div>
                  <div className="text-sm text-gray-500">{day.total_hours}h total</div>
                </div>
                <div className="space-y-1">
                  {day.tasks.slice(0, 3).map((task, i) => (
                    <div key={i} className="text-sm text-gray-600">
                      • {task.title} ({task.duration}h)
                    </div>
                  ))}
                  {day.tasks.length > 3 && (
                    <div className="text-xs text-gray-400">
                      +{day.tasks.length - 3} mais tarefas
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-8">Nenhuma tarefa agendada</p>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, title, value, color }) {
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
  }
  
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-500 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
