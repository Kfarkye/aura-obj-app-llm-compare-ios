import SwiftUI
import FirebaseAuth

struct HistoryView: View {
    @Environment(PromptService.self) var promptService
    
    var body: some View {
        NavigationStack {
            List(promptService.recentPrompts) { prompt in
                NavigationLink(destination: ComparisonView(promptId: prompt.id ?? "")) {
                    VStack(alignment: .leading, spacing: SpecSpacing.sm) {
                        Text(prompt.text)
                            .lineLimit(2)
                            .font(.body)
                            .foregroundColor(.specText)
                        
                        Text(prompt.createdAt, style: .date)
                            .font(.caption)
                            .foregroundColor(.specTextSecondary)
                    }
                    .padding(.vertical, 4)
                }
                .accessibilityLabel("Prompt history: \(prompt.text)")
            }
            .navigationTitle("History")
            .onAppear {
                if let uid = Auth.auth().currentUser?.uid {
                    promptService.fetchRecentPrompts(userId: uid)
                }
            }
            .onDisappear {
                promptService.stopListening()
            }
        }
    }
}
