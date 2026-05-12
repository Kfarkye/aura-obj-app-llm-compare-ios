import Foundation
import FirebaseAuth
import AuthenticationServices
import CryptoKit
import Observation

@Observable
class AuthService: NSObject {
    var isAuthenticated: Bool = false
    var currentUserId: String? { Auth.auth().currentUser?.uid }
    var currentUserEmail: String? { Auth.auth().currentUser?.email }
    
    private var authStateHandler: AuthStateDidChangeListenerHandle?
    private var currentNonce: String?
    
    override init() {
        super.init()
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
    
    func randomNonceString(length: Int = 32) -> String {
        precondition(length > 0)
        var randomBytes = [UInt8](repeating: 0, count: length)
        let errorCode = SecRandomCopyBytes(kSecRandomDefault, randomBytes.count, &randomBytes)
        if errorCode != errSecSuccess {
            fatalError("Unable to generate nonce. SecRandomCopyBytes failed with OSStatus \(errorCode)")
        }
        let charset: [Character] =
            Array("0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-._")
        let nonce = randomBytes.map { byte in charset[Int(byte) % charset.count] }
        return String(nonce)
    }

    func sha256(_ input: String) -> String {
        let inputData = Data(input.utf8)
        let hashedData = SHA256.hash(data: inputData)
        let hashString = hashedData.compactMap { String(format: "%02x", $0) }.joined()
        return hashString
    }
    
    func handleSignInWithAppleRequest(_ request: ASAuthorizationAppleIDRequest) {
        let nonce = randomNonceString()
        currentNonce = nonce
        request.requestedScopes = [.fullName, .email]
        request.nonce = sha256(nonce)
    }

    func handleSignInWithAppleCompletion(_ result: Result<ASAuthorization, Error>) {
        switch result {
        case .success(let authorization):
            if let appleIDCredential = authorization.credential as? ASAuthorizationAppleIDCredential {
                guard let nonce = currentNonce else { return }
                guard let appleIDToken = appleIDCredential.identityToken else { return }
                guard let idTokenString = String(data: appleIDToken, encoding: .utf8) else { return }
                
                let credential = OAuthProvider.appleCredential(withIDToken: idTokenString,
                                                               rawNonce: nonce,
                                                               fullName: appleIDCredential.fullName)
                Task {
                    do {
                        try await Auth.auth().signIn(with: credential)
                    } catch {
                        print("Firebase Auth error: \(error.localizedDescription)")
                    }
                }
            }
        case .failure(let error):
            print("Apple Sign-In failed: \(error.localizedDescription)")
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
