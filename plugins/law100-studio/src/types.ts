export type Bootstrap = {
  user: { id: number; name: string; avatar: string };
  site: { name: string; url: string; driveUrl: string };
  capabilities: {
    editPosts: boolean;
    editPages: boolean;
    moderateComments: boolean;
    uploadFiles: boolean;
    manageOptions: boolean;
  };
  featurePages: string[];
};

export type DocumentSummary = {
  id: number;
  type: 'post' | 'page';
  title: string;
  status: string;
  slug: string;
  modified: string;
  link: string;
};

export type DashboardData = {
  counts: { posts: number; drafts: number; pages: number; pendingComments: number };
  recent: DocumentSummary[];
  pendingComments: Array<{
    id: number;
    author: string;
    content: string;
    date: string;
    postId: number;
    postTitle: string;
  }>;
  system: { wordpress: string; theme: string; updates: number; https: boolean };
};

export type WpRendered = { rendered: string; raw?: string };

export type WpPost = {
  id: number;
  date: string;
  date_gmt: string;
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: 'post' | 'page';
  link: string;
  title: WpRendered;
  content: WpRendered;
  excerpt: WpRendered;
  featured_media: number;
  comment_status: 'open' | 'closed';
  categories?: number[];
  tags?: number[];
  _embedded?: Record<string, unknown>;
};

export type WpTerm = { id: number; count: number; name: string; slug: string; description: string };

export type WpComment = {
  id: number;
  post: number;
  parent: number;
  author: number;
  author_name: string;
  author_email: string;
  author_ip: string;
  author_user_agent: string;
  date: string;
  status: 'approved' | 'hold' | 'spam' | 'trash';
  content: WpRendered;
};

export type WpMedia = {
  id: number;
  date: string;
  slug: string;
  link: string;
  title: WpRendered;
  caption: WpRendered;
  description: WpRendered;
  alt_text: string;
  media_type: 'image' | 'file';
  mime_type: string;
  source_url: string;
  media_details?: { width?: number; height?: number; filesize?: number; sizes?: Record<string, { source_url: string }> };
};
