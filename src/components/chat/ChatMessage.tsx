"use client";

import type { Message } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { Bot, User as UserIcon } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ChatMessageProps = {
  message: Message;
};

export default function ChatMessage({ message }: ChatMessageProps) {
  const { user } = useAuth();
  const isUser = message.role === "user";

  return (
    <div className={cn("flex items-start gap-4", isUser && "justify-end")}>
      {!isUser && (
        <Avatar className="h-10 w-10 border">
            <AvatarFallback><Bot className="h-5 w-5"/></AvatarFallback>
        </Avatar>
      )}
      <Card className={cn(
        "max-w-[75%] rounded-2xl", 
        isUser ? "bg-primary text-primary-foreground" : "bg-card shadow-sm"
      )}>
        <CardContent className="p-3">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </CardContent>
      </Card>
      {isUser && (
        <Avatar className="h-10 w-10">
          <AvatarImage src={user?.photoURL || undefined} />
          <AvatarFallback>
            {user?.displayName ? user.displayName.charAt(0) : <UserIcon />}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
