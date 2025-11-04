import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface ChatConversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: Date;
}

export default function Chat() {
  const [conversations, setConversations] = useState<ChatConversation[]>([
    {
      id: "1",
      title: "Venue Selection",
      lastMessage: "I'd recommend looking at outdoor venues for spring...",
      timestamp: new Date(2025, 10, 3, 14, 30),
    },
    {
      id: "2",
      title: "Budget Planning",
      lastMessage: "Let's break down your budget by category...",
      timestamp: new Date(2025, 10, 2, 10, 15),
    },
    {
      id: "3",
      title: "Guest List",
      lastMessage: "How many guests are you planning to invite?",
      timestamp: new Date(2025, 10, 1, 16, 45),
    },
  ]);

  const [activeConversationId, setActiveConversationId] = useState<string>(conversations[0]?.id || "");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hi! I'm looking for help with choosing a wedding venue.",
      sender: "user",
      timestamp: new Date(2025, 10, 3, 14, 25),
    },
    {
      id: "2",
      text: "I'd be happy to help you find the perfect venue! What season are you planning to get married, and do you have a preference for indoor or outdoor settings?",
      sender: "ai",
      timestamp: new Date(2025, 10, 3, 14, 26),
    },
    {
      id: "3",
      text: "We're thinking spring, and we'd love an outdoor venue if possible.",
      sender: "user",
      timestamp: new Date(2025, 10, 3, 14, 28),
    },
    {
      id: "4",
      text: "I'd recommend looking at outdoor venues for spring. Consider gardens, vineyards, or estates with blooming flowers. Make sure they have a backup indoor option in case of rain. What's your guest count and location preference?",
      sender: "ai",
      timestamp: new Date(2025, 10, 3, 14, 30),
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages([...messages, newUserMessage]);
    setInputValue("");

    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm here to help! Let me think about that...",
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    const newChat: ChatConversation = {
      id: Date.now().toString(),
      title: "New Conversation",
      lastMessage: "Start chatting...",
      timestamp: new Date(),
    };
    setConversations([newChat, ...conversations]);
    setActiveConversationId(newChat.id);
    setMessages([]);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="flex h-full bg-white overflow-hidden">
      {/* Left Sidebar - Conversations List */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 bg-white">
          <button
            onClick={handleNewChat}
            className="w-full rounded-lg bg-rose-400 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
          >
            + New Chat
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setActiveConversationId(conversation.id)}
              className={[
                "w-full text-left p-4 border-b border-slate-200 transition-all hover:bg-white",
                activeConversationId === conversation.id
                  ? "bg-white shadow-sm"
                  : "bg-slate-50",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-slate-800 text-sm truncate">
                  {conversation.title}
                </h3>
                <span className="text-xs text-slate-500 whitespace-nowrap">
                  {formatTime(conversation.timestamp)}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600 truncate">
                {conversation.lastMessage}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200 bg-white">
          <h2 className="text-lg font-semibold text-slate-800">
            {conversations.find((c) => c.id === activeConversationId)?.title ||
              "Chat"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            AI Wedding Planning Assistant
          </p>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={[
                "flex",
                message.sender === "user" ? "justify-end" : "justify-start",
              ].join(" ")}
            >
              <div
                className={[
                  "max-w-[70%] rounded-2xl px-4 py-3 shadow-sm",
                  message.sender === "user"
                    ? "bg-blue-500 text-white rounded-br-sm"
                    : "bg-gray-200 text-slate-800 rounded-bl-sm",
                ].join(" ")}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <span
                  className={[
                    "text-xs mt-1 block",
                    message.sender === "user"
                      ? "text-blue-100"
                      : "text-slate-500",
                  ].join(" ")}
                >
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="flex gap-2 items-end">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              rows={1}
              className="flex-1 rounded-lg border border-slate-300 px-4 py-3 text-sm text-slate-900 resize-none focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-300"
              style={{
                maxHeight: "120px",
                minHeight: "48px",
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="rounded-lg bg-rose-400 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
