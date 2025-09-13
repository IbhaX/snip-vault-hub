import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileText, Code, Link, Upload, X } from "lucide-react";

interface AddContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (content: any) => void;
}

export const AddContentModal = ({ open, onOpenChange, onAdd }: AddContentModalProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [activeTab, setActiveTab] = useState("text");

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) return;

    const newContent = {
      type: activeTab,
      title: title.trim(),
      content: content.trim(),
      tags,
      createdAt: new Date(),
    };

    onAdd(newContent);
    
    // Reset form
    setTitle("");
    setContent("");
    setTags([]);
    setCurrentTag("");
    setActiveTab("text");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-glass border-glass backdrop-blur-md">
        <DialogHeader>
          <DialogTitle>Add New Content</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
            <TabsTrigger value="text" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Text</span>
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center space-x-2">
              <Code className="h-4 w-4" />
              <span>Code</span>
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center space-x-2">
              <Link className="h-4 w-4" />
              <span>Link</span>
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center space-x-2">
              <Upload className="h-4 w-4" />
              <span>File</span>
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your content..."
                className="bg-glass border-glass"
                onKeyPress={handleKeyPress}
              />
            </div>

            <TabsContent value="text" className="space-y-4">
              <div>
                <Label htmlFor="text-content">Content</Label>
                <Textarea
                  id="text-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Enter your text content..."
                  className="min-h-32 bg-glass border-glass"
                  onKeyPress={handleKeyPress}
                />
              </div>
            </TabsContent>

            <TabsContent value="code" className="space-y-4">
              <div>
                <Label htmlFor="code-content">Code Snippet</Label>
                <Textarea
                  id="code-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste your code here..."
                  className="min-h-32 font-mono text-sm bg-glass border-glass"
                  onKeyPress={handleKeyPress}
                />
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-4">
              <div>
                <Label htmlFor="url-content">URL</Label>
                <Input
                  id="url-content"
                  type="url"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="https://example.com"
                  className="bg-glass border-glass"
                  onKeyPress={handleKeyPress}
                />
              </div>
            </TabsContent>

            <TabsContent value="file" className="space-y-4">
              <div className="border-2 border-dashed border-glass rounded-lg p-8 text-center">
                <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag & drop files here, or click to select
                </p>
                <Button variant="outline" size="sm">
                  Choose Files
                </Button>
              </div>
            </TabsContent>

            <div>
              <Label htmlFor="tags">Tags</Label>
              <div className="flex space-x-2">
                <Input
                  id="tags"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  placeholder="Add a tag..."
                  className="bg-glass border-glass"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                      <span>{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Tabs>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim()}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            Save Content
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};