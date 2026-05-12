import SwiftUI
import FirebaseFirestore

struct RankingsView: View {
    @State private var rankings: [Ranking] = []
    
    var body: some View {
        NavigationStack {
            List(rankings.sorted(by: { $0.averageRating > $1.averageRating })) { ranking in
                HStack {
                    Text(ranking.model.capitalized)
                        .font(.headline)
                        .foregroundColor(.specText)
                    
                    Spacer()
                    
                    VStack(alignment: .trailing) {
                        Text(String(format: "%.2f", ranking.averageRating))
                            .font(.title3)
                            .fontWeight(.bold)
                            .foregroundColor(.specPrimary)
                        Text("\(ranking.totalRatings) ratings")
                            .font(.caption)
                            .foregroundColor(.specTextSecondary)
                    }
                }
                .accessibilityLabel("\(ranking.model) has \((String(format: "%.2f", ranking.averageRating))) average out of \(ranking.totalRatings) ratings")
            }
            .navigationTitle("Global Rankings")
            .onAppear {
                fetchRankings()
            }
        }
    }
    
    private func fetchRankings() {
        Firestore.firestore().collection("rankings")
            .addSnapshotListener { snap, _ in
                if let docs = snap?.documents {
                    self.rankings = docs.compactMap { try? $0.data(as: Ranking.self) }
                }
            }
    }
}
