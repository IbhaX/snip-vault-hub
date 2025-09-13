import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  FileText, 
  Code, 
  Link, 
  Image, 
  File,
  Copy, 
  Share2, 
  ExternalLink, 
  MoreVertical 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ContentItem } from "@/hooks/useContentItems";

interface ContentCardProps {
  item: ContentItem;
}

export const ContentCard = ({ item }: ContentCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

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
    const shareData = {
      title: item.title,
      text: item.content || `Check out this ${item.type}`,
      url: item.type === 'url' ? item.content : undefined,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  const handleOpenUrl = () => {
    if (item.type === 'url' && item.content) {
      window.open(item.content, '_blank');
    } else if ((item.type === 'file' || item.type === 'image') && item.file_url) {
      window.open(item.file_url, '_blank');
    }
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
                <DropdownMenuItem onClick={handleShare} className="cursor-pointer">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                {(item.type === 'url' || item.type === 'file' || item.type === 'image') && (
                  <DropdownMenuItem onClick={handleOpenUrl} className="cursor-pointer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {item.type === 'url' ? 'Open Link' : 'Open File'}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {item.type === 'image' && item.file_url && (
            <div className="rounded-md overflow-hidden">
              <img 
                src={item.file_url} 
                alt={item.title}
                className="w-full h-32 object-cover"
              />
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