-- Create table for public shares
CREATE TABLE public.public_shares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  share_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  content_item_id UUID NOT NULL,
  created_by UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  max_views INTEGER NOT NULL DEFAULT 10,
  view_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (content_item_id) REFERENCES content_items(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.public_shares ENABLE ROW LEVEL SECURITY;

-- Create policies for public shares
CREATE POLICY "Users can create shares for their own content" 
ON public.public_shares 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM content_items 
    WHERE id = content_item_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can view their own shares" 
ON public.public_shares 
FOR SELECT 
USING (created_by = auth.uid());

CREATE POLICY "Users can update their own shares" 
ON public.public_shares 
FOR UPDATE 
USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own shares" 
ON public.public_shares 
FOR DELETE 
USING (created_by = auth.uid());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_public_shares_updated_at
BEFORE UPDATE ON public.public_shares
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_public_shares_share_id ON public.public_shares(share_id);
CREATE INDEX idx_public_shares_expires_at ON public.public_shares(expires_at);
CREATE INDEX idx_public_shares_content_item_id ON public.public_shares(content_item_id);