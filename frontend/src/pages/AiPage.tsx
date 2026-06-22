import { useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../api/axios';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function AiPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        'Здравствуйте. Я AI-помощник компании. Чем могу помочь?',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendMessage(e: FormEvent) {
    e.preventDefault();

    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);

    const currentInput = input;

    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        message: currentInput,
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.data.answer,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Ошибка подключения к AI.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        height: 'calc(100vh - 204px)',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 18,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: 20,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <h1 style={{ margin: 0 }}>AI Помощник</h1>

        <p style={{ opacity: 0.7, marginTop: 8 }}>
          Помощь сотрудникам компании
        </p>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 24,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        {messages.map((message, index) => {
          const isUser = message.role === 'user';

          return (
            <div
              key={index}
              style={{
                alignSelf: isUser ? 'flex-end' : 'flex-start',
                maxWidth: '75%',
                background: isUser
                  ? '#116ed0'
                  : 'rgba(255,255,255,0.08)',
                padding: '16px 18px',
                borderRadius: 16,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  opacity: 0.7,
                  marginBottom: 8,
                  fontWeight: 700,
                }}
              >
                {isUser ? 'Вы' : 'AI'}
              </div>

              <div
                style={{
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {message.content}
              </div>
            </div>
          );
        })}

        {loading && (
          <div
            style={{
              alignSelf: 'flex-start',
              background: 'rgba(255,255,255,0.08)',
              padding: '16px 18px',
              borderRadius: 16,
            }}
          >
            AI печатает...
          </div>
        )}
      </div>

      <form
        onSubmit={sendMessage}
        style={{
          display: 'flex',
          gap: 12,
          padding: 18,
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Введите сообщение..."
          style={{
            flex: 1,
            padding: '14px 16px',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.14)',
            background: 'rgba(0,0,0,0.25)',
            color: 'white',
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            background: '#116ed0',
            border: 'none',
            color: 'white',
            padding: '0 22px',
            borderRadius: 12,
            cursor: 'pointer',
            fontWeight: 800,
            opacity: loading ? 0.7 : 1,
          }}
        >
          Отправить
        </button>
      </form>
    </div>
  );
}