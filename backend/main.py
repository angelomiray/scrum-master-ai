from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from models import (Task, TaskCreate, TaskUpdate, TaskWithUtility, 
                    NextActionSuggestion, DashboardStats, UserWeights)
from database import Database
from agent import prioritize_tasks
from agent_intelligence import AgentIntelligence

app = FastAPI(title="Scrum Master AI - Task Manager Inteligente")

# Configuração CORS para permitir requisições do React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializa o banco de dados e agente
db = Database()
agent = AgentIntelligence(db)


@app.get("/")
def read_root():
    return {
        "message": "Scrum Master AI API - Sistema de Priorização Inteligente",
        "features": [
            "Gestão de tarefas (CRUD)",
            "Priorização inteligente",
            "Modo alto estresse",
            "Aprendizado adaptativo",
            "Sugestão de próxima ação",
            "Dashboard com estatísticas"
        ]
    }


# ==================== CRUD de Tarefas ====================

@app.post("/tasks", response_model=Task)
def create_task(task: TaskCreate):
    """Cria uma nova tarefa."""
    return db.create_task(task)


@app.get("/tasks", response_model=List[Task])
def get_tasks():
    """Retorna todas as tarefas."""
    return db.get_all_tasks()


@app.get("/tasks/{task_id}", response_model=Task)
def get_task(task_id: int):
    """Retorna uma tarefa específica."""
    task = db.get_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.patch("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, task_update: TaskUpdate):
    """Atualiza uma tarefa (parcialmente)."""
    task = db.update_task(task_id, task_update)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@app.delete("/tasks/{task_id}")
def delete_task(task_id: int):
    """Remove uma tarefa pelo ID."""
    deleted = db.delete_task(task_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"message": "Task deleted successfully"}


# ==================== Kanban ====================

@app.patch("/tasks/{task_id}/status")
def update_task_status(task_id: int, status: str):
    """Atualiza o status da tarefa (para drag-and-drop Kanban)."""
    if status not in ["backlog", "doing", "done"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    task_update = TaskUpdate(status=status)
    task = db.update_task(task_id, task_update)
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {"message": f"Task moved to {status}", "task": task}


@app.get("/tasks/by-status/{status}", response_model=List[Task])
def get_tasks_by_status(status: str):
    """Retorna tarefas filtradas por status."""
    if status not in ["backlog", "doing", "done"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    all_tasks = db.get_all_tasks()
    return [t for t in all_tasks if t.status == status]


# ==================== Inteligência do Agente ====================

@app.post("/agent/priorizar", response_model=List[TaskWithUtility])
def priorize_tasks():
    """
    🧠 Priorização inteligente com:
    - Reavaliação automática
    - Detecção de modo alto estresse
    - Pesos adaptativos
    """
    tasks = db.get_all_tasks()
    
    if not tasks:
        return []
    
    prioritized = prioritize_tasks(tasks, db)
    return prioritized


@app.get("/agent/next-action", response_model=NextActionSuggestion)
def get_next_action():
    """
    🎯 O que devo fazer agora?
    Retorna a tarefa com maior utilidade + razão da sugestão
    """
    try:
        suggestion = agent.suggest_next_action()
        return suggestion
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/agent/ignore/{task_id}")
def ignore_suggestion(task_id: int):
    """
    🤖 Aprendizado adaptativo
    Registra que usuário ignorou uma sugestão
    """
    task = db.get_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    agent.adaptive_learning(task_id)
    
    return {
        "message": "Preferências registradas",
        "ignored_count": task.ignored_count + 1
    }


@app.get("/agent/weights", response_model=UserWeights)
def get_weights():
    """Retorna pesos adaptativos atuais."""
    weights = db.get_user_weights()
    return UserWeights(**weights)


@app.post("/agent/weights")
def update_weights(weights: UserWeights):
    """Atualiza manualmente os pesos."""
    db.update_user_weights(weights.model_dump())
    return {"message": "Weights updated successfully"}


# ==================== Dashboard & Estatísticas ====================

@app.get("/dashboard/stats", response_model=DashboardStats)
def get_dashboard_stats():
    """📊 Estatísticas para o dashboard."""
    return agent.get_dashboard_stats()


@app.get("/dashboard/timeline")
def get_timeline():
    """📅 Timeline de deadlines para os próximos 30 dias."""
    return agent.get_timeline_data()


@app.get("/dashboard/tasks-by-date/{date}", response_model=List[Task])
def get_tasks_by_date(date: str):
    """
    📆 Tarefas para uma data específica
    Formato da data: YYYY-MM-DD
    """
    try:
        tasks = db.get_tasks_by_date(date)
        return tasks
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/dashboard/high-stress-mode")
def check_high_stress_mode():
    """🚨 Verifica se está em modo alto estresse."""
    tasks = db.get_all_tasks()
    is_high_stress = agent.detect_high_stress_mode(tasks)
    
    return {
        "high_stress_mode": is_high_stress,
        "message": "Modo alto estresse ativado! Priorizando tarefas rápidas e importantes." if is_high_stress else "Tudo sob controle!"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
