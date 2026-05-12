import Foundation
import FirebaseAuth
import Observation

@Observable
class AuthService {
    var isAuthenticated: Bool = false
    var currentUserId: String? { Auth.auth().currentUser?.uid }
    var currentUserEmail: String? { Auth.auth().currentUser?.email }
    
    private var authStateHandler: AuthStateDidChangeListenerHandle?
    
    init() {
        // Listen to Firebase Auth state
        authStateHandler = Auth.auth().addStateDidChangeListener { [weak self] _, user in
            self?.isAuthenticated = (user != nil)
        }
    }
    
    deinit {
        if let handler = authStateHandler {
            Auth.auth().removeStateDidChangeListener(handler)
        }
    }
    
    func signInAnonymously() async throws {
        do {
            let result = try await Auth.auth().signInAnonymously()
            print("Signed in anonymously: \(result.user.uid)")
        } catch {
            throw UserFacingError.signInFailed
        }
    }
    
    func signOut() throws {
        do {
            try Auth.auth().signOut()
        } catch {
            throw UserFacingError.signOutFailed
        }
    }
}

enum UserFacingError: LocalizedError {
    case signInFailed
    case signOutFailed
    
    var errorDescription: String? {
        switch self {
        case .signInFailed: return "Could not sign in at this time. Please try again later."
        case .signOutFailed: return "Could not sign out. Please check your connection."
        }
    }
}
