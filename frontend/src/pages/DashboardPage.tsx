import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import TasksPage from './TasksPage';
import TicketsPage from './TicketsPage';
import SchedulePage from './SchedulePage';
import ChatsPage from './ChatsPage';
import UsersPage from './UsersPage';
import DepartmentsPage from './DepartmentsPage';
import AiPage from './AiPage';
import SettingsPage from './SettingsPage';
import HomePage from './HomePage';
import logo from '../assets/9twllw18bwejhmgpadhh5hqg10jqyncq.png';

const socket = io('http://localhost:3001');

type NotificationItem = {
  id: number;
  title: string;
  text: string;
  type?: string;
  createdAt?: string;
};

const menuByRole: Record<string, string[]> = {
  ADMIN: [
    'Главная',
    'Пользователи',
    'Отделы',
    'Задачи',
    'Тикеты ПТО',
    'Расписание',
    'Чаты',
    'AI Помощник',
    'Аналитика',
    'Настройки',
  ],
  USER: [
    'Главная',
    'Мои задачи',
    'Создать заявку',
    'Мои заявки',
    'Расписание',
    'AI Помощник',
    'Чаты',
    'Профиль',
  ],
  PTO_SPECIALIST: [
    'Главная',
    'Очередь заявок',
    'Мои тикеты',
    'Статистика',
    'AI Помощник',
    'Задачи',
    'Чаты',
  ],
};

export default function DashboardPage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const menu = menuByRole[user.role] || menuByRole.USER;

  const [activePage, setActivePage] = useState('Главная');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!user.id) return;

    socket.emit('registerNotifications', user.id);

    socket.on('notification', (notification: NotificationItem) => {
      setNotifications((prev) => {
        const exists = prev.some((item) => item.id === notification.id);

        if (exists) return prev;

        return [notification, ...prev];
      });
    });

    return () => {
      socket.off('notification');
    };
  }, [user.id]);

  function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  function clearNotifications() {
    setNotifications([]);
    setShowNotifications(false);
  }

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        background: '#061a37',
        color: 'white',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <aside
        style={{
          width: 300,
          height: '100vh',
          position: 'sticky',
          top: 0,
          background: 'linear-gradient(180deg, #082653, #061a37)',
          borderRight: '1px solid rgba(255,255,255,0.12)',
          padding: 22,
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            height: 120,
            borderRadius: 12,
            display: 'grid',
            placeItems: 'center',
            marginBottom: 30,
            overflow: 'hidden',
          }}
        >
          <img
            src={logo}
            alt="Логотип"
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
            }}
          />
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {menu.map((item) => (
            <button
              key={item}
              onClick={() => setActivePage(item)}
              style={{
                textAlign: 'left',
                padding: '14px 16px',
                borderRadius: 10,
                border: 'none',
                background: item === activePage ? '#116ed0' : 'transparent',
                color: 'white',
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: 600,
              }}
            >
              {item}
            </button>
          ))}
        </nav>

        <button
          onClick={logout}
          style={{
            marginTop: 'auto',
            padding: 14,
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'transparent',
            color: 'white',
            cursor: 'pointer',
            fontSize: 15,
          }}
        >
          Выйти
        </button>
      </aside>

      <main style={{ flex: 1, minHeight: '100vh' }}>
        <header
          style={{
            height: 120,
            background: 'linear-gradient(90deg, #0a326b, #087fbd)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 42px',
            borderBottom: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 28 }}>{activePage}</h1>

            <p style={{ margin: '8px 0 0', opacity: 0.8 }}>
              Внутренняя система управления
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
            }}
          >
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  border: 'none',
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: 20,
                  position: 'relative',
                }}
              >
                🔔

                {notifications.length > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -6,
                      right: -6,
                      background: '#ef4444',
                      color: 'white',
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      fontSize: 12,
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 800,
                    }}
                  >
                    {notifications.length}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 54,
                    width: 340,
                    background: '#10294f',
                    border: '1px solid rgba(255,255,255,0.14)',
                    borderRadius: 16,
                    padding: 14,
                    zIndex: 50,
                    boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 12,
                    }}
                  >
                    <div style={{ fontWeight: 900 }}>Уведомления</div>

                    {notifications.length > 0 && (
                      <button
                        onClick={clearNotifications}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'rgba(255,255,255,0.7)',
                          cursor: 'pointer',
                          fontSize: 13,
                        }}
                      >
                        Очистить
                      </button>
                    )}
                  </div>

                  {notifications.length === 0 && (
                    <div style={{ opacity: 0.7, padding: 12 }}>
                      Новых уведомлений нет.
                    </div>
                  )}

                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: 12,
                        borderRadius: 12,
                        background: 'rgba(255,255,255,0.06)',
                        marginBottom: 10,
                      }}
                    >
                      <div style={{ fontWeight: 800 }}>{item.title}</div>

                      <div
                        style={{
                          opacity: 0.7,
                          marginTop: 4,
                          fontSize: 14,
                        }}
                      >
                        {item.text}
                      </div>

                      {item.createdAt && (
                        <div
                          style={{
                            opacity: 0.45,
                            marginTop: 8,
                            fontSize: 12,
                          }}
                        >
                          {new Date(item.createdAt).toLocaleString('ru-RU')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: 18 }}>
                {user.fullName}
              </div>

              <div style={{ opacity: 0.75, marginTop: 6 }}>{user.role}</div>
            </div>
          </div>
        </header>

        <section style={{ padding: 42 }}>
          {activePage === 'Главная' && (
            <HomePage setActivePage={setActivePage} />
          )}

          {activePage === 'Пользователи' && <UsersPage />}

          {activePage === 'Отделы' && <DepartmentsPage />}

          {(activePage === 'Задачи' || activePage === 'Мои задачи') && (
            <TasksPage />
          )}

          {(activePage === 'Тикеты ПТО' ||
            activePage === 'Мои заявки' ||
            activePage === 'Очередь заявок' ||
            activePage === 'Мои тикеты') && <TicketsPage />}

          {activePage === 'Создать заявку' && <TicketsPage openCreateForm />}

          {activePage === 'Расписание' && <SchedulePage />}

          {activePage === 'Чаты' && <ChatsPage />}

          {activePage === 'AI Помощник' && <AiPage />}

          {(activePage === 'Настройки' || activePage === 'Профиль') && (
            <SettingsPage />
          )}
        </section>
      </main>
    </div>
  );
}