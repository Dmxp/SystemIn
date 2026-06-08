import { useEffect, useState } from 'react';
import { api } from '../api/axios';

type User = {
  id: number;
  fullName: string;
};

type Department = {
  id: number;
  name: string;
};

type Task = {
  id: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  deadline?: string;
  assignee?: {
    fullName: string;
  };
  department?: {
    name: string;
  };
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [showForm, setShowForm] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [deadline, setDeadline] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [departmentId, setDepartmentId] = useState('');

  async function loadTasks() {
    const response = await api.get('/tasks');
    setTasks(response.data);
  }

  async function loadUsers() {
    const response = await api.get('/users');
    setUsers(response.data);
  }

  async function loadDepartments() {
    const response = await api.get('/departments');
    setDepartments(response.data);
  }

  async function createTask(e: React.FormEvent) {
    e.preventDefault();

    await api.post('/tasks', {
      title,
      description,
      priority,
      deadline: deadline ? `${deadline}:00` : undefined,
      assigneeId: assigneeId ? Number(assigneeId) : undefined,
      departmentId: departmentId ? Number(departmentId) : undefined,
    });

    setTitle('');
    setDescription('');
    setPriority('MEDIUM');
    setDeadline('');
    setAssigneeId('');
    setDepartmentId('');
    setShowForm(false);

    await loadTasks();
  }

  useEffect(() => {
    loadTasks();
    loadUsers();
    loadDepartments();
  }, []);

  return (
    <div>
      <div style={pageHeaderStyle}>
        <div>
          <h1 style={{ margin: 0 }}>Задачи</h1>
          <p style={{ opacity: 0.7 }}>Управление задачами компании</p>
        </div>

        <button style={primaryButtonStyle} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Закрыть' : 'Создать задачу'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createTask} style={formStyle}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Название задачи"
            required
            style={inputStyle}
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Описание"
            style={{ ...inputStyle, minHeight: 90 }}
          />

          <select value={priority} onChange={(e) => setPriority(e.target.value)} style={inputStyle}>
            <option value="LOW">Низкий</option>
            <option value="MEDIUM">Средний</option>
            <option value="HIGH">Высокий</option>
            <option value="URGENT">Срочно</option>
          </select>

          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            style={inputStyle}
          />

          <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} style={inputStyle}>
            <option value="">Исполнитель</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.fullName}
              </option>
            ))}
          </select>

          <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} style={inputStyle}>
            <option value="">Отдел</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>

          <button type="submit" style={primaryButtonStyle}>
            Сохранить задачу
          </button>
        </form>
      )}

      <div style={tableWrapperStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'rgba(255,255,255,0.04)' }}>
            <tr>
              <th style={thStyle}>Название</th>
              <th style={thStyle}>Статус</th>
              <th style={thStyle}>Приоритет</th>
              <th style={thStyle}>Исполнитель</th>
              <th style={thStyle}>Отдел</th>
              <th style={thStyle}>Дедлайн</th>
            </tr>
          </thead>

          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 800 }}>{task.title}</div>
                  {task.description && (
                    <div style={{ opacity: 0.65, fontSize: 14, marginTop: 4 }}>
                      {task.description}
                    </div>
                  )}
                </td>
                <td style={tdStyle}>{task.status}</td>
                <td style={tdStyle}>{task.priority}</td>
                <td style={tdStyle}>{task.assignee?.fullName || 'Не назначен'}</td>
                <td style={tdStyle}>{task.department?.name || '-'}</td>
                <td style={tdStyle}>
                  {task.deadline
                    ? new Date(task.deadline).toLocaleString('ru-RU')
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const pageHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 24,
};

const primaryButtonStyle: React.CSSProperties = {
  background: '#116ed0',
  border: 'none',
  color: 'white',
  padding: '12px 18px',
  borderRadius: 10,
  cursor: 'pointer',
  fontWeight: 800,
};

const formStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, 1fr)',
  gap: 16,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 18,
  padding: 22,
  marginBottom: 24,
};

const tableWrapperStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  borderRadius: 18,
  overflow: 'hidden',
  border: '1px solid rgba(255,255,255,0.08)',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(0,0,0,0.25)',
  color: 'white',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: 16,
  fontSize: 14,
  opacity: 0.7,
};

const tdStyle: React.CSSProperties = {
  padding: 16,
};