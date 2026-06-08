import { useEffect, useState } from 'react';
import { api } from '../api/axios';

type HomePageProps = {
  setActivePage: (page: string) => void;
};

type ScheduleEvent = {
  id: number;
  title: string;
  startTime: string;
  endTime?: string;
  location?: string;
  type: string;
};

type NewsItem = {
  id: number;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
};

export default function HomePage({ setActivePage }: HomePageProps) {
  const [todayEvents, setTodayEvents] = useState<ScheduleEvent[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    loadTodaySchedule();
    loadNews();
  }, []);

  async function loadTodaySchedule() {
    const response = await api.get('/schedule');

    const today = new Date();

    const todayString = `${today.getFullYear()}-${String(
      today.getMonth() + 1,
    ).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const events = response.data.filter((event: ScheduleEvent) => {
      return event.startTime.slice(0, 10) === todayString;
    });

    setTodayEvents(events.slice(0, 5));
  }

  async function loadNews() {
    const response = await api.get('/news');
    setNews(response.data);
  }

  function formatTime(value: string) {
    return new Date(value).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div>
      <div style={cardsGridStyle}>
        <Card
          title="Мои задачи"
          value="Открыть"
          description="Личные и назначенные задачи"
          onClick={() => setActivePage('Мои задачи')}
        />

        <Card
          title="Заявки"
          value="HelpDesk"
          description="Технические обращения и проблемы"
          onClick={() => setActivePage('Мои заявки')}
        />

        <Card
          title="Расписание"
          value="Сегодня"
          description="Эфиры, студии и монтаж"
          onClick={() => setActivePage('Расписание')}
        />
      </div>

      <div style={topGridStyle}>
        <div style={panelStyle}>
          <h2 style={{ marginTop: 0 }}>Сегодняшнее расписание</h2>

          {todayEvents.length === 0 && (
            <p style={{ opacity: 0.7 }}>
              На сегодня событий в расписании пока нет.
            </p>
          )}

          {todayEvents.map((event) => (
            <button
              key={event.id}
              onClick={() => setActivePage('Расписание')}
              style={scheduleItemStyle}
            >
              <b>
                {formatTime(event.startTime)}
                {event.endTime && `–${formatTime(event.endTime)}`}
              </b>

              <div>
                <div style={{ fontWeight: 800 }}>{event.title}</div>

                <div style={{ opacity: 0.65, fontSize: 14 }}>
                  {event.location || event.type}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div
          style={aiPanelStyle}
          onClick={() => setActivePage('AI Помощник')}
        >
          <div>
            <h2 style={{ margin: 0 }}>AI-помощник</h2>

            <p style={{ opacity: 0.75, marginTop: 8 }}>
              Поможет составить заявку, придумать сюжет, подготовить текст или
              найти решение проблемы.
            </p>
          </div>

          <div style={{ fontSize: 42 }}>✦</div>
        </div>
      </div>

      <div style={{ ...panelStyle, marginTop: 24 }}>
        <h2 style={{ marginTop: 0 }}>Новости компании</h2>

        <div
          style={{
            display: 'grid',
            gap: 14,
            marginTop: 20,
          }}
        >
          {news.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noreferrer"
              style={newsCardStyle}
            >
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={{
                    width: 96,
                    height: 72,
                    objectFit: 'cover',
                    borderRadius: 12,
                    flexShrink: 0,
                  }}
                />
              )}

                


              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  {item.title}
                </div>

                <div
                  style={{
                    opacity: 0.72,
                    lineHeight: 1.5,
                  }}
                >
                  {item.description}
                </div>
              </div>

              <div
                style={{
                  opacity: 0.55,
                  fontSize: 13,
                  marginTop: 12,
                }}
              >
                {new Date(item.publishedAt).toLocaleString('ru-RU')}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({
  title,
  value,
  description,
  onClick,
}: {
  title: string;
  value: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button style={cardStyle} onClick={onClick}>
      <div style={{ opacity: 0.7 }}>{title}</div>

      <div
        style={{
          fontSize: 28,
          fontWeight: 900,
          marginTop: 10,
        }}
      >
        {value}
      </div>

      <div
        style={{
          opacity: 0.65,
          marginTop: 8,
        }}
      >
        {description}
      </div>
    </button>
  );
}

const cardsGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(220px, 1fr))',
  gap: 20,
  marginBottom: 24,
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.07)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 20,
  padding: 24,
  color: 'white',
  cursor: 'pointer',
  textAlign: 'left',
};

const topGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1.3fr 1fr',
  gap: 20,
};

const panelStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
  padding: 24,
};

const scheduleItemStyle: React.CSSProperties = {
  width: '100%',
  display: 'grid',
  gridTemplateColumns: '130px 1fr',
  gap: 14,
  alignItems: 'center',
  background: 'rgba(0,0,0,0.18)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: 'white',
  borderRadius: 12,
  padding: 14,
  marginTop: 10,
  cursor: 'pointer',
  textAlign: 'left',
};

const aiPanelStyle: React.CSSProperties = {
  background:
    'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(17,110,208,0.35))',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 24,
  padding: 28,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  cursor: 'pointer',
};

const newsCardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
  padding: 14,
  textDecoration: 'none',
  color: 'white',
  display: 'flex',
  gap: 14,
  alignItems: 'center',
};