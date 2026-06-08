import { useEffect, useState } from 'react';
import { api } from '../api/axios';

type Department = {
  id: number;
  name: string;
  users: {
    id: number;
    fullName: string;
    email: string;
    role: string;
  }[];
};

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [name, setName] = useState('');

  async function loadDepartments() {
    const response = await api.get('/departments');
    setDepartments(response.data);
  }

  async function createDepartment(e: React.FormEvent) {
    e.preventDefault();

    await api.post('/departments', {
      name,
    });

    setName('');
    await loadDepartments();
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  return (
    <div>
      <h1 style={{ margin: 0, marginBottom: 8 }}>Отделы</h1>
      <p style={{ opacity: 0.7, marginBottom: 24 }}>
        Структура компании и сотрудники отделов
      </p>

      <form
        onSubmit={createDepartment}
        style={{
          display: 'flex',
          gap: 12,
          marginBottom: 24,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 18,
          padding: 18,
        }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Название отдела"
          required
          style={{
            flex: 1,
            padding: '12px 14px',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.14)',
            background: 'rgba(0,0,0,0.25)',
            color: 'white',
          }}
        />

        <button
          style={{
            background: '#116ed0',
            border: 'none',
            color: 'white',
            padding: '0 18px',
            borderRadius: 10,
            cursor: 'pointer',
            fontWeight: 800,
          }}
        >
          Добавить отдел
        </button>
      </form>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 18,
        }}
      >
        {departments.map((department) => (
          <div
            key={department.id}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 18,
              padding: 22,
            }}
          >
            <h2 style={{ marginTop: 0 }}>{department.name}</h2>

            <p style={{ opacity: 0.7, marginBottom: 16 }}>
              Сотрудников: {department.users.length}
            </p>

            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    maxHeight: 220,
                    overflowY: 'auto',
                    paddingRight: 6,
                }}
>
              {department.users.map((user) => (
                <div
                  key={user.id}
                  style={{
                    background: 'rgba(0,0,0,0.18)',
                    borderRadius: 10,
                    padding: 12,
                  }}
                >
                  <div style={{ fontWeight: 800 }}>{user.fullName}</div>
                  <div style={{ opacity: 0.65, fontSize: 14 }}>{user.email}</div>
                  <div style={{ opacity: 0.65, fontSize: 14 }}>{user.role}</div>
                </div>
              ))}

              {department.users.length === 0 && (
                <div style={{ opacity: 0.6 }}>Сотрудников пока нет</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}