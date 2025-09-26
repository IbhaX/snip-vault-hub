import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  FileText, 
  Code, 
  Link, 
  Image, 
  File,
  Eye,
  Clock,
  Download
} from "lucide-react";

interface SharedContent {
  id: string;
  type: 'text' | 'code' | 'url' | 'file' | 'image';
  title: string;
  content?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

interface ShareInfo {
  viewsRemaining: number;
  expiresAt: string;
}

export const PublicShare = () => {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [content, setContent] = useState<SharedContent | null>(null);
  const [shareInfo, setShareInfo] = useState<ShareInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shareId) {
      setError("Invalid share link");
      setLoading(false);
      return;
    }

    fetchSharedContent();
  }, [shareId]);

  const fetchSharedContent = async () => {
    try {
      // Make a direct fetch call to the public-share function with shareId as query param
      const response = await fetch(
        `https://quuovnvafnrbcxpglvfd.supabase.co/functions/v1/public-share?shareId=${shareId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch content');
      }

      const data = await response.json();
      setContent(data.content);
      setShareInfo({
        viewsRemaining: data.viewsRemaining,
        expiresAt: data.expiresAt
      });
    } catch (error: any) {
      console.error('Error fetching shared content:', error);
      setError(error.message || 'Failed to load shared content');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'text': return <FileText className="h-5 w-5" />;
      case 'code': return <Code className="h-5 w-5" />;
      case 'url': return <Link className="h-5 w-5" />;
      case 'image': return <Image className="h-5 w-5" />;
      case 'file': return <File className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'text': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'code': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'url': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'image': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
      case 'file': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleCopy = async () => {
    try {
      const textToCopy = content?.content || content?.file_url || content?.title || '';
      await navigator.clipboard.writeText(textToCopy);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Unable to copy content to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleDownload = async () => {
    if (content && (content.type === 'file' || content.type === 'image') && content.file_url) {
      try {
        const link = document.createElement('a');
        link.href = content.file_url;
        link.download = content.file_name || content.title;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Download started",
          description: `Downloading ${content.file_name || content.title}`,
        });
      } catch (error) {
        toast({
          title: "Download failed",
          description: "Unable to download file",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h2 className="text-xl font-semibold mb-2">Loading shared content...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-xl font-semibold mb-2">Content Not Available</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => navigate('/')} variant="outline">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-xl font-semibold mb-2">Content Not Found</h2>
            <p className="text-muted-foreground mb-4">This share link may have expired or reached its view limit.</p>
            <Button onClick={() => navigate('/')} variant="outline">
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-glass/50 border-glass backdrop-blur-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded ${getTypeColor(content.type)}`}>
                    {getIcon(content.type)}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{content.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className={`text-xs ${getTypeColor(content.type)} border`}>
                        {content.type}
                      </Badge>
                      {shareInfo && (
                        <>
                          <Badge variant="secondary" className="text-xs">
                            <Eye className="h-3 w-3 mr-1" />
                            {shareInfo.viewsRemaining} views left
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            Expires {new Date(shareInfo.expiresAt).toLocaleDateString()}
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleCopy} size="sm" variant="outline">
                    Copy
                  </Button>
                  {(content.type === 'file' || content.type === 'image') && (
                    <Button onClick={handleDownload} size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {content.type === 'image' && content.file_url && (
                <div className="mb-4">
                  <img 
                    src={content.file_url}
                    alt={content.title}
                    className="max-w-full h-auto rounded-lg"
                  />
                </div>
              )}
              
              {content.content && (
                <div className="mb-4">
                  <pre className="whitespace-pre-wrap text-sm bg-muted/20 p-4 rounded-lg overflow-auto">
                    {content.content}
                  </pre>
                </div>
              )}

              {content.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {content.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};