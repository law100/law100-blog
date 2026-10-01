export const commentFilters = ['all', 'hold', 'approved', 'spam', 'trash'] as const;
export type CommentFilter = typeof commentFilters[number];
export const commentsPerPage = 20;

export function commentQuery(filter: CommentFilter, page = 1, perPage = commentsPerPage) {
  // WordPress "all" means approved + pending, not spam or trash.
  const status = filter === 'approved' ? 'approve' : filter;
  return `/wp/v2/comments?context=edit&status=${status}&per_page=${perPage}&page=${page}&orderby=date&order=desc`;
}
