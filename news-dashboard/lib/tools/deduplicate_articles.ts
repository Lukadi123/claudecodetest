// Tool: Remove duplicate articles
import { Article } from '../types';

export function deduplicate_articles(articles: Article[]): Article[] {
    const seen = new Map<string, Article>();

    for (const article of articles) {
        const key = `${article.source}-${article.title.toLowerCase().trim()}`;

        if (!seen.has(key)) {
            seen.set(key, article);
        } else {
            // Keep the most recent one
            const existing = seen.get(key)!;
            const existingDate = new Date(existing.published_at);
            const currentDate = new Date(article.published_at);

            if (currentDate > existingDate) {
                seen.set(key, article);
            }
        }
    }

    return Array.from(seen.values());
}
