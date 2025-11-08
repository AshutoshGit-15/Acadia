/**
 * Generates a Google Calendar URL for adding an event
 */
export function generateGoogleCalendarUrl(params: {
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location?: string;
}): string {
  const { title, description, startDate, endDate, location } = params;
  
  // Format dates for Google Calendar (YYYYMMDDTHHmmssZ)
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };
  
  // If no end date provided, set it to 1 hour after start
  const end = endDate || new Date(startDate.getTime() + 60 * 60 * 1000);
  
  const params_obj = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${formatDate(startDate)}/${formatDate(end)}`,
    details: description || '',
    location: location || '',
  });
  
  return `https://calendar.google.com/calendar/render?${params_obj.toString()}`;
}
