// Tool: Validate article data against schema
import { Article } from '../types';

export function validate_article(data: any): data is Article {
    // Required fields
    if (!data.title || typeof data.title !== 'string') return false;
    if (!data.url || typeof data.url !== 'string') return false;
    if (!data.source || typeof data.source !== 'string') return false;
    if (!data.category || typeof data.category !== 'string') return false;

    // Validate URL format
    try {
        new URL(data.url);
    } catch {
        return false;
    }

    // Validate published_at is within 24 hours
    if (data.published_at) {
        const publishedDate = new Date(data.published_at);
        const now = new Date();
        const hoursDiff = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60);

        if (hoursDiff > 24 || hoursDiff < 0) {
            return false; // Too old or in the future
        }
    }

    return true;
}
