import { useMemo } from "react";
import { ContentCard } from "./ContentCard";
import { Search } from "lucide-react";
import { ContentItem } from "@/hooks/useContentItems";

interface ContentGridProps {
  searchQuery: string;
  items: ContentItem[];
}

export const ContentGrid = ({ searchQuery, items }: ContentGridProps) => {

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.title.toLowerCase().includes(query) ||
      item.content?.toLowerCase().includes(query) ||
      item.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [items, searchQuery]);

  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold mb-2">
          {searchQuery ? "No items found" : "Your vault is empty"}
        </h3>
        <p className="text-muted-foreground">
          {searchQuery 
            ? "Try adjusting your search terms" 
            : "Start by adding your first piece of content"
          }
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredItems.map((item) => (
        <ContentCard key={item.id} item={item} />
      ))}
    </div>
  );
};