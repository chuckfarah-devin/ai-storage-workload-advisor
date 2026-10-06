import type { Status } from './model.js';

// R-STAT-1: precedence constraint > needs-investigation > ready at every level.
// An empty status list yields needs-investigation: no evidence cannot be ready.
export function combineStatuses(statuses: Status[]): Status {
  if (statuses.length === 0) return 'needs-investigation';
  if (statuses.includes('modeled-constraint')) return 'modeled-constraint';
  if (statuses.includes('needs-investigation')) return 'needs-investigation';
  return 'modeled-ready';
}
