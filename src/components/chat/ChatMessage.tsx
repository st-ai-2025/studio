
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Message } from "@/types";
import FormattedMessage from "./FormattedMessage";

type ChatMessageProps = {
  message: Message;
};

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex items-start gap-4", isUser && "justify-end")}>
      {!isUser && (
        <Avatar className="h-10 w-10 border">
          <AvatarFallback className="text-xl">🧑‍🏫</AvatarFallback>
        </Avatar>
      )}
      <Card
        className={cn(
          "max-w-[75%]",
          isUser ? "bg-primary text-primary-foreground" : "bg-card shadow-sm"
        )}
      >
        <CardContent className="p-3 message-content">
          <FormattedMessage content={message.content} isUser={isUser} />
          {message.answers && (
            <div className="mt-2 space-y-2">
              {Object.entries(message.answers).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="font-bold">{key}:</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
