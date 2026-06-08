export default function SettingsPage() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  return (
    <div>
      <h1 style={{ margin: 0, marginBottom: 8 }}>Настройки</h1>

      <p style={{ opacity: 0.7, marginBottom: 24 }}>
        Параметры пользователя и системы
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}
      >
        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Профиль</h2>

          <InfoRow label="ФИО" value={user.fullName || '-'} />
          <InfoRow label="Email" value={user.email || '-'} />
          <InfoRow label="Роль" value={user.role || '-'} />
          <InfoRow label="Отдел" value={user.department?.name || '-'} />
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Система</h2>

          <InfoRow label="Название" value="SystemIn" />
          <InfoRow label="Организация" value="ГТРК Регион-Тюмень" />
          <InfoRow label="Версия" value="0.1.0 MVP" />
        </div>

        <div style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Сеанс</h2>

          <p style={{ opacity: 0.75, marginBottom: 18 }}>
            Здесь можно завершить текущий сеанс пользователя.
          </p>

          <button
            onClick={logout}
            style={{
              background: '#dc2626',
              border: 'none',
              color: 'white',
              padding: '12px 18px',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 800,
            }}
          >
            Выйти из системы
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 16,
        padding: '12px 0',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <span style={{ opacity: 0.65 }}>{label}</span>
      <b style={{ textAlign: 'right' }}>{value}</b>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 18,
  padding: 24,
};