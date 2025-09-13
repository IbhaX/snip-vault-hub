import { useMemo } from "react";
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns";
import { ContentCard } from "./ContentCard";
import { ContentItem } from "@/hooks/useContentItems";
import { Clock } from "lucide-react";

interface TimelineViewProps {
  searchQuery: string;
  items: ContentItem[];
}

export const TimelineView = ({ searchQuery, items }: TimelineViewProps) => {
  const filteredAndGroupedItems = useMemo(() => {
    const filtered = items.filter(item => {
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(query) ||
        item.content?.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    });

    // Group items by time periods
    const grouped = filtered.reduce((acc, item) => {
      const date = new Date(item.created_at);
      let period: string;

      if (isToday(date)) {
        period = "Today";
      } else if (isYesterday(date)) {
        period = "Yesterday";
      } else if (isThisWeek(date)) {
        period = "This Week";
      } else if (isThisMonth(date)) {
        period = "This Month";
      } else {
        period = format(date, "MMMM yyyy");
      }

      if (!acc[period]) {
        acc[period] = [];
      }
      acc[period].push(item);
      return acc;
    }, {} as Record<string, ContentItem[]>);

    // Sort periods and items within each period
    const sortedPeriods = Object.entries(grouped)
      .map(([period, items]) => ({
        period,
        items: items.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ),
      }))
      .sort((a, b) => {
        // Custom sort to put recent periods first
        const periodOrder = ["Today", "Yesterday", "This Week", "This Month"];
        const aIndex = periodOrder.indexOf(a.period);
        const bIndex = periodOrder.indexOf(b.period);
        
        if (aIndex !== -1 && bIndex !== -1) {
          return aIndex - bIndex;
        } else if (aIndex !== -1) {
          return -1;
        } else if (bIndex !== -1) {
          return 1;
        } else {
          // For month/year periods, sort by date
          return b.period.localeCompare(a.period);
        }
      });

    return sortedPeriods;
  }, [items, searchQuery]);

  if (filteredAndGroupedItems.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">
          {searchQuery ? "No matching items found" : "Your vault is empty"}
        </h3>
        <p className="text-muted-foreground">
          {searchQuery 
            ? "Try adjusting your search query" 
            : "Start by adding your first piece of content"
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {filteredAndGroupedItems.map(({ period, items }) => (
        <div key={period} className="space-y-4">
          <div className="sticky top-20 z-40 flex items-center space-x-2 py-2 bg-gradient-secondary/80 backdrop-blur-sm rounded-lg px-4">
            <Clock className="h-4 w-4 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">{period}</h2>
            <span className="text-sm text-muted-foreground">({items.length} items)</span>
          </div>
          
          <div className="space-y-4 relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-primary opacity-20"></div>
            
            {items.map((item, index) => (
              <div key={item.id} className="relative pl-12">
                {/* Timeline dot */}
                <div className="absolute left-2.5 top-4 w-3 h-3 bg-gradient-primary rounded-full border-2 border-background shadow-glow"></div>
                
                {/* Timeline connector */}
                {index < items.length - 1 && (
                  <div className="absolute left-4 top-8 w-0.5 h-full bg-gradient-primary opacity-10"></div>
                )}
                
                {/* Content card */}
                <div className="bg-glass/50 rounded-lg p-1 border border-glass">
                  <ContentCard item={item} />
                </div>
                
                {/* Timestamp */}
                <div className="mt-2 ml-4 text-xs text-muted-foreground">
                  {format(new Date(item.created_at), "h:mm a")}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};