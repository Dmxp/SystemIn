import { useEffect, useState } from 'react';
import { api } from '../api/axios';

type Ticket = {
  id: number;
  title: string;
  description?: string;
  category?: string;
  status: string;
  priority: string;
  cabinet?: string;
  assignee?: {
    fullName: string;
  };
};

export default function TicketsPage({
  openCreateForm = false,
}: {
  openCreateForm?: boolean;
}) {
  const [showForm, setShowForm] = useState(openCreateForm);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Компьютер');
  const [priority, setPriority] = useState('MEDIUM');
  const [cabinet, setCabinet] = useState('');

  async function loadTickets() {
    const response = await api.get('/tickets');
    setTickets(response.data);
  }

  async function createTicket(e: React.FormEvent) {
    e.preventDefault();

    await api.post('/tickets', {
      title,
      description,
      category,
      priority,
      cabinet,
    });

    setTitle('');
    setDescription('');
    setCategory('Компьютер');
    setPriority('MEDIUM');
    setCabinet('');
    setShowForm(false);

    await loadTickets();
  }

  useEffect(() => {
    loadTickets();
  }, []);

  function getStatusColor(status: string) {
    switch (status) {
      case 'NEW':
        return '#1d4ed8';
      case 'IN_PROGRESS':
        return '#f59e0b';
      case 'RESOLVED':
        return '#10b981';
      case 'CLOSED':
        return '#6b7280';
      default:
        return '#334155';
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'LOW':
        return '#10b981';
      case 'MEDIUM':
        return '#3b82f6';
      case 'HIGH':
        return '#f59e0b';
      case 'URGENT':
        return '#ef4444';
      default:
        return '#64748b';
    }
  }

  return (
    <div>
      <div style={pageHeaderStyle}>
        <div>
          <h1 style={{ margin: 0 }}>Заявки</h1>
          <p style={{ opacity: 0.7 }}>Создание и отслеживание заявок</p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          style={primaryButtonStyle}
        >
          {showForm ? 'Закрыть' : 'Создать заявку'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createTicket} style={formStyle}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Кратко опишите проблему"
            required
            style={inputStyle}
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={inputStyle}
          >
            <option value="Компьютер">Компьютер</option>
            <option value="Интернет">Интернет</option>
            <option value="Принтер">Принтер</option>
            <option value="Программа">Программа</option>
            <option value="Оборудование">Оборудование</option>
            <option value="Электрика">Электрика</option>
            <option value="Другое">Другое</option>
          </select>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={inputStyle}
          >
            <option value="LOW">Низкий</option>
            <option value="MEDIUM">Средний</option>
            <option value="HIGH">Высокий</option>
            <option value="URGENT">Срочно</option>
          </select>

          <input
            value={cabinet}
            onChange={(e) => setCabinet(e.target.value)}
            placeholder="Кабинет"
            style={inputStyle}
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Подробное описание проблемы"
            style={{
              ...inputStyle,
              gridColumn: '1 / -1',
              minHeight: 90,
              resize: 'vertical',
            }}
          />

          <button type="submit" style={primaryButtonStyle}>
            Отправить заявку
          </button>
        </form>
      )}

      <div style={tableWrapperStyle}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: 'rgba(255,255,255,0.04)' }}>
            <tr>
              <th style={thStyle}>Проблема</th>
              <th style={thStyle}>Категория</th>
              <th style={thStyle}>Статус</th>
              <th style={thStyle}>Приоритет</th>
              <th style={thStyle}>Кабинет</th>
              <th style={thStyle}>Исполнитель</th>
            </tr>
          </thead>

          <tbody>
            {tickets.map((ticket) => (
              <tr
                key={ticket.id}
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <td style={tdStyle}>
                  <div style={{ fontWeight: 800 }}>{ticket.title}</div>
                  {ticket.description && (
                    <div style={{ opacity: 0.65, fontSize: 14, marginTop: 4 }}>
                      {ticket.description}
                    </div>
                  )}
                </td>

                <td style={tdStyle}>{ticket.category || '-'}</td>

                <td style={tdStyle}>
                  <span
                    style={{
                      background: getStatusColor(ticket.status),
                      padding: '6px 10px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {ticket.status}
                  </span>
                </td>

                <td style={tdStyle}>
                  <span
                    style={{
                      background: getPriorityColor(ticket.priority),
                      padding: '6px 10px',
                      borderRadius: 8,
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {ticket.priority}
                  </span>
                </td>

                <td style={tdStyle}>{ticket.cabinet || '-'}</td>

                <td style={tdStyle}>
                  {ticket.assignee?.fullName || 'Не назначен'}
                </td>
              </tr>
            ))}

            {tickets.length === 0 && (
              <tr>
                <td style={tdStyle} colSpan={6}>
                  Заявок пока нет.
                </td>
              </tr>
            )}
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
  gridTemplateColumns: 'repeat(4, 1fr)',
  gap: 16,
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 18,
  padding: 22,
  marginBottom: 24,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(0,0,0,0.25)',
  color: 'white',
};

const tableWrapperStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.05)',
  borderRadius: 18,
  overflow: 'hidden',
  border: '1px solid rgba(255,255,255,0.08)',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: 18,
  fontSize: 14,
  opacity: 0.7,
};

const tdStyle: React.CSSProperties = {
  padding: 18,
};