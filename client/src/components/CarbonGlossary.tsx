import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { carbonTerms } from "./TermTooltip";

// Define lord-icon element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lord-icon': {
        src?: string;
        trigger?: string;
        colors?: string;
        style?: React.CSSProperties;
        onError?: (event: any) => void;
        onLoad?: (event: any) => void;
        state?: string;
      };
    }
  }
}

export function CarbonGlossary() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTerms = Object.entries(carbonTerms).filter(
    ([term, definition]) =>
      term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      definition.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="fixed bottom-20 right-6 z-40 bg-card/90 border shadow-lg backdrop-blur-sm hover:bg-card"
        >
          <lord-icon
            src="/dictionary-glossary.json"
            trigger="hover"
            style={{
              width: "20px",
              height: "20px",
              marginRight: "8px"
            }}
          />
          Glossary
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-surface-container">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-on-surface">
            Carbon Credit Glossary
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search terms or definitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-surface-container-high border"
            />
          </div>

          {/* Terms List */}
          <div className="overflow-y-auto max-h-96 space-y-3">
            {filteredTerms.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No terms found matching "{searchTerm}"
              </div>
            ) : (
              filteredTerms.map(([term, definition]) => (
                <Card
                  key={term}
                  className="border"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-emerald-600 capitalize">
                      {term}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                      {definition}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
