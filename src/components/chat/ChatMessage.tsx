
"use client";

import type { Message } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/use-auth";
import { Bot, User as UserIcon } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import FormattedMessage from "./FormattedMessage";

type ChatMessageProps = {
  message: Omit<Message, 'id' | 'timestamp'>;
};

export default function ChatMessage({ message }: ChatMessageProps) {
  const { user } = useAuth();
  const isUser = message.role === "user";

  const photoURL = user?.photoURL || undefined;
  const displayName = user?.displayName;

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
        <CardContent className="p-3 whitespace-pre-wrap">
          <FormattedMessage content={message.content} />
        </CardContent>
      </Card>
      {isUser && (
        <Avatar className="h-10 w-10">
          <AvatarImage src={photoURL} />
          <AvatarFallback>
            {displayName ? displayName.charAt(0) : <UserIcon />}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
