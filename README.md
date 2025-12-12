# Scrum Master AI - Gerenciador Inteligente de Tarefas

**Disciplina:** Introdução à Inteligência Artificial  
**Semestre:** 2025.2  
**Professor:** ANDRÉ LUIS FONSECA FAUSTINO
**Turma:** [T04]

## Integrantes do Grupo
* Ângelo Gabriel de Lima Miranda (2020118732)
* Kleison Vitoriano da Silva (20250066607)

## Descrição do Projeto

O **Scrum Master AI** é um gerenciador de tarefas acadêmico que prioriza automaticamente atividades usando **teoria da utilidade** e **aprendizado adaptativo**. O sistema calcula um score de utilidade para cada tarefa considerando múltiplos fatores (urgência, importância, stress, diversão, esforço e penalidades), ordena as atividades de forma otimizada e sugere a melhor tarefa para executar em cada momento. 

O agente possui três funcionalidades principais: **(1) Cálculo de Utilidade Multidimensional** - pondera 6 fatores com pesos adaptativos; **(2) Modo Alto Estresse** - detecta automaticamente sobrecarga e ajusta a estratégia para priorizar tarefas rápidas e importantes; **(3) Aprendizado Adaptativo** - ajusta os pesos quando o usuário ignora sugestões, aprendendo suas preferências reais. O projeto utiliza **FastAPI** no backend para criar uma API REST, **SQLite** para persistência de dados, **React + Vite** no frontend com interface moderna em **TailwindCSS**, e **Lucide React** para ícones profissionais.

## Guia de Instalação e Execução

### Pré-requisitos
* **Python 3.12+** instalado
* **Node.js 18+** e **npm** instalados
* **Git** para clonar o repositório

### 1. Clonar o Repositório

```bash
git clone https://github.com/angelomiray/scrum-master-ai.git
cd scrum-master-ai
```

### 2. Configurar o Backend (FastAPI)

```bash
# Entrar na pasta backend
cd backend

# Criar ambiente virtual Python
python3 -m venv venv

# Ativar ambiente virtual
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Popular banco de dados com tarefas de exemplo
python seed_tasks.py

# Iniciar servidor backend
python main.py
```

O backend estará disponível em: **http://localhost:8000**  
Documentação da API: **http://localhost:8000/docs**

### 3. Configurar o Frontend (React + Vite)

Abra um **novo terminal** e execute:

```bash
# Entrar na pasta frontend
cd frontend

# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em: **http://localhost:5173**

### 4. Como Utilizar

1. **Acesse** http://localhost:5173 no navegador
2. **Crie tarefas** clicando em "Nova Tarefa" e preenchendo os atributos:
   - Título e descrição
   - Deadline (em dias)
   - Importância (0 a 1)
   - Duração estimada (em horas)
   - Nível de stress (0 a 1)
   - Nível de diversão (0 a 1)
   - Penalidade por atraso (0 a 1)
3. **Visualize no Kanban** e arraste tarefas entre as colunas (Backlog → Doing → Done)
4. **Clique em "Priorizar Tarefas"** para ver a lista ordenada por utilidade
5. **Dashboard** mostra a sugestão "O que fazer agora?" com a melhor tarefa e o motivo
6. **Painel lateral** exibe progresso geral, estatísticas e calendário de deadlines

## Estrutura dos Arquivos

```
AI-Task-Manager/
├── backend/                      # Servidor FastAPI
│   ├── main.py                   # Endpoints da API REST
│   ├── agent_intelligence.py     # Lógica do agente de IA
│   ├── database.py               # Camada de persistência (SQLite)
│   ├── models.py                 # Modelos Pydantic
## Funcionalidades do Agente de IA

### 1. Cálculo de Utilidade Multidimensional
O agente calcula um score de utilidade para cada tarefa usando a fórmula:

```
utility = urgência × w1 + importância × w2 + penalidade × w3 + 
          (1 - stress) × w4 + diversão × w5 + (1 - esforço) × w6
```

Onde:
- **Urgência**: Calculada como `1 / (deadline + 1)` (aumenta exponencialmente)
- **Importância**: Valor de 0 a 1 definido pelo usuário
- **Penalidade**: Aplicada apenas se deadline < 2 dias
- **Stress**: Tarefas com baixo stress recebem pontos extras
- **Diversão**: Tarefas prazerosas ganham bônus
- **Esforço**: Tarefas rápidas são priorizadas como "vitórias rápidas"

### 2. Modo Alto Estresse (Adaptação Automática)
Detecta automaticamente sobrecarga quando:
- ≥50% das tarefas têm stress alto (≥0.6), OU
- ≥40% das tarefas são urgentes (deadline ≤2 dias), OU  
- Total de horas pendentes ≥40h

**Ajustes aplicados:**
- Urgência: +30%
- Importância: +40%
- Esforço (tarefas rápidas): +80%
- Diversão: -70%

**Estratégia**: Priorizar tarefas importantes e rápidas para reduzir carga mental.

### 3. Aprendizado Adaptativo
Quando o usuário ignora uma sugestão (≥2 vezes), o agente ajusta os pesos:
- Ignora tarefas estressantes → diminui peso de stress em 10%
- Ignora tarefas longas → aumenta peso de esforço em 10%
- Ignora tarefas de baixa importância → aumenta peso de importância em 10%
- Ignora tarefas divertidas → diminui peso de diversão em 10%

## Endpoints da API

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Informações da API |
| POST | `/tasks` | Criar nova tarefa |
| GET | `/tasks` | Listar todas as tarefas |
| PATCH | `/tasks/{id}` | Atualizar tarefa |
| DELETE | `/tasks/{id}` | Remover tarefa |
| POST | `/agent/priorizar` | Ordenar tarefas por utilidade |
| GET | `/agent/next-action` | Sugerir próxima tarefa ideal |
| POST | `/agent/ignore/{id}` | Registrar ignorar (aprendizado) |
| GET | `/agent/weights` | Obter pesos adaptativos atuais |
| GET | `/dashboard/stats` | Estatísticas gerais |
| GET | `/dashboard/high-stress-mode` | Verificar modo alto estresse |

## Resultados e Demonstração

O sistema foi testado com 4 tarefas acadêmicas de exemplo (React, testes unitários, FastAPI, algoritmos) com diferentes níveis de urgência, importância e stress. O agente conseguiu:

1. **Priorizar corretamente** tarefas urgentes e importantes
2. **Detectar modo alto estresse** quando múltiplas tarefas tinham deadline curto
3. **Adaptar pesos** após ignorar sugestões, ajustando para preferências do usuário
4. **Sugerir "vitórias rápidas"** (tarefas de 2h) quando em sobrecarga

A interface drag-and-drop permite mover tarefas entre colunas (Backlog → Doing → Done), com atualização em tempo real das estatísticas no painel lateral. O calendário exibe deadlines dos próximos 7 dias e permite visualizar tarefas por data.

## Referências

* [FastAPI Documentation](https://fastapi.tiangolo.com/) - Framework web utilizado no backend
* [React Documentation](https://react.dev/) - Biblioteca UI do frontend
* [TailwindCSS](https://tailwindcss.com/) - Framework CSS utilitário
* [Teoria da Utilidade em IA](https://en.wikipedia.org/wiki/Utility) - Base teórica para o cálculo de priorização
* [Aprendizado por Reforço](https://pt.wikipedia.org/wiki/Aprendizado_por_refor%C3%A7o) - Conceito aplicado no aprendizado adaptativoo de próxima ação
│   │   │   ├── KanbanBoard.jsx   # Quadro Kanban drag-and-drop
│   │   │   ├── PrioritizedView.jsx # Lista ordenada por utilidade
│   │   │   ├── TaskForm.jsx      # Modal de criar/editar tarefa
│   │   │   ├── ProgressPanel.jsx # Painel lateral com stats e calendário
│   │   │   ├── TaskList.jsx      # Lista simples de tarefas
│   │   │   ├── Sidebar.jsx       # Menu de navegação
│   │   │   └── Modal.jsx         # Componente de modal genérico
│   │   ├── App.jsx               # Componente raiz + roteamento
│   │   ├── main.jsx              # Entry point
│   │   └── styles.css            # Estilos globais
│   ├── package.json              # Dependências Node.js
│   └── vite.config.js            # Configuração do Vite
│
└── README.md                     # Este arquivo
```

### Tecnologias Utilizadas

**Backend:**
- FastAPI 0.104.1 - Framework web moderno e rápido
- Pydantic 2.5.0 - Validação de dados
- SQLite - Banco de dados embutido
- Uvicorn 0.24.0 - Servidor ASGI

**Frontend:**
- React 18.2.0 - Biblioteca UI
- Vite 5.0.8 - Build tool e dev server
- TailwindCSS 3.3.6 - Framework CSS utilitário
- Lucide React - Biblioteca de ícones
- @dnd-kit - Drag and drop
- React Router 6.20.0 - Roteamento

## Resultados e Demonstração

Você poderá ver um vídeo demonstrativo através do link: [https://drive.google.com/file/d/1OSB8ubk85KxQFbfKKjUtOoJzW6u5QBCc/view?usp=sharing](https://drive.google.com/file/d/1OSB8ubk85KxQFbfKKjUtOoJzW6u5QBCc/view?usp=sharing)