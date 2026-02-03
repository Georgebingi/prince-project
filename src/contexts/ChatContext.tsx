import React, {
  useEffect,
  useMemo,
  useState,
  createContext,
  useContext } from
'react';
import { useAuth } from './AuthContext';
import { useStaff } from './StaffContext';
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  message: string;
  timestamp: string;
  read: boolean;
}
export interface ChatConversation {
  userId: string;
  userName: string;
  userRole: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}
interface ChatContextType {
  conversations: ChatConversation[];
  messages: ChatMessage[];
  sendMessage: (
  receiverId: string,
  receiverName: string,
  message: string)
  => void;
  markAsRead: (userId: string) => void;
  getConversationMessages: (userId: string) => ChatMessage[];
  getUnreadCount: () => number;
}
const ChatContext = createContext<ChatContextType | undefined>(undefined);
export function ChatProvider({ children }: {children: ReactNode;}) {
  const { user } = useAuth();
  const { staff } = useStaff();
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('chat_messages');
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem('chat_messages', JSON.stringify(messages));
  }, [messages]);
  const sendMessage = (
  receiverId: string,
  receiverName: string,
  message: string) =>
  {
    if (!user) return;
    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: user.staffId,
      senderName: user.name,
      receiverId,
      receiverName,
      message,
      timestamp: new Date().toISOString(),
      read: false
    };
    setMessages((prev) => [...prev, newMessage]);
  };
  const markAsRead = (userId: string) => {
    if (!user) return;
    setMessages((prev) =>
    prev.map((msg) =>
    msg.senderId === userId && msg.receiverId === user.staffId && !msg.read ?
    {
      ...msg,
      read: true
    } :
    msg
    )
    );
  };
  const getConversationMessages = (userId: string): ChatMessage[] => {
    if (!user) return [];
    return messages.
    filter(
      (msg) =>
      msg.senderId === user.staffId && msg.receiverId === userId ||
      msg.senderId === userId && msg.receiverId === user.staffId
    ).
    sort(
      (a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };
  const conversations: ChatConversation[] = useMemo(() => {
    if (!user) return [];
    const conversationMap = new Map<string, ChatConversation>();
    messages.forEach((msg) => {
      const isOutgoing = msg.senderId === user.staffId;
      const otherUserId = isOutgoing ? msg.receiverId : msg.senderId;
      const otherUserName = isOutgoing ? msg.receiverName : msg.senderName;
      // Find user role from staff list
      const staffMember = staff.find((s) => s.staffId === otherUserId);
      const userRole = staffMember?.role || 'Unknown';
      if (!conversationMap.has(otherUserId)) {
        conversationMap.set(otherUserId, {
          userId: otherUserId,
          userName: otherUserName,
          userRole,
          lastMessage: msg.message,
          lastMessageTime: msg.timestamp,
          unreadCount: 0
        });
      }
      const conv = conversationMap.get(otherUserId)!;
      if (new Date(msg.timestamp) > new Date(conv.lastMessageTime)) {
        conv.lastMessage = msg.message;
        conv.lastMessageTime = msg.timestamp;
      }
      if (msg.receiverId === user.staffId && !msg.read) {
        conv.unreadCount++;
      }
    });
    return Array.from(conversationMap.values()).sort(
      (a, b) =>
      new Date(b.lastMessageTime).getTime() -
      new Date(a.lastMessageTime).getTime()
    );
  }, [messages, user, staff]);
  const getUnreadCount = (): number => {
    if (!user) return 0;
    return messages.filter(
      (msg) => msg.receiverId === user.staffId && !msg.read
    ).length;
  };
  return (
    <ChatContext.Provider
      value={{
        conversations,
        messages,
        sendMessage,
        markAsRead,
        getConversationMessages,
        getUnreadCount
      }}>

      {children}
    </ChatContext.Provider>);

}
export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
}