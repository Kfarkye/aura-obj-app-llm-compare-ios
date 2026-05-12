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
        
        self.isLoading = true
        defer { self.isLoading = false }
        
        var data: [String: Any] = [
            "prompt": text,
            "userId": userId
        ]
        if let keys = useOwnKeys {
            data["useOwnKeys"] = keys
        }
        
        do {
            let result = try await withTimeout(seconds: 30) {
                try await self.functions.httpsCallable("llmProxy").call(data)
            }
            
            // Note: v1 requires llmProxy to create Prompt & Responses, so we just get promptId.
            guard let responseData = result?.data as? [String: Any],
                  let promptId = responseData["promptId"] as? String else {
                throw UserFacingError.networkError
            }
            
            return promptId
        } catch {
            throw UserFacingError.generationFailed
        }
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
