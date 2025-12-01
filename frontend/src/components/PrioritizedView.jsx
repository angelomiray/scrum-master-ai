import { useState } from 'react'
import { Sparkles, TrendingUp, AlertCircle, Clock, Bot, Flame, Zap, CheckCircle, Star, Pin, FileText, Frown, Smile, Calendar, AlertTriangle } from 'lucide-react'

const API_URL = 'http://localhost:8000'

const urgencyColors = {
  urgent: 'bg-red-500',
  moderate: 'bg-yellow-500',
  calm: 'bg-green-500',
}

const importanceColors = {
  high: 'bg-purple-500',
  medium: 'bg-blue-500',
  low: 'bg-gray-400',
}

export default function PrioritizedView() {
  const [prioritizedTasks, setPrioritizedTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const prioritizeTasks = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_URL}/agent/priorizar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setPrioritizedTasks(data)
      } else {
        setError('Erro ao priorizar tarefas')
      }
    } catch (error) {
      console.error('Erro:', error)
      setError('Erro ao conectar com o servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-indigo-600" />
            Priorização Inteligente
          </h2>
          <p className="text-gray-600">
            O agente analisa suas tarefas e sugere a ordem ideal de execução baseada em utilidade.
          </p>
        </div>
        
        {/* Action Button */}
        <div className="mb-8">
          <button
            onClick={prioritizeTasks}
            disabled={loading}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 flex items-center gap-3 shadow-lg transition-all text-lg font-semibold"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Analisando...
              </>
            ) : (
              <>
                <Bot className="w-6 h-6" />
                Priorizar Tarefas
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Results */}
        {prioritizedTasks.length > 0 && (
          <div>
            <div className="bg-indigo-100 border-2 border-indigo-500 rounded-xl px-6 py-4 mb-6">
              <h3 className="text-lg font-bold text-indigo-900">
                ✨ {prioritizedTasks.length} tarefas analisadas e ordenadas por prioridade
              </h3>
              <p className="text-indigo-700 text-sm mt-1">
                Execute na ordem mostrada para máxima eficiência
              </p>
            </div>
            
            <div className="space-y-4">
              {prioritizedTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all border-l-8 border-indigo-500 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        {/* Ranking Number */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-xl w-14 h-14 flex items-center justify-center font-bold text-xl shadow-lg">
                          {index + 1}
                        </div>
                        
                        {/* Title */}
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            {task.title}
                          </h3>
                          
                          {task.description && (
                            <p className="text-sm text-gray-600 mb-3">
                              {task.description}
                            </p>
                          )}
                          
                          {/* Tags */}
                          <div className="flex gap-2 flex-wrap">
                            <span className={`${urgencyColors[task.urgency_level]} text-white text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1`}>
                              {task.urgency_level === 'urgent' && <><Flame className="w-3 h-3" /> Urgente</>}
                              {task.urgency_level === 'moderate' && <><Zap className="w-3 h-3" /> Moderado</>}
                              {task.urgency_level === 'calm' && <><CheckCircle className="w-3 h-3" /> Tranquilo</>}
                            </span>
                            <span className={`${importanceColors[task.importance_level]} text-white text-xs px-3 py-1.5 rounded-full font-semibold flex items-center gap-1`}>
                              {task.importance_level === 'high' && <><Star className="w-3 h-3" /> Alta</>}
                              {task.importance_level === 'medium' && <><Pin className="w-3 h-3" /> Média</>}
                              {task.importance_level === 'low' && <><FileText className="w-3 h-3" /> Baixa</>}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Utility Score */}
                      <div className="text-right ml-4">
                        <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                          {task.utility}
                        </div>
                        <div className="text-xs text-gray-500 font-semibold">UTILIDADE</div>
                      </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                      <DetailItem icon={<Calendar className="w-4 h-4" />} label="Deadline" value={`${task.deadline} dias`} />
                      <DetailItem icon={<Clock className="w-4 h-4" />} label="Duração" value={`${task.duration}h`} />
                      <DetailItem icon={<Star className="w-4 h-4" />} label="Importância" value={`${(task.importance * 100).toFixed(0)}%`} />
                      <DetailItem icon={<Frown className="w-4 h-4" />} label="Stress" value={`${(task.stress * 100).toFixed(0)}%`} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <DetailItem icon={<Smile className="w-4 h-4" />} label="Diversão" value={`${(task.fun * 100).toFixed(0)}%`} />
                      <DetailItem icon={<AlertTriangle className="w-4 h-4" />} label="Penalidade" value={`${(task.penalty_late * 100).toFixed(0)}%`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && prioritizedTasks.length === 0 && !error && (
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Pronto para priorizar?
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Clique no botão acima para que o agente analise suas tarefas e determine a melhor ordem de execução.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function DetailItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
      <div className="text-indigo-600">{icon}</div>
      <div>
        <div className="text-xs text-gray-500">{label}</div>
        <div className="font-semibold text-gray-800">{value}</div>
      </div>
    </div>
  )
}
