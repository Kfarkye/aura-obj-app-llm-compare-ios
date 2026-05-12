# First Run Checklist

Follow these exact steps to get from this generated repository to a running iOS app in the simulator.

1. **Install the Firebase CLI**: `npm install -g firebase-tools`. Authenticate by running: `firebase login`.
2. **Create a Firebase Project**: Go to the Firebase Console (brand new or use existing). Note your project ID. Enable Firestore (Production mode) and Authentication.
3. **Download iOS Config**: In Firebase Console > Project Settings, add an iOS app matching your Bundle ID. Download the `GoogleService-Info.plist` file. Replace the placeholder file located in `Spec/Resources/` with this real file.
4. **Enable Auth Providers**: In Firebase Console > Authentication > Sign In Methods, enable **Apple**, **Google**, and **Email/Password**.
5. **Set Secrets**: Run the following commands in the terminal to set the API keys for the Cloud Functions:
   `firebase functions:secrets:set OPENAI_API_KEY`
   `firebase functions:secrets:set ANTHROPIC_API_KEY`
   `firebase functions:secrets:set GEMINI_API_KEY`
   `firebase functions:secrets:set PERSPECTIVE_API_KEY`
6. **Deploy Backend**: Navigate to the `functions/` directory and run `firebase deploy --only functions,firestore:rules` (ensure the rules and functions compile without errors).
7. **Open Xcode**: Open `Package.swift` using Xcode 15+. Wait for Xcode to resolve all external SPM dependencies (Firebase SDK).
8. **Configure Xcode Settings**: Select the top-level app target. Within signing settings, set your **Apple Developer Team ID**. Replace `com.yourname.spec` with your actual **Bundle ID**.
9. **Enable Apple Capabilities**: Go to your Apple Developer Portal, find the App ID matching your Bundle ID, and ensure that the **Sign in with Apple** capability is explicitly enabled.
10. **Build & Run**: Select the iPhone 15 Pro Max simulator (iOS 17+) and hit build (Cmd + R). Sign in via Apple or Email. Send a test prompt and verify you receive three responses streaming from the cloud functions. Run the seeding tool `submission/seed-demo-account.ts` either via `node` or using `firebase functions:shell` to populate demo data.
