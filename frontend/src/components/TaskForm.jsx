import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, X, AlertCircle } from 'lucide-react'

const API_URL = 'http://localhost:8000'

export default function TaskForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: 7,
    importance: 0.5,
    duration: 2,
    stress: 0.5,
    fun: 0.5,
    penalty_late: 0.5,
    status: 'backlog'
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === 'number' || type === 'range' ? parseFloat(value) : value,
    })
    
    // Limpa erro do campo
    if (errors[name]) {
      setErrors({ ...errors, [name]: null })
    }
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório'
    }
    
    if (formData.duration <= 0) {
      newErrors.duration = 'Duração deve ser maior que zero'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) return
    
    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        navigate('/tasks')
      } else {
        alert('Erro ao criar tarefa')
      }
    } catch (error) {
      console.error('Erro:', error)
      alert('Erro ao conectar com o servidor')
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Nova Tarefa</h2>
          <p className="text-gray-600 mt-1">Preencha os detalhes da sua tarefa</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          {/* Título */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Título da Tarefa *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className={`w-full rounded-lg border-2 ${errors.title ? 'border-red-500' : 'border-gray-300'} focus:border-indigo-500 focus:ring focus:ring-indigo-200 px-4 py-3 transition-colors`}
              placeholder="Ex: Estudar para prova de Cálculo"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border-2 border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200 px-4 py-3 transition-colors resize-none"
              placeholder="Detalhes adicionais sobre a tarefa..."
            />
          </div>

          {/* Grid de campos numéricos */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Deadline */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Deadline: <span className="text-indigo-600 font-bold">{formData.deadline} dias</span>
              </label>
              <input
                type="range"
                name="deadline"
                min="0"
                max="30"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Hoje</span>
                <span>30 dias</span>
              </div>
            </div>

            {/* Duração */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duração: <span className="text-indigo-600 font-bold">{formData.duration}h</span>
              </label>
              <input
                type="range"
                name="duration"
                min="0.5"
                max="20"
                step="0.5"
                value={formData.duration}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0.5h</span>
                <span>20h</span>
              </div>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-4">
            <SliderInput
              label="Importância"
              name="importance"
              value={formData.importance}
              onChange={handleChange}
              color="purple"
            />
            
            <SliderInput
              label="Nível de Stress"
              name="stress"
              value={formData.stress}
              onChange={handleChange}
              color="orange"
            />
            
            <SliderInput
              label="Diversão"
              name="fun"
              value={formData.fun}
              onChange={handleChange}
              color="green"
            />
            
            <SliderInput
              label="Penalidade se Atrasado"
              name="penalty_late"
              value={formData.penalty_late}
              onChange={handleChange}
              color="red"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center gap-2 font-semibold transition-colors"
            >
              <Save className="w-5 h-5" />
              Salvar Tarefa
            </button>
            <button
              type="button"
              onClick={() => navigate('/tasks')}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 flex items-center justify-center gap-2 font-semibold transition-colors"
            >
              <X className="w-5 h-5" />
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SliderInput({ label, name, value, onChange, color }) {
  const colors = {
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
  }
  
  const percentage = (value * 100).toFixed(0)
  
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
        <span className={`text-sm font-bold px-3 py-1 rounded-full bg-${color}-100 text-${color}-700`}>
          {percentage}%
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          name={name}
          min="0"
          max="1"
          step="0.01"
          value={value}
          onChange={onChange}
          className={`w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-${color}-600`}
        />
        <div 
          className={`absolute top-0 left-0 h-2 ${colors[color]} rounded-lg pointer-events-none`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
