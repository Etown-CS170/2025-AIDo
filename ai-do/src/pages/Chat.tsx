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
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations on component mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    }
  }, [activeConversationId]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem("aido_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }

      const data = await response.json();
      setConversations(data.map((conv: any) => ({
        ...conv,
        timestamp: new Date(conv.timestamp),
      })));

      // Don't auto-select a conversation - let user choose
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversations");
      console.error("Error fetching conversations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem("aido_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/conversations/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await response.json();
      setMessages(data.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
      console.error("Error fetching messages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !activeConversationId) return;

    const userMessageText = inputValue;
    setInputValue("");

    // Optimistically add user message to UI
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      text: userMessageText,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    try {
      const token = localStorage.getItem("aido_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/conversations/${activeConversationId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: userMessageText }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      
      // Replace temp message with actual message from server
      setMessages((prev) => 
        prev.map((msg) => 
          msg.id === tempUserMessage.id 
            ? { ...data.userMessage, timestamp: new Date(data.userMessage.timestamp) }
            : msg
        )
      );

      // Add AI response
      if (data.aiMessage) {
        setMessages((prev) => [...prev, {
          ...data.aiMessage,
          timestamp: new Date(data.aiMessage.timestamp),
        }]);
      }

      // Update conversation list (to refresh lastMessage and timestamp)
      await fetchConversations();
      
      // Restore the active conversation ID since fetchConversations might reset it
      setActiveConversationId(activeConversationId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
      console.error("Error sending message:", err);
      
      // Remove temp message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempUserMessage.id));
      
      // Restore input
      setInputValue(userMessageText);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = async () => {
    try {
      const token = localStorage.getItem("aido_token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: "New Conversation" }),
      });

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      const newConversation = await response.json();
      setConversations([{
        ...newConversation,
        timestamp: new Date(newConversation.timestamp),
      }, ...conversations]);
      setActiveConversationId(newConversation.id);
      setMessages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create conversation");
      console.error("Error creating conversation:", err);
    }
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
            disabled={isLoading}
            className="w-full rounded-lg bg-rose-400 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + New Chat
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && conversations.length === 0 ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-sm text-slate-500">Loading conversations...</div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="text-3xl mb-3">💬</div>
              <div className="text-sm text-slate-600">No conversations yet</div>
              <div className="text-xs text-slate-500 mt-1">Click "New Chat" to start</div>
            </div>
          ) : (
            conversations.map((conversation) => (
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
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {!activeConversationId ? (
          // Empty state when no conversation is selected
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-6xl mb-6">💬</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Welcome to AI-Do Chat</h2>
            <p className="text-slate-600 mb-6 max-w-md">
              Select a conversation from the sidebar or create a new chat to start planning your perfect wedding with our AI assistant.
            </p>
            <button
              onClick={handleNewChat}
              className="rounded-lg bg-rose-400 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
            >
              Start New Chat
            </button>
          </div>
        ) : (
          <>
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
              {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
              
              {messages.length === 0 && !isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="text-5xl mb-4">👋</div>
                  <h3 className="text-lg font-semibold text-slate-800">Start a conversation</h3>
                  <p className="text-sm text-slate-500 mt-2">
                    Ask me anything about wedding planning!
                  </p>
                </div>
              ) : (
                messages.map((message) => (
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
            ))
          )}
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
          </>
        )}
      </div>
    </div>
  );
}
