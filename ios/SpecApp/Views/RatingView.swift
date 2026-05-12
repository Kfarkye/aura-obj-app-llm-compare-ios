import SwiftUI
import FirebaseAuth

struct RatingView: View {
    let promptId: String
    let model: String
    @Bindable var ratingService: RatingService
    
    private var currentUserId: String? {
        Auth.auth().currentUser?.uid
    }
    
    private var currentScore: Int {
        guard let uid = currentUserId else { return 0 }
        let ratingId = "\(uid)_\(promptId)_\(model)"
        return ratingService.userRatings[ratingId]?.score ?? 0
    }
    
    var body: some View {
        HStack(spacing: SpecSpacing.md) {
            Text("Rate:")
                .font(.subheadline)
                .foregroundColor(.specTextSecondary)
            
            HStack(spacing: 4) {
                ForEach(1...5, id: \.self) { score in
                    Image(systemName: score <= currentScore ? "star.fill" : "star")
                        .foregroundColor(score <= currentScore ? .specPrimary : .gray)
                        .onTapGesture {
                            Task {
                                try? await ratingService.submitRating(promptId: promptId, model: model, score: score)
                            }
                        }
                        .accessibilityLabel("Rate \(score) out of 5 stars")
                        .accessibilityAddTraits(.isButton)
                }
            }
        }
    }
}
