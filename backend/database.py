import sqlite3
from typing import List, Optional
from datetime import datetime
from models import Task, TaskCreate, TaskUpdate


class Database:
    def __init__(self, db_name: str = "tasks.db"):
        self.db_name = db_name
        self.init_db()

    def get_connection(self):
        return sqlite3.connect(self.db_name)

    def init_db(self):
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Tabela de tarefas
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT DEFAULT '',
                deadline INTEGER NOT NULL,
                importance REAL NOT NULL,
                duration REAL NOT NULL,
                stress REAL NOT NULL,
                fun REAL NOT NULL,
                penalty_late REAL NOT NULL,
                status TEXT DEFAULT 'backlog',
                ignored_count INTEGER DEFAULT 0,
                completed_date TEXT,
                created_at TEXT NOT NULL
            )
        """)
        
        # Tabela de pesos do usuário (aprendizado adaptativo)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_weights (
                id INTEGER PRIMARY KEY,
                urgency_weight REAL DEFAULT 3.0,
                importance_weight REAL DEFAULT 2.5,
                penalty_weight REAL DEFAULT 2.0,
                stress_weight REAL DEFAULT 1.0,
                fun_weight REAL DEFAULT 0.5,
                effort_weight REAL DEFAULT 1.5,
                updated_at TEXT
            )
        """)
        
        # Inicializa pesos padrão se não existir
        cursor.execute("SELECT COUNT(*) FROM user_weights")
        if cursor.fetchone()[0] == 0:
            cursor.execute("""
                INSERT INTO user_weights (id, updated_at) 
                VALUES (1, ?)
            """, (datetime.now().isoformat(),))
        
        conn.commit()
        conn.close()

    def create_task(self, task: TaskCreate) -> Task:
        conn = self.get_connection()
        cursor = conn.cursor()
        created_at = datetime.now().isoformat()
        
        cursor.execute("""
            INSERT INTO tasks (title, description, deadline, importance, duration, stress, fun, penalty_late, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (task.title, task.description, task.deadline, task.importance, task.duration, task.stress, 
              task.fun, task.penalty_late, task.status, created_at))
        
        conn.commit()
        task_id = cursor.lastrowid
        conn.close()
        
        return Task(
            id=task_id, 
            created_at=created_at,
            ignored_count=0,
            completed_date=None,
            **task.model_dump()
        )

    def get_all_tasks(self) -> List[Task]:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM tasks ORDER BY created_at DESC")
        rows = cursor.fetchall()
        conn.close()
        
        tasks = []
        for row in rows:
            tasks.append(Task(
                id=row[0],
                title=row[1],
                description=row[2] if len(row) > 2 and row[2] else "",
                deadline=row[3] if len(row) > 3 else row[2],
                importance=row[4] if len(row) > 4 else row[3],
                duration=row[5] if len(row) > 5 else row[4],
                stress=row[6] if len(row) > 6 else row[5],
                fun=row[7] if len(row) > 7 else row[6],
                penalty_late=row[8] if len(row) > 8 else row[7],
                status=row[9] if len(row) > 9 and row[9] else "backlog",
                ignored_count=row[10] if len(row) > 10 and row[10] else 0,
                completed_date=row[11] if len(row) > 11 else None,
                created_at=row[12] if len(row) > 12 else row[11] if len(row) > 11 else ""
            ))
        return tasks

    def get_task_by_id(self, task_id: int) -> Optional[Task]:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return None
            
        return Task(
            id=row[0],
            title=row[1],
            description=row[2] if len(row) > 2 and row[2] else "",
            deadline=row[3] if len(row) > 3 else row[2],
            importance=row[4] if len(row) > 4 else row[3],
            duration=row[5] if len(row) > 5 else row[4],
            stress=row[6] if len(row) > 6 else row[5],
            fun=row[7] if len(row) > 7 else row[6],
            penalty_late=row[8] if len(row) > 8 else row[7],
            status=row[9] if len(row) > 9 and row[9] else "backlog",
            ignored_count=row[10] if len(row) > 10 and row[10] else 0,
            completed_date=row[11] if len(row) > 11 else None,
            created_at=row[12] if len(row) > 12 else row[11] if len(row) > 11 else ""
        )

    def update_task(self, task_id: int, task_update: TaskUpdate) -> Optional[Task]:
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Busca tarefa atual
        current_task = self.get_task_by_id(task_id)
        if not current_task:
            conn.close()
            return None
        
        # Prepara update
        update_data = task_update.model_dump(exclude_unset=True)
        
        # Se mudou para done, registra data
        if update_data.get('status') == 'done' and current_task.status != 'done':
            update_data['completed_date'] = datetime.now().isoformat()
        
        if not update_data:
            conn.close()
            return current_task
        
        # Monta query dinamicamente
        set_clause = ", ".join([f"{key} = ?" for key in update_data.keys()])
        values = list(update_data.values()) + [task_id]
        
        cursor.execute(f"UPDATE tasks SET {set_clause} WHERE id = ?", values)
        conn.commit()
        conn.close()
        
        return self.get_task_by_id(task_id)

    def delete_task(self, task_id: int) -> bool:
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        conn.commit()
        deleted = cursor.rowcount > 0
        conn.close()
        return deleted

    def increment_ignored_count(self, task_id: int):
        """Incrementa contador quando usuário ignora sugestão"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE tasks SET ignored_count = ignored_count + 1 
            WHERE id = ?
        """, (task_id,))
        conn.commit()
        conn.close()

    def get_user_weights(self):
        """Retorna pesos adaptativos do usuário"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM user_weights WHERE id = 1")
        row = cursor.fetchone()
        conn.close()
        
        return {
            'urgency_weight': row[1],
            'importance_weight': row[2],
            'penalty_weight': row[3],
            'stress_weight': row[4],
            'fun_weight': row[5],
            'effort_weight': row[6]
        }

    def update_user_weights(self, weights: dict):
        """Atualiza pesos adaptativos"""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE user_weights 
            SET urgency_weight = ?, importance_weight = ?, penalty_weight = ?,
                stress_weight = ?, fun_weight = ?, effort_weight = ?, updated_at = ?
            WHERE id = 1
        """, (weights['urgency_weight'], weights['importance_weight'], 
              weights['penalty_weight'], weights['stress_weight'],
              weights['fun_weight'], weights['effort_weight'],
              datetime.now().isoformat()))
        conn.commit()
        conn.close()

    def get_tasks_by_date(self, target_date: str) -> List[Task]:
        """Retorna tarefas cujo deadline cai em uma data específica"""
        # Calcula quantos dias faltam para a data alvo
        from datetime import datetime, timedelta
        target = datetime.fromisoformat(target_date)
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        days_until = (target - today).days
        
        tasks = self.get_all_tasks()
        return [t for t in tasks if t.deadline == days_until and t.status != 'done']
