import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, LogOut, Clock, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentGrid } from "@/components/ContentGrid";
import { TimelineView } from "@/components/TimelineView";
import { AddContentModal } from "@/components/AddContentModal";
import { useAuth } from "@/hooks/useAuth";
import { useContentItems } from "@/hooks/useContentItems";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState("grid");
  const { user, loading: authLoading, signOut } = useAuth();
  const { items, loading, addItem } = useContentItems();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleAddContent = async (content: any) => {
    try {
      await addItem(content);
      setShowAddModal(false);
    } catch (error) {
      console.error("Error adding content:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-secondary">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-glass bg-glass backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className={`flex items-center justify-between ${isMobile ? 'flex-col space-y-4' : ''}`}>
            <div className={`flex items-center ${isMobile ? 'flex-col space-y-4' : 'space-x-4'}`}>
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  Vault
                </h1>
                {!isMobile && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                )}
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search your vault..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-10 bg-glass border-glass ${isMobile ? 'w-full' : 'w-80'}`}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-primary hover:shadow-glow transition-all duration-300"
                size={isMobile ? "sm" : "default"}
              >
                <Plus className="h-4 w-4 mr-2" />
                {isMobile ? "Add" : "Add Content"}
              </Button>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size={isMobile ? "sm" : "default"}
                className="border-glass bg-glass hover:bg-muted/20"
              >
                <LogOut className="h-4 w-4" />
                {!isMobile && <span className="ml-2">Sign Out</span>}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-glass border-glass">
            <TabsTrigger value="grid" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Grid View</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Timeline</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="grid" className="mt-6">
            <ContentGrid searchQuery={searchQuery} items={items} />
          </TabsContent>
          
          <TabsContent value="timeline" className="mt-6">
            <TimelineView searchQuery={searchQuery} items={items} />
          </TabsContent>
        </Tabs>
      </div>

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