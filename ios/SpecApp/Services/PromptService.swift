import Foundation
import FirebaseFirestore
import FirebaseAuth
import FirebaseFunctions

@Observable
class PromptService {
    var recentPrompts: [Prompt] = []
    
    private let db = Firestore.firestore()
    private var listener: ListenerRegistration?
    
    func fetchRecentPrompts(userId: String) {
        let query = db.collection("prompts")
            .whereField("userId", isEqualTo: userId)
            .order(by: "createdAt", descending: true)
            .limit(to: 50)
            
        listener = query.addSnapshotListener { [weak self] snapshot, error in
            guard let documents = snapshot?.documents else {
                print("Error fetching prompts: \(error?.localizedDescription ?? "Unknown error")")
                return
            }
            self?.recentPrompts = documents.compactMap { try? $0.data(as: Prompt.self) }
        }
    }
    
    func stopListening() {
        listener?.remove()
    }
}
