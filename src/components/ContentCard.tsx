import { useState } from "react";
import { Copy, Share, ExternalLink, Code, FileText, Link, Image, MoreVertical } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { ContentItem } from "./ContentGrid";

interface ContentCardProps {
  item: ContentItem;
}

export const ContentCard = ({ item }: ContentCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { toast } = useToast();

  const getIcon = () => {
    switch (item.type) {
      case "text":
        return <FileText className="h-4 w-4" />;
      case "code":
        return <Code className="h-4 w-4" />;
      case "url":
        return <Link className="h-4 w-4" />;
      case "image":
        return <Image className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeColor = () => {
    switch (item.type) {
      case "text":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "code":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "url":
        return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      case "image":
        return "bg-pink-500/20 text-pink-400 border-pink-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.content);
      toast({
        title: "Copied to clipboard!",
        description: "Content has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy content to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: item.title,
          text: item.content,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback to copying link
      handleCopy();
    }
  };

  const handleOpenUrl = () => {
    if (item.type === "url") {
      window.open(item.content, "_blank");
    }
  };

  const truncatedContent = item.content.length > 150 
    ? `${item.content.slice(0, 150)}...` 
    : item.content;

  return (
    <Card className="group bg-glass border-glass backdrop-blur-md hover:shadow-card transition-all duration-300 hover:scale-105">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className={`p-1.5 rounded-md border ${getTypeColor()}`}>
              {getIcon()}
            </div>
            <Badge variant="secondary" className="text-xs">
              {item.type}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShare}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              {item.type === "url" && (
                <DropdownMenuItem onClick={handleOpenUrl}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Link
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <h3 className="font-semibold text-sm mb-2 line-clamp-2">{item.title}</h3>
        
        <div className="text-xs text-muted-foreground mb-3">
          {item.type === "code" ? (
            <pre className="bg-secondary p-2 rounded text-xs overflow-x-auto">
              <code>{isExpanded ? item.content : truncatedContent}</code>
            </pre>
          ) : (
            <p className="line-clamp-3">
              {isExpanded ? item.content : truncatedContent}
            </p>
          )}
          {item.content.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary hover:underline mt-1"
            >
              {isExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1">
          {item.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="px-4 py-3 flex justify-between items-center bg-secondary/20">
        <span className="text-xs text-muted-foreground">
          {item.createdAt.toLocaleDateString()}
        </span>
        <div className="flex space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Share className="h-3 w-3" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};