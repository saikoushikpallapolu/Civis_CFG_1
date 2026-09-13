# Civis — Citizen Feedback & Policy Analytics Platform

Civis is an AI-assisted civic consultation platform designed to bridge the gap between citizen voices and policymakers. It enables government agencies and civil society organizations to ingest complex policy documents, generate structured consultation surveys using **Google Gemini 3.6 Flash**, collect public responses (both authenticated and anonymous), and deliver decision-ready qualitative and quantitative correlation analytics for lawmakers.

---

## 🌟 Key Features

### 1. AI Policy Ingestion & Question Generation
- **Document Ingestion**: Upload policy drafts in **PDF** or **Plain Text (.txt)**, or paste raw policy text.
- **AI Question Suggester**: Uses **Google Gemini 3.6 Flash** to parse policy documents, extract titles, categories, and executive summaries, and generate balanced objective (MCQ) and subjective (open-ended) survey questions.
- **Custom Form Studio**: Administrators can fine-tune generated questions or build custom consultation surveys from scratch with full control over question types, choices, and requirements.

### 2. Citizen Participation Portal
- **Consultation Discovery**: Real-time search by keyword and category filters (e.g., *Environment & Climate*, *Urban Mobility*, *Digital Governance*, *Healthcare*).
- **Dynamic Survey Forms**: Automatically renders single-choice radio buttons, multi-select checkboxes, and multiline text areas with client-side validation.
- **Inclusive Participation**: Supports both verified citizen submissions and anonymous feedback to ensure maximum democratic participation.

### 3. Lawmaker Analytics & AI Correlation Engine
- **Mathematical Aggregations**: Automatically tallies multiple-choice responses into distribution counts and percentages formatted directly for Recharts.
- **Qualitative Synthesis**: Analyzes open-ended citizen text comments to compute net sentiment (positive, neutral, negative) and recurring thematic drivers.
- **Segment Correlation**: Slices citizen sentiment and text explanations by the specific multiple-choice options they selected, showing *why* citizens agree or disagree.
- **Actionable Policy Recommendations**: Generates concrete, prioritized policy amendments (`High`, `Medium`, `Low`) based on ground-level citizen feedback.
- **MongoDB Caching Layer**: Results are cached in the `Analysis` collection and served in under 150ms, with automatic invalidation when new responses arrive.

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: MongoDB Atlas with Mongoose ODM
- **AI Engine**: Google Gemini API (`gemini-3.6-flash`)
- **Authentication**: Dual-token JWT (Access Token + Refresh Token stored in MongoDB) with bcrypt password hashing
- **File Processing**: Multer + `pdf-parse` v2 (Uint8Array buffer parsing)

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4 + Lucide React Icons
- **Visualizations**: Recharts (Donut charts, Horizontal Theme Bar charts, Stacked Correlation charts, and MCQ Bar charts)
- **HTTP Client**: Axios with automatic 401 token refresh interceptors
- **Routing**: React Router DOM v7

---

## 📁 Repository Structure

```
Civis_CFG_1/
├── public/
│   ├── policy_documents/        # Sample policy drafts (NUPT_ASIP_2026.txt, etc.)
│   └── temp/                    # Temporary upload storage for Multer
├── src/
│   ├── controllers/
│   │   ├── analytics.controller.js    # Lawmaker analytics & cache controller
│   │   ├── auth.controller.js         # Authentication & token refresh logic
│   │   ├── consultation.controller.js # Consultation CRUD & AI question generation
│   │   └── response.controller.js     # Citizen response submission & creator view
│   ├── models/
│   │   ├── analysis.model.js          # Cached AI analytics & correlation schema
│   │   ├── consultation.model.js      # Dynamic consultation & question schema
│   │   ├── response.model.js          # Citizen answer submission schema
│   │   └── user.model.js              # User schema with roles ('citizen', 'admin')
│   ├── middlewares/
│   │   ├── auth.middleware.js         # JWT verification & optional anonymous auth
│   │   ├── multer.middleware.js       # Multipart file upload handler
│   │   └── role.middleware.js         # Role-based access control (RBAC)
│   ├── routes/
│   │   ├── auth.routes.js             # Auth endpoints (/login, /register, etc.)
│   │   └── consultation.routes.js     # Consultations, responses, & analytics routes
│   ├── services/
│   │   ├── aggregation.service.js     # Pure math aggregations & chart data helpers
│   │   └── llm.service.js             # Gemini 3.6 Flash integration
│   ├── utils/
│   │   ├── ApiError.js                # Standardized error class
│   │   ├── ApiResponse.js              # Standardized API response wrapper
│   │   ├── asyncHandler.js            # Promise-based controller wrapper
│   │   └── fileExtractor.js           # PDF & TXT document parser
│   ├── app.js                         # Express application setup & middleware
│   ├── constants.js                   # Application constants & database name
│   └── index.js                       # Server entry point
├── frontend/
│   ├── src/
│   │   ├── api/                       # Axios client & API service modules
│   │   ├── components/
│   │   │   ├── admin/                 # Policy uploader & question editor
│   │   │   ├── analytics/             # Recharts visualization components
│   │   │   ├── citizen/               # Dynamic form & consultation cards
│   │   │   └── common/                # Navbar, footer, protected route guard
│   │   ├── context/                   # AuthContext with token refresh
│   │   ├── pages/                     # Application pages
│   │   ├── App.jsx                    # Route declarations
│   │   └── main.jsx                   # React entry point
│   ├── index.html
│   ├── vite.config.js                 # Vite config (Port: 5180, /api proxy to 8000)
│   └── package.json
├── seed_consultations.js              # Mock data seed script for multiple policies
├── package.json
└── Readme.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18+ (tested on Node v22)
- **MongoDB**: MongoDB Atlas connection URI or local MongoDB instance
- **Gemini API Key**: Google AI Studio API key

### 1. Environment Configuration
Create a `.env` file in the root directory:

```env
PORT=8000
MONGO_DB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net
CORS_ORIGIN=*
ACCESS_TOKEN_SECRET=your_jwt_access_secret_key
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_jwt_refresh_secret_key
REFRESH_TOKEN_EXPIRY=10d
GEMINI_API_KEY=your_google_gemini_api_key
```

### 2. Install Dependencies

**Backend**:
```bash
npm install
```

**Frontend**:
```bash
cd frontend
npm install
cd ..
```

### 3. Seed Initial Consultations & Demo Admin
Run the seed script to create initial sample policies and verify the test admin account:
```bash
node -r dotenv/config --experimental-json-modules seed_consultations.js
```

### 4. Run Locally

**Start the Backend Server (Port 8000)**:
```bash
npm run dev
```

**Start the Frontend Client (Port 5180)**:
```bash
cd frontend
npm run dev
```

Open your browser at **`http://localhost:5180/`**.

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Policy Admin / Lawmaker** | `admin@civis.vote` | `Admin@123` | Full access to AI Studio, Consultation CRUD, & Analytics |
| **Citizen Voter** | Register any citizen account | User defined | Can browse consultations and submit responses |

---

## 📡 API Reference Summary

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Public | Register a new citizen or admin account |
| `POST` | `/login` | Public | Login and receive `accessToken` & `refreshToken` |
| `POST` | `/refresh-token` | Public | Refresh expired access token |
| `POST` | `/logout` | Private | Revoke refresh token and logout |
| `GET` | `/me` | Private | Get authenticated user profile |

### Consultations & AI Studio (`/api/v1/consultations`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/generate-questions` | Admin | Ingest PDF/TXT and generate questions with Gemini |
| `GET` | `/` | Public | List all consultations with search & category filters |
| `POST` | `/` | Admin | Publish a new consultation survey |
| `GET` | `/:id` | Public | Get consultation survey schema |
| `PATCH` | `/:id` | Admin | Update consultation metadata or status |
| `DELETE` | `/:id` | Admin | Delete a consultation |

### Citizen Responses & Analytics
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/:id/responses` | Public | Submit citizen survey response (Auth or Anonymous) |
| `GET` | `/:id/responses` | Admin | View raw responses (enforces creator ownership) |
| `GET` | `/:id/analytics` | Admin | Get mathematical stats & AI correlation charts (Cached) |
| `POST` | `/:id/analytics/regenerate`| Admin | Force Gemini to recompute qualitative synthesis |

---

## 📄 License
This project is licensed under the ISC License.