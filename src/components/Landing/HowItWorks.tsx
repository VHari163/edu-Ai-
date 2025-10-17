import { Book, Brain, CheckCircle2, MessageSquare } from "lucide-react";

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            The Socratic Method
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Learn through dialogue, not lecture. Our AI guides you to discover answers yourself.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Step
            number="1"
            icon={<Book className="h-8 w-8" />}
            title="Choose a Topic"
            description="Select from philosophical questions like justice, ethics, or knowledge"
          />
          <Step
            number="2"
            icon={<MessageSquare className="h-8 w-8" />}
            title="Engage in Dialogue"
            description="Share your thoughts and the AI asks probing questions"
          />
          <Step
            number="3"
            icon={<Brain className="h-8 w-8" />}
            title="Challenge Your Thinking"
            description="Identify logical flaws and refine your arguments"
          />
          <Step
            number="4"
            icon={<CheckCircle2 className="h-8 w-8" />}
            title="Gain Insights"
            description="Receive feedback on your reasoning journey"
          />
        </div>

        <div className="mt-16 p-8 rounded-2xl" style={{ background: 'var(--gradient-card)', boxShadow: 'var(--shadow-elegant)' }}>
          <h3 className="text-2xl font-bold mb-4">What Makes This Different?</h3>
          <div className="space-y-4">
            <Feature text="No direct answers - you discover truth through questioning" />
            <Feature text="AI identifies logical fallacies in real-time" />
            <Feature text="Track the evolution of your reasoning" />
            <Feature text="Constructive feedback that encourages growth" />
          </div>
        </div>
      </div>
    </section>
  );
};

const Step = ({ number, icon, title, description }: { number: string, icon: React.ReactNode, title: string, description: string }) => (
  <div className="text-center">
    <div className="relative inline-block mb-4">
      <div className="absolute -top-2 -left-2 text-6xl font-bold text-primary/10">{number}</div>
      <div className="relative p-4 rounded-full bg-primary/10">
        <div className="text-primary">{icon}</div>
      </div>
    </div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const Feature = ({ text }: { text: string }) => (
  <div className="flex items-start gap-3">
    <CheckCircle2 className="h-6 w-6 text-accent flex-shrink-0 mt-0.5" />
    <p className="text-lg">{text}</p>
  </div>
);
