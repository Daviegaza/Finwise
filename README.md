# 💰 FinWise — AI-Powered Global Financial Advisor

> A full-stack TypeScript + React financial advisor app powered by Claude AI. Track spending, set budgets, manage goals, and get personalized AI financial advice across 15+ countries.

![FinWise Dashboard](https://via.placeholder.com/1200x600/0A0A15/C9A84C?text=FinWise+AI+Financial+Advisor)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Advisor** | Full conversational AI (Claude Opus) with real-time access to your financial data |
| 📊 **Smart Dashboard** | Income, expenses, savings rate, daily spend with 6-month trend charts |
| 💸 **Transaction Manager** | Add, filter, delete transactions with full category system |
| 💰 **Budget Tracking** | Visual progress rings, over-budget alerts, spending by category |
| 🎯 **Financial Goals** | Emergency fund, vacation, purchases — track & contribute |
| 💡 **AI Insights** | 8+ insight types: spending spikes, budget alerts, savings rates, goal risks |
| 🌍 **15 Countries** | US, UK, Kenya, Nigeria, India, Germany, Japan, UAE, Singapore + more |
| 💱 **Multi-Currency** | USD, KES, GBP, NGN, INR, EUR, JPY, AED, SGD, etc. |
| 📱 **Fully Responsive** | Mobile, tablet, desktop — optimized for all screen sizes |
| 🎨 **Luxury Dark UI** | Fraunces serif + Sora sans, gold accents, smooth animations |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- An [Anthropic API Key](https://console.anthropic.com/)

### 1. Clone & Install
```bash
git clone https://github.com/yourname/finwise.git
cd finwise

# Install all dependencies
cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Backend
```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
ANTHROPIC_API_KEY=sk-ant-your-key-here
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Run Development Servers
```bash
# Option A: Run both together from root
cd finwise
npm install  # installs concurrently
npm run dev

# Option B: Run separately
# Terminal 1:
cd finwise/backend && npm run dev

# Terminal 2:
cd finwise/frontend && npm run dev
```

### 4. Open the App
Visit **http://localhost:5173**

---

## 📁 Full Project Structure

```
finwise/
├── package.json                        ← Root monorepo config
├── README.md
│
├── backend/
│   ├── .env.example                    ← Copy to .env, add API key
│   ├── .env                            ← Your local config (gitignored)
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts                    ← Express server + middleware
│       ├── types/
│       │   └── index.ts                ← All TypeScript interfaces
│       ├── services/
│       │   ├── financialService.ts     ← Calculations, seeded demo data, insights
│       │   └── aiService.ts            ← Claude AI integration (15 countries)
│       └── routes/
│           ├── ai.ts                   ← POST /api/ai/chat, GET /api/ai/narrative
│           ├── transactions.ts         ← Full CRUD /api/transactions/:userId
│           ├── budgets.ts              ← /api/budgets + /api/insights
│           └── users.ts                ← GET/PUT /api/users/:userId
│
└── frontend/
    ├── index.html                      ← Google Fonts: Fraunces + Sora
    ├── vite.config.ts                  ← Vite + proxy to :3001
    ├── tailwind.config.js              ← Custom design tokens
    ├── tsconfig.json
    └── src/
        ├── main.tsx                    ← Entry point
        ├── App.tsx                     ← Root component + navigation
        ├── index.css                   ← Design system: tokens, animations, components
        ├── types/
        │   └── index.ts                ← Shared TypeScript interfaces
        ├── services/
        │   └── api.ts                  ← All API calls (fetch wrapper)
        ├── utils/
        │   └── categories.ts           ← Category icons, colors, currency helpers
        ├── hooks/
        │   └── index.ts                ← useUser, useSummary, useTransactions,
        │                                  useBudgets, useGoals, useInsights, useAIChat
        └── components/
            ├── Layout/
            │   ├── Sidebar.tsx         ← Desktop sidebar with health score
            │   └── TopBar.tsx          ← TopBar + MobileNav drawer + BottomTabBar
            ├── Dashboard/
            │   ├── DashboardPage.tsx   ← Full dashboard page
            │   ├── StatCards.tsx       ← 4 animated KPI metric cards
            │   ├── SpendingChart.tsx   ← Area/Bar/Donut Recharts (switchable)
            │   └── Widgets.tsx         ← Category breakdown + Recent activity
            ├── AIAdvisor/
            │   └── AIAdvisor.tsx       ← Full chat UI with quick prompts
            ├── Transactions/
            │   └── TransactionsPage.tsx ← Table, CRUD modal, search & filters
            ├── Budget/
            │   ├── BudgetPage.tsx      ← Budget cards with SVG progress rings
            │   └── GoalsPage.tsx       ← Goal cards with contribute flow
            ├── Insights/
            │   └── InsightsPage.tsx    ← AI narrative + prioritized insight cards
            └── Settings/
                └── SettingsPage.tsx    ← Country/currency/profile/notifications
```

---

## 🌐 API Reference

All endpoints are prefixed with `/api`.

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/users/:userId` | Get user profile |
| PUT | `/users/:userId` | Update user profile |

### Transactions
| Method | Endpoint | Description |
|---|---|---|
| GET | `/transactions/:userId` | List transactions (supports filters) |
| POST | `/transactions/:userId` | Create transaction |
| PUT | `/transactions/:userId/:id` | Update transaction |
| DELETE | `/transactions/:userId/:id` | Delete transaction |

**Query params:** `category`, `type`, `from`, `to`, `limit`, `offset`

### Budgets & Goals
| Method | Endpoint | Description |
|---|---|---|
| GET | `/budgets/:userId` | List budgets with current spending |
| POST | `/budgets/:userId` | Create budget |
| PUT | `/budgets/:userId/:id` | Update budget |
| DELETE | `/budgets/:userId/:id` | Delete budget |
| GET | `/budgets/:userId/goals` | List goals |
| POST | `/budgets/:userId/goals` | Create goal |
| PUT | `/budgets/:userId/goals/:id` | Update goal |

### Insights
| Method | Endpoint | Description |
|---|---|---|
| GET | `/insights/:userId` | Get AI-generated insights |
| GET | `/insights/:userId/summary` | Get financial summary |

### AI
| Method | Endpoint | Description |
|---|---|---|
| POST | `/ai/chat` | Send message to AI advisor |
| GET | `/ai/narrative/:userId` | Generate personalized AI summary |
| GET | `/ai/countries` | List supported countries |

---

## 🌍 Supported Countries

| Code | Country | Currency | Symbol |
|---|---|---|---|
| US | United States | USD | $ |
| GB | United Kingdom | GBP | £ |
| KE | Kenya | KES | KSh |
| NG | Nigeria | NGN | ₦ |
| ZA | South Africa | ZAR | R |
| IN | India | INR | ₹ |
| DE | Germany | EUR | € |
| CA | Canada | CAD | C$ |
| AU | Australia | AUD | A$ |
| BR | Brazil | BRL | R$ |
| GH | Ghana | GHS | GH₵ |
| JP | Japan | JPY | ¥ |
| SG | Singapore | SGD | S$ |
| AE | UAE | AED | AED |
| EG | Egypt | EGP | E£ |

---

## 🎨 Design System

### Fonts
- **Display:** Fraunces (editorial serif for headings and values)
- **Body:** Sora (clean geometric sans for all UI text)
- **Mono:** JetBrains Mono (code and data values)

### Color Palette
| Token | Value | Use |
|---|---|---|
| `--bg-primary` | `#0A0A15` | Main background |
| `--bg-card` | `#16162A` | Card surfaces |
| `--gold` | `#C9A84C` | Primary brand accent |
| `--success` | `#34D399` | Positive/income |
| `--danger` | `#F87171` | Negative/expense/alert |
| `--warning` | `#FBBF24` | Caution states |
| `--info` | `#60A5FA` | Informational |

### Key Component Classes
```css
.card           /* Base card with border and hover */
.btn-gold       /* Primary CTA button with gradient */
.btn-ghost      /* Secondary outlined button */
.input-field    /* Form inputs with gold focus ring */
.badge-*        /* Status badges (success, danger, warning) */
.gold-text      /* Gradient text effect */
.progress-bar   /* Base progress track */
.progress-fill  /* Animated progress fill */
```

---

## 🔧 Production Deployment

### Backend (Railway / Render / Heroku)
```bash
cd backend
npm run build
npm start
```

Set environment variables:
- `ANTHROPIC_API_KEY` — your Claude API key
- `FRONTEND_URL` — your deployed frontend URL
- `PORT` — typically 3001 or set by platform
- `NODE_ENV=production`

### Frontend (Vercel / Netlify)
```bash
cd frontend
npm run build
# Deploy the `dist/` folder
```

Update `vite.config.ts` proxy target to your production API URL, or use an environment variable:
```ts
server: {
  proxy: {
    '/api': {
      target: process.env.VITE_API_URL || 'http://localhost:3001',
    }
  }
}
```

---

## 📈 Roadmap

- [ ] Real database (PostgreSQL with Prisma)
- [ ] JWT authentication + multi-user support
- [ ] Bank account sync (Plaid / Open Banking)
- [ ] Real-time currency conversion
- [ ] PDF export for financial reports
- [ ] Mobile app (React Native)
- [ ] Recurring transaction detection
- [ ] Tax estimation by country
- [ ] Investment portfolio tracking
- [ ] SMS / email alerts

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

Built with ❤️ using **TypeScript**, **React**, **Express**, and **Claude AI** by Anthropic.
