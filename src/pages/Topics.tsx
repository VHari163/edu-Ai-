import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { TopicCard } from "@/components/Topics/TopicCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Topic {
  id: string;
  title: string;
  question: string;
  description: string;
}

const Topics = () => {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const { data, error } = await supabase
        .from('topics')
        .select('*')
        .order('title');

      if (error) throw error;
      setTopics(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading topics",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTopicSelect = async (topicId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: dialogue, error } = await supabase
        .from('dialogues')
        .insert({
          user_id: user.id,
          topic_id: topicId,
        })
        .select()
        .single();

      if (error) throw error;
      navigate(`/dialogue/${dialogue.id}`);
    } catch (error: any) {
      toast({
        title: "Error starting dialogue",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-muted-foreground">Loading topics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8" style={{ background: 'var(--gradient-hero)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Topic
          </h1>
          <p className="text-xl text-muted-foreground">
            Select a philosophical question to explore through Socratic dialogue
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <TopicCard
              key={topic.id}
              {...topic}
              onSelect={handleTopicSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Topics;
