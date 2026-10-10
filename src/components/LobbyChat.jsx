import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { Send } from "./Icons";

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

// Group chat box. GroupLobbyPage owns the messages and the WebSocket;
// this component only shows them and calls onSend(text) when you press Send.
export function LobbyChat({ messages, selfName, error, onSend }) {
  const [text, setText] = useState("");
  const bottomRef = useRef(null);

  // Scroll to the newest message whenever the list changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  function handleSubmit(event) {
    event.preventDefault();
    if (!text.trim()) return;
    const sent = onSend(text.trim());
    if (sent) setText("");
  }

  return (
    <section className="card">
      <h2 className="label">Group chat</h2>
      {error ? <p className="field-error">{error}</p> : null}

      <div className="chat-box">
        {messages.length === 0 ? <p className="hint">No messages yet. Say hello!</p> : null}
        {messages.map((msg) => {
          const isMine = msg.senderName === selfName;
          return (
            <div key={msg.id} className={isMine ? "bubble mine" : "bubble"}>
              {!isMine ? <p className="bubble-name">{msg.senderName}</p> : null}
              <p>{msg.message}</p>
              <p className="bubble-time">{formatTime(msg.timestamp)}</p>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-form">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g. I'm at exit B"
          aria-label="Message"
        />
        <Button type="submit" variant="lime" disabled={!text.trim()} aria-label="Send message">
          <Send size={18} />
        </Button>
      </form>
    </section>
  );
}
