import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Download, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { motion } from "framer-motion";
import type { Transaction } from "@shared/schema";

interface DataTableProps {
  transactions?: Transaction[];
  isLoading: boolean;
  onExport?: (selectedIds: number[]) => void;
}

type SortField = keyof Transaction;
type SortDirection = "asc" | "desc";

export function DataTable({ transactions, isLoading, onExport }: DataTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<SortField>("retirementYear");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  if (isLoading) {
    return (
      <Card className="glass-effect border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-6 bg-gray-700 rounded w-32 animate-pulse"></div>
            <div className="h-8 bg-gray-700 rounded w-24 animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-dark-800/50 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="glass-effect border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-white">Transaction Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 py-12">
            <p>No transaction data available</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortDirection === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const totalPages = Math.ceil(sortedTransactions.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentTransactions = sortedTransactions.slice(startIndex, endIndex);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(currentTransactions.map(t => t.id)));
    } else {
      setSelectedRows(new Set());
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedRows);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedRows(newSelected);
  };

  const handleExport = () => {
    onExport?.(Array.from(selectedRows));
  };

  const getProjectTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "afforestation":
      case "forestry":
        return "bg-emerald-500/20 text-emerald-400";
      case "solar":
      case "renewable energy":
        return "bg-blue-500/20 text-blue-400";
      case "methane capture":
      case "waste management":
        return "bg-amber-500/20 text-amber-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="text-muted-foreground cursor-pointer hover:text-foreground transition-colors label-medium"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        <ArrowUpDown size={12} />
      </div>
    </TableHead>
  );

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="material-card glass-effect border-border"
        style={{
          background: 'hsl(var(--card))',
          backdropFilter: 'blur(16px) saturate(180%)'
        }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="headline-small text-foreground">Transaction Details</CardTitle>
            <div className="flex items-center space-x-3">
              <span className="body-medium text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, transactions.length)} of {transactions.length} transactions
              </span>
              <Button
                onClick={handleExport}
                disabled={selectedRows.size === 0}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 label-medium font-medium transition-colors"
              >
                <Download className="mr-2" size={16} />
                Export Selected ({selectedRows.size})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedRows.size === currentTransactions.length && currentTransactions.length > 0}
                      onCheckedChange={handleSelectAll}
                      className="border-border data-[state=checked]:bg-primary"
                    />
                  </TableHead>
                  <SortableHeader field="buyerBrandName">Buyer</SortableHeader>
                  <SortableHeader field="country">Country</SortableHeader>
                  <SortableHeader field="type">Project Type</SortableHeader>
                  <SortableHeader field="creditsRetired">Credits</SortableHeader>
                  <SortableHeader field="retirementYear">Year</SortableHeader>
                  <SortableHeader field="buyerSector">Sector</SortableHeader>
                  <TableHead className="text-right text-muted-foreground label-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTransactions.map((transaction, index) => (
                  <motion.tr
                    key={transaction.id}
                    className="border-border hover:bg-primary/5 hover:border-primary/20 transition-all duration-200 cursor-pointer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TableCell>
                      <Checkbox
                        checked={selectedRows.has(transaction.id)}
                        onCheckedChange={(checked) => handleSelectRow(transaction.id, checked as boolean)}
                        className="border-border data-[state=checked]:bg-primary"
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="body-medium font-medium text-foreground">{transaction.buyerBrandName}</p>
                        <p className="body-small text-muted-foreground">{transaction.buyerHQLocation}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-3 bg-primary rounded-sm"></div>
                        <span className="body-medium text-foreground">{transaction.country}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getProjectTypeColor(transaction.type)}>
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="body-medium font-semibold text-foreground">
                        {transaction.creditsRetired.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="body-medium text-foreground">{transaction.retirementYear}</span>
                    </TableCell>
                    <TableCell>
                      <span className="body-medium text-foreground">{transaction.buyerSector}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-primary hover:text-primary/80 h-8 w-8"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground h-8 w-8"
                          title="Export"
                        >
                          <Download size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <div className="flex items-center space-x-2">
              <span className="body-medium text-muted-foreground">Rows per page:</span>
              <Select 
                value={pageSize.toString()} 
                onValueChange={(value) => setPageSize(parseInt(value))}
              >
                <SelectTrigger className="w-20 bg-surface-container border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-surface-container border-border">
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="bg-surface-container border-border text-muted-foreground hover:text-foreground hover:border-primary"
              >
                <ChevronLeft size={16} />
              </Button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={
                        currentPage === page
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-surface-container border-border text-muted-foreground hover:text-foreground hover:border-primary"
                      }
                    >
                      {page}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="px-2 body-medium text-muted-foreground">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      className="bg-surface-container border-border text-muted-foreground hover:text-foreground hover:border-primary"
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="bg-surface-container border-border text-muted-foreground hover:text-foreground hover:border-primary"
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
