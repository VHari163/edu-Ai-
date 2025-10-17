-- Create topics table for pre-defined philosophical questions
CREATE TABLE public.topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  question TEXT NOT NULL,
  description TEXT,
  common_fallacies TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dialogues table to store conversation sessions
CREATE TABLE public.dialogues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create messages table to store individual messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dialogue_id UUID NOT NULL REFERENCES public.dialogues(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reasoning_traces table to track argument evolution
CREATE TABLE public.reasoning_traces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dialogue_id UUID NOT NULL REFERENCES public.dialogues(id) ON DELETE CASCADE,
  claim TEXT NOT NULL,
  logical_issues TEXT[],
  improvements TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dialogues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reasoning_traces ENABLE ROW LEVEL SECURITY;

-- Create policies for topics (public read)
CREATE POLICY "Topics are viewable by everyone"
ON public.topics FOR SELECT
USING (true);

-- Create policies for dialogues (users can manage their own)
CREATE POLICY "Users can view their own dialogues"
ON public.dialogues FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dialogues"
ON public.dialogues FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dialogues"
ON public.dialogues FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dialogues"
ON public.dialogues FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for messages
CREATE POLICY "Users can view messages from their dialogues"
ON public.messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.dialogues
    WHERE dialogues.id = messages.dialogue_id
    AND dialogues.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create messages in their dialogues"
ON public.messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.dialogues
    WHERE dialogues.id = messages.dialogue_id
    AND dialogues.user_id = auth.uid()
  )
);

-- Create policies for reasoning traces
CREATE POLICY "Users can view reasoning traces from their dialogues"
ON public.reasoning_traces FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.dialogues
    WHERE dialogues.id = reasoning_traces.dialogue_id
    AND dialogues.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create reasoning traces in their dialogues"
ON public.reasoning_traces FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.dialogues
    WHERE dialogues.id = reasoning_traces.dialogue_id
    AND dialogues.user_id = auth.uid()
  )
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for dialogues
CREATE TRIGGER update_dialogues_updated_at
BEFORE UPDATE ON public.dialogues
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample topics
INSERT INTO public.topics (title, question, description, common_fallacies) VALUES
  ('Justice', 'What is justice?', 'Explore the nature of justice, fairness, and moral rightness in society.', ARRAY['Appeal to emotion', 'False equivalence', 'Circular reasoning']),
  ('Ethics of AI', 'Should AI have rights?', 'Debate whether artificial intelligence deserves moral consideration and legal rights.', ARRAY['Slippery slope', 'False dichotomy', 'Appeal to nature']),
  ('Free Will', 'Do we have free will?', 'Examine the philosophical question of whether human choices are truly free.', ARRAY['Begging the question', 'False cause', 'Appeal to ignorance']),
  ('Truth and Knowledge', 'What can we truly know?', 'Investigate the limits of human knowledge and the nature of truth.', ARRAY['Circular reasoning', 'Appeal to authority', 'Red herring']),
  ('Moral Relativism', 'Is morality relative or absolute?', 'Explore whether moral truths are universal or culturally dependent.', ARRAY['Hasty generalization', 'Strawman', 'Appeal to tradition']);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;