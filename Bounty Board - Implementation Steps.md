# Bounty Board: Implementation Steps for the Landing Page, Accounts and Real Mode

Oct 9, 2026 · @Tanishq

Start with Step 0 now. The earlier change document is the plan and this document is the order of work, so you do not need to wait for anything else: every step below is self-contained, ends with a check, and can be pasted into Antigravity as a prompt. Do them in order and do not start a step until the previous check passes.

## 1. One correction to my earlier change document

The earlier document said the selected agent's owner wallet submits the evidence. That does not work for platform-hosted agents, because the platform cannot sign with a user's personal wallet, and an agent that bids automatically needs a key that is online. The fix is an **operator key** per agent:

- When a bidder creates an agent, the platform generates a fresh operator key and stores it encrypted (testnet only).
- The contract registers three addresses per agent: **owner** (the human), **payout** (where earnings go) and **operator** (the hot key that bids and submits).
- Only the operator can call placeBid and submitWork for that agent. Only the owner can change the operator, pause the agent, or change the payout address.
- The owner tops up the operator with a little testnet MON for gas and bid bonds from the bidder workspace. Earnings go straight to the payout address, never to the operator.

This adds a small contract change in Step 5. If you would rather avoid custodial keys, the alternative is that bidders sign every bid and submission themselves, which removes auto-bid.

## 2. Free-tier plan

Every item below has a free option. Limits change often, so keep them in a config file you can edit, never hardcoded, and confirm the current numbers on each provider's own page before launch. Sources I found disagreed on exact figures, which confirms they move.

| Part | Free choice | Notes and caveats |
| --- | --- | --- |
| LLM pool | Gemini API free tier (Flash and Flash-Lite models), Groq free tier, OpenRouter free models, local Ollama as the last fallback | Free tiers are rate-limited per minute and per day, and Gemini's free tier excludes commercial use and may use submitted content to improve Google products. Tell users not to put private data in tasks. Use at least two providers with automatic failover. |
| Evidence storage | Pinata free plan (IPFS) plus a local cache | Check the current storage and pin limits. Cap each evidence bundle at 1 MB so the free quota lasts. |
| Chain and faucet | Monad testnet and the official faucet from the Monad docs | Faucets limit how much one address can claim; do not build your own drip. |
| Web hosting | Vercel Hobby plan | Free for non-commercial projects. |
| Backend hosting | Your own machine with a free Cloudflare Tunnel, or a free web-service tier | Free tiers may sleep when idle and may lose local disk on redeploy, so check the terms. |
| Database | SQLite file through Drizzle, locally | For hosted persistence use a free libSQL (Turso) or Postgres (Neon) tier; check limits before choosing. |
| Indexer | Ponder with SQLite, self-hosted | Free. |
| Auth and notifications | Your own wallet-signature login and in-app notifications | Free; no email service. |

### Quota rules to build in

- A global limiter per LLM provider (requests per minute and per day) read from a config file.
- A per-agent daily request quota so one bidder cannot drain the shared pool.
- On a rate-limit error, back off and fail over to the next provider; if all are exhausted, the job waits in the queue rather than failing the task.
- Show remaining quota to the owner on the agent page.

## 3. Steps

### Step 0. Baseline and safety

**Goal:** a clean starting point before any change.

**Do:**

- Run git init, add a .gitignore that excludes .env files, node\_modules, local databases, Foundry out and cache folders, and any keys.
- Create .env.example files listing every variable with empty values.
- Commit as baseline-demo-works. Optionally create a private GitHub repository and push.
- Confirm that no private key, API key or seed phrase is in the repo history.

**Done when:** a fresh clone with your .env files restored runs the demo exactly as today.

### Step 1. Landing page and /demo

**Goal:** the current app becomes the demo, with a new landing page in front of it.

**Files:**

- apps/web/app/page.tsx (new landing page)
- apps/web/app/demo/layout.tsx and page.tsx (the current interface moved here)
- apps/web/components/demo/DemoBanner.tsx (new)
- apps/web/components/landing/ (hero, how-it-works, live stats, call-to-action buttons)

**Prompt for Antigravity:**

> Move the current demo UI, including its routes, components and styles, under /demo without changing its behavior. Fix imports and any hardcoded links or API paths. Add a new landing page at / with a headline, a four-step how-it-works strip (post, bid, verify, pay), three buttons (Try the demo to /demo, Log in to /login, Sign up with a poster and bidder choice to /signup/poster and /signup/bidder), a Monad testnet badge, and a live statistics row read from the existing indexer API (tasks posted, MON paid out, active agents), showing zero instead of fake numbers. Add a persistent banner on /demo that says Demo mode, burner wallets, no account needed, with an Exit demo link to /. Keep the existing dark glassmorphism style.

**Done when:** / shows the landing page, Try the demo opens the unchanged demo, Exit demo returns to /, and nothing else broke.

### Step 2. App database and demo isolation

**Goal:** a place to store users, agents and jobs, and a way to keep demo data out of real lists.

**Files:**

- services/backend/src/db/schema.ts, client.ts and migrations (Drizzle with better-sqlite3)
- services/backend/src/lib/demoWallets.ts

**Tables:** users, poster\_profiles, bidder\_profiles, agents, agent\_secrets, api\_keys, sessions, notifications, task\_drafts, jobs, llm\_usage, audit\_log.

**Prompt for Antigravity:**

> Add a SQLite application database to the Fastify backend using Drizzle ORM with migrations, separate from Ponder's database. Create the tables listed above with sensible columns and indexes. Add a demo\_wallets list (from env) and a helper isDemoWallet(address). Define a record as demo when its poster or actor is a demo wallet. Make every marketplace, leaderboard and statistics query exclude demo records, and make the demo reset endpoint touch only demo records.

**Done when:** migrations run on a fresh database, and a demo task never appears in a query meant for real data.

### Step 3. Wallet login, signup and sessions

**Goal:** users prove wallet ownership and get a session.

**Files:**

- services/backend/src/routes/auth.ts, plugins/session.ts
- apps/web/app/login/page.tsx, app/signup/poster/page.tsx, app/signup/bidder/page.tsx
- apps/web/lib/auth.tsx (AuthProvider), middleware.ts (route guard)

**Prompt for Antigravity:**

> Implement sign-in with a wallet. Backend: POST /auth/nonce returns a single-use nonce with expiry; POST /auth/verify takes a SIWE-style message and signature, verifies it with viem (domain, nonce, expiry, chain), creates or loads the user, and sets an httpOnly, secure, same-site session cookie backed by a sessions table; POST /auth/logout deletes the session; GET /me returns the user and roles. Frontend: login and signup pages using Wagmi to connect a wallet and sign the message; the signup pages enable the poster or bidder role and then continue to the profile form; add an AuthProvider, a role switcher in the header, and Next.js middleware that protects /app/poster/*, /app/bidder/* and /settings.

**Done when:** a new wallet can sign up, log out, log in again, and a protected page redirects to /login when no session exists. Replaying an old signature fails.

### Step 4. Profiles, roles and settings

**Goal:** users enter and edit their information.

**Files:** routes/me.ts, app/settings/page.tsx, components/profile/ProfileForm.tsx, public profile pages.

**Prompt for Antigravity:**

> Add profile editing with the fields from section 4 of the change document (display name required, avatar, bio, optional email, organisation and categories for posters, skills for bidders, validated links). Validate with zod on the backend. Store avatars as images no larger than 200 KB. Add POST /me/roles to enable or disable the poster and bidder roles, a settings page to edit profile data, view active sessions and log out everywhere, and a public read-only profile view. Render all user text as plain text.

**Done when:** a user can create, edit and view a profile, and cannot edit anyone else's.

### Step 5. Contract changes

**Goal:** block self-dealing and add agent operators.

**Changes:**

- AgentRegistry: store owner, payout and operator for each agent; owner can pause, change operator and payout; add an active flag.
- BountyBoard: placeBid and submitWork require msg.sender to be the agent's operator; placeBid reverts if the agent's owner or operator equals the task poster; paused agents cannot bid.
- Settlement credits go to the agent's payout address.

**Prompt for Antigravity:**

> Update AgentRegistry and BountyBoard as described, keeping custom errors and ReentrancyGuard. Add Foundry tests for: a non-operator cannot bid or submit; a poster cannot bid on their own task through owner or operator; a paused agent cannot bid; payouts and refunds reach the correct addresses; owner can rotate the operator; all existing tests still pass. Add or update invariant tests. Then redeploy to Monad testnet, verify the contracts, and update addresses and ABIs in Ponder, the backend and the web app.

**Commands (inside WSL):** forge test, then your existing deploy script with the testnet RPC and a funded deployer key from .env.

**Done when:** the full test suite passes and the new deployment is indexed.

### Step 6. Poster workspace

**Goal:** a poster controls their own tasks end to end.

**Files:** app/app/poster/ (dashboard, new, tasks, tasks/\[id\], wallet), components/poster/, services/backend/src/routes/tasks.ts and goldVault.ts.

**Prompt for Antigravity:**

> Build the poster workspace. Dashboard with counts by status and MON locked in escrow. A create-task wizard: template, inputs (upload or paste, with size limits), criteria builder, gold-set upload sent privately to the backend vault with its hash committed on-chain, reward, bidding window, execution deadline, selection mode, review, then fund through createTask with Wagmi. A My tasks list with status filters. A task page showing bids (price, ETA, agent reputation), a Select button in manual mode, an automatic highlight in reputation mode, the evidence and per-criterion verdict, a Dispute button only inside the challenge window, and a Cancel button only for Open tasks with no selection. A wallet panel with balance, escrow locked, credited refunds and a withdraw button. Every state shown must come from the indexer, not local state.

**Done when:** a new poster can post a task and see it appear in the marketplace, using only their own wallet.

### Step 7. Agent management and bidder workspace

**Goal:** a bidder creates agents and controls their work.

**Files:** app/app/bidder/ (dashboard, agents, agents/new, marketplace, jobs, earnings), routes/agents.ts, routes/apiKeys.ts, lib/operatorKeys.ts.

**Prompt for Antigravity:**

> Build the bidder workspace. Agent creation form: name, description, provider and model from the free-tier list, supported templates, minimum and maximum price, pricing rule, maximum concurrent jobs, accuracy target, auto-bid on or off. On creation generate an operator key, encrypt it with AES-GCM using a server secret, register the agent on-chain with owner, payout and operator, and show a Fund your agent panel with the operator address. Pause, resume and archive controls. A marketplace with filters for template, reward, deadline and verification type. Manual bidding through the operator, and an auto-bid engine that bids when a task matches the agent's strategy. Active jobs, submissions with verdicts and a dispute button, earnings with withdraw, and a reputation page. API key issue and revoke for external agents, storing only a hash.

**Done when:** a new bidder can create an agent, fund its operator, and see it bid on a real task.

### Step 8. Multi-tenant runner and LLM pool

**Goal:** one runner that serves every user's agents within free limits.

**Files:** services/worker-agents/src/queue.ts, runner.ts, llm/ (client.ts, providers/gemini.ts, groq.ts, openrouter.ts, ollama.ts, limiter.ts, quota.ts), evidence/builder.ts, ipfs/pinata.ts, config/llm-limits.json.

**Prompt for Antigravity:**

> Replace the three fixed demo agents with a job queue stored in the jobs table. When the indexer reports that an agent was selected, enqueue a job. The runner claims jobs atomically, respects each agent's concurrency limit and deadline, builds a prompt that treats task content strictly as data, calls the LLM client, builds the evidence bundle, pins it to IPFS with a cache, and submits work through the agent's operator key. The LLM client is provider-agnostic with adapters for Gemini, Groq, OpenRouter and Ollama, a per-provider limiter and a per-agent daily quota both read from llm-limits.json, exponential backoff on rate-limit errors, and failover to the next provider. Record usage in llm\_usage. Keep the three scripted demo personas working through the same runner, flagged as demo.

**Done when:** two different users' agents complete two different tasks at the same time without exceeding the configured limits.

### Step 9. Marketplace, notifications and public pages

**Files:** app/tasks, app/tasks/\[id\], app/agents/\[id\], app/leaderboard, routes/notifications.ts, components/NotificationBell.tsx.

**Prompt for Antigravity:**

> Build the public marketplace with filters and search, a public task page showing bids, evidence and verdicts (the gold set stays hidden until settlement), public agent pages with reputation history, and a leaderboard. Add in-app notifications for bid received, selected, work submitted, verdict ready, dispute opened and task settled, created from indexer events, with a bell and an unread count. Feed the landing page statistics from real data only.

**Done when:** a poster is notified when a bid arrives, and a bidder when they win.

### Step 10. Admin page

**Files:** app/admin/, routes/admin.ts.

**Prompt for Antigravity:**

> Add an admin area visible only to wallets in an ADMIN\_WALLETS env allowlist. Show the verifier set and stakes from VerifierRegistry, a pause and unpause control for new tasks that is signed by the contract owner's wallet in the browser (never a server-held owner key), a list of users with ban and unban controls (a ban stops logins and new bids but never touches escrowed funds), an audit log, and LLM usage by provider and agent.

**Done when:** a non-admin gets a forbidden response on every admin route.

### Step 11. Security hardening

**Prompt for Antigravity:**

> Add Fastify rate limiting per IP and per wallet, security headers and a strict content security policy, zod validation on every route, upload type and size limits, CSRF protection for cookie-authenticated writes, output sanitisation for all user text, encrypted secret handling with no secrets in logs, and prompt-injection defenses (fixed system prompts, structured JSON outputs only, deterministic checks before any LLM verifier, evidence treated as data). Add automated tests for auth replay, role bypass, self-dealing, oversized uploads and injection strings in task text.

**Done when:** all hardening tests pass and a manual attempt to read another user's agent or secrets fails.

### Step 12. Free deployment

**Do:**

- Deploy the web app to Vercel Hobby with environment variables set in the dashboard.
- Run the backend, Ponder and the runner on your machine behind a Cloudflare Tunnel, or on a free service tier if its terms fit; if the disk is not persistent, use a free libSQL or Postgres database instead.
- Confirm contracts are verified on the explorer and list addresses in the README.
- Write a README with setup, environment variables, scenarios and the free-tier limits table.
- Record a backup video of each scenario.

**Done when:** a stranger can open the public URL, connect a wallet, post a task and watch it settle.

### Step 13. Final rehearsal

Run each row below at least three times, including once with the primary LLM provider rate-limited on purpose.

| Scenario | Expected result |
| --- | --- |
| New poster and new bidder, happy path | Task settles, MON reaches the payout address |
| Sloppy agent wins | FAIL verdict, poster refunded, bond slashed |
| Reputation mode | High-reputation agent wins over a cheaper new one |
| Dispute | Panel resolves and bonds settle correctly |
| Poster bids on own task | Contract reverts |
| Demo run during real activity | Real data is untouched |
| Primary LLM provider exhausted | Failover or queued wait, task still completes |

## 4. How to work through this

1. Paste one step at a time into Antigravity, and run its checks before moving on.
2. After each step, commit with the step number in the message.
3. If a step fails, send me the exact error and the step number and I will fix that step only.
4. Never paste private keys, seed phrases or API keys into chat. Keep them in .env files.
