
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LogOut, Bot, Send, RefreshCw } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "./ChatMessage";
import PostSurveyForm from "./PostSurveyForm";
import { generateContextAwareIntroduction } from "@/ai/flows/context-aware-introduction";
import { personalizedChat } from "@/ai/flows/personalized-chat";
import type { Message } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Logo } from "../Logo";
import { db, createUserProfile } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp, doc, setDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

type ChatInterfaceProps = {
  surveyData: Record<string, any>;
  onResetSurvey: () => void;
};

export default function ChatInterface({ surveyData, onResetSurvey }: ChatInterfaceProps) {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [messages, setMessages] = useState<Omit<Message, 'id' | 'timestamp'>[]>([]);
  const [input, setInput] = useState("");
  const [isResponding, setIsResponding] = useState(false);
  const [isFirstMessage, setIsFirstMessage] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [showPostSurveyButton, setShowPostSurveyButton] = useState(false);
  const [isPostSurveyOpen, setIsPostSurveyOpen] = useState(false);
  const [chatStartTime, setChatStartTime] = useState<Date | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const getElapsedTime = () => {
    if (!chatStartTime) return { minutes: 0, seconds: 0 };
    const now = new Date();
    const diffMs = now.getTime() - chatStartTime.getTime();
    const totalSeconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return { minutes, seconds };
  };

  useEffect(() => {
    if (user) {
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
        const res = await generateContextAwareIntroduction({ surveyResponses: surveyData });
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

    const userMessageContent = input.trim();
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
        if (isFirstMessage) {
            setChatStartTime(new Date());
            await createUserProfile(user); 
            const sessionRef = doc(db, "users", user.uid, "sessions", sessionId);
            await setDoc(sessionRef, {
                surveyData: surveyData,
                startTime: serverTimestamp(),
            });
            setIsFirstMessage(false);
        }

        const messagesCollectionRef = collection(db, "users", user.uid, "sessions", sessionId, "messages");
        
        await addDoc(messagesCollectionRef, {
            ...userMessage,
            timestamp: serverTimestamp(),
        });
        
        const res = await personalizedChat({ 
          surveyResponses: surveyData, 
          history: newMessages.map(({ role, content }) => ({ role, content })) 
        });
        
        if (res.chatbotResponse) {
            const trimmedResponse = res.chatbotResponse.trim();
            if (trimmedResponse.includes("[Before you exit, please take the survey by clicking the button below.]")) {
              setShowPostSurveyButton(true);
            }

            const assistantMessage = {
                content: trimmedResponse,
                role: 'assistant' as const,
                userId: user.uid
            };
            
            setMessages((prevMessages) => [...prevMessages, assistantMessage]);
            
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
  
  const handlePostSurveySubmit = (data: Record<string, any>) => {
    if (!user || !sessionId) {
      toast({ variant: "destructive", title: "Error", description: "Cannot save survey. User or session is not initialized." });
      return;
    }
    
    router.push('/thank-you');
    setIsPostSurveyOpen(false);
    
    const surveyResponse = {
      ...data,
      interestChange: data.interestChange[0],
      understandingChange: data.understandingChange[0],
    };

    const saveSurvey = async () => {
      try {
        const sessionRef = doc(db, "users", user.uid, "sessions", sessionId);
        await updateDoc(sessionRef, {
          postSurveyResponse: surveyResponse,
          endTime: serverTimestamp()
        });
        console.log("Post-chat survey submitted:", surveyResponse);
      } catch (error) {
        console.error("Error saving post-chat survey:", error);
        // We don't show a toast here because the user has already navigated away.
        // The error is logged for debugging purposes.
      }
    }

    saveSurvey();
  };

  return (
    <div className="flex h-screen flex-col w-[600px]">
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-card px-4 md:px-6">
        <div className="flex items-center gap-3">
          <Logo className="h-8 w-8"/>
          <h1 className="text-lg font-semibold font-headline">TutorFlow</h1>
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
        <ScrollArea className="h-full">
          <div className="p-4 md:p-6 space-y-6">
            {messages.map((msg, index) => (
              <ChatMessage key={index} message={msg} />
            ))}
            {isResponding && (
                <div className="flex items-start gap-4">
                    <Avatar className="h-10 w-10 border">
                        <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2 pt-3">
                      <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"></div>
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </main>
      <footer className="shrink-0 border-t bg-card p-4 space-y-4">
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
        <div className="flex justify-center">
            {showPostSurveyButton ? (
                 <Dialog open={isPostSurveyOpen} onOpenChange={setIsPostSurveyOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">Take Survey</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                        <DialogTitle>Post-Session Survey</DialogTitle>
                        </DialogHeader>
                        <PostSurveyForm onSubmit={handlePostSurveySubmit} />
                    </DialogContent>
                </Dialog>
            ) : (
                <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="outline">End Session</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>How to End Your Session</AlertDialogTitle>
                    <AlertDialogDescription>
                      To conclude your session, tell your AI tutor "I am done". The AI tutor will then ask you a few questions to assess your understanding of the topic before you can exit.
                    </AlertDialogDescription>
                    {chatStartTime && (
                        <div className="mt-4 text-sm text-foreground p-3 bg-secondary rounded-md">
                            You have only used the tutoring chatbot for {getElapsedTime().minutes} minutes {getElapsedTime().seconds} seconds. To make your data useful for the research, it is recommended that you spend at least 15 minutes in the chat.
                        </div>
                    )}
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogAction>Got it</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
      </footer>
    </div>
  );
}

    

    