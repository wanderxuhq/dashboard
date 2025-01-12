export interface FeedItem {
  id: string;
  site: string;
  title: string;
  url: string;
  time: string;
  from?: string;
  content?: string;
  html?: string;
  uid?: string;
  processed?: boolean;
}

export interface ApiResponse {
  data: FeedItem[];
  error?: string;
} 