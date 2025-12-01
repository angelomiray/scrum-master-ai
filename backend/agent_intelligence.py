"""
Módulo de Inteligência do Agente
Implementa funcionalidades avançadas de IA para o gerenciamento de tarefas
"""

from typing import List, Dict, Tuple
from datetime import datetime, timedelta
from models import Task, TaskWithUtility, NextActionSuggestion, DashboardStats
from database import Database


class AgentIntelligence:
    def __init__(self, db: Database):
        self.db = db
    
    def calculate_utility(self, task: Task, weights: Dict = None) -> float:
        """
        Calcula utilidade com pesos adaptativos
        """
        if weights is None:
            weights = self.db.get_user_weights()
        
        # Urgência: aumenta conforme deadline diminui
        urgency = 1 / (task.deadline + 1)
        
        # Esforço: normalizado por 10 horas
        effort = task.duration / 10
        
        # Penalidade: só aplica se deadline < 2 dias
        penalty = task.penalty_late if task.deadline < 2 else 0
        
        # Fórmula de utilidade com pesos adaptativos
        utility = (
            urgency * weights['urgency_weight'] +
            task.importance * weights['importance_weight'] +
            penalty * weights['penalty_weight'] +
            (1 - task.stress) * weights['stress_weight'] +
            task.fun * weights['fun_weight'] +
            (1 - effort) * weights['effort_weight']
        )
        
        return round(utility, 2)
    
    def get_urgency_level(self, deadline: int) -> str:
        """Classifica urgência"""
        if deadline <= 1:
            return "urgent"
        elif deadline <= 3:
            return "moderate"
        else:
            return "calm"
    
    def get_importance_level(self, importance: float) -> str:
        """Classifica importância"""
        if importance >= 0.8:
            return "high"
        elif importance >= 0.5:
            return "medium"
        else:
            return "low"
    
    def detect_high_stress_mode(self, tasks: List[Task]) -> bool:
        """
        Detecta se o usuário está em modo alto estresse
        Critérios:
        - Muitas tarefas com stress >= 0.6
        - Prazos muito curtos (deadline <= 2)
        - Carga de horas muito grande
        """
        if not tasks:
            return False
        
        active_tasks = [t for t in tasks if t.status != 'done']
        
        if len(active_tasks) == 0:
            return False
        
        high_stress_count = sum(1 for t in active_tasks if t.stress >= 0.6)
        urgent_count = sum(1 for t in active_tasks if t.deadline <= 2)
        total_hours = sum(t.duration for t in active_tasks)
        
        # Está em alto estresse se:
        stress_ratio = high_stress_count / len(active_tasks)
        urgent_ratio = urgent_count / len(active_tasks)
        
        return (stress_ratio >= 0.5 or  # 50%+ das tarefas com alto stress
                urgent_ratio >= 0.4 or   # 40%+ das tarefas urgentes
                total_hours >= 40)       # Mais de 40 horas de trabalho
    
    def adjust_weights_for_high_stress(self, base_weights: Dict) -> Dict:
        """
        Ajusta pesos quando em modo alto estresse
        Prioriza: tarefas rápidas, importantes, que reduzem estresse
        """
        return {
            'urgency_weight': base_weights['urgency_weight'] * 1.3,  # Aumenta urgência
            'importance_weight': base_weights['importance_weight'] * 1.4,  # Muito mais importante
            'penalty_weight': base_weights['penalty_weight'] * 1.2,
            'stress_weight': base_weights['stress_weight'] * 0.5,  # Reduz peso do stress
            'fun_weight': base_weights['fun_weight'] * 0.3,  # Fun menos importante
            'effort_weight': base_weights['effort_weight'] * 1.8  # MUITO mais peso em tarefas rápidas
        }
    
    def prioritize_tasks(self, tasks: List[Task], force_weights: Dict = None) -> List[TaskWithUtility]:
        """
        Prioriza tarefas com reavaliação automática
        """
        if not tasks:
            return []
        
        # Filtra apenas tarefas não concluídas
        active_tasks = [t for t in tasks if t.status != 'done']
        
        if not active_tasks:
            return []
        
        # Detecta modo alto estresse
        high_stress = self.detect_high_stress_mode(active_tasks)
        
        # Carrega pesos
        base_weights = force_weights or self.db.get_user_weights()
        
        # Ajusta pesos se necessário
        weights = self.adjust_weights_for_high_stress(base_weights) if high_stress else base_weights
        
        tasks_with_utility = []
        
        for task in active_tasks:
            utility = self.calculate_utility(task, weights)
            urgency_level = self.get_urgency_level(task.deadline)
            importance_level = self.get_importance_level(task.importance)
            
            task_with_utility = TaskWithUtility(
                **task.model_dump(),
                utility=utility,
                urgency_level=urgency_level,
                importance_level=importance_level
            )
            tasks_with_utility.append(task_with_utility)
        
        # Ordena por utilidade
        tasks_with_utility.sort(key=lambda x: x.utility, reverse=True)
        
        return tasks_with_utility
    
    def suggest_next_action(self) -> NextActionSuggestion:
        """
        🧠 Sugestão de próxima ação
        Retorna a tarefa com maior utilidade no momento
        """
        tasks = self.db.get_all_tasks()
        # Filtra apenas tarefas não concluídas
        pending_tasks = [t for t in tasks if t.status != 'done']
        prioritized = self.prioritize_tasks(pending_tasks)
        
        if not prioritized:
            raise ValueError("Nenhuma tarefa disponível")
        
        best_task = prioritized[0]
        
        # Gera razão da sugestão
        reasons = []
        
        if best_task.urgency_level == "urgent":
            reasons.append("Deadline muito próximo")
        
        if best_task.importance_level == "high":
            reasons.append("Alta importância")
        
        if best_task.duration <= 2:
            reasons.append("Tarefa rápida (vitória rápida)")
        
        if best_task.stress < 0.3:
            reasons.append("Baixo stress")
        
        if best_task.fun > 0.7:
            reasons.append("Tarefa prazerosa")
        
        if not reasons:
            reasons.append("Melhor relação custo-benefício")
        
        reason = " • ".join(reasons)
        
        # Calcula horário estimado de término
        now = datetime.now()
        finish_time = now + timedelta(hours=best_task.duration)
        
        return NextActionSuggestion(
            task=best_task,
            reason=reason,
            estimated_finish_time=finish_time.strftime("%H:%M")
        )
    
    def adaptive_learning(self, ignored_task_id: int):
        """
        🤖 Aprendizado adaptativo
        Ajusta pesos quando usuário ignora sugestão
        """
        # Incrementa contador de ignorados
        self.db.increment_ignored_count(ignored_task_id)
        
        # Busca tarefa ignorada
        task = self.db.get_task_by_id(ignored_task_id)
        
        if not task or task.ignored_count < 2:
            return  # Precisa ignorar pelo menos 2x para ajustar
        
        # Carrega pesos atuais
        weights = self.db.get_user_weights()
        
        # Ajusta pesos baseado nas características da tarefa ignorada
        # Se ignora tarefas estressantes → diminui peso de stress
        if task.stress >= 0.6:
            weights['stress_weight'] *= 0.9
        
        # Se ignora tarefas longas → aumenta peso de effort
        if task.duration >= 5:
            weights['effort_weight'] *= 1.1
        
        # Se ignora tarefas de baixa importância → aumenta peso de importância
        if task.importance < 0.5:
            weights['importance_weight'] *= 1.1
        
        # Se ignora tarefas divertidas → diminui peso de fun
        if task.fun >= 0.7:
            weights['fun_weight'] *= 0.9
        
        # Salva pesos ajustados
        self.db.update_user_weights(weights)
    
    def get_dashboard_stats(self) -> DashboardStats:
        """
        📊 Estatísticas para o dashboard
        """
        all_tasks = self.db.get_all_tasks()
        
        backlog = [t for t in all_tasks if t.status == 'backlog']
        doing = [t for t in all_tasks if t.status == 'doing']
        done = [t for t in all_tasks if t.status == 'done']
        active = [t for t in all_tasks if t.status != 'done']
        
        total_hours = sum(t.duration for t in active)
        urgent = sum(1 for t in active if t.deadline <= 2)
        high_stress = sum(1 for t in active if t.stress >= 0.6)
        
        avg_stress = sum(t.stress for t in active) / len(active) if active else 0
        
        completion_rate = len(done) / len(all_tasks) if all_tasks else 0
        
        return DashboardStats(
            total_tasks=len(all_tasks),
            backlog_count=len(backlog),
            doing_count=len(doing),
            done_count=len(done),
            total_hours=round(total_hours, 1),
            urgent_tasks=urgent,
            high_stress_tasks=high_stress,
            average_stress=round(avg_stress, 2),
            completion_rate=round(completion_rate, 2)
        )
    
    def get_timeline_data(self) -> List[Dict]:
        """
        📅 Timeline de deadlines para os próximos 30 dias
        """
        tasks = self.db.get_all_tasks()
        active_tasks = [t for t in tasks if t.status != 'done']
        
        # Agrupa por deadline
        timeline = {}
        for task in active_tasks:
            if task.deadline <= 30:  # Apenas próximos 30 dias
                date = (datetime.now() + timedelta(days=task.deadline)).strftime("%Y-%m-%d")
                
                if date not in timeline:
                    timeline[date] = {
                        'date': date,
                        'tasks': [],
                        'total_hours': 0,
                        'urgent_count': 0
                    }
                
                timeline[date]['tasks'].append({
                    'id': task.id,
                    'title': task.title,
                    'duration': task.duration,
                    'importance': task.importance
                })
                timeline[date]['total_hours'] += task.duration
                
                if task.deadline <= 2:
                    timeline[date]['urgent_count'] += 1
        
        # Converte para lista ordenada
        result = sorted(timeline.values(), key=lambda x: x['date'])
        return result
