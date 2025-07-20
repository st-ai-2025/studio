
"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Bot, Send, RefreshCw } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "./ChatMessage";
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { generateContextAwareIntroduction } from "@/ai/flows/context-aware-introduction";
import { personalizedChat } from "@/ai/flows/personalized-chat";
import type { Message } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";
import { Logo } from "../Logo";

type ChatInterfaceProps = {
  surveyData: Record<string, any>;
  onResetSurvey: () => void;
};

export default function ChatInterface({ surveyData, onResetSurvey }: ChatInterfaceProps) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [isResponding, setIsResponding] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Effect for listening to Firestore for chat messages
  useEffect(() => {
    if (!user) return;
    
    setLoading(true);

    if (bypassAuth) {
        // In bypass mode, we handle the intro separately.
        setLoading(false);
        return; 
    }

    const q = query(
      collection(db, "chats"),
      where("userId", "==", user.uid),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const msgs: Message[] = [];
        querySnapshot.forEach((doc) => {
          msgs.push({ id: doc.id, ...doc.data() } as Message);
        });
        setMessages(msgs);
        setLoading(false);
      }, 
      (error) => {
        console.error("Error fetching chat history:", error);
        toast({ variant: "destructive", title: "Error", description: "Could not load chat history. Check Firestore security rules and index configuration." });
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, bypassAuth, toast]);


  // Effect for generating the initial introduction message
  useEffect(() => {
    // Only run if not loading, user is present, and there are no messages.
    if (!loading && user && messages.length === 0) {
      setIsResponding(true);

      const createIntroduction = async () => {
        try {
          const res = await generateContextAwareIntroduction({ surveyResponses: JSON.stringify(surveyData) });
          if (res.introduction) {
            const introMsg = {
              content: res.introduction,
              role: 'assistant' as const,
              timestamp: serverTimestamp(),
              userId: user.uid,
            };
            
            if (bypassAuth) {
                // In bypass, just update state directly
                setMessages([{...introMsg, id: 'intro-1', timestamp: new Date() as any}]);
            } else {
                // In normal mode, add to Firestore, listener will update state
                await addDoc(collection(db, "chats"), introMsg);
            }
          }
        } catch (error) {
          console.error("Error generating introduction:", error);
          toast({ variant: "destructive", title: "Error", description: "Failed to start conversation." });
        } finally {
          setIsResponding(false);
        }
      };
      
      createIntroduction();
    }
    // This should only depend on these stable values.
  }, [loading, user, messages.length, surveyData, toast, bypassAuth]);


  const handleSend = async () => {
    if (input.trim() === "" || !user) return;

    const userMessageContent = input;
    setInput("");
    setIsResponding(true);

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: userMessageContent,
      role: 'user',
      timestamp: (bypassAuth ? new Date() : serverTimestamp()) as any,
      userId: user.uid,
    };
    
    // Optimistically update UI only in bypass mode, otherwise let Firestore handle it
    if (bypassAuth) {
        setMessages(prev => [...prev, userMessage]);
    }
    
    try {
        if (!bypassAuth) {
            await addDoc(collection(db, "chats"), {
                content: userMessage.content,
                role: userMessage.role,
                timestamp: serverTimestamp(),
                userId: userMessage.userId
            });
        }
        
        const res = await personalizedChat({ surveyResponses: surveyData, userMessage: userMessageContent });
        
        if (res.chatbotResponse) {
            const assistantMessage: Omit<Message, 'id'> = {
                content: res.chatbotResponse,
                role: 'assistant',
                timestamp: (bypassAuth ? new Date() : serverTimestamp()) as any,
                userId: user.uid
            };

            if (!bypassAuth) {
              // The onSnapshot listener will handle adding the assistant message to the UI
              await addDoc(collection(db, "chats"), assistantMessage);
            } else {
                setMessages(prev => [...prev.filter(m => m.id !== userMessage.id), userMessage, {...assistantMessage, id: `assistant-${Date.now()}`}]);
            }
        }
    } catch (error) {
        console.error("Error sending message:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to send message." });
        // Rollback optimistic update on error if in bypass mode
        if(bypassAuth) {
            setMessages(prev => prev.filter(m => m.id !== userMessage.id));
        }
        setInput(userMessageContent);
    } finally {
        setIsResponding(false);
    }
  };

  if (loading && messages.length === 0) {
    return (
        <div className="flex h-screen flex-col">
            <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-10 w-10 rounded-full" />
            </header>
            <main className="flex-1 p-4 space-y-4">
                <Skeleton className="h-16 w-3/4 self-start rounded-xl" />
                <Skeleton className="h-16 w-3/4 self-end rounded-xl" />
                <Skeleton className="h-16 w-2/4 self-start rounded-xl" />
            </main>
            <footer className="shrink-0 border-t p-4">
                 <Skeleton className="h-24 w-full" />
            </footer>
        </div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-8"/>
          <h1 className="text-lg font-semibold font-headline">FormFlow AI Chat</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || "User"} />
                <AvatarFallback>{user?.displayName?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onResetSurvey}><RefreshCw className="mr-2 h-4 w-4" />New Survey</DropdownMenuItem>
            <DropdownMenuItem asChild>
                <a href="https://forms.gle/your-post-chat-survey-link" target="_blank" rel="noopener noreferrer">Post-Chat Survey</a>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <main className="flex-1">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 md:p-6 space-y-6">
            {messages.map((msg, index) => (
              <ChatMessage key={msg.id || index} message={msg} />
            ))}
            {isResponding && (
                <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 border">
                        <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-12 w-64" />
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
      </main>
      <footer className="shrink-0 border-t bg-card p-4">
        <div className="relative">
          <Textarea
            placeholder="Type your message..."
            className="pr-20 min-h-[50px] resize-none"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90"
            onClick={handleSend}
            disabled={isResponding || input.trim() === ""}
          >
            <Send className="h-5 w-5 text-primary-foreground" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
