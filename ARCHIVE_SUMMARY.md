Archive summary - non-critical files moved

Date: 2025-08-16

What I did:
- Moved many non-critical `.txt` files (test sessions, temp cookies, pasted notes) and paste files from `attached_assets/` into `archive/` and `archive/attached_assets/`.
- Excluded files that appear referenced by code: `admin_cookies.txt`, `admin-cookies.txt`, `admin_cookies_fresh.txt`, `admin_cookies_fixed.txt`, `cookies.txt`.
- Created `scripts/archive_candidates.sh` (executable) that performs the same operation so it can be repeated or adjusted.

Why:
- Clean workspace and reduce noise while preserving recoverability.

Notes:
- Build was run successfully (`npm run build`) after archiving; there were warnings unrelated to archiving (duplicate class members warnings and chunk size warnings).
- TypeScript check (`npm run check`) previously fails in this environment due to missing type for `vite/client`. That is pre-existing and unrelated to archive.

Files moved: see git commit for exact list. If you want, I can permanently delete them or open a PR for team review.
