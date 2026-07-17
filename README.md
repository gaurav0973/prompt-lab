<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=nextdotjs" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-7-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-06B6D4?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS" />
</p>

# ✨ PromptLab

**A full-stack AI chat application** for rapid prompt experimentation and intelligent conversations. Chat with OpenAI models in real time, manage conversation threads, and revisit your best prompt experiments — all within a polished, responsive interface.

> Built with **Next.js 16**, **Vercel AI SDK**, **Clerk Auth**, **Prisma**, and **shadcn/ui**.

---

## 🚀 Features

- **🤖 Real-time AI Streaming** — Chat with OpenAI's GPT-4o-mini (configurable per conversation) via the Vercel AI SDK with live streamed responses.
- **💬 Conversation Management** — Create, rename, pin, archive, and delete chat threads from a collapsible sidebar.
- **📝 Persistent History** — Every message is saved to a PostgreSQL database (Neon) so you never lose context.
- **🔐 Authentication** — Secure sign-in via Clerk with automatic user provisioning/onboarding.
- **🌗 Theme Toggle** — Switch between light, dark, and system themes powered by `next-themes`.
- **📱 Responsive Design** — Mobile-friendly layout with collapsible sidebar and adaptive UI components.
- **🧩 Rich Markdown Rendering** — Assistant responses rendered with full markdown support including code highlighting, LaTeX math, Mermaid diagrams, and CJK text via Streamdown plugins.
- **⚡ Optimistic UI** — React Query mutations for instant feedback on sidebar operations (rename, pin, delete).
- **🔀 Message Branching** — Built-in branch navigation for exploring alternative response variants.

---

## 🛠️ Tech Stack

| Layer            | Technology                                                       |
| ---------------- | ---------------------------------------------------------------- |
| **Framework**    | [Next.js 16](https://nextjs.org/) (App Router, Server Actions)   |
| **Language**     | [TypeScript 5](https://www.typescriptlang.org/)                  |
| **UI**           | [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS 4](https://tailwindcss.com/) |
| **AI**           | [Vercel AI SDK](https://sdk.vercel.ai/) + [OpenAI](https://openai.com/) |
| **Auth**         | [Clerk](https://clerk.com/)                                      |
| **Database**     | [PostgreSQL](https://www.postgresql.org/) (Neon) via [Prisma 7](https://www.prisma.io/) |
| **State**        | [TanStack React Query](https://tanstack.com/query)               |
| **Markdown**     | [Streamdown](https://github.com/nicholasgriffintn/streamdown) (code, math, mermaid, CJK plugins) |
| **Notifications**| [Sonner](https://sonner.emilkowal.dev/)                          |
| **Package Mgr**  | [pnpm](https://pnpm.io/)                                        |

---

## 📁 Project Structure

```
prompt-lab/
├── app/
│   ├── (auth)/                    # Auth route group (sign-in)
│   │   └── sign-in/[[...sign-in]] # Clerk catch-all sign-in page
│   ├── (root)/                    # Main app route group
│   │   ├── c/[id]/                # Individual conversation page
│   │   ├── layout.tsx             # Conditional sidebar shell for signed-in users
│   │   └── page.tsx               # Landing page (guest) / New chat (signed-in)
│   ├── api/chat/                  # POST API route for AI streaming
│   ├── globals.css                # Global styles & design tokens
│   └── layout.tsx                 # Root layout (Clerk + Theme + Query providers)
│
├── components/
│   ├── ai-elements/               # AI-specific UI primitives
│   │   ├── conversation.tsx       # Conversation wrapper with auto-scroll
│   │   ├── loader.tsx             # Typing indicator / loading animation
│   │   └── message.tsx            # Message bubble, actions, branch nav, markdown
│   ├── providers/                 # Context providers
│   │   ├── query-provider.tsx     # TanStack React Query provider
│   │   └── theme-provider.tsx     # next-themes provider
│   ├── ui/                        # 60+ shadcn/ui components
│   └── mode-toggle.tsx            # Light/dark theme switcher
│
├── features/
│   ├── ai/
│   │   ├── action/chat-store.ts   # Server actions: save/load messages (DB ↔ UI)
│   │   └── utils/model.ts         # OpenAI model configuration
│   ├── auth/
│   │   └── action/
│   │       ├── get-current-authenticated-user.ts  # Auth guard + auto-onboard
│   │       └── onboard.ts         # Clerk → DB user sync (upsert)
│   ├── conversation/
│   │   ├── action/                # Server actions: CRUD for conversations
│   │   ├── components/            # Chat shell, sidebar, composer, messages
│   │   ├── hooks/                 # React Query hooks for conversations
│   │   └── utils/                 # Query key factory
│   └── messages/
│       ├── action/                # Server actions: CRUD for messages
│       └── hooks/                 # React Query hooks for messages
│
├── lib/
│   ├── db.ts                      # Prisma client singleton (PrismaPg adapter)
│   ├── utils.ts                   # Utility helpers (cn, etc.)
│   └── generated/prisma/          # Generated Prisma client (gitignored)
│
├── prisma/
│   ├── schema.prisma              # Database schema (User, Conversation, Message)
│   └── migrations/                # Prisma migration history
│
├── proxy.ts                       # Clerk middleware (route protection)
├── prisma.config.ts               # Prisma config (datasource, migration path)
└── package.json
```

---

## 🏗️ Architecture Overview

```mermaid
flowchart LR
    subgraph Client
        A[React UI] -->|useChat| B[AI SDK Transport]
        A -->|React Query| C[Server Actions]
    end

    subgraph Server
        B -->|POST /api/chat| D[Chat Route]
        D -->|streamText| E[OpenAI API]
        D -->|read/write| F[(PostgreSQL)]
        C -->|Prisma ORM| F
    end

    subgraph Auth
        G[Clerk] -->|middleware| D
        G -->|protect| C
    end
```

**Request flow:**
1. User types a message → `ChatComposer` calls `sendMessage` via the AI SDK's `useChat` hook.
2. The `DefaultChatTransport` sends a `POST` to `/api/chat` with the message and conversation ID.
3. The API route authenticates the user (Clerk), loads conversation history (Prisma), and calls `streamText` (OpenAI).
4. The response streams back to the client via `createUIMessageStreamResponse`.
5. On stream completion, messages are persisted to PostgreSQL and the sidebar refreshes via React Query invalidation.

---

## ⚙️ Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** (recommended) — `npm install -g pnpm`
- A **PostgreSQL** database (e.g. [Neon](https://neon.tech/))
- A **Clerk** account ([clerk.com](https://clerk.com/))
- An **OpenAI** API key ([platform.openai.com](https://platform.openai.com/))

### 1. Clone the repository

```bash
git clone https://github.com/gaurav0973/prompt-lab.git
cd prompt-lab
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
# Database (PostgreSQL connection string)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# OpenAI
OPENAI_API_KEY=sk-proj-...
```

### 4. Set up the database

```bash
# Generate the Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate deploy
```

### 5. Run the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to start chatting.

---

## 📜 Available Scripts

| Command                       | Description                            |
| ----------------------------- | -------------------------------------- |
| `pnpm dev`                    | Start the development server           |
| `pnpm build`                  | Create a production build              |
| `pnpm start`                  | Start the production server            |
| `pnpm lint`                   | Run ESLint                             |
| `pnpm prisma generate`       | Generate the Prisma client             |
| `pnpm prisma migrate dev`    | Create and apply a new migration       |
| `pnpm prisma migrate deploy` | Apply pending migrations (production)  |
| `pnpm prisma studio`         | Open the Prisma database GUI           |

---

## 🗄️ Database Schema

The app uses three core models:

```
┌──────────┐      ┌───────────────┐      ┌──────────┐
│   User   │──1:N─│ Conversation  │──1:N─│ Message  │
└──────────┘      └───────────────┘      └──────────┘
```

- **User** — Synced from Clerk on first sign-in (clerk ID, email, name, avatar).
- **Conversation** — Thread with title, optional system prompt, per-thread model override, pin/archive flags.
- **Message** — Individual chat message with role (`USER`/`ASSISTANT`/`SYSTEM`/`TOOL`), status tracking, structured parts (JSON), and content.

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub.
2. Import the repository in [Vercel](https://vercel.com/).
3. Add all environment variables (`DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `OPENAI_API_KEY`).
4. Vercel will automatically run `prisma generate` via the `postinstall` script.
5. Deploy!

> **💡 Tip:** The `postinstall` script in `package.json` runs `prisma generate` automatically, ensuring the Prisma client is always available at build time.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/gaurav0973">Gaurav Maurya</a>
</p>
