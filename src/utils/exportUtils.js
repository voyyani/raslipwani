import Papa from 'papaparse';

/**
 * Export data to CSV file
 * @param {Array} data - Array of objects to export
 * @param {String} filename - Name of the file (without .csv extension)
 * @param {Array} columns - Optional array of column configs {key, label}
 */
export const exportToCSV = (data, filename, columns = null) => {
  if (!data || data.length === 0) {
    throw new Error('No data to export');
  }

  let csvData = data;

  // If columns specified, map and reorder data
  if (columns && columns.length > 0) {
    csvData = data.map(row => {
      const newRow = {};
      columns.forEach(col => {
        newRow[col.label || col.key] = row[col.key] || '';
      });
      return newRow;
    });
  }

  // Convert to CSV
  const csv = Papa.unparse(csvData);

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return true;
};

/**
 * Format property data for export
 * @param {Array} properties - Array of property objects
 */
export const formatPropertiesForExport = (properties) => {
  return properties.map(property => ({
    ID: property.id,
    Title: property.title,
    Location: property.location,
    Address: property.address,
    Type: property.property_type,
    Purpose: property.purpose,
    Price: property.price,
    Bedrooms: property.bedrooms,
    Bathrooms: property.bathrooms,
    'Area (sqft)': property.area_sqft,
    Status: property.status,
    Featured: property.featured ? 'Yes' : 'No',
    'Created At': new Date(property.created_at).toLocaleDateString(),
  }));
};

/**
 * Format booking data for export
 * @param {Array} bookings - Array of booking objects
 */
export const formatBookingsForExport = (bookings) => {
  return bookings.map(booking => ({
    ID: booking.id,
    Name: booking.name,
    Email: booking.email,
    Phone: booking.phone,
    Service: booking.service || booking.viewing_type,
    Type: booking.type,
    'Appointment Date': booking.appointment_at ? new Date(booking.appointment_at).toLocaleString() : '',
    Status: booking.status || 'pending',
    Message: booking.message,
    'Created At': new Date(booking.created_at).toLocaleDateString(),
  }));
};

/**
 * Format client data for export (will be used later)
 * @param {Array} clients - Array of client objects
 */
export const formatClientsForExport = (clients) => {
  return clients.map(client => ({
    ID: client.id,
    'First Name': client.first_name,
    'Last Name': client.last_name,
    Email: client.email,
    Phone: client.phone,
    Type: client.client_type,
    Status: client.status,
    'Budget Min': client.budget_min,
    'Budget Max': client.budget_max,
    'Created At': new Date(client.created_at).toLocaleDateString(),
  }));
};
