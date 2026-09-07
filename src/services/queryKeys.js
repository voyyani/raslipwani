/**
 * Every TanStack Query key in the app.
 *
 * Keys are hierarchical on purpose: `['properties', 'detail', '7']` sits under
 * `['properties']`, so `invalidateQueries({ queryKey: queryKeys.properties.all })`
 * after a write clears the admin table, the featured strip and every open detail
 * at once. That is impossible with the flat strings this replaces —
 * 'featured-properties', 'admin-bookings', 'booking-stats', 'client',
 * 'client-stats', 'booking-notes' — where invalidating one said nothing about
 * the others, and every write had to remember its own list of them.
 *
 * Ids are coerced to strings because properties.id arrives as an integer from
 * the database and as a string from useParams(). Two spellings of one row is
 * two cache entries, one of which is always stale.
 */
const id = (value) => String(value);

export const queryKeys = {
  properties: {
    all: ['properties'],
    featured: () => ['properties', 'featured'],
    available: () => ['properties', 'available'],
    list: (sort = {}) => ['properties', 'list', sort],
    page: (params = {}) => ['properties', 'page', params],
    detail: (propertyId) => ['properties', 'detail', id(propertyId)],
    segment: (segment) => ['properties', 'segment', segment],
    search: (term) => ['properties', 'search', term],
  },
  bookings: {
    all: ['bookings'],
    list: (filters = {}) => ['bookings', 'list', filters],
    stats: () => ['bookings', 'stats'],
    pendingCount: () => ['bookings', 'pending-count'],
    notes: (bookingId) => ['bookings', 'notes', id(bookingId)],
  },
  clients: {
    all: ['clients'],
    page: (params = {}) => ['clients', 'page', params],
    detail: (clientId) => ['clients', 'detail', id(clientId)],
    stats: (clientId) => ['clients', 'stats', id(clientId)],
    interests: (clientId) => ['clients', 'interests', id(clientId)],
    communications: (clientId) => ['clients', 'communications', id(clientId)],
  },
  settings: {
    all: ['settings'],
    category: (category) => ['settings', 'category', category],
    general: () => ['settings', 'category', 'general'],
    cloudinary: () => ['settings', 'cloudinary'],
    emailTemplates: () => ['settings', 'email-templates'],
  },
  dashboard: {
    all: ['dashboard'],
    stats: () => ['dashboard', 'stats'],
  },
};
