import { useEffect, useState, useRef, Fragment } from 'react';
import { MessageCircle, X, Send, Users, Search, Smile, ArrowLeft } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { useChat, ChatMessage } from '../contexts/ChatContext';
import { useStaff } from '../contexts/StaffContext';
import { useAuth } from '../contexts/AuthContext';
import { useSystem } from '../contexts/SystemContext';

export function ChatWidget() {
  const {
    user
  } = useAuth();
  const {
    staff
  } = useStaff();
  const {
    conversations,
    sendMessage,
    markAsRead,
    getConversationMessages,
    getUnreadCount
  } = useChat();
  const {
    addSystemNotification
  } = useSystem();
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'conversations' | 'users' | 'chat'>('conversations');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [conversationMessages, setConversationMessages] = useState<ChatMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const unreadCount = getUnreadCount();
  // Get selected user details directly from staff list
  const selectedUser = selectedUserId ? staff.find(s => s.id === selectedUserId) : null;
  
  // Fetch messages when selected user changes
  useEffect(() => {
    if (selectedUserId) {
      setMessagesLoading(true);
      getConversationMessages(selectedUserId).then(messages => {
        setConversationMessages(messages);
        setMessagesLoading(false);
      });
    } else {
      setConversationMessages([]);
    }
  }, [selectedUserId, getConversationMessages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current && view === 'chat') {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth'
      });
    }
  }, [conversationMessages, view, selectedUserId]);
  // Filter staff based on search
  const filteredStaff = staff.filter(s => s.id !== user?.staffId && (s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.role.toLowerCase().includes(searchQuery.toLowerCase())));
  const handleSelectUser = (staffMember: (typeof staff)[0]) => {
    setSelectedUserId(staffMember.id);
    setView('chat');
    setSearchQuery('');
    markAsRead(staffMember.id);
  };
  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedUserId || isSending) return;

    setIsSending(true);
    try {
      if (selectedUser) {
        sendMessage(selectedUserId, selectedUser.name, messageText);
        // Send notification ONLY to the recipient
        addSystemNotification({
          title: `New message from ${user?.name}`,
          message: messageText.substring(0, 50) + (messageText.length > 50 ? '...' : ''),
          type: 'info',
          createdBy: user?.name || 'Unknown',
          recipientId: selectedUserId // Only show to the recipient
        });
        setMessageText('');
      }
    } finally {
      setIsSending(false);
    }
  };
  const handleSelectConversation = (conv: (typeof conversations)[0]) => {
    setSelectedUserId(conv.userId);
    setView('chat');
    markAsRead(conv.userId);
  };
  const handleBack = () => {
    if (view === 'chat') {
      setSelectedUserId(null);
      setView('conversations');
    } else if (view === 'users') {
      setView('conversations');
    }
  };
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };
  if (!isOpen) {
    return <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 z-40 p-4 bg-primary text-white rounded-full shadow-lg hover:bg-blue-700 transition-all hover:scale-110">
        <MessageCircle className="h-6 w-6" />
        {unreadCount > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>}
      </button>;
  }
  return <div className="fixed bottom-6 right-6 z-40 w-full max-w-sm sm:w-96 h-[500px] sm:h-[600px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="bg-primary text-white p-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          {view !== 'conversations' && <button onClick={handleBack} className="p-1 hover:bg-white/20 rounded-full transition-colors mr-1">
              <ArrowLeft className="h-5 w-5" />
            </button>}

          {view === 'chat' && selectedUser ? <>
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white font-medium text-sm">
                {selectedUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-sm">{selectedUser.name}</h3>
                <p className="text-xs text-blue-100">{selectedUser.role}</p>
              </div>
            </> : <>
              <MessageCircle className="h-5 w-5" />
              <h3 className="font-semibold">
                {view === 'users' ? 'New Chat' : 'Messages'}
              </h3>
            </>}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => {
          setIsOpen(false);
          setView('conversations');
          setSelectedUserId(null);
        }} className="p-1 hover:bg-blue-600 rounded transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content based on view state */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* CONVERSATIONS LIST VIEW */}
        {view === 'conversations' && <div className="flex-1 overflow-y-auto flex flex-col">
            <div className="p-4 border-b border-slate-200 flex-shrink-0">
              <Button size="sm" className="w-full" onClick={() => setView('users')}>
                <Users className="h-4 w-4 mr-2" />
                Start New Chat
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {conversations.length > 0 ? conversations.map(conv => <button key={conv.userId} onClick={() => handleSelectConversation(conv)} className="w-full p-4 hover:bg-slate-50 text-left border-b border-slate-100 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium flex-shrink-0">
                        {conv.userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <p className="font-medium text-slate-900 truncate">
                            {conv.userName}
                          </p>
                          {conv.unreadCount > 0 && <Badge variant="danger" className="text-xs ml-2">
                              {conv.unreadCount}
                            </Badge>}
                        </div>
                        <p className="text-sm text-slate-600 truncate">
                          {conv.lastMessage}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {formatDate(conv.lastMessageTime)}
                        </p>
                      </div>
                    </div>
                  </button>) : <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    No conversations yet
                  </h3>
                  <p className="text-sm mb-4">
                    Start a new chat to begin messaging with your colleagues
                  </p>
                </div>}
            </div>
          </div>}

        {/* USER SELECTION VIEW */}
        {view === 'users' && <div className="flex-1 flex flex-col">
            <div className="p-3 border-b border-slate-200 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" placeholder="Search users..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary" autoFocus />
              </div>
            </div>

            <div className="p-3 bg-slate-50 text-xs font-semibold text-slate-600 uppercase flex-shrink-0">
              Select User to Chat
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredStaff.length > 0 ? filteredStaff.map(staffMember => <button key={staffMember.id} onClick={() => handleSelectUser(staffMember)} className="w-full p-3 hover:bg-slate-50 text-left border-b border-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-sm">
                        {staffMember.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 text-sm truncate">
                          {staffMember.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {staffMember.role} • {staffMember.department}
                        </p>
                      </div>
                    </div>
                  </button>) : <div className="p-8 text-center text-slate-500">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No users found</p>
                </div>}
            </div>
          </div>}

        {/* CHAT VIEW */}
        {view === 'chat' && <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50" style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e2e8f0' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"
        }}>
          {messagesLoading ? <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                  <div className="text-center">
                    <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p>Loading messages...</p>
                  </div>
                </div> : conversationMessages.length > 0 ? conversationMessages.map((msg: ChatMessage, index: number) => {
            const showDate = index === 0 || formatDate(msg.timestamp) !== formatDate(conversationMessages[index - 1].timestamp);
            const isOwnMessage = msg.senderId === user?.staffId;
            return <Fragment key={msg.id}>

                      {showDate && <div className="flex justify-center my-4">
                          <span className="bg-white/80 text-slate-600 text-xs px-3 py-1 rounded-full shadow-sm">
                            {formatDate(msg.timestamp)}
                          </span>
                        </div>}
                      <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] rounded-lg px-3 py-2 shadow-sm ${isOwnMessage ? 'bg-primary text-white rounded-br-none' : 'bg-white text-slate-900 border border-slate-200 rounded-bl-none'}`}>
                          <p className="text-sm break-words whitespace-pre-wrap">
                            {msg.message}
                          </p>
                          <div className={`flex items-center justify-end gap-1 mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-slate-400'}`}>
                            <span className="text-xs">
                              {formatTime(msg.timestamp)}
                            </span>
                            {isOwnMessage && <svg className="h-4 w-4" viewBox="0 0 16 15" fill="none">
                                <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" fill="currentColor" />
                              </svg>}
                          </div>
                        </div>
                      </div>
                    </Fragment>;
          }) : <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                </div>}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-slate-200 bg-white flex-shrink-0">
              <div className="flex items-end gap-2">
                {/* Message Input */}
                <div className="flex-1 relative">
                  <textarea value={messageText} onChange={e => setMessageText(e.target.value)} onKeyPress={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }} placeholder="Type a message..." rows={1} className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary text-sm resize-none max-h-24" style={{
                minHeight: '40px'
              }} />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <Smile className="h-5 w-5" />
                  </button>
                </div>

                {/* Send Button */}
                <button onClick={handleSendMessage} disabled={!messageText.trim()} className={`p-2 rounded-full transition-all ${messageText.trim() ? 'bg-primary text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>}
      </div>
    </div>;
}
