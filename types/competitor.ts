export type CompetitorType = "direct" | "adjacent" | "alternative" | "unconventional";

export type CompanyOverview = {
  name: string;
  description: string;
  sells: string;
  targetCustomer: string;
  category: string;
};

export type CompetitorEntry = {
  name: string;
  type: CompetitorType;
  relevance: number;
  reason: string;
};

export type CompetitionMapResult = {
  url: string;
  overview: CompanyOverview;
  positioning: string;
  competitors: CompetitorEntry[];
  provider: string;
};

export type AnalyzeErrorBody = {
  error: string;
  code?: "MISSING_API_KEY" | "EMPTY_INPUT" | "FETCH_FAILED" | "INVALID_URL" | "UPSTREAM_ERROR";
};
