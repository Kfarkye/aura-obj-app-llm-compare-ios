import SwiftUI
import AuthenticationServices

struct SignInView: View {
    @Environment(AuthService.self) var authService
    @State private var isSigningIn = false
    @State private var errorMessage: String?
    
    var body: some View {
        VStack(spacing: SpecSpacing.xl) {
            Spacer()
            
            VStack(spacing: SpecSpacing.md) {
                Text("Spec")
                    .font(.system(size: 48, weight: .bold, design: .rounded))
                    .foregroundColor(.specPrimary)
                
                Text("Compare AI models side by side.")
                    .font(.body)
                    .foregroundColor(.specTextSecondary)
                    .multilineTextAlignment(.center)
            }
            
            Spacer()
            
            if isSigningIn {
                ProgressView()
            } else {
                VStack(spacing: SpecSpacing.md) {
                    SignInWithAppleButton(.signIn) { request in
                        authService.handleSignInWithAppleRequest(request)
                    } onCompletion: { result in
                        authService.handleSignInWithAppleCompletion(result)
                    }
                    .signInWithAppleButtonStyle(.black)
                    .frame(height: 50)
                    .cornerRadius(SpecCornerRadius.standard)
                    
                    Button {
                        Task {
                            isSigningIn = true
                            do {
                                try await authService.signInAnonymously()
                            } catch {
                                errorMessage = error.localizedDescription
                            }
                            isSigningIn = false
                        }
                    } label: {
                        Text("Continue as Guest")
                            .font(.headline)
                            .foregroundColor(.specText)
                            .frame(maxWidth: .infinity)
                            .frame(height: 50)
                            .background(Color.gray.opacity(0.1))
                            .cornerRadius(SpecCornerRadius.standard)
                    }
                }
                .padding(.horizontal, SpecSpacing.lg)
            }
            
            if let errorMessage {
                Text(errorMessage)
                    .font(.caption)
                    .foregroundColor(.specError)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }
            
            Spacer()
        }
        .background(Color.specBackground.ignoresSafeArea())
    }
}
