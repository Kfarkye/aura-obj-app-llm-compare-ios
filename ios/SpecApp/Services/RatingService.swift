import Foundation
import FirebaseFirestore
import FirebaseAuth

@Observable
class RatingService {
    private let db = Firestore.firestore()
    
    // In-memory cache for optimistic updates
    var userRatings: [String: Rating] = [:] 
    
    func submitRating(promptId: String, model: String, score: Int) async throws {
        guard let userId = Auth.auth().currentUser?.uid else { return }
        
        // Optimistic UI update
        let ratingId = "\(userId)_\(promptId)_\(model)"
        let previousRating = userRatings[ratingId]
        
        let newRating = Rating(
            id: ratingId,
            userId: userId,
            promptId: promptId,
            model: model,
            score: score,
            createdAt: previousRating?.createdAt ?? Date(),
            updatedAt: Date()
        )
        userRatings[ratingId] = newRating
        
        do {
            try await withTimeout(seconds: 10) {
                try await self.db.collection("ratings").document(ratingId).setData(from: newRating)
            }
        } catch {
            // Rollback on failure
            userRatings[ratingId] = previousRating
            print("Failed to save rating: \(error.localizedDescription)")
            throw CustomError(message: "Failed to save rating. Please try again.")
        }
    }
    
    func fetchUserRatings(for promptId: String) {
        guard let userId = Auth.auth().currentUser?.uid else { return }
        
        db.collection("ratings")
            .whereField("userId", isEqualTo: userId)
            .whereField("promptId", isEqualTo: promptId)
            .getDocuments { [weak self] snapshot, _ in
                guard let docs = snapshot?.documents else { return }
                for doc in docs {
                    if let rating = try? doc.data(as: Rating.self), let id = rating.id {
                        self?.userRatings[id] = rating
                    }
                }
            }
    }
}
