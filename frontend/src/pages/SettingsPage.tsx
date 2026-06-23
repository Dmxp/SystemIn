import { useEffect, useState } from 'react';
import { api } from '../api/axios';

type Profile = {
  id: number;
  fullName: string;
  email: string;
  role: string;
  position?: string;
  cabinet?: string;
  createdAt?: string;
  department?: {
    id: number;
    name: string;
  };
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState('');
  const [cabinet, setCabinet] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');

  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  async function loadProfile() {
    const response = await api.get('/auth/me');

    setProfile(response.data);
    setFullName(response.data.fullName || '');
    setEmail(response.data.email || '');
    setPosition(response.data.position || '');
    setCabinet(response.data.cabinet || '');
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileMessage('');

    const response = await api.patch('/users/me', {
      fullName,
      email,
      position,
      cabinet,
    });

    setProfile(response.data);
    setIsEditing(false);
    setProfileMessage('Профиль успешно обновлён');

    const localUser = JSON.parse(localStorage.getItem('user') || '{}');

    localStorage.setItem(
      'user',
      JSON.stringify({
        ...localUser,
        fullName: response.data.fullName,
        email: response.data.email,
        position: response.data.position,
        cabinet: response.data.cabinet,
        department: response.data.department,
      }),
    );
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage('');

    if (newPassword !== passwordRepeat) {
      setPasswordMessage('Новый пароль и повтор пароля не совпадают');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage('Новый пароль должен быть не короче 6 символов');
      return;
    }

    try {
      await api.patch('/users/me/password', {
        currentPassword,
        newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setPasswordRepeat('');
      setPasswordMessage('Пароль успешно изменён');
    } catch (error) {
      console.error(error);
      setPasswordMessage('Не удалось изменить пароль. Проверьте текущий пароль.');
    }
  }

  function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  useEffect(() => {
    loadProfile();
  }, []);

  if (!profile) {
    return <div>Загрузка профиля...</div>;
  }

  const initials = profile.fullName
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2);

  return (
    <div>
      <h1 style={{ margin: 0, marginBottom: 8 }}>Профиль сотрудника</h1>

      <p style={{ opacity: 0.7, marginBottom: 24 }}>
        Личная информация и параметры учётной записи
      </p>

      <div style={profileGridStyle}>
        <div style={mainCardStyle}>
          <div style={avatarWrapperStyle}>
            <div style={avatarStyle}>{initials}</div>
            <span style={onlineDotStyle} />
          </div>

          <h2 style={{ marginBottom: 6 }}>{profile.fullName}</h2>

          <div style={{ opacity: 0.7 }}>
            {profile.position || 'Должность не указана'}
          </div>

          <div style={roleBadgeStyle}>{profile.role}</div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            style={secondaryButtonStyle}
          >
            {isEditing ? 'Отменить' : 'Редактировать профиль'}
          </button>
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Данные сотрудника</h2>

          {!isEditing && (
            <>
              <InfoRow label="ФИО" value={profile.fullName} />
              <InfoRow label="Email" value={profile.email} />
              <InfoRow
                label="Отдел"
                value={profile.department?.name || 'Не указан'}
              />
              <InfoRow
                label="Должность"
                value={profile.position || 'Не указана'}
              />
              <InfoRow label="Кабинет" value={profile.cabinet || 'Не указан'} />
              <InfoRow label="Роль" value={profile.role} />
              <InfoRow label="ID сотрудника" value={`#${profile.id}`} />

              {profile.createdAt && (
                <InfoRow
                  label="Дата регистрации"
                  value={new Date(profile.createdAt).toLocaleDateString('ru-RU')}
                />
              )}
            </>
          )}

          {isEditing && (
            <form onSubmit={saveProfile} style={formStyle}>
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

              <button type="submit" style={primaryButtonStyle}>
                Сохранить изменения
              </button>
            </form>
          )}

          {profileMessage && (
            <div style={successMessageStyle}>{profileMessage}</div>
          )}
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Безопасность</h2>

          <p style={{ opacity: 0.7, marginBottom: 18 }}>
            Здесь можно изменить пароль текущей учётной записи.
          </p>

          <form onSubmit={changePassword} style={formStyle}>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Текущий пароль"
              required
              style={inputStyle}
            />

            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Новый пароль"
              required
              style={inputStyle}
            />

            <input
              type="password"
              value={passwordRepeat}
              onChange={(e) => setPasswordRepeat(e.target.value)}
              placeholder="Повторите новый пароль"
              required
              style={inputStyle}
            />

            <button type="submit" style={primaryButtonStyle}>
              Изменить пароль
            </button>
          </form>

          {passwordMessage && (
            <div style={messageStyle}>{passwordMessage}</div>
          )}
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Система</h2>

          <InfoRow label="Проект" value="SystemIn" />
          <InfoRow label="Организация" value="ГТРК Регион-Тюмень" />
          <InfoRow label="Версия" value="0.1.0 MVP" />

          <button onClick={logout} style={dangerButtonStyle}>
            Выйти из системы
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={infoRowStyle}>
      <span style={{ opacity: 0.65 }}>{label}</span>
      <b style={{ textAlign: 'right' }}>{value}</b>
    </div>
  );
}

const profileGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '320px 1fr',
  gap: 20,
  alignItems: 'start',
};

const mainCardStyle: React.CSSProperties = {
  background:
    'linear-gradient(180deg, rgba(17,110,208,0.35), rgba(255,255,255,0.06))',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 22,
  padding: 28,
  textAlign: 'center',
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 22,
  padding: 24,
};

const avatarWrapperStyle: React.CSSProperties = {
  position: 'relative',
  width: 120,
  height: 120,
  margin: '0 auto 18px',
};

const avatarStyle: React.CSSProperties = {
  width: 120,
  height: 120,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #116ed0, #0ea5e9)',
  display: 'grid',
  placeItems: 'center',
  fontSize: 36,
  fontWeight: 900,
};

const onlineDotStyle: React.CSSProperties = {
  position: 'absolute',
  right: 10,
  bottom: 10,
  width: 18,
  height: 18,
  background: '#22c55e',
  border: '3px solid #12305a',
  borderRadius: '50%',
};

const roleBadgeStyle: React.CSSProperties = {
  display: 'inline-block',
  marginTop: 18,
  background: 'rgba(255,255,255,0.14)',
  padding: '8px 14px',
  borderRadius: 999,
  fontWeight: 800,
};

const infoRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 16,
  padding: '13px 0',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
};

const formStyle: React.CSSProperties = {
  display: 'grid',
  gap: 14,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(0,0,0,0.25)',
  color: 'white',
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

const secondaryButtonStyle: React.CSSProperties = {
  marginTop: 20,
  background: 'rgba(255,255,255,0.12)',
  border: '1px solid rgba(255,255,255,0.16)',
  color: 'white',
  padding: '11px 16px',
  borderRadius: 10,
  cursor: 'pointer',
  fontWeight: 800,
};

const dangerButtonStyle: React.CSSProperties = {
  marginTop: 24,
  background: '#dc2626',
  border: 'none',
  color: 'white',
  padding: '12px 18px',
  borderRadius: 10,
  cursor: 'pointer',
  fontWeight: 800,
};

const successMessageStyle: React.CSSProperties = {
  marginTop: 16,
  color: '#86efac',
  fontWeight: 700,
};

const messageStyle: React.CSSProperties = {
  marginTop: 16,
  color: '#facc15',
  fontWeight: 700,
};