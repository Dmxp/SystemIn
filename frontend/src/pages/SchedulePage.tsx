import { useEffect, useState } from 'react';
import { api } from '../api/axios';

type ScheduleEvent = {
  id: number;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime?: string;
  type: string;
  location?: string;
  channel?: string;
  responsible?: string;
};

const eventTypes = [
  { value: 'BROADCAST', label: 'Эфир' },
  { value: 'STUDIO', label: 'Студия' },
  { value: 'SERVER', label: 'Сервер' },
  { value: 'VIDEO_EDITING', label: 'Монтаж / видео' },
  { value: 'RADIO', label: 'Радио' },
  { value: 'INGEST', label: 'Инжест' },
  { value: 'ADVERTISING', label: 'Реклама' },
  { value: 'RESERVE', label: 'Резерв' },
  { value: 'OTHER', label: 'Другое' },
];

export default function SchedulePage() {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`;

  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(today);

  const [title, setTitle] = useState('');
  const [type, setType] = useState('BROADCAST');
  const [date, setDate] = useState(today);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [location, setLocation] = useState('');
  const [channel, setChannel] = useState('');
  const [responsible, setResponsible] = useState('');
  const [description, setDescription] = useState('');

  async function loadSchedule() {
    const response = await api.get('/schedule');
    setEvents(response.data);
  }

  useEffect(() => {
    loadSchedule();
  }, []);

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();

    await api.post('/schedule', {
      title,
      description,
      date: `${date}T00:00:00`,
      startTime: `${date}T${startTime}:00`,
      endTime: endTime ? `${date}T${endTime}:00` : undefined,
      type,
      location,
      channel,
      responsible,
    });

    setTitle('');
    setDescription('');
    setLocation('');
    setChannel('');
    setResponsible('');
    setShowForm(false);
    setSelectedDate(date);

    await loadSchedule();
  }

  const filteredEvents = events.filter((event) => {
    return event.startTime.slice(0, 10) === selectedDate;
  });

  function formatTime(value: string) {
    return new Date(value).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  function getTypeLabel(value: string) {
    return eventTypes.find((item) => item.value === value)?.label || value;
  }

  function getTypeColor(value: string) {
    switch (value) {
      case 'BROADCAST':
        return '#ef4444';
      case 'STUDIO':
        return '#3b82f6';
      case 'RADIO':
        return '#10b981';
      case 'VIDEO_EDITING':
        return '#f59e0b';
      case 'SERVER':
        return '#8b5cf6';
      case 'ADVERTISING':
        return '#dc2626';
      case 'RESERVE':
        return '#64748b';
      default:
        return '#475569';
    }
  }
  function changeDay(days: number) {
    const [year, month, day] = selectedDate.split('-').map(Number);

    const current = new Date(year, month - 1, day);
    current.setDate(current.getDate() + days);

    const newYear = current.getFullYear();
    const newMonth = String(current.getMonth() + 1).padStart(2, '0');
    const newDay = String(current.getDate()).padStart(2, '0');

    const newDate = `${newYear}-${newMonth}-${newDay}`;

    setSelectedDate(newDate);
    setDate(newDate);
  }

  // function changeDay(days: number) {
  //   const current = new Date(`${selectedDate}T00:00:00`);
  //   current.setDate(current.getDate() + days);
  //   const newDate = current.toISOString().slice(0, 10);
  //   setSelectedDate(newDate);
  //   setDate(newDate);
  // }

  return (
    <div>
      <div style={pageHeaderStyle}>
        <div>
          <h1 style={{ margin: 0 }}>Расписание</h1>
          <p style={{ opacity: 0.7 }}>Эфиры, студии, монтаж и оборудование</p>
        </div>

        <button style={primaryButtonStyle} onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Закрыть форму' : 'Добавить событие'}
        </button>
      </div>

      <div style={calendarBarStyle}>
        <button style={secondaryButtonStyle} onClick={() => changeDay(-1)}>
          ← Предыдущий день
        </button>

        <input
          type="date"
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setDate(e.target.value);
          }}
          style={inputStyle}
        />

        <button style={secondaryButtonStyle} onClick={() => changeDay(1)}>
          Следующий день →
        </button>
      </div>

      {showForm && (
        <form onSubmit={createEvent} style={formStyle}>
          <div style={gridStyle}>
            <Field label="Название">
              <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} required />
            </Field>

            <Field label="Тип события">
              <select value={type} onChange={(e) => setType(e.target.value)} style={inputStyle}>
                {eventTypes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Дата">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} style={inputStyle} required />
            </Field>

            <Field label="Начало">
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={inputStyle} required />
            </Field>

            <Field label="Окончание">
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={inputStyle} />
            </Field>

            <Field label="Локация">
              <input value={location} onChange={(e) => setLocation(e.target.value)} style={inputStyle} placeholder="АСБ-90" />
            </Field>

            <Field label="Канал">
              <input value={channel} onChange={(e) => setChannel(e.target.value)} style={inputStyle} placeholder="Россия" />
            </Field>

            <Field label="Ответственные">
              <input value={responsible} onChange={(e) => setResponsible(e.target.value)} style={inputStyle} />
            </Field>
          </div>

          <Field label="Описание">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, minHeight: 90 }} />
          </Field>

          <button type="submit" style={primaryButtonStyle}>
            Сохранить событие
          </button>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filteredEvents.map((event) => (
          <div
            key={event.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 130px 1fr 180px 220px',
              gap: 12,
              alignItems: 'center',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: '12px 16px',
            }}
          >
            <div style={{ fontWeight: 800 }}>
              {formatTime(event.startTime)}
              {event.endTime && `–${formatTime(event.endTime)}`}
            </div>

            <span
              style={{
                background: getTypeColor(event.type),
                padding: '5px 8px',
                borderRadius: 7,
                fontSize: 12,
                fontWeight: 700,
                textAlign: 'center',
              }}
            >
              {getTypeLabel(event.type)}
            </span>

            <div>
              <div style={{ fontWeight: 800 }}>{event.title}</div>

              {event.description && (
                <div style={{ opacity: 0.7, fontSize: 13, marginTop: 4 }}>
                  {event.description}
                </div>
              )}
            </div>

            <div style={{ opacity: 0.8, fontSize: 14 }}>
              {event.location || '-'}
            </div>

            <div style={{ opacity: 0.8, fontSize: 14 }}>
              {event.responsible || '-'}
            </div>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div style={eventCardStyle}>На выбранный день событий пока нет.</div>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <span style={{ opacity: 0.75, fontSize: 14 }}>{label}</span>
      {children}
    </label>
  );
}

const pageHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 28,
};

const calendarBarStyle: React.CSSProperties = {
  display: 'flex',
  gap: 12,
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
  fontWeight: 700,
};

const secondaryButtonStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.12)',
  color: 'white',
  padding: '12px 18px',
  borderRadius: 10,
  cursor: 'pointer',
  fontWeight: 700,
};

const formStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 18,
  padding: 24,
  marginBottom: 24,
  display: 'flex',
  flexDirection: 'column',
  gap: 18,
};

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(4, minmax(160px, 1fr))',
  gap: 16,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.16)',
  background: 'rgba(0,0,0,0.2)',
  color: 'white',
};

const eventCardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 18,
  padding: 24,
};
