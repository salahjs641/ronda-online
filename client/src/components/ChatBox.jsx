import React, { useState, useRef, useEffect } from 'react';

const ChatBox = ({ messages, onSend }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [text, setText] = useState('');
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (text.trim()) {
            onSend(text.trim());
            setText('');
        }
    };

    const handleKey = (e) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="chat-container">
            <button className="chat-toggle" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? '▾ Chat' : '▸ Chat'}
            </button>

            {isOpen && (
                <div className="chat-box">
                    <div className="chat-messages">
                        {messages.length === 0 && (
                            <div className="chat-msg">
                                <span className="chat-text" style={{ opacity: 0.4 }}>No messages yet...</span>
                            </div>
                        )}
                        {messages.map((msg, i) => (
                            <div key={i} className="chat-msg">
                                <span className={`chat-user team-${msg.team}`}>{msg.username}:</span>
                                <span className="chat-text">{msg.text}</span>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-row">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={handleKey}
                            maxLength={200}
                        />
                        <button onClick={handleSend}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatBox;
