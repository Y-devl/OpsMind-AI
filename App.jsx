import React, { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [uploadMsg, setUploadMsg] = useState(""); // Sidebar message
  const chatEndRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch("http://localhost:5000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input })
      });

      const data = await res.json();
      const botMsg = { sender: "bot", text: data.answer || "No response" };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [...prev, { sender: "bot", text: "Server error" }]);
    }

    setInput("");
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/upload", { method: "POST", body: formData });
      const data = await res.json();
      setUploadMsg(data.message);
    } catch {
      setUploadMsg("Upload failed ❌");
    }
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Enterprise SOP</h2>
        <label className="upload-btn">
          📄 Upload SOP
          <input
            type="file"
            hidden
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              handleFileUpload(file);
            }}
          />
        </label>
        {uploadMsg && <div className="upload-msg">{uploadMsg}</div>}
      </div>

      {/* Chat Section */}
      <div className="chat-wrapper">
        <div className="chat-container">
          {messages.length === 0 && (
            <div className="welcome">
              <h2>How can I help you today?</h2>
            </div>
          )}

          <div className="chat-inner">
            {messages.map((msg, i) => (
              <div key={i} className={`message-row ${msg.sender}`}>
                <div className="bubble">{msg.text}</div>
              </div>
            ))}
            <div ref={chatEndRef}></div>
          </div>
        </div>

        {/* Input */}
        <div className="input-area">
          <input
            type="text"
            placeholder="Ask something about SOP..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
