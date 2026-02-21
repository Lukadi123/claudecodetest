# NewsPulse — CLAUDE.md

News aggregator dashboard built with Next.js 16, React 19, Tailwind v4.

---

## Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI**: React 19, Tailwind CSS v4, Framer Motion, Motion, Lucide React
- **Auth & DB**: Supabase (Auth + PostgreSQL + RLS + Storage)
- **News Data**: RSS feeds via rss2json API proxy (30 feeds across 3 categories)
- **Article Parsing**: Axios, Cheerio (for in-site article reading via ArticleModal)
- **Utilities**: date-fns, uuid, clsx, tailwind-merge, class-variance-authority

## Dev
- Run: `npm run dev` → http://localhost:3000 (or next available port)
- Environment variables in `.env.local` (see below)
- TypeScript: `npx tsc --noEmit` → must stay at 0 errors

## Environment Variables (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
```

---

## File Structure
```
app/
  page.tsx                  # Home page (auth-guarded, ProfileAvatar, SearchBar, NewsGrid)
  layout.tsx                # Root layout — BackgroundPaths + AuthProvider wrapper
  globals.css               # Global styles, brand tokens, shadcn CSS vars
  api/rss/route.ts          # NEW — Fetches 30 RSS feeds via rss2json, deduplicates, returns articles
  api/scrape/route.ts       # OLD — HTML scraping (kept for rollback, no longer used)
  api/article/route.ts      # Fetch & parse individual article content (used by ArticleModal)
  login/page.tsx            # Login page (email + password, Remember me, show/hide toggle)
  signup/page.tsx           # Registration (name, email, password + confirm, strength indicator, age, gender)
  choose-avatar/page.tsx    # Avatar selection page (4 presets + custom upload, disabled Continue until chosen)

components/
  Header.tsx                # Logo, Refresh button, last updated timestamp
  NewsGrid.tsx              # CategoryTab components + article grid + rotation controls + ArticleModal
  NewsCard.tsx              # Article card with heart save button, opens ArticleModal on click
  ArticleModal.tsx          # Full-screen modal for in-site article reading
  TrendingSection.tsx       # Rotating trending topics with pagination dots
  ProfileAvatar.tsx         # Fixed top-left avatar circle + "Welcome! {name}" + profile dropdown + logout
  ui/
    background-paths.tsx    # Animated SVG path background (fixed, z-0)
    button.tsx              # shadcn-style Button (all variants)
    interactive-hover-button.tsx  # Arrow-slide hover button
    card.tsx                # shadcn Card component
    avatar-picker.tsx       # Animated avatar picker (4 presets + custom image upload)
    search-bar.tsx          # Gooey animated search bar with suggestions dropdown

lib/
  supabase.ts               # Supabase browser client singleton
  utils.ts                  # cn() helper (clsx + tailwind-merge)
  types.ts                  # Shared TypeScript types (Article, TrendingTopic, etc.)
  types/
    auth.ts                 # Profile, AuthContextType interfaces (includes avatar_url)
  context/
    AuthContext.tsx          # Auth state provider (signUp with upsert, signIn, signOut, updateAvatar)
  config/
    rss-feeds.ts            # NEW — 30 RSS feed URLs mapped to categories
  agents/
    scraper_agent.ts        # OLD — Orchestrates per-source HTML scraping (kept for rollback)
    trend_agent.ts          # Scrapes Reddit/X trending topics
  tools/
    fetch_rss.ts            # NEW — Fetches single RSS feed via rss2json API, maps to Article[]
    scrape_url.ts           # OLD — HTML fetching (kept for rollback)
    parse_article.ts        # OLD — HTML parsing (kept for rollback)
    validate_article.ts
    deduplicate_articles.ts # Reused by new RSS route
    format_timestamp.ts
  hooks/
    useArticles.ts          # Fetches from /api/rss (was /api/scrape), 15-min auto-refresh
    useSavedArticles.ts     # localStorage save/unsave
```

---

## Brand
- Primary: `#93b44a` | Accent: `#BFF549` | Background: `#000000`
- Text secondary: `#99A1AF`
- Font: Inter
- Sharp corners (--radius: 0px)
- CSS tokens in `globals.css`: `--primary`, `--accent`, `--background`, `--foreground`, `--primary-foreground`, `--ring`, `--card`, `--card-foreground`, `--border`, `--muted`, `--muted-foreground`

---

## Authentication System

### Supabase Setup
- **Client**: `lib/supabase.ts` — browser-side `createClient` using `NEXT_PUBLIC_` env vars
- **Auth**: Supabase Auth for email/password signup and login
- **Database**: `profiles` table linked to `auth.users` via UUID foreign key
- **Storage**: `avatars` bucket (public) for custom avatar image uploads
- **RLS**: Row Level Security enabled — users can only SELECT/INSERT/UPDATE their own profile

### Database Schema (profiles table)
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
  email TEXT NOT NULL,
  avatar_id INTEGER DEFAULT NULL,
  avatar_url TEXT DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies
- `Users can read own profile` — SELECT where `auth.uid() = id`
- `Users can insert own profile` — INSERT where `auth.uid() = id`
- `Users can update own profile` — UPDATE where `auth.uid() = id`

### Storage Policies (avatars bucket)
- `Users can upload own avatar` — INSERT where `bucket_id = 'avatars'` and path matches user ID
- `Users can update own avatar` — UPDATE same condition
- `Anyone can view avatars` — SELECT on all

### Auth Flow
1. User visits `/` → if not logged in, redirected to `/login`
2. `/login` — email/password sign in, "Remember me" checkbox, show/hide password → redirects to `/`
3. `/signup` — registration form (name, email, password + confirm with strength indicator, age, gender) → redirects to `/choose-avatar`
4. `/choose-avatar` — pick from 4 animated avatars OR upload custom image → saves to profiles → redirects to `/`
5. Main page shows `ProfileAvatar` (fixed top-left) with "Welcome! {name}" text — click opens dropdown with user info + logout

### Auth Context (`lib/context/AuthContext.tsx`)
- Wraps the app in `layout.tsx` via `<AuthProvider>`
- Provides: `user`, `profile`, `loading`, `signUp()`, `signIn()`, `signOut()`, `updateAvatar(avatarId, avatarUrl)`
- Uses `signUpUserId` ref to block ALL `onAuthStateChange` profile fetches for the signing-up user (prevents race condition overwriting locally-set profile)
- `signUp()` uses `upsert` instead of `insert` because Supabase has a DB trigger that auto-creates a bare profile row on signup — insert would fail with duplicate key
- `updateAvatar()` accepts both `avatarId` (preset) and `avatarUrl` (custom upload)

### ProfileAvatar (`components/ProfileAvatar.tsx`)
- Fixed position: `top-4 left-8 z-50`, flex row with avatar circle + "Welcome! {name}"
- Shows custom uploaded image (`avatar_url`) or preset avatar from `avatar-picker.tsx` array
- Click opens glass-card dropdown: avatar preview, Name, Email, Age, Gender, Logout button
- Dropdown: `min-w-[300px]`, `p-6`, uses `glass-card` class

### Avatar Picker (`components/ui/avatar-picker.tsx`)
- 4 unique SVG face avatars + dashed upload button for custom images
- Spin animation on selection (1080deg rotation via motion)
- Exports `avatars` array, `Avatar` type, and `AvatarSelection` union type
- `AvatarSelection`: `{ type: 'preset', avatarId }` or `{ type: 'custom', imageUrl, file }`
- Custom images uploaded to Supabase Storage `avatars` bucket on choose-avatar page
- No avatar pre-selected — user must actively choose before "Continue" button enables

### Important Auth Notes
- Supabase email confirmation should be DISABLED for immediate signup-to-login flow
- DB trigger auto-creates profile rows → `signUp()` uses `upsert` to merge name/age/gender
- `signUpUserId` ref blocks auth events for 5 seconds after signup to prevent profile overwrite
- Old test users with null profile fields need manual SQL fix or re-registration

---

## News System (RSS-based)

### Architecture
- **30 RSS feeds** across 3 categories (10 each): North Macedonia, Balkan, AI
- **Feed config**: `lib/config/rss-feeds.ts` — single source of truth for all feed URLs
- **Fetcher**: `lib/tools/fetch_rss.ts` — calls `https://api.rss2json.com/v1/api.json?rss_url=ENCODED_URL`, maps response to `Article[]`
- **API route**: `app/api/rss/route.ts` — fetches all 30 feeds in parallel via `Promise.allSettled`, deduplicates, sorts newest-first
- **Hook**: `lib/hooks/useArticles.ts` — fetches from `/api/rss`, auto-refreshes every 15 minutes

### RSS Sources
**North Macedonia (10):** meta.mk, makfax.com.mk, balkaninsight.com (MK feed), mrt.com.mk, novamakedonija.com.mk, slobodenpecat.mk, kurir.mk, 24vesti.mk, mia.mk, rferl.org

**Balkan (10):** balkaninsight.com, europeanwesternbalkans.com, emerging-europe.com, seenews.com, total-croatia-news.com, total-serbia-news.com, n1info.com, euractiv.com, intellinews.com, tanjug.rs

**AI (10):** techcrunch.com, theverge.com, venturebeat.com, technologyreview.com, wired.com, arstechnica.com, openai.com, deepmind.google, blog.research.google, ainews.com

### Key Design Decisions
- `NewsSource` type is `string` (not a union) to support 30+ dynamic source domains
- Failed feeds are skipped silently (return empty array)
- Source domain extracted from feed URL hostname (e.g., `meta.mk`, `techcrunch.com`)
- HTML stripped from RSS description for article summary
- Old `/api/scrape` route kept for rollback but not used

### Category Tabs
- **ALL**: 3x3 grid (9 articles: 3 per category), auto-rotates every 30s
  - Smooth crossfade transition (AnimatePresence)
  - Pauses on hover
  - Prev/Next navigation arrows
  - Progress bar showing countdown
- **North Macedonia / Balkan / AI**: Scrollable 3-column grid, sorted newest first
- **Saved**: localStorage-based saved articles with heart toggle

### Article Reading
- Clicking any article card opens `ArticleModal` (in-site reading)
- ArticleModal fetches article content via `/api/article?url=...` (Axios + Cheerio)
- Extracts headings, paragraphs, images from source HTML
- Falls back to "Open on {source}" link if scraping fails
- Has save button, external link button, close button, Escape key support

### Search Bar (`components/ui/search-bar.tsx`)
- Centered between TrendingSection and category tabs
- Gooey animated particles on focus (brand green colors)
- Real-time filtering by title, summary, and source
- Suggestions dropdown populated from article titles
- Clear button appears when text is entered
- Expands from 380px to 520px on focus

---

## Features Built

### Core
- **RSS-based news aggregation**: 30 feeds across 3 categories
- **Category tabs**: ALL / North Macedonia / Balkan / AI / Saved
- **ALL tab 3x3 grid**: 9 articles with 30s auto-rotation, hover pause, prev/next arrows, progress bar
- **Search bar**: Real-time filtering with animated suggestions
- **Saved articles**: Heart icon saves to localStorage; count badge on Saved tab
- **In-site article reading**: ArticleModal with content extraction
- **Full auth system**: Signup with password strength, login with remember me, avatar selection with upload
- **Profile display**: Welcome message + avatar dropdown with user info

### UI Components (shadcn-compatible)
- `BackgroundPaths` — Fixed animated SVG paths in brand green
- `InteractiveHoverButton` — Arrow-slide animation
- `Button` — Standard shadcn with CVA variants
- `Card` — shadcn Card (used by AvatarPicker)
- `AvatarPicker` — 4 SVG avatars + custom upload with spin animation
- `SearchBar` — Gooey animated search with particles

---

## Routing

| Route | Auth | Description |
|-------|------|-------------|
| `/` | Protected | Main news dashboard with search, categories, articles |
| `/login` | Public | Email/password login with remember me |
| `/signup` | Public | Registration with password strength indicator |
| `/choose-avatar` | Protected | Avatar selection (presets + upload) |

---

## Known Issues
- npm audit vulnerabilities (non-critical)
- Missing `error.tsx` and `not-found.tsx` pages
- Some RSS feeds may not provide thumbnails (articles show without images)
- rss2json free tier has 10,000 requests/day limit
- TrendingSection shows empty (trending data not fetched in RSS route — Reddit scraper is independent)
- Old test users may have null profile fields
