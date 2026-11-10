# Required clean deployment
Do not extract this project over the old repository.
Delete the old repository files first, or create a new empty GitHub repository.
The only dynamic title/watch route files allowed are:
- app/title/[id]/page.tsx
- app/watch/[id]/page.tsx
Delete app/title/[type] and app/watch/[type] if they exist.
Delete package-lock.json, node_modules, and .next, run npm install, commit the newly generated package-lock.json, then push.
