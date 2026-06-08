import { useState } from 'react';
import { api } from '../api/axios';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@test.ru');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
      });

      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      window.location.href = '/';
    } catch {
      setError('Неверный email или пароль');
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <form
        onSubmit={handleLogin}
        style={{
          width: 360,
          padding: 24,
          border: '1px solid #ddd',
          borderRadius: 12,
        }}
      >
        <h1>SystemIn</h1>
        <p>Вход во внутреннюю систему</p>

        <div>
          <label>Email</label>
          <input
            style={{ width: '100%', padding: 10, marginTop: 6, marginBottom: 12 }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Пароль</label>
          <input
            type="password"
            style={{ width: '100%', padding: 10, marginTop: 6, marginBottom: 12 }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button style={{ width: '100%', padding: 12 }} type="submit">
          Войти
        </button>
      </form>
    </div>
  );
}