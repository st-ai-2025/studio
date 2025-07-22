
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
import { generateContextAwareIntroduction } from "@/ai/flows/context-aware-introduction";
import { personalizedChat } from "@/ai/flows/personalized-chat";
import type { Message } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "../Logo";
import { db, createUserProfile } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp, doc, setDoc } from "firebase/firestore";

type ChatInterfaceProps = {
  surveyData: Record<string, any>;
  onResetSurvey: () => void;
};

export default function ChatInterface({ surveyData, onResetSurvey }: ChatInterfaceProps) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Omit<Message, 'id' | 'timestamp'>[]>([]);
  const [input, setInput] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  };

  useEffect(() => {
    if (user) {
      // Generate a new session ID when the component mounts with a user
      const newSessionId = doc(collection(db, 'users', user.uid, 'sessions')).id;
      setSessionId(newSessionId);
    }
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    const generateIntro = async () => {
      setIsResponding(true);
      try {
        const res = await generateContextAwareIntroduction({ surveyResponses: JSON.stringify(surveyData) });
        if (res.introduction) {
          const introMsg = {
            content: res.introduction,
            role: 'assistant' as const,
            userId: user.uid,
          };
          setMessages([introMsg]);
        }
      } catch (error) {
        console.error("Error generating introduction:", error);
        toast({ variant: "destructive", title: "Error", description: "Failed to start conversation. Please try again." });
      } finally {
        setIsResponding(false);
      }
    };

    generateIntro();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, surveyData]);


  const handleSend = async () => {
    if (input.trim() === "" || !user || !sessionId) {
        toast({ variant: "destructive", title: "Error", description: "Cannot send message. User or session is not initialized." });
        return;
    }

    const userMessageContent = input;
    const userMessage = {
      content: userMessageContent,
      role: 'user' as const,
      userId: user.uid,
    };
    
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsResponding(true);

    try {
        // On the first message, create the user profile and the session document
        if (isFirstMessage) {
            await createUserProfile(user); 
            const sessionRef = doc(db, "users", user.uid, "sessions", sessionId);
            await setDoc(sessionRef, {
                surveyData: surveyData,
                startTime: serverTimestamp(),
            });
            setIsFirstMessage(false);
        }

        const messagesCollectionRef = collection(db, "users", user.uid, "sessions", sessionId, "messages");
        
        // Save user message to Firestore
        await addDoc(messagesCollectionRef, {
            ...userMessage,
            timestamp: serverTimestamp(),
        });
        
        // Get AI response
        const res = await personalizedChat({ 
          surveyResponses: surveyData, 
          history: newMessages.map(({ role, content }) => ({ role, content })) 
        });
        
        if (res.chatbotResponse) {
            const assistantMessage = {
                content: res.chatbotResponse,
                role: 'assistant' as const,
                userId: user.uid
            };
            setMessages(prev => [...prev, assistantMessage]);
            
            // Save assistant message to Firestore
            await addDoc(messagesCollectionRef, {
              ...assistantMessage,
              timestamp: serverTimestamp(),
            });
        }
    } catch (error) {
        console.error("Error sending message:", error);
        toast({ 
            variant: "destructive", 
            title: "Failed to send message", 
            description: "There was an error sending your message. Please check the console for details."
        });
    } finally {
        setIsResponding(false);
    }
  };
  
  return (
    <div className="flex h-screen flex-col w-[600px]">
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
            <DropdownMenuItem onClick={signOut}><LogOut className="mr-2 h-4 w-4" />Sign Out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <main className="flex-1">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="p-4 md:p-6 space-y-6">
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
            {isResponding && (
                <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10 border">
                        <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                    </Avatar>
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
