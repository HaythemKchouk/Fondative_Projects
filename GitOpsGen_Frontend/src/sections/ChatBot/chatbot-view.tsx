import React, { useState, useRef, useEffect } from 'react';

type Role = 'user' | 'assistant';

interface Message {
  role: Role;
  content: string;
}

const API_KEY = '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessage: Message = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
                content: `
Tu es un assistant spécialisé dans GitOps et DevOps.

Tu peux répondre à :
- des définitions (ex : "c'est quoi DevOps ?"),
- des questions techniques sur GitOps, CI/CD, Kubernetes, infrastructure as code, etc.
- des cas d’usage ou des conseils en lien avec DevOps/GitOps.

Si la question est clairement hors de ce domaine (ex : cuisine, sport, psychologie), réponds :
❌ Hors sujet : je ne réponds qu'aux questions techniques liées à GitOps ou DevOps.
  `,

            },
            ...updatedMessages,
          ],
          temperature: 0.7,
          top_p: 1,
          n: 1,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const botReply = data.choices[0].message.content;

      setMessages([...updatedMessages, { role: 'assistant', content: botReply }]);
    } catch (error) {
      console.error('Erreur API:', error);
      setMessages([...updatedMessages, { role: 'assistant', content: 'Erreur lors de la réponse.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Bouton flottant */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={styles.floatingButton}
        aria-label={isOpen ? "Fermer le chat" : "Ouvrir le chat"}
      >
        {isOpen ? '×' : '💬'}
      </button>

      {/* Pop-up du chat */}
      {isOpen && (
        <div style={styles.popupContainer}>
          <div style={styles.popupHeader}>
            <h2 style={styles.popupTitle}>Chatbot GitOps/DevOps</h2>
            <button 
              onClick={() => setIsOpen(false)}
              style={styles.closeButton}
              aria-label="Fermer"
            >
              ×
            </button>
          </div>
          
          <div style={styles.chatWindow}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.message,
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.role === 'user' ? '#0b63ce' : '#e0e7ff',
                  color: msg.role === 'user' ? 'white' : '#1a202c',
                  borderTopRightRadius: msg.role === 'user' ? 4 : 16,
                  borderTopLeftRadius: msg.role === 'user' ? 16 : 4,
                  position: 'relative',
                  maxWidth: '75%',
                  padding: '14px 18px',
                  boxShadow: msg.role === 'user'
                    ? '0 4px 8px rgba(11, 99, 206, 0.3)'
                    : '0 4px 8px rgba(160, 174, 255, 0.3)',
                }}
              >
                <b style={{ fontSize: 14 }}>{msg.role === 'user' ? 'Vous' : 'Bot'}</b>
                <p style={{ margin: '6px 0 0', whiteSpace: 'pre-wrap', fontSize: 15 }}>{msg.content}</p>

                <span
                  style={{
                    content: '""',
                    position: 'absolute',
                    width: 0,
                    height: 0,
                    borderStyle: 'solid',
                    bottom: 0,
                    ...(msg.role === 'user'
                      ? {
                          right: -10,
                          borderWidth: '10px 0 0 10px',
                          borderColor: `transparent transparent transparent #0b63ce`,
                        }
                      : {
                          left: -10,
                          borderWidth: '10px 10px 0 0',
                          borderColor: `transparent #e0e7ff transparent transparent`,
                        }),
                  }}
                />
              </div>
            ))}
            {loading && <div style={styles.loading}>Chargement<span className="dot-flashing">...</span></div>}
            <div ref={messagesEndRef} />
          </div>
          
          <div style={styles.inputArea}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage();
              }}
              placeholder="Pose ta question sur GitOps ou DevOps..."
              style={styles.input}
              disabled={loading}
              autoFocus
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              style={styles.button}
              aria-label="Envoyer"
            >
              Envoyer
            </button>
          </div>
        </div>
      )}

      <style>{`
        .dot-flashing {
          animation: dot-flashing 1s infinite linear alternate;
          color: #555;
          font-weight: bold;
        }
        @keyframes dot-flashing {
          0% { opacity: 0.2; }
          50% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  floatingButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: '50%',
    backgroundColor: '#0b63ce',
    color: 'white',
    border: 'none',
    boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
    cursor: 'pointer',
    fontSize: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    transition: 'transform 0.2s',
  },
  popupContainer: {
    position: 'fixed',
    bottom: 100,
    right: 30,
    width: 400,
    height: '70vh',
    backgroundColor: 'white',
    borderRadius: 16,
    boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
    display: 'flex',
    flexDirection: 'column',
    zIndex: 1000,
    overflow: 'hidden',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  popupHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    backgroundColor: '#f0f4ff',
    borderBottom: '1px solid #cdd6ff',
  },
  popupTitle: {
    margin: 0,
    fontSize: 18,
    color: '#0b3c91',
    fontWeight: '600',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: 24,
    color: '#666',
    cursor: 'pointer',
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: '50%',
    transition: 'background-color 0.2s',
  },
  chatWindow: {
    flex: 1,
    padding: 16,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    backgroundColor: '#ffffff',
  },
  message: {
    wordBreak: 'break-word',
  },
  loading: {
    fontStyle: 'italic',
    color: '#555',
    alignSelf: 'center',
    marginTop: 10,
    fontWeight: '600',
    fontSize: 15,
  },
  inputArea: {
    display: 'flex',
    padding: 16,
    borderTop: '1px solid #eee',
    backgroundColor: '#f9faff',
  },
  input: {
    flexGrow: 1,
    padding: 12,
    borderRadius: 20,
    border: '1.5px solid #ddd',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.3s',
  },
  button: {
    marginLeft: 12,
    padding: '10px 20px',
    borderRadius: 20,
    border: 'none',
    backgroundColor: '#0b63ce',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
};