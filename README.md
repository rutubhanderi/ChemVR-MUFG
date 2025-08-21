# ChemVR: AI-Powered Molecular Builder and Chemistry Tutor

An interactive Next.js application that helps students learn chemistry by building and validating molecules in 3D, guided by an AI tutor powered by Google Gemini. It features real-time molecule validation, gamified challenges, progress tracking, and Firebase authentication.

## Features

- 3D molecule builder with React Three Fiber and Drei
- AI Tutor (Gemini) with modes: suggestion, validation, education, and hints
- Real-time structural validation via `/api/validate` with valence checks and formula detection
- Gamification: achievements, challenges, and progress feedback
- Firebase auth: Email/Password and Google Sign-In
- Modern UI components (Radix UI, shadcn-inspired), dark mode, responsive design
- Export controls for sharing/saving work
- Type-safe codebase with TypeScript

## Prerequisites

- Node.js 18+ and Git
- pnpm or npm
- Google AI Studio API key for Gemini (`GEMINI_API_KEY`)
- Firebase project credentials for web app config (NEXT_PUBLIC_… variables)
- Optional: `curl` for testing API routes locally

## How to Run the Application

1) Clone the repository

```bash
# Replace with your repo URL
git clone https://github.com/<your-username>/mufg.git
cd mufg
```

2) Install dependencies

```bash
# using pnpm (recommended)
pnpm install
# or npm
npm install
```

3) Configure environment variables

Create a `.env.local` file in the project root with your keys:

```ini
# Gemini (Google AI Studio)
GEMINI_API_KEY=your_google_ai_studio_api_key

# Firebase Web App Config (Project Settings → General → Your apps)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

Quick helpers:

```bash
# Sanity check your environment variables
npm run check:env

# Get Firebase setup reminders
npm run setup:firebase
```

4) Start the development server

```bash
# using pnpm
pnpm dev
# or npm
npm run dev
```

Then open http://localhost:3000.

5) (Optional) Test the AI Tutor API locally

```bash
npm run test:ai
# or manually
curl -X POST http://localhost:3000/api/ai-tutor \
  -H 'Content-Type: application/json' \
  -d '{"type":"education","question":"What is a covalent bond?"}'
```

### Production build

```bash
pnpm build && pnpm start
# or
npm run build && npm run start
```
### Tech Notes (Stack)

- Next.js 15, React 19, TypeScript
- UI: Radix UI primitives, Tailwind CSS 4
- 3D: three.js, @react-three/fiber, @react-three/drei
- State: Zustand
- Auth/Backend: Firebase Authentication
- AI: Google Gemini via `/app/api/ai-tutor/route.ts`
- Validation API: `/app/api/validate/route.ts` (valence checks, formula recognition)

## Contributing

Contributions are welcome! Please follow these guidelines:

- Report bugs and request features via GitHub Issues with clear steps to reproduce or motivation
- Discuss significant changes via an issue before opening a PR
- Fork the repo and create a feature branch from `main`
- Write clear commit messages and include tests or screenshots where useful
- Ensure the app builds and runs locally before submitting

Pull request checklist:

- The app builds (`npm run build`) without errors
- Linting passes or is addressed if enabled
- Changes are scoped and documented in the PR description

Code of Conduct: This project does not yet include a formal code of conduct. Please be respectful and professional. You’re welcome to propose adding `CODE_OF_CONDUCT.md` via PR.

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

We’d love to hear from you!

