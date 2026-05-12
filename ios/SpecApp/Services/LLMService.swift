import Foundation
import FirebaseFunctions
import FirebaseAuth
import FirebaseFirestore

@Observable
class LLMService {
    var isLoading: Bool = false
    var currentError: UserFacingError?
    
    private let functions = Functions.functions()
    
    struct ProxyResponse: Decodable {
        let promptId: String
        let errors: [String: String]?
    }
    
    func submitPrompt(_ text: String, useOwnKeys: [String: String]? = nil) async throws -> String {
        guard let userId = Auth.auth().currentUser?.uid else {
            throw UserFacingError.notAuthenticated
        }
        
        let db = Firestore.firestore()
        let promptRef = db.collection("prompts").document()
        let promptId = promptRef.documentID
        
        // Optomistic Document Creation
        try await promptRef.setData([
            "userId": userId,
            "text": text,
            "createdAt": FieldValue.serverTimestamp(),
            "flagged": false
        ])
        
        var data: [String: Any] = [
            "promptId": promptId,
            "prompt": text,
            "userId": userId
        ]
        if let keys = useOwnKeys {
            data["useOwnKeys"] = keys
        }
        
        Task {
            do {
                _ = try await self.functions.httpsCallable("llmProxy").call(data)
            } catch {
                print("LlmProxy returned error: \(error.localizedDescription)")
                try? await db.collection("prompts").document(promptId).collection("responses").document("error").setData([
                    "model": "error",
                    "userId": userId,
                    "error": true,
                    "text": "Failed to generate responses. Please try again or check your rate limits."
                ])
            }
        }
        
        // Add a slight artificial delay so UI handles the initial push cleanly without jarring
        try? await Task.sleep(nanoseconds: 300_000_000)
        
        return promptId
    }
}

// Timeout utility
func withTimeout<T>(seconds: TimeInterval, operation: @escaping () async throws -> T) async throws -> T {
    return try await withThrowingTaskGroup(of: T.self) { group in
        group.addTask {
            return try await operation()
        }
        group.addTask {
            try await Task.sleep(nanoseconds: UInt64(seconds * 1_000_000_000))
            throw CancellationError()
        }
        let result = try await group.next()!
        group.cancelAll()
        return result
    }
}

extension UserFacingError {
    static let notAuthenticated = UserFacingError.custom("You must be signed in to submit a prompt.")
    static let networkError = UserFacingError.custom("A network error occurred. Please try again.")
    static let generationFailed = UserFacingError.custom("Failed to generate responses. Please try again or check your rate limits.")
    
    static func custom(_ message: String) -> LocalizedError {
        return CustomError(message: message)
    }
}

struct CustomError: LocalizedError {
    let message: String
    var errorDescription: String? { message }
}
