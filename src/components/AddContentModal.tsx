import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { X, Upload, Type, Code, Link, FileText, Image as ImageIcon } from "lucide-react";
import { useContentItems } from "@/hooks/useContentItems";
import { useToast } from "@/hooks/use-toast";

interface AddContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (content: any) => void;
}

export const AddContentModal = ({ open, onOpenChange, onAdd }: AddContentModalProps) => {
  const [activeTab, setActiveTab] = useState("text");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadFile } = useContentItems();
  const { toast } = useToast();

  const resetForm = () => {
    setTitle("");
    setContent("");
    setUrl("");
    setTags([]);
    setTagInput("");
    setSelectedFile(null);
    setActiveTab("text");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!title) {
        setTitle(file.name);
      }
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;

    setIsUploading(true);
    try {
      let contentData: any = {
        title,
        tags,
        type: activeTab as 'text' | 'code' | 'url' | 'file' | 'image',
      };

      if (activeTab === 'url') {
        contentData.content = url;
      } else if (activeTab === 'file' && selectedFile) {
        const fileUrl = await uploadFile(selectedFile);
        contentData.file_url = fileUrl;
        contentData.file_name = selectedFile.name;
        contentData.file_size = selectedFile.size;
        contentData.content = `File: ${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`;
      } else if (activeTab === 'image' && selectedFile) {
        const fileUrl = await uploadFile(selectedFile);
        contentData.file_url = fileUrl;
        contentData.file_name = selectedFile.name;
        contentData.file_size = selectedFile.size;
        contentData.content = `Image: ${selectedFile.name}`;
        contentData.type = 'image';
      } else {
        contentData.content = content;
      }

      await onAdd(contentData);
      resetForm();
      onOpenChange(false);
      
      toast({
        title: "Content saved!",
        description: "Your content has been saved to your vault.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save content",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-glass border-glass backdrop-blur-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Content</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-glass border-glass">
            <TabsTrigger value="text" className="flex items-center space-x-1">
              <Type className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Text</span>
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center space-x-1">
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Code</span>
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center space-x-1">
              <Link className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">URL</span>
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center space-x-1">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">File</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center space-x-1">
              <ImageIcon className="h-4 w-4" />
              <span className="hidden sm:inline text-xs">Image</span>
            </TabsTrigger>
          </TabsList>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-glass border-glass"
              />
            </div>

            <TabsContent value="text" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text-content">Content</Label>
                <Textarea
                  id="text-content"
                  placeholder="Enter your text content..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-32 bg-glass border-glass"
                />
              </div>
            </TabsContent>

            <TabsContent value="code" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code-content">Code Snippet</Label>
                <Textarea
                  id="code-content"
                  placeholder="Paste your code here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-32 font-mono text-sm bg-glass border-glass"
                />
              </div>
            </TabsContent>

            <TabsContent value="url" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url-content">URL</Label>
                <Input
                  id="url-content"
                  type="url"
                  placeholder="https://example.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="bg-glass border-glass"
                />
              </div>
            </TabsContent>

            <TabsContent value="file" className="space-y-4">
              <div className="space-y-2">
                <Label>File Upload</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="*/*"
                />
                <div 
                  className="border-2 border-dashed border-glass rounded-lg p-6 text-center bg-glass/20 cursor-pointer hover:bg-glass/30 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  {selectedFile ? (
                    <p className="text-sm text-foreground">{selectedFile.name}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Click to select a file
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="image" className="space-y-4">
              <div className="space-y-2">
                <Label>Image Upload</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept="image/*"
                />
                <div 
                  className="border-2 border-dashed border-glass rounded-lg p-6 text-center bg-glass/20 cursor-pointer hover:bg-glass/30 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  {selectedFile ? (
                    <div className="space-y-2">
                      <p className="text-sm text-foreground">{selectedFile.name}</p>
                      {selectedFile.type.startsWith('image/') && (
                        <img 
                          src={URL.createObjectURL(selectedFile)} 
                          alt="Preview" 
                          className="max-w-32 max-h-32 mx-auto rounded-md"
                        />
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Click to select an image
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="space-y-2">
                <Input
                  placeholder="Add tags (press Enter)"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleAddTag}
                  className="bg-glass border-glass"
                />
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-glass">
                      {tag}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Tabs>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-glass">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!title.trim() || isUploading || ((activeTab === 'file' || activeTab === 'image') && !selectedFile)}
            className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
          >
            {isUploading ? "Uploading..." : "Add Content"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};