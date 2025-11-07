import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { motion } from "framer-motion";
import { TermTooltip } from "./TermTooltip";
import { trackDataPointSelection } from "@/lib/analytics";
import type { Transaction } from "@shared/schema";
import { formatNumber } from "@/lib/formatNumber";

interface DataTableProps {
  transactions?: Transaction[];
  isLoading: boolean;
  onProjectTypeClick?: (projectType: string) => void;
}

type SortField = keyof Transaction;
type SortDirection = "asc" | "desc";

export function DataTable({ transactions, isLoading, onProjectTypeClick }: DataTableProps) {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState<SortField>("retirementYear");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  if (isLoading) {
    return (
      <Card className="glass-effect border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-6 bg-surface-container-high rounded w-32 animate-pulse"></div>
            <div className="h-8 bg-surface-container-high rounded w-24 animate-pulse"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-surface-container/50 rounded animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transactions || transactions.length === 0) {
    return (
      <Card className="glass-effect border">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-on-surface">Transaction Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-12">
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

  const getProjectTypeColor = (type: string) => {
    // Using M3 neutral surface containers with semantic text tokens for WCAG AA compliance
    return "bg-surface-container text-on-surface dark:bg-surface-container dark:text-on-surface hover:bg-surface-container-high dark:hover:bg-surface-container-high border border-outline-variant dark:border-outline-variant";
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="text-on-surface-variant cursor-pointer hover:text-on-surface transition-colors"
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
      <Card className="glass-effect border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-on-surface">Transaction Details</CardTitle>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(endIndex, transactions.length)} of {transactions.length} transactions
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto border-b border">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHeader field="buyerBrandName">Buyer</SortableHeader>
                  <SortableHeader field="country">Country</SortableHeader>
                  <SortableHeader field="type">Project Type</SortableHeader>
                  <SortableHeader field="creditsRetired">
                    <TermTooltip term="Credits" explanation="Number of carbon credits retired in this transaction, each representing one metric ton of CO2 equivalent emissions reduced or removed" />
                  </SortableHeader>
                  <SortableHeader field="retirementYear">
                    <TermTooltip term="Retirement Year" explanation="The year when these carbon credits were permanently cancelled, ensuring the environmental benefit cannot be claimed again" />
                  </SortableHeader>
                  <SortableHeader field="buyerSector">Sector</SortableHeader>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentTransactions.map((transaction, index) => (
                  <motion.tr
                    key={transaction.id}
                    className="border hover:bg-primary/5 transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      trackDataPointSelection('transaction', transaction.projectName, {
                        id: transaction.id,
                        country: transaction.country,
                        sector: transaction.buyerSector
                      });
                    }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium text-on-surface">{transaction.buyerBrandName}</p>
                        <p className="text-xs text-muted-foreground">{transaction.buyerHQLocation}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-3 bg-green-500 rounded-sm"></div>
                        <span className="text-sm text-on-surface">{transaction.country}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="custom"
                        className={`${getProjectTypeColor(transaction.type)} cursor-pointer transition-all`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onProjectTypeClick?.(transaction.type);
                        }}
                        data-testid={`chip-project-type-${transaction.type.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm font-semibold text-on-surface">
                        {formatNumber(transaction.creditsRetired)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-on-surface">{transaction.retirementYear}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-on-surface">{transaction.buyerSector}</span>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Rows per page:</span>
              <Select 
                value={pageSize.toString()} 
                onValueChange={(value) => setPageSize(parseInt(value))}
              >
                <SelectTrigger className="w-20 bg-surface-container border text-on-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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
                className="bg-surface-container border text-on-surface-variant hover:text-on-surface hover:border"
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
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "bg-surface-container border text-on-surface-variant hover:text-on-surface hover:border"
                      }
                    >
                      {page}
                    </Button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="px-2 text-sm text-muted-foreground">...</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      className="bg-surface-container border text-on-surface-variant hover:text-on-surface hover:border"
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
                className="bg-surface-container border text-on-surface-variant hover:text-on-surface hover:border"
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