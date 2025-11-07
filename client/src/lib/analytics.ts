declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

type EventCategory = 'interaction' | 'visualization' | 'engagement' | 'conversion' | 'advanced_use';

interface FilterTrackingParams {
  filter_type: string;
  filter_value: string;
  result_count?: number;
  event_category: EventCategory;
}

interface ChartInteractionParams {
  chart_type: string;
  interaction_type: string;
  data_point?: string;
  event_category: EventCategory;
}

interface SearchParams {
  search_term: string;
  result_count: number;
  event_category: EventCategory;
}

interface DataPointSelectionParams {
  item_type: string;
  item_name: string;
  item_id?: string | number;
  country?: string;
  sector?: string;
  event_category: EventCategory;
}

interface ComparisonParams {
  item_count: number;
  comparison_type: string;
  items_compared: string;
  event_category: EventCategory;
}

interface ConversionParams {
  action_type: string;
  context?: string;
  project_id?: string | number;
  project_name?: string;
  event_category: EventCategory;
  value?: number;
}

interface ExternalLinkParams {
  link_url: string;
  link_context: string;
  event_category: EventCategory;
}

interface EngagementParams {
  engagement_duration: number;
  engagement_level: 'low' | 'medium' | 'high';
}

interface ReferrerParams {
  referrer_url: string;
  entry_source: string;
}

function safeGtag(eventName: string, params: any) {
  if (typeof window !== 'undefined' && window.gtag) {
    try {
      window.gtag('event', eventName, params);
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }
}

export function trackFilter(filterType: string, filterValue: string, resultCount?: number) {
  const params: FilterTrackingParams = {
    filter_type: filterType,
    filter_value: filterValue,
    event_category: 'interaction'
  };
  
  if (resultCount !== undefined) {
    params.result_count = resultCount;
  }
  
  safeGtag('filter_applied', params);
}

export function trackChartInteraction(
  chartType: string, 
  interactionType: 'click' | 'hover' | 'zoom', 
  dataPoint?: string
) {
  const params: ChartInteractionParams = {
    chart_type: chartType,
    interaction_type: interactionType,
    event_category: 'visualization'
  };
  
  if (dataPoint) {
    params.data_point = dataPoint;
  }
  
  safeGtag('chart_interaction', params);
}

export function trackSearch(searchTerm: string, resultCount: number) {
  const params: SearchParams = {
    search_term: searchTerm,
    result_count: resultCount,
    event_category: 'interaction'
  };
  
  safeGtag('search', params);
}

export function trackDataPointSelection(
  itemType: string,
  itemName: string,
  details?: {
    id?: string | number;
    country?: string;
    sector?: string;
  }
) {
  const params: DataPointSelectionParams = {
    item_type: itemType,
    item_name: itemName,
    event_category: 'engagement'
  };
  
  if (details?.id) params.item_id = details.id;
  if (details?.country) params.country = details.country;
  if (details?.sector) params.sector = details.sector;
  
  safeGtag('data_point_selected', params);
}

export function trackComparison(items: string[], comparisonType: string = 'projects') {
  const params: ComparisonParams = {
    item_count: items.length,
    comparison_type: comparisonType,
    items_compared: items.join(', '),
    event_category: 'advanced_use'
  };
  
  safeGtag('comparison_made', params);
}

export function trackConversion(
  actionType: 'report_viewed' | 'contact_clicked' | 'export_clicked' | 'form_submitted',
  context?: string,
  details?: {
    projectId?: string | number;
    projectName?: string;
    value?: number;
  }
) {
  const params: ConversionParams = {
    action_type: actionType,
    event_category: 'conversion'
  };
  
  if (context) params.context = context;
  if (details?.projectId) params.project_id = details.projectId;
  if (details?.projectName) params.project_name = details.projectName;
  if (details?.value) params.value = details.value;
  
  safeGtag(actionType, params);
}

export function trackExternalLink(linkUrl: string, linkContext: string) {
  const params: ExternalLinkParams = {
    link_url: linkUrl,
    link_context: linkContext,
    event_category: 'conversion'
  };
  
  safeGtag('external_link_clicked', params);
}

export function trackEngagement(duration: number, level: 'low' | 'medium' | 'high') {
  const params: EngagementParams = {
    engagement_duration: duration,
    engagement_level: level
  };
  
  safeGtag('time_engaged', params);
}

export function trackReferrer(referrerUrl: string, source: string) {
  const params: ReferrerParams = {
    referrer_url: referrerUrl,
    entry_source: source
  };
  
  safeGtag('arrived_from_catalyst_fund', params);
}

export function trackDataExplored(firstInteractionTime: number) {
  safeGtag('data_explored', {
    first_interaction_time: firstInteractionTime
  });
}
