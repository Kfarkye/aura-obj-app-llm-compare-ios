import SwiftUI
import FirebaseFirestore

struct ComparisonView: View {
    let promptId: String
    
    @State private var prompt: Prompt?
    @State private var responses: [LLMResponse] = []
    @State private var ratingService = RatingService()
    @State private var errorMessage: String?
    
    // We attach listener to get realtime responses.
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(alignment: .top, spacing: SpecSpacing.md) {
                ForEach(["openai", "anthropic", "gemini"], id: \.self) { model in
                    let response = responses.first(where: { $0.model == model })
                    VStack(alignment: .leading, spacing: SpecSpacing.md) {
                        Text(model.capitalized)
                            .font(.headline)
                            .foregroundColor(.specText)
                        
                        ScrollView {
                            if let response = response {
                                if let error = response.error {
                                    Text("Error: \(error)")
                                        .foregroundColor(.specError)
                                } else {
                                    Text(response.text)
                                        .font(.body)
                                        .foregroundColor(.specText)
                                        .textSelection(.enabled)
                                        .accessibilityLabel("\(model) response: \(response.text)")
                                }
                            } else {
                                ProgressView()
                                    .frame(maxWidth: .infinity, alignment: .center)
                                    .padding(.top, SpecSpacing.xl)
                                    .accessibilityLabel("Loading \(model) response")
                            }
                        }
                        .frame(width: 300)
                        
                        Divider()
                        
                        RatingView(
                            promptId: promptId,
                            model: model,
                            ratingService: ratingService
                        )
                    }
                    .padding(SpecSpacing.md)
                    .background(Color.specCard)
                    .cornerRadius(SpecCornerRadius.standard)
                }
            }
            .padding(SpecSpacing.md)
        }
        .background(Color.specBackground.ignoresSafeArea())
        .navigationTitle("Comparison")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            fetchData()
        }
    }
    
    private func fetchData() {
        let db = Firestore.firestore()
        db.collection("prompts").document(promptId).getDocument { snap, err in
            if let snap = snap {
                self.prompt = try? snap.data(as: Prompt.self)
            }
        }
        
        db.collection("prompts").document(promptId).collection("responses")
            .addSnapshotListener { snap, err in
                if let docs = snap?.documents {
                    self.responses = docs.compactMap { try? $0.data(as: LLMResponse.self) }
                }
            }
            
        ratingService.fetchUserRatings(for: promptId)
    }
}
