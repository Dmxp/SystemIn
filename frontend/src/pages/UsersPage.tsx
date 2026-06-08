import { useEffect, useState } from 'react';
import { api } from '../api/axios';

type Department = {
  id: number;
  name: string;
};

type User = {
  id: number;
  fullName: string;
  email: string;
  position?: string;
  cabinet?: string;
  role: string;
  department?: {
    id: number;
    name: string;
  };
};

const roles = [
  'USER',
  'ADMIN',
  'DEPARTMENT_HEAD',
  'PTO_SPECIALIST',
  'MANAGEMENT',
];

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [showForm, setShowForm] = useState(false);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [position, setPosition] = useState('');
  const [cabinet, setCabinet] = useState('');
  const [role, setRole] = useState('USER');
  const [departmentId, setDepartmentId] = useState('');

  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [editCabinet, setEditCabinet] = useState('');
  const [editRole, setEditRole] = useState('USER');
  const [editDepartmentId, setEditDepartmentId] = useState('');

  async function loadUsers() {
    const response = await api.get('/users');
    setUsers(response.data);
  }

  async function loadDepartments() {
    const response = await api.get('/departments');
    setDepartments(response.data);
  }

  async function createUser(e: React.FormEvent) {
    e.preventDefault();

    await api.post('/users', {
      fullName,
      email,
      password,
      position,
      cabinet,
      role,
      departmentId: departmentId ? Number(departmentId) : null,
    });

    setFullName('');
    setEmail('');
    setPassword('');
    setPosition('');
    setCabinet('');
    setRole('USER');
    setDepartmentId('');
    setShowForm(false);

    await loadUsers();
  }

  function startEdit(user: User) {
    setEditingUserId(user.id);
    setEditFullName(user.fullName);
    setEditPosition(user.position || '');
    setEditCabinet(user.cabinet || '');
    setEditRole(user.role);
    setEditDepartmentId(user.department?.id ? String(user.department.id) : '');
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();

    if (!editingUserId) return;

    await api.patch(`/users/${editingUserId}`, {
      fullName: editFullName,
      position: editPosition,
      cabinet: editCabinet,
      role: editRole,
      departmentId: editDepartmentId ? Number(editDepartmentId) : null,
    });

    setEditingUserId(null);
    await loadUsers();
  }

  async function resetPassword(userId: number) {
    const newPassword = prompt('Введите новый пароль для пользователя');

    if (!newPassword) return;

    await api.patch(`/users/${userId}/password`, {
      password: newPassword,
    });

    alert('Пароль успешно изменён');
  }

  useEffect(() => {
    loadUsers();
    loadDepartments();
  }, []);

  return (
    <div>
      <div style={pageHeaderStyle}>
        <div>
          <h1 style={{ margin: 0, marginBottom: 8 }}>Пользователи</h1>

          <p style={{ opacity: 0.7 }}>Сотрудники, роли и отделы</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          style={primaryButtonStyle}
        >
          {showForm ? 'Закрыть' : 'Добавить пользователя'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createUser} style={formStyle}>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="ФИО"
            required
            style={inputStyle}
          />

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            style={inputStyle}
          />

          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            required
            style={inputStyle}
          />

          <input
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            placeholder="Должность"
            style={inputStyle}
          />

          <input
            value={cabinet}
            onChange={(e) => setCabinet(e.target.value)}
            placeholder="Кабинет"
            style={inputStyle}
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={inputStyle}
          >
            {roles.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            style={inputStyle}
          >
            <option value="">Выберите отдел</option>

            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>

          <button type="submit" style={primaryButtonStyle}>
            Создать
          </button>
        </form>
      )}

      {editingUserId && (
        <form onSubmit={saveEdit} style={formStyle}>
          <input
            value={editFullName}
            onChange={(e) => setEditFullName(e.target.value)}
            placeholder="ФИО"
            style={inputStyle}
          />

          <input
            value={editPosition}
            onChange={(e) => setEditPosition(e.target.value)}
            placeholder="Должность"
            style={inputStyle}
          />

          <input
            value={editCabinet}
            onChange={(e) => setEditCabinet(e.target.value)}
            placeholder="Кабинет"
            style={inputStyle}
          />

          <select
            value={editRole}
            onChange={(e) => setEditRole(e.target.value)}
            style={inputStyle}
          >
            {roles.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={editDepartmentId}
            onChange={(e) => setEditDepartmentId(e.target.value)}
            style={inputStyle}
          >
            <option value="">Без отдела</option>

            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>

          <button type="submit" style={primaryButtonStyle}>
            Сохранить
          </button>

          <button
            type="button"
            onClick={() => setEditingUserId(null)}
            style={{
              ...primaryButtonStyle,
              background: '#64748b',
            }}
          >
            Отмена
          </button>
        </form>
      )}

      <div style={tableWrapperStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'rgba(255,255,255,0.04)' }}>
            <tr>
              <th style={thStyle}>ФИО</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Должность</th>
              <th style={thStyle}>Кабинет</th>
              <th style={thStyle}>Отдел</th>
              <th style={thStyle}>Роль</th>
              <th style={thStyle}>Действия</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <td style={tdStyle}>{user.fullName}</td>
                <td style={tdStyle}>{user.email}</td>
                <td style={tdStyle}>{user.position || '-'}</td>
                <td style={tdStyle}>{user.cabinet || '-'}</td>
                <td style={tdStyle}>{user.department?.name || '-'}</td>
                <td style={tdStyle}>{user.role}</td>

                <td style={tdStyle}>
                  <button
                    onClick={() => startEdit(user)}
                    style={smallButtonStyle}
                  >
                    Редактировать
                  </button>

                  <button
                    onClick={() => resetPassword(user.id)}
                    style={{
                      ...smallButtonStyle,
                      background: '#dc2626',
                      marginLeft: 8,
                    }}
                  >
                    Сброс пароля
                  </button>
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

const tableWrapperStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  borderRadius: 18,
  overflow: 'hidden',
  border: '1px solid rgba(255,255,255,0.08)',
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

const primaryButtonStyle: React.CSSProperties = {
  background: '#116ed0',
  border: 'none',
  color: 'white',
  padding: '12px 18px',
  borderRadius: 10,
  cursor: 'pointer',
  fontWeight: 800,
};

const smallButtonStyle: React.CSSProperties = {
  background: '#116ed0',
  border: 'none',
  color: 'white',
  padding: '8px 10px',
  borderRadius: 8,
  cursor: 'pointer',
  fontWeight: 700,
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

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(0,0,0,0.25)',
  color: 'white',
};