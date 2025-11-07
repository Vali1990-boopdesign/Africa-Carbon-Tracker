import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Users, Globe, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { BilateralSankeyDiagram } from "./BilateralSankeyDiagram";
import { TermTooltip } from "./TermTooltip";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { trackDataPointSelection, trackExternalLink } from "@/lib/analytics";
import type { BilateralAgreement } from "@shared/schema";

// Define lord-icon element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lord-icon': {
        src?: string;
        trigger?: string;
        colors?: string;
        style?: React.CSSProperties;
      };
    }
  }
}

interface BilateralAgreementsSummary {
  totalAgreements: number;
  activeAgreements: number;
  uniqueCountries: number;
  uniquePartners: number;
}

export function BilateralAgreements() {
  const [agreements, setAgreements] = useState<BilateralAgreement[]>([]);
  const [summary, setSummary] = useState<BilateralAgreementsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agreementsRes, summaryRes] = await Promise.all([
          fetch("/api/bilateral-agreements"),
          fetch("/api/bilateral-agreements/summary")
        ]);

        // Handle agreements response
        if (agreementsRes.ok) {
          const agreementsData = await agreementsRes.json();
          if (Array.isArray(agreementsData)) {
            setAgreements(agreementsData);
          } else {
            console.error("Agreements data is not an array:", agreementsData);
            setAgreements([]);
          }
        } else {
          console.error("Failed to fetch agreements:", agreementsRes.status);
          setAgreements([]);
        }

        // Handle summary response
        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          setSummary(summaryData);
        } else {
          console.error("Failed to fetch summary:", summaryRes.status);
          setSummary(null);
        }
      } catch (error) {
        console.error("Failed to fetch bilateral agreements data:", error);
        setAgreements([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // URL mapping for bilateral agreement sources
  const getAgreementUrl = (country: string, partner: string) => {
    const key = `${country.toLowerCase()}-${partner.toLowerCase()}`;
    const urlMap: Record<string, string> = {
      'benin-norway': 'https://www.goldstandard.org/carbon-market-regulations-tracker',
      'ethiopia-japan': 'https://www.goldstandard.org/carbon-market-regulations-tracker',
      'gabon-south korea': 'https://www.orfonline.org/research/potential-or-peril-carbon-trading-in-africa?utm_source=chatgpt.com',
      'ghana-switzerland, singapore, sweden': 'https://www.goldstandard.org/carbon-market-regulations-tracker',
      'kenya-japan, singapore, switzerland': 'https://www.goldstandard.org/carbon-market-regulations-tracker',
      'rwanda-singapore, sweden, kuwait': 'https://www.goldstandard.org/carbon-market-regulations-tracker',
      'senegal-singapore': 'https://www.orfonline.org/research/potential-or-peril-carbon-trading-in-africa?utm_source=chatgpt.com',
      'zambia-norway, sweden, singapore': 'https://www.goldstandard.org/carbon-market-regulations-tracker',
      'zimbabwe-united arab emirates (via blue carbon)': 'https://www.goldstandard.org/carbon-market-regulations-tracker'
    };

    return urlMap[key] || 'https://www.goldstandard.org/carbon-market-regulations-tracker';
  };

  const displayedAgreements = showAll ? agreements : agreements.slice(0, 3);

  if (isLoading) {
    return (
      <Card className="glass-effect border">
        <CardHeader>
          <div className="h-6 bg-surface-container rounded w-48 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-8 bg-surface-container rounded w-16 mx-auto mb-2 animate-pulse"></div>
                  <div className="h-4 bg-surface-container rounded w-24 mx-auto animate-pulse"></div>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-surface-container/50 rounded animate-pulse"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="glass-effect border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold text-on-surface">
          <div className="hover-icon-trigger">
            <lord-icon
              src="/wired-outline-56-document-hover-swipe.json"
              trigger="hover"
              colors="primary:#10b981,secondary:#059669"
              style={{ width: '32px', height: '32px' }}
            />
          </div>
          <TermTooltip 
            term="Africa's Bilateral Agreements"
            explanation="Bilateral Agreements are partnerships between two countries that establish a framework for trading carbon credits and achieving emission reduction goals under Article 6.2 of the Paris Agreement"
          />
        </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary Stats */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div
                className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-2xl font-bold text-on-surface">{summary.uniquePartners}</div>
                <div className="text-sm text-muted-foreground">Partners</div>
              </motion.div>

              <motion.div
                className="text-center p-4 bg-emerald-500/10 rounded-lg border border-emerald-500/20"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-center mb-2">
                  <FileText className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-on-surface">{summary.totalAgreements}</div>
                <div className="text-sm text-muted-foreground">Total Agreements</div>
              </motion.div>

              <motion.div
                className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-on-surface">{summary.uniqueCountries}</div>
                <div className="text-sm text-muted-foreground">Buyers from Partner Countries</div>
              </motion.div>

              <motion.div
                className="text-center p-4 bg-green-500/10 rounded-lg border border-green-500/20"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-on-surface">{summary.activeAgreements}</div>
                <div className="text-sm text-muted-foreground">Buyers in past 5 years</div>
              </motion.div>
            </div>
          )}

          {/* Sankey Diagram - Desktop Only */}
          {!isMobile && agreements.length > 0 && (
            <BilateralSankeyDiagram agreements={agreements} />
          )}

          {/* Agreements List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-on-surface">Recent Agreements</h3>
              {agreements.length > 3 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAll(!showAll)}
                  className="bg-surface-container border text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                >
                  {showAll ? 'Show Less' : `Show All (${agreements.length})`}
                </Button>
              )}
            </div>

            <ScrollArea className={showAll ? "h-96" : ""}>
              <div className="space-y-3">
                {displayedAgreements.map((agreement, index) => (
                  <motion.div
                    key={agreement.id}
                    className="p-4 bg-surface-container/50 rounded-lg border hover:border-primary/30 transition-all duration-200 cursor-pointer"
                    onClick={() => {
                      trackDataPointSelection('bilateral_agreement', agreement.agreementName, {
                        id: agreement.id,
                        country: agreement.country
                      });
                    }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-on-surface line-clamp-1">
                            {agreement.agreementName}
                          </h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Country:</span> {agreement.country}
                          </div>
                          <div>
                            <span className="font-medium">Partner:</span> {agreement.partner}
                          </div>
                          {agreement.signingYear && (
                            <div>
                              <span className="font-medium">Year:</span> {agreement.signingYear}
                            </div>
                          )}
                        </div>
                        {agreement.agreementType && (
                          <div className="mt-2">
                            <Badge variant="outline" className="border-outline text-on-surface-variant">
                              {agreement.agreementType}
                            </Badge>
                          </div>
                        )}
                        {agreement.description && (
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                            {agreement.description.replace(' Link', '')} 
                            <a 
                              href={getAgreementUrl(agreement.country, agreement.partner)}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 underline ml-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                trackExternalLink(getAgreementUrl(agreement.country, agreement.partner), 'bilateral_agreement_source');
                              }}
                            >
                              Link
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {agreements.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No bilateral agreements data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}