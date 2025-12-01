# 🤖 Agente Scrum - Sistema de Priorização de Tarefas Acadêmicas

Sistema completo de gerenciamento e priorização inteligente de tarefas acadêmicas utilizando FastAPI + React + TailwindCSS.

## 📋 Estrutura do Projeto

```
project/
├── backend/              # API FastAPI
│   ├── main.py          # Rotas da API
│   ├── agent.py         # Algoritmo de utilidade
│   ├── models.py        # Modelos Pydantic
│   ├── database.py      # Gerenciamento SQLite
│   ├── requirements.txt # Dependências Python
│   └── venv/            # Ambiente virtual
│
└── frontend/            # Aplicação React
    ├── src/
    │   ├── components/  # Componentes React
    │   ├── App.jsx      # Componente principal
    │   └── main.jsx     # Entry point
    ├── package.json
    ├── vite.config.js
    └── tailwind.config.js
```

## 🚀 Como Executar

### Backend (FastAPI)

1. Navegue até a pasta backend:
```bash
cd backend
```

2. Ative o ambiente virtual:
```bash
source venv/bin/activate
```

3. Execute o servidor:
```bash
python main.py
```

O backend estará rodando em: **http://localhost:8000**

API Docs disponível em: **http://localhost:8000/docs**

### Frontend (React + Vite)

1. Em outro terminal, navegue até a pasta frontend:
```bash
cd frontend
```

2. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

O frontend estará rodando em: **http://localhost:5173**

## 🎯 Funcionalidades

### 1. **Gerenciamento de Tarefas**
- Criar novas tarefas com múltiplos parâmetros
- Visualizar todas as tarefas cadastradas
- Excluir tarefas

### 2. **Parâmetros de Tarefa**
- **Título**: Nome da tarefa
- **Deadline**: Dias restantes até o prazo
- **Importância**: Nível de importância (0-1)
- **Duração**: Tempo estimado em horas
- **Stress**: Nível de stress da tarefa (0-1)
- **Diversão**: Quão divertida é a tarefa (0-1)
- **Penalidade**: Penalidade se atrasado (0-1)

### 3. **Priorização Inteligente**
O algoritmo de utilidade considera:
- **Urgência**: inversamente proporcional ao deadline
- **Importância**: valor direto da importância
- **Esforço**: penaliza tarefas longas
- **Penalidade**: aumenta drasticamente se próximo do deadline
- **Stress**: penaliza tarefas estressantes
- **Diversão**: bonifica tarefas prazerosas

#### Fórmula de Utilidade:
```python
urgency = 1 / (deadline + 1)
effort = duration / 10
penalty = penalty_late if deadline < 2 else 0

utility = (
    urgency * 3.0 +           # Urgência tem peso alto
    importance * 2.5 +        # Importância também é crucial
    penalty * 2.0 +           # Penalidade aumenta prioridade
    (1 - stress) * 1.0 +      # Menos stress é melhor
    fun * 0.5 +               # Diversão é um bônus leve
    (1 - effort) * 1.5        # Tarefas rápidas são priorizadas
)
```

## 🎨 Interface

### Páginas:
1. **Tarefas** (`/`) - Lista todas as tarefas
2. **Nova Tarefa** (`/new`) - Formulário para criar tarefa
3. **Priorizar** (`/priorizar`) - Visualização ordenada por utilidade

### Tema:
- Design minimalista e funcional
- Tema claro com TailwindCSS
- Cards estilo Kanban/Trello
- Tags coloridas para urgência e importância

## 🔌 API Endpoints

### `POST /tasks`
Cria uma nova tarefa
```json
{
  "title": "Estudar FastAPI",
  "deadline": 5,
  "importance": 0.8,
  "duration": 4.5,
  "stress": 0.6,
  "fun": 0.7,
  "penalty_late": 0.5
}
```

### `GET /tasks`
Retorna todas as tarefas

### `DELETE /tasks/{id}`
Remove uma tarefa pelo ID

### `POST /agent/priorizar`
Retorna todas as tarefas ordenadas por utilidade

## 🛠️ Tecnologias

- **Backend**: FastAPI, SQLite, Pydantic
- **Frontend**: React, Vite, TailwindCSS, React Router
- **Comunicação**: API REST (JSON)
- **Estilo**: Minimalista, funcional, tema claro

## 📦 Dependências

### Backend
- fastapi==0.104.1
- uvicorn==0.24.0
- sqlalchemy==2.0.23
- pydantic==2.5.0
- python-multipart==0.0.6

### Frontend
- react ^18.2.0
- react-router-dom ^6.20.0
- vite ^5.0.8
- tailwindcss ^3.3.6

## 🎓 Casos de Uso

Ideal para estudantes que precisam:
- Organizar trabalhos acadêmicos
- Priorizar estudos para provas
- Balancear múltiplas disciplinas
- Gerenciar prazos de entrega
- Otimizar tempo de estudo

---

**Desenvolvido com ❤️ usando FastAPI + React + TailwindCSS**
