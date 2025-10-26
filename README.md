# 🕌 Noor - Islamic Mobile App

**نور** - A comprehensive Islamic mobile application built with React Native (Expo) and Node.js, providing essential Islamic features for daily practice.

## 📱 Features

### Core Islamic Features
- **📿 Adhkar (أذكار)** - Morning, evening, and situational remembrances
- **🤲 Duas (دعاء)** - Supplications from Quran and Sunnah
- **🕐 Prayer Times (مواقيت الصلاة)** - Accurate prayer times based on location
- **🧭 Qibla Direction (القبلة)** - Compass pointing to Kaaba
- **📿 Digital Tasbeeh (تسبيح)** - Dhikr counter with customizable targets
- **🗓️ Islamic Calendar** - Hijri dates and special occasions
- **🔔 Smart Reminders** - Customizable notifications for prayers and adhkar

### Technical Features
- 🌙 **Dark/Light Mode** - Automatic theme switching
- 🌍 **Multi-language Support** - Arabic and English
- 📱 **Offline Support** - Core features work without internet
- 🔄 **Real-time Sync** - Data synchronization across devices
- 🎨 **Beautiful UI** - Islamic-inspired design with Material Design
- 🔐 **Secure Authentication** - JWT-based user system

## 🏗️ Project Structure

```
noor-app/
├── backend/                 # Node.js + Express + MongoDB
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Authentication & validation
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── server.js          # Main server file
│   └── .env.example       # Environment variables template
│
├── frontend/              # React Native (Expo)
│   ├── components/        # Reusable UI components
│   ├── context/          # React contexts (Auth, Theme)
│   ├── screens/          # App screens
│   ├── services/         # API services
│   ├── utils/            # Utility functions
│   ├── App.js            # Main app component
│   └── package.json      # Dependencies
│
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **MongoDB Atlas** account (for database)
- **iOS Simulator** or **Android Emulator** (for testing)

### 1. Clone & Navigate
```bash
git clone <your-repo-url>
cd noor-app
```

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env file with your MongoDB URI and JWT secret
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret_key

# Start development server
npm run dev
```

The backend will be running on `http://localhost:5000`

### 3. Frontend Setup
```bash
# Navigate to frontend (new terminal)
cd frontend

# Install dependencies
npm install

# Start Expo development server
npx expo start
```

### 4. Testing
- **iOS**: Press `i` in the terminal or scan QR with Camera app
- **Android**: Press `a` or scan QR with Expo Go app
- **Web**: Press `w` for web preview

## ⚙️ Configuration

### Backend Environment Variables
Create `.env` file in `/backend` directory:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/noor?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# External APIs
ALADHAN_API=https://api.aladhan.com/v1
GOOGLE_API_KEY=your_google_maps_api_key (optional)

# Notifications (optional)
FCM_SERVER_KEY=your_firebase_server_key
```

### Frontend Configuration
Update API URL in `/frontend/services/api.js`:
- **Development**: Uses your local IP automatically
- **Production**: Update `API_BASE_URL` with your deployed backend URL

## 🧪 Development

### Backend Development
```bash
cd backend
npm run dev        # Start with nodemon (auto-reload)
npm start          # Start production server
npm test           # Run tests (when implemented)
```

### Frontend Development
```bash
cd frontend
npx expo start     # Start development server
npx expo start -c  # Clear cache and start
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run on web browser
```

## 📊 API Documentation

### Base URL
- **Development**: `http://localhost:5000/api/v1`
- **Production**: `https://your-domain.com/api/v1`

### Key Endpoints
- `POST /auth/login` - User authentication
- `GET /zikr` - Get adhkar by category
- `GET /dua` - Get duas with filters
- `GET /prayer/times` - Get prayer times by location
- `GET /qibla/direction` - Get Qibla direction
- `GET /reminder` - Get user reminders

### Authentication
Most endpoints require JWT token in header:
```
Authorization: Bearer <your_jwt_token>
```

## 🎨 UI/UX Design

### Color Palette
- **Primary**: `#2E8B57` (Sea Green) - Nature and growth in Islam
- **Secondary**: `#DAA520` (Goldenrod) - Islamic architecture
- **Accent**: `#CD853F` (Peru) - Warm earth tones

### Typography
- **Arabic**: Noto Sans Arabic (when available)
- **Latin**: System default with proper RTL support

### Layout
- **Material Design 3** components via React Native Paper
- **RTL Support** for Arabic text
- **Responsive Design** for various screen sizes

## 🌍 Localization

The app supports:
- **Arabic (العربية)** - Primary language for Islamic content
- **English** - Interface and translations

### Adding Translations
1. Update language context in `/frontend/context/ThemeContext.js`
2. Add translation strings for new features
3. Ensure RTL layout support for Arabic

## 📱 Deployment

### Backend Deployment (Heroku/Railway/DigitalOcean)
```bash
# Example for Heroku
heroku create your-noor-backend
git subtree push --prefix backend heroku main

# Set environment variables
heroku config:set MONGO_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_jwt_secret
```

### Frontend Deployment (Expo EAS)
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for production
eas build --platform all

# Submit to app stores
eas submit
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Style
- **ESLint** for JavaScript linting
- **Prettier** for code formatting
- **Islamic naming** - Use Arabic terms for Islamic concepts
- **Comments** - Explain Islamic context when needed

### Islamic Guidelines
- All content must be authentic (Quran/Sahih Hadith)
- Provide proper attribution for Islamic texts
- Respect Islamic principles in UI/UX design
- Ensure accuracy in prayer times and Qibla direction

## 📚 Islamic Data Sources

### Adhkar & Duas
- **Hisnul Muslim** (Fortress of the Muslim)
- **Sahih Bukhari** and **Sahih Muslim**
- **Authenticated** supplications only

### Prayer Times
- **Aladhan API** - Islamic prayer times calculation
- **Multiple calculation methods** (MWL, ISNA, etc.)
- **Qibla direction** using spherical trigonometry

### Calendar
- **Hijri Calendar** conversion
- **Islamic events** and special dates

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Allah (سبحانه وتعالى)** - For guidance and blessings
- **Islamic scholars** - For authentic Islamic knowledge
- **Open source community** - For amazing tools and libraries
- **Aladhan API** - For Islamic prayer times data

## 📞 Support

### Technical Support
- **Issues**: [GitHub Issues](link-to-issues)
- **Email**: support@noorapp.com
- **Discord**: [Community Server](link-to-discord)

### Islamic Content Verification
If you find any Islamic content that needs verification or correction, please reach out to our Islamic advisory team.

---

**Built with ❤️ for the Ummah**

*"وَذَكِّرْ فَإِنَّ الذِّكْرَىٰ تَنفَعُ الْمُؤْمِنِينَ"*

*"And remind, for indeed, the reminder benefits the believers." - Quran 51:55*
