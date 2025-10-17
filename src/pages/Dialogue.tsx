import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MessageBubble } from "@/components/Dialogue/MessageBubble";
import { DialogueInput } from "@/components/Dialogue/DialogueInput";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Topic {
  title: string;
  question: string;
  common_fallacies: string[];
}

const Dialogue = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      fetchDialogue();
      subscribeToMessages();
    }
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchDialogue = async () => {
    try {
      const { data: dialogue, error: dialogueError } = await supabase
        .from('dialogues')
        .select(`
          *,
          topics (
            title,
            question,
            common_fallacies
          )
        `)
        .eq('id', id)
        .single();

      if (dialogueError) throw dialogueError;
      setTopic(dialogue.topics as unknown as Topic);

      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .select('*')
        .eq('dialogue_id', id)
        .order('created_at');

      if (messageError) throw messageError;
      
      const formattedMessages = messageData.map(msg => ({
        id: msg.id,
        role: msg.role as "user" | "assistant",
        content: msg.content
      }));
      
      setMessages(formattedMessages);

      // Send initial AI greeting if no messages
      if (formattedMessages.length === 0 && dialogue.topics) {
        await sendInitialGreeting(dialogue.topics as unknown as Topic);
      }
    } catch (error: any) {
      toast({
        title: "Error loading dialogue",
        description: error.message,
        variant: "destructive",
      });
      navigate('/topics');
    } finally {
      setInitialLoading(false);
    }
  };

  const sendInitialGreeting = async (topicData: Topic) => {
    const greeting = `Welcome! Let's explore the question: "${topicData.question}"\n\nTo begin, what are your initial thoughts on this topic?`;
    
    await supabase.from('messages').insert({
      dialogue_id: id,
      role: 'assistant',
      content: greeting
    });
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`messages-${id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `dialogue_id=eq.${id}`
        },
        (payload) => {
          const newMessage = payload.new as any;
          setMessages(prev => [...prev, {
            id: newMessage.id,
            role: newMessage.role,
            content: newMessage.content
          }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async (content: string) => {
    if (!id || !topic) return;
    
    setLoading(true);
    try {
      // Save user message
      await supabase.from('messages').insert({
        dialogue_id: id,
        role: 'user',
        content
      });

      // Get AI response
      const conversationHistory = [
        ...messages,
        { role: 'user', content }
      ].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('socratic-dialogue', {
        body: {
          messages: conversationHistory,
          topic: topic.question,
          commonFallacies: topic.common_fallacies
        }
      });

      if (error) throw error;

      // Save AI response
      await supabase.from('messages').insert({
        dialogue_id: id,
        role: 'assistant',
        content: data.message
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEndDialogue = async () => {
    try {
      await supabase
        .from('dialogues')
        .update({ status: 'completed' })
        .eq('id', id);
      
      toast({
        title: "Dialogue completed",
        description: "Your philosophical journey has been saved.",
      });
      navigate('/topics');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Loading dialogue...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--gradient-hero)' }}>
      <div className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10" style={{ boxShadow: 'var(--shadow-elegant)' }}>
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate('/topics')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Topics
          </Button>
          <div className="text-center flex-1">
            <h2 className="font-semibold text-lg">{topic?.title}</h2>
            <p className="text-sm text-muted-foreground italic">"{topic?.question}"</p>
          </div>
          <Button variant="ghost" onClick={handleEndDialogue}>
            <Download className="mr-2 h-4 w-4" />
            End
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col max-w-4xl mx-auto w-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} {...message} />
          ))}
          {loading && (
            <div className="flex justify-start">
              <Card className="px-4 py-3 animate-pulse">
                <p className="text-muted-foreground">Thinking...</p>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t bg-card/80 backdrop-blur-sm" style={{ boxShadow: 'var(--shadow-elegant)' }}>
          <DialogueInput onSend={handleSendMessage} disabled={loading} />
        </div>
      </div>
    </div>
  );
};

export default Dialogue;
