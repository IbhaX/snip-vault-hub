import { useState, useEffect } from "react";
import { ContentCard } from "./ContentCard";

export interface ContentItem {
  id: string;
  type: "text" | "image" | "url" | "code" | "file";
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  thumbnail?: string;
}

interface ContentGridProps {
  searchQuery: string;
}

export const ContentGrid = ({ searchQuery }: ContentGridProps) => {
  const [items, setItems] = useState<ContentItem[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    const mockData: ContentItem[] = [
      {
        id: "1",
        type: "text",
        title: "Project Ideas",
        content: "Build a personal storage app with React and Supabase. Features should include drag & drop, search, and sharing capabilities.",
        tags: ["ideas", "project", "development"],
        createdAt: new Date("2024-01-15"),
      },
      {
        id: "2",
        type: "code",
        title: "React Hook Pattern",
        content: `const useLocalStorage = (key: string, initialValue: any) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: any) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};`,
        tags: ["react", "hooks", "typescript"],
        createdAt: new Date("2024-01-14"),
      },
      {
        id: "3",
        type: "url",
        title: "Design Inspiration",
        content: "https://dribbble.com/shots/16742371-Dashboard-Design",
        tags: ["design", "ui", "inspiration"],
        createdAt: new Date("2024-01-13"),
      },
      {
        id: "4",
        type: "text",
        title: "Meeting Notes",
        content: "Discussed the new storage app requirements:\n- Fast search capabilities\n- Multiple content types support\n- Sharing functionality\n- Cross-platform sync\n- Privacy focused",
        tags: ["meeting", "notes", "requirements"],
        createdAt: new Date("2024-01-12"),
      },
    ];
    
    setItems(mockData);
  }, []);

  const filteredItems = items.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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