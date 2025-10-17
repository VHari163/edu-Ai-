import { Button } from "@/components/ui/button";
import { Brain, MessageCircle, Target, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 py-20" style={{ background: 'var(--gradient-hero)' }}>
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div className="inline-flex p-3 rounded-full mb-6" style={{ background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-glow)' }}>
          <Brain className="h-16 w-16 text-primary-foreground" />
        </div>
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
          Master Critical Thinking Through
          <span className="block mt-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Socratic Dialogue
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
          An AI-powered tutor that guides you to discover answers through questioning, 
          just like Socrates taught in ancient Athens.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button
            size="lg"
            className="text-lg px-8 py-6"
            onClick={() => navigate('/topics')}
          >
            Start Learning
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-lg px-8 py-6"
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Learn More
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-20">
        <FeatureCard
          icon={<MessageCircle className="h-8 w-8" />}
          title="Guided Questions"
          description="AI asks probing questions instead of giving answers"
        />
        <FeatureCard
          icon={<Target className="h-8 w-8" />}
          title="Identify Fallacies"
          description="Learn to recognize flaws in logical reasoning"
        />
        <FeatureCard
          icon={<TrendingUp className="h-8 w-8" />}
          title="Track Progress"
          description="See how your arguments evolve over time"
        />
      </div>
    </section>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="p-6 rounded-xl backdrop-blur-sm" style={{ background: 'var(--gradient-card)', boxShadow: 'var(--shadow-elegant)', transition: 'var(--transition-smooth)' }}>
    <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4">
      <div className="text-primary">{icon}</div>
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);
