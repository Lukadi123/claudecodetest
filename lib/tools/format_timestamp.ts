// Tool: Format timestamp to relative time
import { formatDistanceToNow } from 'date-fns';

export function format_timestamp(date: string | Date): string {
    try {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return formatDistanceToNow(dateObj, { addSuffix: true });
    } catch {
        return 'Unknown time';
    }
}
