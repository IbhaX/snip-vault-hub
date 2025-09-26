import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ContentItem } from "@/hooks/useContentItems";

export const RawView = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!itemId || !user) {
      setError("Invalid request");
      setLoading(false);
      return;
    }

    fetchContent();
  }, [itemId, user]);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content_items')
        .select('*')
        .eq('id', itemId)
        .eq('user_id', user!.id)
        .single();

      if (error) throw error;
      setContent(data as ContentItem);
    } catch (error: any) {
      console.error('Error fetching content:', error);
      setError('Content not found or access denied');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '20px', 
        fontFamily: 'monospace', 
        fontSize: '14px',
        lineHeight: '1.4',
        color: '#333',
        backgroundColor: '#fff'
      }}>
        Loading...
      </div>
    );
  }

  if (error || !content) {
    return (
      <div style={{ 
        padding: '20px', 
        fontFamily: 'monospace', 
        fontSize: '14px',
        lineHeight: '1.4',
        color: '#333',
        backgroundColor: '#fff'
      }}>
        Error: {error || 'Content not found'}
      </div>
    );
  }

  // For files and images, redirect to the file URL
  if ((content.type === 'file' || content.type === 'image') && content.file_url) {
    window.location.href = content.file_url;
    return null;
  }

  // For URLs, redirect to the URL
  if (content.type === 'url' && content.content) {
    window.location.href = content.content;
    return null;
  }

  // For text and code, display raw content
  return (
    <div style={{ 
      padding: '0',
      margin: '0',
      fontFamily: 'monospace', 
      fontSize: '14px',
      lineHeight: '1.4',
      color: '#333',
      backgroundColor: '#fff',
      minHeight: '100vh',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word'
    }}>
      {content.content || 'No content available'}
    </div>
  );
};