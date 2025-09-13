import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ContentGrid } from "@/components/ContentGrid";
import { AddContentModal } from "@/components/AddContentModal";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const { toast } = useToast();

  const handleAddContent = (content: any) => {
    // For now, just show a success message
    // This will be connected to backend storage later
    toast({
      title: "Content saved!",
      description: "Your content has been saved to your personal vault.",
    });
    setShowAddModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-glass bg-glass backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Vault
              </h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search your vault..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-80 bg-glass border-glass"
                />
              </div>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Content
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <ContentGrid searchQuery={searchQuery} />
      </main>

      {/* Add Content Modal */}
      <AddContentModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onAdd={handleAddContent}
      />
    </div>
  );
};

export default Index;