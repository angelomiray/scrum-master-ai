#!/usr/bin/env python
from database import Database
from agent_intelligence import AgentIntelligence

db = Database()
agent = AgentIntelligence(db)

# Verificar tarefas
tasks = db.get_all_tasks()
print(f"Total de tarefas: {len(tasks)}")
for t in tasks:
    print(f"  - {t.title} (status: {t.status})")

# Filtrar pendentes
pending = [t for t in tasks if t.status != 'done']
print(f"\nTarefas pendentes: {len(pending)}")

# Tentar sugerir próxima ação
try:
    suggestion = agent.suggest_next_action()
    print(f"\n✅ Sugestão: {suggestion.task.title}")
    print(f"   Razão: {suggestion.reason}")
except ValueError as e:
    print(f"\n❌ Erro: {e}")
except Exception as e:
    print(f"\n❌ Erro inesperado: {type(e).__name__}: {e}")
