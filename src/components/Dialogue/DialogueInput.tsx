import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

interface DialogueInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const DialogueInput = ({ onSend, disabled }: DialogueInputProps) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Share your thoughts..."
        className="min-h-[60px] resize-none"
        disabled={disabled}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
      />
      <Button 
        type="submit" 
        disabled={!input.trim() || disabled}
        className="self-end"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};
