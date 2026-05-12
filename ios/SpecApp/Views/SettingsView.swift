import SwiftUI

struct SettingsView: View {
    @Environment(AuthService.self) var authService
    @State private var errorMessage: String?
    
    var body: some View {
        NavigationStack {
            List {
                Section {
                    Text(authService.currentUserEmail ?? "Guest User")
                        .foregroundColor(.specTextSecondary)
                }
                
                Section {
                    Button("Sign Out") {
                        do {
                            try authService.signOut()
                        } catch {
                            errorMessage = error.localizedDescription
                        }
                    }
                    .foregroundColor(.specPrimary)
                }
                
                Section {
                    NavigationLink("Delete Account", destination: AccountDeletionView())
                        .foregroundColor(.specError)
                }
            }
            .navigationTitle("Settings")
            .alert("Error", isPresented: .constant(errorMessage != nil)) {
                Button("OK") { errorMessage = nil }
            } message: {
                Text(errorMessage ?? "")
            }
        }
    }
}
