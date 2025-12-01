from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TaskCreate(BaseModel):
    title: str
    description: str = ""
    deadline: int
    importance: float
    duration: float
    stress: float
    fun: float
    penalty_late: float
    status: str = "backlog"  # backlog, doing, done


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[int] = None
    importance: Optional[float] = None
    duration: Optional[float] = None
    stress: Optional[float] = None
    fun: Optional[float] = None
    penalty_late: Optional[float] = None
    status: Optional[str] = None


class Task(BaseModel):
    id: int
    title: str
    description: str = ""
    deadline: int
    importance: float
    duration: float
    stress: float
    fun: float
    penalty_late: float
    status: str = "backlog"
    ignored_count: int = 0
    completed_date: Optional[str] = None
    created_at: str

    class Config:
        from_attributes = True


class TaskWithUtility(Task):
    utility: float
    urgency_level: str
    importance_level: str


class UserWeights(BaseModel):
    urgency_weight: float = 3.0
    importance_weight: float = 2.5
    penalty_weight: float = 2.0
    stress_weight: float = 1.0
    fun_weight: float = 0.5
    effort_weight: float = 1.5


class DashboardStats(BaseModel):
    total_tasks: int
    backlog_count: int
    doing_count: int
    done_count: int
    total_hours: float
    urgent_tasks: int
    high_stress_tasks: int
    average_stress: float
    completion_rate: float


class NextActionSuggestion(BaseModel):
    task: TaskWithUtility
    reason: str
    estimated_finish_time: str
