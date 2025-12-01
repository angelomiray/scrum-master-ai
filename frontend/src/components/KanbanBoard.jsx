import { useState, useEffect } from 'react'
import { DndContext, DragOverlay, closestCorners, useDraggable, useDroppable, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { Plus, Clock, AlertCircle, Trash2, Inbox, Rocket, CheckCircle2 } from 'lucide-react'
import { ConfirmModal } from './Modal'

const API_URL = 'http://localhost:8000'

export default function KanbanBoard() {
  const [tasks, setTasks] = useState({ backlog: [], doing: [], done: [] })
  const [activeId, setActiveId] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )
  
  useEffect(() => {
    fetchTasks()
  }, [])
  
  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks`)
      const data = await response.json()
      
      // Agrupa por status
      const grouped = {
        backlog: data.filter(t => t.status === 'backlog'),
        doing: data.filter(t => t.status === 'doing'),
        done: data.filter(t => t.status === 'done')
      }
      
      setTasks(grouped)
    } catch (error) {
      console.error('Erro ao buscar tarefas:', error)
    }
  }
  
  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }
  
  const handleDragEnd = async (event) => {
    const { active, over } = event
    
    if (!over) {
      setActiveId(null)
      return
    }
    
    const taskId = active.id
    const newStatus = over.id
    
    // Atualiza no backend
    try {
      await fetch(`${API_URL}/tasks/${taskId}/status?status=${newStatus}`, {
        method: 'PATCH'
      })
      
      // Atualiza localmente
      fetchTasks()
    } catch (error) {
      console.error('Erro ao mover tarefa:', error)
    }
    
    setActiveId(null)
  }
  
  const confirmDelete = (task) => {
    setTaskToDelete(task)
    setShowDeleteModal(true)
  }
  
  const handleDelete = async () => {
    if (!taskToDelete) return
    
    try {
      await fetch(`${API_URL}/tasks/${taskToDelete.id}`, {
        method: 'DELETE'
      })
      fetchTasks()
    } catch (error) {
      console.error('Erro ao deletar tarefa:', error)
    }
    
    setShowDeleteModal(false)
    setTaskToDelete(null)
  }
  
  const getUrgencyColor = (deadline) => {
    if (deadline <= 1) return 'border-red-500 bg-red-50'
    if (deadline <= 3) return 'border-yellow-500 bg-yellow-50'
    return 'border-green-500 bg-green-50'
  }
  
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Kanban Board</h1>
        <p className="text-gray-600">Arraste e solte para organizar suas tarefas</p>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KanbanColumn
            id="backlog"
            title="Backlog"
            icon={<Inbox className="w-5 h-5" />}
            tasks={tasks.backlog}
            onDelete={confirmDelete}
            getUrgencyColor={getUrgencyColor}
          />
          <KanbanColumn
            id="doing"
            title="Em Progresso"
            icon={<Rocket className="w-5 h-5" />}
            tasks={tasks.doing}
            onDelete={confirmDelete}
            getUrgencyColor={getUrgencyColor}
          />
          <KanbanColumn
            id="done"
            title="Concluído"
            icon={<CheckCircle2 className="w-5 h-5" />}
            tasks={tasks.done}
            onDelete={confirmDelete}
            getUrgencyColor={getUrgencyColor}
          />
        </div>
        
        <DragOverlay>
          {activeId ? (
            <TaskCard
              task={getAllTasks().find(t => t.id === activeId)}
              isDragging
              getUrgencyColor={getUrgencyColor}
            />
          ) : null}
        </DragOverlay>
      </DndContext>
      
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Excluir Tarefa"
        message={`Deseja realmente excluir "${taskToDelete?.title}"?`}
        confirmText="Excluir"
        confirmColor="red"
      />
    </div>
  )
  
  function getAllTasks() {
    return [...tasks.backlog, ...tasks.doing, ...tasks.done]
  }
}

function KanbanColumn({ id, title, icon, tasks, onDelete, getUrgencyColor }) {
  const { setNodeRef } = useDroppable({ id })
  
  return (
    <div
      ref={setNodeRef}
      className="bg-white rounded-xl shadow-md p-4 min-h-[600px]"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          {icon}
          {title}
        </h2>
        <span className="bg-gray-200 text-gray-700 text-sm font-semibold px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>
      
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm">Arraste tarefas para cá</p>
          </div>
        ) : (
          tasks.map(task => (
            <DraggableTask
              key={task.id}
              task={task}
              onDelete={onDelete}
              getUrgencyColor={getUrgencyColor}
            />
          ))
        )}
      </div>
    </div>
  )
}

function DraggableTask({ task, onDelete, getUrgencyColor }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id
  })
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={isDragging ? 'opacity-50' : ''}
    >
      <TaskCard task={task} onDelete={onDelete} getUrgencyColor={getUrgencyColor} />
    </div>
  )
}

function TaskCard({ task, onDelete, getUrgencyColor, isDragging }) {
  if (!task) return null
  
  return (
    <div className={`p-4 rounded-lg border-l-4 ${getUrgencyColor(task.deadline)} bg-white shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${isDragging ? 'shadow-2xl rotate-3' : ''}`}>
      <h3 className="font-semibold text-gray-800 mb-2">{task.title}</h3>
      
      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}
      
      <div className="space-y-1 text-xs text-gray-600 mb-3">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{task.duration}h</span>
          <span className="mx-1">•</span>
          <AlertCircle className="w-3 h-3" />
          <span>{task.deadline} dias</span>
        </div>
        <div className="flex gap-2">
          <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
            Imp: {(task.importance * 100).toFixed(0)}%
          </span>
          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
            Stress: {(task.stress * 100).toFixed(0)}%
          </span>
        </div>
      </div>
      
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(task)
          }}
          className="w-full bg-red-500 text-white text-xs py-2 rounded hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          Excluir
        </button>
      )}
    </div>
  )
}
