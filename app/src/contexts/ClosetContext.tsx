import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  analyzeClothingItem,
  type ClothingAnalysis,
} from "../lib/api";

export interface ClosetItem {
  id: string;
  dataUrl: string;
  name: string;
  analysis: ClothingAnalysis | null;
  isAnalyzing: boolean;
}

interface ClosetContextType {
  items: ClosetItem[];
  addItems: (files: File[]) => void;
  removeItem: (id: string) => void;
  selectedOccasion: string | null;
  setSelectedOccasion: (occasion: string | null) => void;
}

const ClosetContext = createContext<ClosetContextType | null>(null);

let nextId = 1;

export function ClosetProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ClosetItem[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState<string | null>(null);

  const addItems = useCallback((files: File[]) => {
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const id = `item-${nextId++}`;

        // Add item immediately with analyzing flag
        setItems((prev) => [
          ...prev,
          { id, dataUrl, name: file.name, analysis: null, isAnalyzing: true },
        ]);

        // Fire-and-forget analysis
        analyzeClothingItem(dataUrl)
          .then((analysis) => {
            setItems((prev) =>
              prev.map((item) =>
                item.id === id
                  ? { ...item, analysis, isAnalyzing: false }
                  : item,
              ),
            );
          })
          .catch(() => {
            // Fallback already handled inside analyzeClothingItem,
            // but just in case of unexpected errors
            setItems((prev) =>
              prev.map((item) =>
                item.id === id
                  ? {
                      ...item,
                      analysis: {
                        category: "top",
                        subcategory: "unknown",
                        color: "unknown",
                        pattern: "solid",
                        styleTags: ["casual"],
                        seasonality: ["all"],
                      },
                      isAnalyzing: false,
                    }
                  : item,
              ),
            );
          });
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  return (
    <ClosetContext.Provider
      value={{
        items,
        addItems,
        removeItem,
        selectedOccasion,
        setSelectedOccasion,
      }}
    >
      {children}
    </ClosetContext.Provider>
  );
}

export function useCloset() {
  const ctx = useContext(ClosetContext);
  if (!ctx) throw new Error("useCloset must be used within ClosetProvider");
  return ctx;
}
