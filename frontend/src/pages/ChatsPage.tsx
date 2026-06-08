import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/axios';
import { io } from 'socket.io-client';

type User = {
  id: number;
  fullName: string;
  email: string;
  position?: string;
  department?: {
    id: number;
    name: string;
  };
};

type Conversation = {
  id: number;
  title?: string;
  type: string;
  members: {
    user: User;
  }[];
  messages: {
    text: string;
    sender: {
      fullName: string;
    };
  }[];
};

type Message = {
  id: number;
  text: string;
  createdAt: string;
  sender: {
    id: number;
    fullName: string;
  };
};

const socket = io('http://localhost:3000');

export default function ChatsPage() {
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [chatType, setChatType] = useState('DIRECT');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [groupTitle, setGroupTitle] = useState('');

  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);

  const activeChat = useMemo(() => {
    return conversations.find((chat) => chat.id === activeChatId);
  }, [conversations, activeChatId]);

  async function loadUsers() {
    const response = await api.get('/users');
    setUsers(response.data);
  }

  async function loadChats() {
    const response = await api.get('/chats');
    setConversations(response.data);

    if (response.data.length > 0 && !activeChatId) {
      setActiveChatId(response.data[0].id);
      loadMessages(response.data[0].id);
    }
  }

  async function loadMessages(chatId: number) {
    const response = await api.get(`/chats/${chatId}/messages`);
    setMessages(response.data);
  }

  async function createChat(e: React.FormEvent) {
    e.preventDefault();

    if (!selectedUserId) return;

    const selectedUser = users.find((user) => user.id === Number(selectedUserId));

    const response = await api.post('/chats', {
      title: chatType === 'GROUP' ? groupTitle : selectedUser?.fullName,
      type: chatType,
      memberIds: [Number(selectedUserId)],
    });

    setSelectedUserId('');
    setGroupTitle('');
    setShowCreateForm(false);

    await loadChats();

    setActiveChatId(response.data.id);
    await loadMessages(response.data.id);
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();

    if (!activeChatId || !text.trim()) return;

    await api.post(`/chats/${activeChatId}/messages`, {
      text,
    });

    setText('');
    await loadChats();
  }

  function getChatTitle(chat: Conversation) {
    if (chat.type === 'DIRECT') {
      const companion = chat.members.find(
        (member) => member.user.id !== currentUser.id,
      );

      return companion?.user.fullName || 'Личный чат';
    }

    return chat.title || `Чат #${chat.id}`;
  }

  function getActiveChatTitle() {
    if (!activeChat) return 'Сообщения';

    return getChatTitle(activeChat);
  }

  useEffect(() => {
    loadUsers();
    loadChats();
  }, []);

  useEffect(() => {
    if (!activeChatId) return;

    socket.emit('register', currentUser.id);
    socket.emit('joinChat', activeChatId);

    socket.on('newMessage', (message: Message) => {
      setMessages((prev) => {
        const exists = prev.some((item) => item.id === message.id);

        if (exists) return prev;

        return [...prev, message];
      });
    });

    socket.on('onlineUsers', (users: number[]) => {
      setOnlineUsers(users);
    });
    
    socket.on('newConversation', (conversation: Conversation) => {
      setConversations((prev) => {
        const exists = prev.some((item) => item.id === conversation.id);

        if (exists) return prev;

        return [conversation, ...prev];
      });
    });

    return () => {
      socket.off('newMessage');
      socket.off('onlineUsers');
      socket.off('newConversation');
    };
  }, [activeChatId]);

  return (
    <div
      style={{
        height: 'calc(100vh - 204px)',
        display: 'grid',
        gridTemplateColumns: '340px 1fr',
        gap: 20,
      }}
    >
      <aside
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 18,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: 18, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ margin: 0 }}>Чаты</h2>
          <p style={{ opacity: 0.65, marginTop: 6 }}>Диалоги и группы</p>

          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            style={{
              marginTop: 14,
              width: '100%',
              background: '#116ed0',
              border: 'none',
              color: 'white',
              padding: '10px 12px',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 800,
            }}
          >
            {showCreateForm ? 'Закрыть' : 'Создать чат'}
          </button>

          {showCreateForm && (
            <form
              onSubmit={createChat}
              style={{
                marginTop: 12,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <select
                value={chatType}
                onChange={(e) => setChatType(e.target.value)}
                style={chatInputStyle}
              >
                <option value="DIRECT">Личный чат</option>
                <option value="GROUP">Группа</option>
              </select>

              {chatType === 'GROUP' && (
                <input
                  value={groupTitle}
                  onChange={(e) => setGroupTitle(e.target.value)}
                  placeholder="Название группы"
                  style={chatInputStyle}
                  required
                />
              )}

              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                style={chatInputStyle}
                required
              >
                <option value="">Выберите сотрудника</option>

                {users
                  .filter((user) => user.id !== currentUser.id)
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName}
                      {user.department?.name ? ` — ${user.department.name}` : ''}
                    </option>
                  ))}
              </select>

              <button
                type="submit"
                style={{
                  background: '#0f63b6',
                  border: 'none',
                  color: 'white',
                  padding: '10px 12px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontWeight: 800,
                }}
              >
                Создать
              </button>
            </form>
          )}
        </div>

        <div style={{ overflowY: 'auto' }}>
          {conversations.map((chat) => (
            <button
              key={chat.id}
              onClick={() => {
                setActiveChatId(chat.id);
                loadMessages(chat.id);
              }}
              style={{
                width: '100%',
                display: 'block',
                textAlign: 'left',
                padding: 16,
                border: 'none',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                background:
                  activeChatId === chat.id ? 'rgba(17,110,208,0.35)' : 'transparent',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: (() => {
                      const companion = chat.members.find(
                        (member) => member.user.id !== currentUser.id,
                      );

                      if (!companion) return '#64748b';

                      return onlineUsers.includes(companion.user.id)
                        ? '#22c55e'
                        : '#64748b';
                    })(),
                  }}
                />

                <div style={{ fontWeight: 800 }}>
                  {getChatTitle(chat)}
                </div>
              </div>



              <div style={{ opacity: 0.65, fontSize: 14, marginTop: 6 }}>
                {chat.messages?.[0]?.text || 'Сообщений пока нет'}
              </div>
            </button>
          ))}
        </div>
      </aside>

      <main
        style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 18,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: 18,
            borderBottom: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <h2 style={{ margin: 0 }}>{getActiveChatTitle()}</h2>
        </div>

        <div
          style={{
            flex: 1,
            padding: 20,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {messages.map((message) => {
            const isMine = message.sender.id === currentUser.id;

            return (
              <div
                key={message.id}
                style={{
                  alignSelf: isMine ? 'flex-end' : 'flex-start',
                  maxWidth: '70%',
                  background: isMine ? '#116ed0' : 'rgba(255,255,255,0.1)',
                  padding: 14,
                  borderRadius: 14,
                }}
              >
                <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 6 }}>
                  {message.sender.fullName}
                </div>

                <div>{message.text}</div>
              </div>
            );
          })}
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
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Написать сообщение..."
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
            style={{
              background: '#116ed0',
              border: 'none',
              color: 'white',
              padding: '0 22px',
              borderRadius: 12,
              cursor: 'pointer',
              fontWeight: 800,
            }}
          >
            Отправить
          </button>
        </form>
      </main>
    </div>
  );
}

const chatInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(0,0,0,0.25)',
  color: 'white',
};