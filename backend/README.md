# 🚀 Noor Backend API

Node.js + Express + MongoDB backend for the Noor Islamic mobile app.

## 📋 Features

- **RESTful API** for Islamic content (Adhkar, Duas, Prayer Times)
- **JWT Authentication** for user management
- **MongoDB** with Mongoose ODM
- **Prayer Times Integration** with Aladhan API
- **Qibla Calculation** using spherical trigonometry
- **Reminder System** for notifications
- **Rate Limiting** and security middleware

## 🏃‍♂️ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Test API
Visit `http://localhost:5000/api/health` to verify the server is running.

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user profile
- `PUT /api/v1/auth/profile` - Update user profile

### Zikr (Adhkar) Endpoints
- `GET /api/v1/zikr` - Get all adhkar
- `GET /api/v1/zikr/categories` - Get categories
- `GET /api/v1/zikr/category/:name` - Get adhkar by category
- `GET /api/v1/zikr/search/:term` - Search adhkar

### Dua Endpoints
- `GET /api/v1/dua` - Get all duas
- `GET /api/v1/dua/categories` - Get categories
- `GET /api/v1/dua/category/:name` - Get duas by category
- `POST /api/v1/dua/:id/favorite` - Add to favorites

### Prayer Times Endpoints
- `GET /api/v1/prayer/times` - Get prayer times by coordinates
- `GET /api/v1/prayer/times/city/:city` - Get prayer times by city
- `GET /api/v1/prayer/calendar` - Get Islamic calendar

### Qibla Endpoints
- `GET /api/v1/qibla/direction` - Get Qibla direction
- `POST /api/v1/qibla/verify` - Verify user's direction

### Reminder Endpoints
- `GET /api/v1/reminder` - Get user reminders
- `POST /api/v1/reminder` - Create new reminder
- `PUT /api/v1/reminder/:id` - Update reminder

## 🔧 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (to be implemented)

## 📊 Database Models

### User
- Authentication and profile data
- Preferences (calculation methods, language, etc.)
- Progress tracking for adhkar

### Zikr
- Arabic text, transliteration, translation
- Categories and repetition counts
- Source references and authenticity grades

### Dua
- Supplications with full text and metadata
- Categories and difficulty levels
- Related duas and popularity stats

### PrayerTime
- Cached prayer times for locations
- Islamic calendar information
- Calculation method preferences

### Reminder
- User notifications and scheduling
- Recurrence patterns and preferences
- Statistics and acknowledgment tracking

## 🔐 Security Features

- **JWT Authentication** with secure token handling
- **Password Hashing** using bcryptjs
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for frontend access
- **Input Validation** and sanitization

## 🌍 External APIs

### Aladhan API
- Islamic prayer times calculation
- Hijri calendar conversion
- Multiple calculation methods support

## 🚀 Deployment

### Environment Variables
Ensure these are set in production:
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Strong secret for JWT signing
- `NODE_ENV=production` - Enable production optimizations

### Recommended Platforms
- **Heroku** - Easy deployment with Git
- **Railway** - Modern deployment platform
- **DigitalOcean App Platform** - Scalable hosting
- **AWS/GCP/Azure** - Enterprise solutions

---

**May Allah accept our efforts in serving the Ummah** 🤲

