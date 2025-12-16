import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { authFetch, useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { format, isToday, isYesterday } from 'date-fns';
import { Loader2, MessageCircle, Send, Search, Circle, RefreshCw, Trash2 } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderRole?: string | null;
  senderName?: string | null;
  receiverId: string;
  receiverRole?: string | null;
  receiverName?: string | null;
  peerId?: string;
  peerName?: string;
  subject?: string | null;
  content: string;
  createdAt?: string | Date;
  isRead?: boolean;
}

const formatMessageTime = (d?: string | Date) => {
  if (!d) return '';
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  
  if (isToday(date)) {
    return format(date, 'h:mm a');
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else {
    return format(date, 'MMM d');
  }
};

export default function JobseekerMessagesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentUserId = user?.id?.toString();
  const [selectedPeer, setSelectedPeer] = useState<string | null>(null);
  const [messageBody, setMessageBody] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingPeerId, setDeletingPeerId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const conversationEndRef = useRef<HTMLDivElement | null>(null);

  const {
    data: messages = [],
    isLoading: isLoadingThreads,
    refetch: refetchThreads,
  } = useQuery<Message[]>({
    queryKey: ['messages', 'all'],
    queryFn: async () => {
      const res = await authFetch('/api/messages?type=all');
      return res.json();
    },
    staleTime: 60_000,
  });

  const threads = useMemo(() => {
    const grouped = new Map<string, Message[]>();
    messages.forEach((msg) => {
      if (!currentUserId) return;
      const peerId = msg.peerId || (msg.senderId.toString() === currentUserId ? msg.receiverId : msg.senderId);
      if (!peerId) return;
      const peerName = msg.peerName || (msg.senderId.toString() === currentUserId ? msg.receiverName : msg.senderName) || '';
      const threadKey = peerName.trim().toLowerCase() || peerId;
      const arr = grouped.get(threadKey) || [];
      arr.push(msg);
      grouped.set(threadKey, arr);
    });

    const threadList = Array.from(grouped.entries()).map(([threadKey, msgs]) => {
      const sorted = [...msgs].sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime());
      const last = sorted[0];
      const peerName = sorted
        .map((m) => m.peerName || (m.senderId.toString() === currentUserId ? m.receiverName : m.senderName))
        .find((name) => Boolean(name));
      const peerId = sorted.find((m) => m.peerId)?.peerId || sorted[0].peerId || sorted[0].receiverId || sorted[0].senderId;
      return {
        threadKey,
        peerId,
        peerName: peerName || peerId,
        lastMessage: last,
        unread: sorted.some((m) => m.receiverId.toString() === currentUserId && m.isRead === false),
      };
    });

    return threadList.sort((a, b) => {
      const timeA = new Date(a.lastMessage.createdAt || '').getTime();
      const timeB = new Date(b.lastMessage.createdAt || '').getTime();
      return timeB - timeA;
    });
  }, [messages, currentUserId]);

  useEffect(() => {
    if (!selectedPeer && threads.length > 0) {
      setSelectedPeer(threads[0].peerId);
    }
  }, [threads, selectedPeer]);

  const { data: conversation = [], isLoading: isLoadingConversation, refetch: refetchConversation } = useQuery<Message[]>(
    {
      queryKey: ['messages', 'conversation', selectedPeer],
      queryFn: async () => {
        if (!selectedPeer) return [];
        const res = await authFetch(`/api/messages/conversation/${selectedPeer}`);
        return res.json();
      },
      enabled: Boolean(selectedPeer),
      refetchInterval: selectedPeer ? 4000 : false,
      refetchIntervalInBackground: true,
    }
  );

  // Mark messages as read automatically when a conversation is opened.
  useEffect(() => {
    if (!currentUserId) return;
    if (!selectedPeer) return;
    const unread = conversation.filter(
      (m) => m.receiverId?.toString?.() === currentUserId && m.isRead === false
    );
    if (unread.length === 0) return;

    (async () => {
      await Promise.all(
        unread.map((m) =>
          authFetch(`/api/messages/${m.id}/read`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isRead: true }),
          }).catch(() => null)
        )
      );

      queryClient.invalidateQueries({ queryKey: ['messages', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'conversation', selectedPeer] });
    })();
  }, [conversation, currentUserId, queryClient, selectedPeer]);

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!selectedPeer) throw new Error('Select a conversation first');
      const payload = {
        receiverId: selectedPeer,
        receiverRole: 'employer',
        content: messageBody.trim(),
      };
      const res = await authFetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res.json();
    },
    onSuccess: () => {
      setMessageBody('');
      queryClient.invalidateQueries({ queryKey: ['messages', 'all'] });
      refetchConversation();
    },
    onError: (error: any) => {
      toast({ title: 'Failed to send', description: error?.message || 'Please try again.', variant: 'destructive' });
    },
    onSettled: () => {
      // Keep typing flow: sending disables the textarea briefly, which can drop focus.
      requestAnimationFrame(() => textareaRef.current?.focus());
    },
  });

  const deleteConversationMutation = useMutation({
    onMutate: async (peerId: string) => {
      setDeletingPeerId(peerId);
    },
    mutationFn: async (peerId: string) => {
      const res = await authFetch(`/api/messages/conversation/${peerId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || 'Failed to delete conversation');
      }

      return res.json();
    },
    onSuccess: async (_data, peerId) => {
      if (selectedPeer === peerId) {
        setSelectedPeer(null);
      }

      await refetchThreads();
      queryClient.invalidateQueries({ queryKey: ['messages', 'all'] });
      queryClient.invalidateQueries({ queryKey: ['messages', 'conversation', peerId] });
      toast({ title: 'Conversation deleted', description: 'All messages in this conversation were removed.' });
    },
    onError: (error: any) => {
      toast({
        title: 'Delete failed',
        description: error?.message || 'Please try again.',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setDeletingPeerId(null);
    },
  });

  const selectedThreadMeta = threads.find((t) => t.peerId === selectedPeer);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [messageBody]);

  // Always keep the latest message in view
  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.length, selectedPeer]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendMutation.isPending && selectedPeer && messageBody.trim()) {
        sendMutation.mutate();
      }
    }
  };

  const filteredThreads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return threads;
    return threads.filter((thread) => {
      const name = (thread.peerName || thread.peerId || '').toLowerCase();
      const content = (thread.lastMessage?.content || '').toLowerCase();
      return name.includes(q) || content.includes(q);
    });
  }, [threads, searchQuery]);

  return (
    <div className="h-full min-h-0 bg-slate-50 overflow-hidden">
      <div className="mx-auto flex h-full min-h-0 max-w-7xl flex-col gap-4 px-6 py-6 box-border">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Messages</h1>
          <Button
            variant="outline"
            onClick={() => {
              refetchThreads();
              if (selectedPeer) refetchConversation();
            }}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Main content */}
        <div className="flex-1 min-h-0">
          <div className="h-full grid gap-4 grid-cols-[340px,1fr] min-h-0">
            {/* Conversations Sidebar */}
            <Card className="h-full flex flex-col border border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 pb-4 flex-shrink-0">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900">
                  <MessageCircle className="h-5 w-5 text-indigo-600" />
                  Conversations
                </CardTitle>
                <div className="relative mt-3">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search by name or message..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-white border-slate-200"
                  />
                </div>
              </CardHeader>
              <CardContent className="flex-1 min-h-0 space-y-1 overflow-y-auto overscroll-contain p-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                {isLoadingThreads && (
                  <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading conversations...</span>
                  </div>
                )}
                {!isLoadingThreads && threads.length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
                    <p className="font-medium text-slate-900">No messages yet.</p>
                    <p className="mt-1 text-sm text-slate-500">Employers will appear here once you start chatting.</p>
                  </div>
                )}
                {!isLoadingThreads && filteredThreads.length === 0 && threads.length > 0 && (
                  <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
                    <Search className="h-6 w-6 text-slate-400" />
                    <p className="text-sm text-slate-500">No conversations found</p>
                  </div>
                )}
                {filteredThreads.map((thread) => {
                  const isActive = thread.peerId === selectedPeer;
                  const preview = thread.lastMessage.content.slice(0, 60);
                  const displayName = thread.peerName || thread.peerId;
                  const initials = displayName.slice(0, 2).toUpperCase();
                  const isDeletingThisThread = deleteConversationMutation.isPending && deletingPeerId === thread.peerId;
                  return (
                    <div
                      key={thread.peerId}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSelectedPeer(thread.peerId)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedPeer(thread.peerId);
                        }
                      }}
                      className={`group relative flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-all duration-200 ${
                        isActive 
                          ? 'bg-indigo-50 shadow-sm' 
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <button
                        type="button"
                        aria-label={`Delete conversation with ${displayName}`}
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-400 opacity-0 transition group-hover:opacity-100 focus:opacity-100 hover:bg-rose-50 hover:text-rose-600"
                        disabled={isDeletingThisThread}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (deleteConversationMutation.isPending) return;
                          const ok = window.confirm(`Delete conversation with ${displayName}? This will remove all messages.`);
                          if (!ok) return;
                          deleteConversationMutation.mutate(thread.peerId);
                        }}
                      >
                        {isDeletingThisThread ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>

                      {/* Avatar with online indicator */}
                      <div className="relative">
                        <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                          <AvatarFallback className={`text-sm font-semibold ${
                            isActive 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white'
                          }`}>
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        {thread.unread && (
                          <Circle className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 fill-emerald-500 text-emerald-500" />
                        )}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <p className={`truncate text-sm font-semibold ${
                            isActive ? 'text-indigo-900' : 'text-slate-900'
                          }`}>
                            {displayName}
                          </p>
                          <span className="flex-shrink-0 text-xs text-slate-500">
                            {formatMessageTime(thread.lastMessage.createdAt)}
                          </span>
                        </div>
                        <p className={`mb-1.5 truncate text-xs ${
                          thread.unread ? 'font-medium text-slate-900' : 'text-slate-600'
                        }`}>
                          {preview}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Conversation View */}
            <Card className="h-full min-h-0 flex flex-col border border-slate-200 shadow-sm bg-white">
              {selectedThreadMeta ? (
                <>
                  {/* Conversation Header */}
                  <CardHeader className="border-b border-slate-100 py-3 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-white shadow">
                          <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-sm font-semibold text-white">
                            {(selectedThreadMeta.peerName || selectedThreadMeta.peerId).slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base font-semibold text-slate-900">
                            {selectedThreadMeta.peerName || selectedThreadMeta.peerId}
                          </CardTitle>
                          <p className="text-xs text-slate-500">Employer</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages Area */}
                  <CardContent className="flex-1 min-h-0 grid grid-rows-[1fr,auto] p-0 overflow-hidden">
                    <div className="min-h-0 space-y-4 overflow-y-auto overscroll-contain bg-slate-50 p-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                      {isLoadingConversation && (
                        <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Loading messages...</span>
                        </div>
                      )}
                      {!isLoadingConversation && conversation.length === 0 && (
                        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                          <div className="rounded-full bg-white p-4 shadow-sm">
                            <MessageCircle className="h-8 w-8 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">Start a conversation</p>
                            <p className="text-sm text-slate-500">Send your first message to this employer</p>
                          </div>
                        </div>
                      )}
                      {conversation.map((msg, idx) => {
                        const isMine = msg.senderId?.toString() === currentUserId || msg.senderRole === 'jobseeker';
                        return (
                          <div key={msg.id}>
                            <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                              <div className={`flex max-w-[70%] items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
                                {!isMine && (
                                  <Avatar className="h-8 w-8 flex-shrink-0 mb-5">
                                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-semibold text-white">
                                      {(selectedThreadMeta.peerName || '').slice(0, 2).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                <div className="flex flex-col gap-1">
                                  <div
                                    className={`group relative rounded-2xl px-4 py-3 shadow-sm transition-all ${
                                      isMine
                                        ? 'bg-indigo-600 text-white rounded-br-md'
                                        : 'bg-white text-slate-900 border border-slate-200 rounded-bl-md'
                                    }`}
                                  >
                                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                                      {msg.content}
                                    </p>
                                  </div>
                                  <div className={`flex items-center gap-1.5 px-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                    <span className={`text-xs ${isMine ? 'text-indigo-100/90' : 'text-slate-500'}`}>
                                      {format(new Date(msg.createdAt || ''), 'h:mm a')}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={conversationEndRef} />
                    </div>

                    {/* Message Input */}
                    <div className="border-t border-slate-200 bg-white p-4">
                      <div className="flex items-center gap-2">
                        <Textarea
                          ref={textareaRef}
                          placeholder="Type your message..."
                          value={messageBody}
                          onChange={(e) => setMessageBody(e.target.value)}
                          onKeyDown={handleKeyDown}
                          disabled={!selectedPeer || sendMutation.isPending}
                          rows={1}
                          className="flex-1 min-h-[48px] max-h-32 resize-none rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:bg-white"
                        />
                        <Button
                          onClick={() => sendMutation.mutate()}
                          disabled={!selectedPeer || !messageBody.trim() || sendMutation.isPending}
                          size="icon"
                          className="h-12 w-12 flex-shrink-0 rounded-full bg-indigo-600 hover:bg-indigo-700"
                        >
                          {sendMutation.isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Send className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <div className="rounded-full bg-slate-100 p-6">
                    <MessageCircle className="h-12 w-12 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Select a conversation</h3>
                    <p className="text-sm text-slate-500">Choose a conversation from the left to view messages</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
