import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface TopicCardProps {
  id: string;
  title: string;
  question: string;
  description: string;
  onSelect: (id: string) => void;
}

export const TopicCard = ({ id, title, question, description, onSelect }: TopicCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-all h-full" style={{ boxShadow: 'var(--shadow-elegant)' }}>
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription className="text-lg italic">"{question}"</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{description}</p>
        <Button 
          className="w-full"
          onClick={() => onSelect(id)}
        >
          <MessageCircle className="mr-2 h-4 w-4" />
          Begin Dialogue
        </Button>
      </CardContent>
    </Card>
  );
};
