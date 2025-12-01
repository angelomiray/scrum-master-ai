#!/usr/bin/env python
from database import Database
from models import TaskCreate

db = Database()

# Criar tarefas de exemplo
tarefas_exemplo = [
    TaskCreate(
        title="Estudar React avançado",
        description="Estudar hooks customizados, context API e performance optimization",
        deadline=3,
        importance=0.9,
        duration=4,
        stress=0.5,
        fun=0.8,
        penalty_late=0.9,
        status="backlog"
    ),
    TaskCreate(
        title="Implementar testes unitários",
        description="Adicionar testes com Jest e React Testing Library",
        deadline=5,
        importance=0.7,
        duration=3,
        stress=0.6,
        fun=0.4,
        penalty_late=0.6,
        status="backlog"
    ),
    TaskCreate(
        title="Revisar documentação FastAPI",
        description="Estudar middleware, dependency injection e async patterns",
        deadline=7,
        importance=0.6,
        duration=2,
        stress=0.3,
        fun=0.7,
        penalty_late=0.4,
        status="backlog"
    ),
    TaskCreate(
        title="Fazer exercícios de algoritmos",
        description="Resolver problemas de estruturas de dados e complexidade",
        deadline=2,
        importance=0.8,
        duration=2,
        stress=0.7,
        fun=0.5,
        penalty_late=0.8,
        status="backlog"
    ),
]

print("🎯 Criando tarefas de exemplo...")
for tarefa in tarefas_exemplo:
    task = db.create_task(tarefa)
    print(f"✅ Criada: {task.title}")

print(f"\n📊 Total de tarefas no banco: {len(db.get_all_tasks())}")
