from typing import List
from models import Task, TaskWithUtility
from agent_intelligence import AgentIntelligence
from database import Database


# Mantém funções originais para compatibilidade, mas agora usa AgentIntelligence

def calculate_utility(task: Task, db: Database = None) -> float:
    """Calcula utilidade (wrapper para AgentIntelligence)"""
    if db is None:
        db = Database()
    agent = AgentIntelligence(db)
    return agent.calculate_utility(task)


def get_urgency_level(deadline: int) -> str:
    """Classifica o nível de urgência baseado no deadline."""
    if deadline <= 1:
        return "urgent"
    elif deadline <= 3:
        return "moderate"
    else:
        return "calm"


def get_importance_level(importance: float) -> str:
    """Classifica o nível de importância."""
    if importance >= 0.8:
        return "high"
    elif importance >= 0.5:
        return "medium"
    else:
        return "low"


def prioritize_tasks(tasks: List[Task], db: Database = None) -> List[TaskWithUtility]:
    """
    Ordena as tarefas por utilidade (wrapper para AgentIntelligence)
    Agora com reavaliação automática e detecção de alto estresse
    """
    if db is None:
        db = Database()
    agent = AgentIntelligence(db)
    return agent.prioritize_tasks(tasks)
