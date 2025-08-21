# ChemVR Web - Interactive Molecular Builder with Firebase Authentication

A Next.js application featuring an interactive 3D molecular builder with Firebase authentication, AI-powered chemistry tutoring, and gamification elements.

## Features

- 🔐 **Firebase Authentication**
  - Email and password authentication
  - Google Sign-In (popup method)
  - Protected routes and user state management
  - Automatic session persistence

- 🧪 **Interactive 3D Molecular Builder**
  - Real-time 3D molecular visualization
  - Manual bond creation system
  - Atom manipulation and positioning
  - Molecular validation and export

- 🤖 **AI Chemistry Tutor**
  - Powered by Gemini 1.5 Flash
  - Interactive Q&A about chemistry concepts
  - Real-time molecular analysis

- 🎮 **Gamification System**
  - Achievement system
  - Challenge-based learning
  - Progress tracking and scoring

## Prerequisites

- Node.js 18+ and pnpm
- Firebase project with Authentication enabled
- Google Cloud project with Gemini API access

## Setup Instructions

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password and Google Sign-In methods
3. Get your Firebase configuration from Project Settings > General > Your apps

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Gemini API (for AI Tutor)
GEMINI_API_KEY=your-gemini-api-key
```

### 4. Firebase Authentication Setup

1. **Enable Email/Password Authentication:**
   - Go to Firebase Console > Authentication > Sign-in method
   - Enable "Email/Password" provider

2. **Enable Google Sign-In:**
   - Go to Firebase Console > Authentication > Sign-in method
   - Enable "Google" provider
   - Add your authorized domain (localhost for development)

3. **Configure Authorized Domains:**
   - Go to Firebase Console > Authentication > Settings > Authorized domains
   - Add `localhost` for development
   - Add your production domain when deploying

### 5. Run the Application

```bash
# Development mode
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```
## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test authentication flow
5. Submit a pull request


## License

This project is licensed under the MIT License.

## 📬 Contact the Contributors  

If you have any questions, suggestions, or feedback, feel free to reach out to the contributors of this project:  

- [@jayg2309](https://github.com/jayg2309)  
- [@rutubhanderi](https://github.com/rutubhanderi)  
- [@kshitij0318](https://github.com/kshitij0318)  

We’d love to hear from you! 
