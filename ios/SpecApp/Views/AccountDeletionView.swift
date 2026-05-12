import SwiftUI
import FirebaseFunctions

struct AccountDeletionView: View {
    @Environment(AuthService.self) var authService
    @State private var isDeleting = false
    @State private var errorMessage: String?
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        VStack(spacing: SpecSpacing.xl) {
            Image(systemName: "exclamationmark.triangle.fill")
                .resizable()
                .frame(width: 50, height: 50)
                .foregroundColor(.specError)
            
            Text("Delete Account")
                .font(.largeTitle)
                .fontWeight(.bold)
            
            Text("This action cannot be undone. All your prompts, ratings, and history will be permanently deleted.")
                .multilineTextAlignment(.center)
                .foregroundColor(.specTextSecondary)
                .padding(.horizontal)
            
            Spacer()
            
            if let errorMessage {
                Text(errorMessage)
                    .font(.caption)
                    .foregroundColor(.specError)
                    .multilineTextAlignment(.center)
            }
            
            if isDeleting {
                ProgressView()
            } else {
                Button(role: .destructive, action: deleteAccount) {
                    Text("Permanently Delete Account")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .frame(height: 50)
                        .background(Color.specError.opacity(0.1))
                        .foregroundColor(.specError)
                        .cornerRadius(SpecCornerRadius.standard)
                }
                .padding(.horizontal, SpecSpacing.lg)
            }
        }
        .padding(.vertical, SpecSpacing.xl)
        .navigationBarTitleDisplayMode(.inline)
    }
    
    private func deleteAccount() {
        errorMessage = nil
        isDeleting = true
        
        Task {
            do {
                _ = try await Functions.functions().httpsCallable("deleteAccount").call()
                try authService.signOut()
            } catch {
                errorMessage = "Could not delete account. Please re-authenticate and try again."
                isDeleting = false
            }
        }
    }
}
