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
import { BookOpen, Search } from "lucide-react";
import { carbonTerms } from "./TermTooltip";

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
          className="fixed bottom-20 right-6 z-40 bg-white/90 dark:bg-gray-800/90 border-gray-300 dark:border-gray-600 shadow-lg backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800"
        >
          <BookOpen className="w-4 h-4 mr-2" />
          Glossary
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
            Carbon Credit Glossary
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search terms or definitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
          </div>

          {/* Terms List */}
          <div className="overflow-y-auto max-h-96 space-y-3">
            {filteredTerms.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                No terms found matching "{searchTerm}"
              </div>
            ) : (
              filteredTerms.map(([term, definition]) => (
                <Card
                  key={term}
                  className="border border-gray-200 dark:border-gray-700"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold text-emerald-600 dark:text-emerald-400 capitalize">
                      {term}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
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
