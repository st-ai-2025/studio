
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
import { Skeleton } from "../ui/skeleton";
import { Logo } from "../Logo";
import { db, createUserProfile } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

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
    if (input.trim() === "" || !user) {
        toast({ variant: "destructive", title: "Error", description: "You must be logged in to send a message." });
        return;
    }

    const userMessageContent = input;
    setInput("");

    const userMessage = {
      content: userMessageContent,
      role: 'user' as const,
      userId: user.uid,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsResponding(true);

    try {
        if (isFirstMessage) {
            await createUserProfile(user);
            setIsFirstMessage(false);
        }

        const userChatsCollection = collection(db, "users", user.uid, "chats");
        
        await addDoc(userChatsCollection, {
            ...userMessage,
            timestamp: serverTimestamp(),
        });
        
        const res = await personalizedChat({ surveyResponses: surveyData, userMessage: userMessageContent });
        
        if (res.chatbotResponse) {
            const assistantMessage = {
                content: res.chatbotResponse,
                role: 'assistant' as const,
                userId: user.uid
            };
            setMessages(prev => [...prev, assistantMessage]);
            await addDoc(userChatsCollection, {
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
            {isResponding && messages.length > 0 && (
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
             {messages.length === 0 && (
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
