import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  FileText, 
  Code, 
  Link, 
  Image, 
  File,
  Copy, 
  Share2, 
  ExternalLink, 
  Download,
  Trash2,
  Eye,
  MoreVertical 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ContentItem, useContentItems } from "@/hooks/useContentItems";
import { supabase } from "@/integrations/supabase/client";
interface ContentCardProps {
  item: ContentItem;
}

export const ContentCard = ({ item }: ContentCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { toast } = useToast();
  const { deleteItem } = useContentItems();

  const resolveSignedUrl = async (path: string, expiresIn = 60 * 60) => {
    try {
      const { data, error } = await supabase.storage
        .from('content-files')
        .createSignedUrl(path, expiresIn);
      if (error) throw error;
      return data.signedUrl as string;
    } catch (e) {
      console.error('Failed to create signed URL', e);
      return null;
    }
  };

  // Prepare image preview signed URL if needed
  useEffect(() => {
    const setupPreview = async () => {
      if (item.type === 'image' && item.file_url) {
        if (item.file_url.startsWith('http')) {
          setPreviewUrl(item.file_url);
        } else {
          const url = await resolveSignedUrl(item.file_url);
          setPreviewUrl(url);
        }
      } else {
        setPreviewUrl(null);
      }
    };
    setupPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.id, item.type, item.file_url]);

  const getIcon = () => {
    switch (item.type) {
      case 'text': return <FileText className="h-4 w-4" />;
      case 'code': return <Code className="h-4 w-4" />;
      case 'url': return <Link className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'file': return <File className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = () => {
    switch (item.type) {
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
      const textToCopy = item.content || item.file_url || item.title;
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

  const handleShare = async () => {
    let shareUrl: string | undefined = undefined;

    if ((item.type === 'file' || item.type === 'image') && item.file_url) {
      shareUrl = item.file_url.startsWith('http')
        ? item.file_url
        : await resolveSignedUrl(item.file_url);
    } else if (item.type === 'url') {
      shareUrl = item.content;
    }

    const shareData = {
      title: item.title,
      text: item.content || `Check out this ${item.type}: ${item.title}`,
      url: shareUrl,
    };

    if (navigator.share && shareUrl) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          if (shareUrl) {
            await navigator.clipboard.writeText(shareUrl);
            toast({ title: 'Link copied', description: 'Shareable link copied to clipboard' });
          } else {
            handleCopy();
          }
        }
      }
    } else {
      if (shareUrl) {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: 'Link copied', description: 'Shareable link copied to clipboard' });
      } else {
        handleCopy();
      }
    }
  };

  const handleOpenUrl = async () => {
    if (item.type === 'url' && item.content) {
      window.open(item.content, '_blank');
    } else if ((item.type === 'file' || item.type === 'image') && item.file_url) {
      const url = item.file_url.startsWith('http')
        ? item.file_url
        : await resolveSignedUrl(item.file_url);
      if (url) window.open(url, '_blank');
      else toast({ title: 'Unable to open file', description: 'Could not generate access link', variant: 'destructive' });
    }
  };

  const handleDownload = async () => {
    if ((item.type === 'file' || item.type === 'image') && item.file_url) {
      try {
        const url = item.file_url.startsWith('http')
          ? item.file_url
          : await resolveSignedUrl(item.file_url);
        
        if (url) {
          const link = document.createElement('a');
          link.href = url;
          link.download = item.file_name || item.title;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          toast({
            title: "Download started",
            description: `Downloading ${item.file_name || item.title}`,
          });
        } else {
          throw new Error('Could not generate download link');
        }
      } catch (error) {
        toast({
          title: "Download failed",
          description: "Unable to download file",
          variant: "destructive",
        });
      }
    }
  };

  const handleDelete = async () => {
    try {
      await deleteItem(item.id);
      toast({
        title: "Deleted!",
        description: "Item has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Unable to delete item",
        variant: "destructive",
      });
    }
  };

  const handlePublicShare = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('public-share', {
        body: { 
          itemId: item.id,
          expiresIn: 24 * 60 * 60, // 24 hours
          maxViews: 10 // Max 10 views
        }
      });

      if (error) throw error;

      const shareUrl = `${window.location.origin}/share/${data.shareId}`;
      await navigator.clipboard.writeText(shareUrl);
      
      toast({
        title: "Public link created!",
        description: "Shareable link copied to clipboard (expires in 24h or after 10 views)",
      });
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Unable to create public share link",
        variant: "destructive",
      });
    }
  };

  const handleRawView = async () => {
    const rawUrl = `${window.location.origin}/raw/${item.id}`;
    window.open(rawUrl, '_blank');
  };

  return (
    <Card className="group bg-glass/50 border-glass hover:bg-glass/70 transition-all duration-300 hover:shadow-glow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className={`p-1 rounded ${getTypeColor()}`}>
              {getIcon()}
            </div>
            <Badge variant="outline" className={`text-xs ${getTypeColor()} border`}>
              {item.type}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm line-clamp-1">{item.title}</h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-glass border-glass backdrop-blur-md">
                <DropdownMenuItem onClick={handleCopy} className="cursor-pointer">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePublicShare} className="cursor-pointer">
                  <Share2 className="h-4 w-4 mr-2" />
                  Create Public Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleRawView} className="cursor-pointer">
                  <Eye className="h-4 w-4 mr-2" />
                  Raw View
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {(item.type === 'file' || item.type === 'image') && (
                  <DropdownMenuItem onClick={handleDownload} className="cursor-pointer">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                )}
                {(item.type === 'url' || item.type === 'file' || item.type === 'image') && (
                  <DropdownMenuItem onClick={handleOpenUrl} className="cursor-pointer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {item.type === 'url' ? 'Open Link' : 'Open File'}
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer text-destructive focus:text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-glass border-glass backdrop-blur-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Item</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{item.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {item.type === 'image' && item.file_url && (
            <div className="rounded-md overflow-hidden">
              {previewUrl ? (
                <img 
                  src={previewUrl}
                  alt={item.title}
                  className="w-full h-32 object-cover"
                />
              ) : (
                <div className="w-full h-32 animate-pulse bg-muted/20" />
              )}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground line-clamp-3">
            {isExpanded ? item.content : item.content?.slice(0, 150)}
            {item.content && item.content.length > 150 && (
              <Button
                variant="link"
                size="sm"
                className="h-auto p-0 text-xs ml-1"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
              >
                {isExpanded ? 'Show less' : '...more'}
              </Button>
            )}
          </div>

          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs bg-glass">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-glass">
                  +{item.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex space-x-2 w-full">
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopy}
            className="flex-1 bg-glass/50 border-glass hover:bg-glass"
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleShare}
            className="flex-1 bg-glass/50 border-glass hover:bg-glass"
          >
            <Share2 className="h-3 w-3 mr-1" />
            Share
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};