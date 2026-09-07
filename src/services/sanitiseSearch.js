/**
 * PostgREST parses `or=(a.ilike.%x%,b.ilike.%x%)` by splitting on commas, so a
 * comma typed into the search box would add a condition of the searcher's
 * choosing. Parentheses terminate a filter for the same reason.
 */
export const sanitiseSearch = (term) => term.replace(/[,()]/g, ' ').trim();
