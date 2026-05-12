# Pre-Submission Checklist

Verify every item on this list before clicking "Submit for Review" in App Store Connect.

## Xcode & Build Settings
- [ ] Bundle ID is definitively set, matches Firebase Auth, and matches the Apple Developer Portal.
- [ ] Team ID is set in Xcode's Signing tab.
- [ ] **Sign in with Apple** capability is explicitly enabled in both Xcode signing settings AND the Apple Developer Portal.
- [ ] `AppIcon` is correctly set at all sizes including the mandatory 1024x1024 icon.
- [ ] Launch screen renders correctly (light theme, Spec mark centered).

## App Store Connect - Metadata & Assets
- [ ] All 5 screenshots uploaded for iPhone 15 Pro Max (6.7" Display).
- [ ] All 3+ screenshots uploaded for iPad Pro 13".
- [ ] Primary Category: Productivity. Secondary: Developer Tools.
- [ ] Age Rating: 12+ (Infrequent/Mild Mature/Suggestive Themes is "No"; the 12+ accounts for UGC nature of prompts).
- [ ] Pricing: Free, no IAP in v1.
- [ ] Availability: All countries except sanctioned regions.
- [ ] Privacy Policy URL is live and reachable (hosted alongside the marketing site).
- [ ] Terms of Service URL is live and reachable.
- [ ] Support URL is live (e.g., mailto or contact form).
- [ ] Marketing URL is live (the spec.app landing page).

## App Store Connect - Review & Compliance
- [ ] App Privacy Nutrition Labels are filled in matching `submission/privacy-nutrition-labels.md` exactly.
- [ ] Review notes are pasted exactly matching `submission/review-notes.md`.
- [ ] Export Compliance: Answered "Yes" (uses standard HTTPS encryption) and is exempt.
- [ ] Content Rights: Answered "Yes" (confirming rights to use OpenAI, Anthropic, and Google trademarks under nominative fair use).
- [ ] App Review Information includes the demo account credentials and the explanation of the deletion path.

## Quality & Demo Account Verification
- [ ] Demo account `demo@spec.app` has been seeded and verified working.
- [ ] Sign in with the demo credentials manually to ensure history populates, rankings display, and you can submit a comparison cleanly.
- [ ] Crashlytics is initialized and the TestFlight build is verified as crash-free.
- [ ] The current TestFlight build has been tested end-to-end by at least one external tester.
