# Virtual Assistant (MERN + Vite)

Live Demo: https://virtualassistant-hwys.onrender.com

A voice-enabled virtual assistant web app with authentication, chat history, multimedia intents (YouTube, Google, Netflix/Hotstar, etc.), and password reset via email OTP. Built with React (Vite + Tailwind) frontend and an Express + MongoDB backend.

## Features

- **Authentication**
- **Profile & Assistant customization** (name and image upload via Cloudinary)
- **Ask the Assistant** with smart intent detection
- **System utilities**: date, time, day, month
- **History management**: delete all or individual items
- **Password reset flow**: email OTP, verify OTP, reset password
- **CORS + cookies** based session handling

## Screenshots

- **Screenshot 1**

  ![Screenshot 1](screenshots/Screenshot%202025-09-18%20035738.png)

- **Screenshot 2**

  ![Screenshot 2](screenshots/Screenshot%202025-09-18%20035800.png)

- **Screenshot 3**

  ![Screenshot 3](screenshots/Screenshot%202025-09-18%20035909.png)

- **Screenshot 4**

  ![Screenshot 4](screenshots/Screenshot%202025-09-18%20035934.png)

- **Screenshot 5**

  ![Screenshot 5](screenshots/Screenshot%202025-09-18%20040129.png)

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, React Router, Lucide Icons
- **Backend**: Node.js, Express 5, Mongoose, JWT, Multer, Cloudinary, Nodemailer, Moment.js
- **Database**: MongoDB

## Monorepo Structure

```
VirtualAssistant/
├── frontend/           # Vite React app
│   ├── package.json
│   └── ...
├── backend/            # Express API server
│   ├── index.js        # Entry
│   ├── gemini.js       # Intent parsing via external API
│   ├── routes/
│   ├── controllers/
│   ├── middlewares/
│   └── config/
└── README.md
```

## Prerequisites

- Node.js 18+
- A MongoDB connection string
- Gmail account for SMTP (or change transporter)
- Cloudinary account for image uploads

## Environment Variables

Create a `.env` file in `backend/` with:

```
# Server
PORT=5000

# Database
MONGODB_URL=your_mongodb_connection_string

# Auth
JWT_SECRET=your_jwt_secret

# Gemini or LLM gateway
GEMINI_API_URL=https://generativelanguage.googleapis.com/v1/models/...:generateContent?key=YOUR_KEY

# Email (Gmail example; enable App Passwords or less secure method per your org policy)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Notes:
- Backend CORS is configured for `http://localhost:5173` by default.
- Cookies are used for auth. Keep same-site/secure settings aligned with your environment.

## Install & Run

Open two terminals.

- **Backend**
  - Location: `backend/`
  - Install: `npm install`
  - Run (dev): `npm run dev`
  - Default: http://localhost:5000

- **Frontend**
  - Location: `frontend/`
  - Install: `npm install`
  - Run (dev): `npm run dev`
  - Default: http://localhost:5173

## API Overview

Base URL: `http://localhost:5000/api`

- **Auth** (`/auth`)
  - `POST /signup` — body: `{ name, email, password, mobileNumber }` → sets auth cookie
  - `POST /signin` — body: `{ email, password }` → sets auth cookie
  - `GET /logout` — clears cookie

- **User** (`/user`) — requires auth cookie
  - `GET /current` — get logged-in user (sans password)
  - `POST /update` — multipart form-data: `assistantName`, optional `assistantImage` (file) or `imageUrl` (string)
  - `POST /asktoassistant` — body: `{ command }` → intent JSON with `type`, `userInput`, `response`
  - `DELETE /history` — delete all history
  - `DELETE /history/:index` — delete one history item by index

- **Password Reset** (public)
  - `POST /user/forgot-password` — body: `{ email }` → emails 6-digit OTP
  - `POST /user/verify-otp` — body: `{ email, otp }` → returns `resetToken` (10 min)
  - `POST /user/reset-password` — body: `{ token: resetToken, newPassword }`
  - `POST /user/resend-otp` — body: `{ email }`

## Intent Types Returned by Assistant

Examples of `type` values returned from `/asktoassistant`:

- `general`
- `google-search`
- `youtube-search` | `youtube-open` | `youtube-play`
- `calculator-open` | `instagram-open` | `facebook-open` | `watsapp-open` | `cricbuzz-open`
- `weather-show`
- `get-time` | `get-date` | `get-day` | `get-month`
- `Netflix-open` | `Netflix-play`
- `Hotstar-open` | `Hotstar-play` | `Hotstar-search`

Special handling:
- For Netflix/Hotstar "play" intents, `userInput` is normalized to only the title.

## Development Notes

- Multer handles single file upload key `assistantImage`.
- Cloudinary upload returns a secure URL stored on the user record.
- Auth uses JWT signed with `JWT_SECRET` and stored in an HTTP-only cookie.
- Make sure your Gmail account uses App Passwords if 2FA is enabled.

## Scripts

- Backend: `npm run dev` (nodemon)
- Frontend: `npm run dev`, `npm run build`, `npm run preview`

## License

ISC
