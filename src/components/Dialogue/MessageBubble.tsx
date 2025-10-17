import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export const MessageBubble = ({ role, content }: MessageBubbleProps) => {
  const isUser = role === "user";

  return (
    <div className={cn("flex gap-3 mb-4", isUser && "flex-row-reverse")}>
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
        isUser ? "bg-secondary" : "bg-primary"
      )}>
        {isUser ? (
          <User className="h-5 w-5 text-secondary-foreground" />
        ) : (
          <Bot className="h-5 w-5 text-primary-foreground" />
        )}
      </div>
      <div className={cn(
        "flex-1 px-4 py-3 rounded-2xl max-w-[80%]",
        isUser 
          ? "bg-secondary text-secondary-foreground rounded-tr-none" 
          : "bg-card text-card-foreground rounded-tl-none"
      )} style={{ boxShadow: 'var(--shadow-elegant)' }}>
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
};
