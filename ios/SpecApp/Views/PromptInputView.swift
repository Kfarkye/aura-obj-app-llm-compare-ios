import SwiftUI

struct PromptInputView: View {
    @State private var llmService = LLMService()
    @State private var promptText: String = ""
    @State private var errorMessage: String?
    @State private var navPath = NavigationPath()
    
    var body: some View {
        NavigationStack(path: $navPath) {
            VStack(spacing: SpecSpacing.md) {
                TextEditor(text: $promptText)
                    .padding(SpecSpacing.sm)
                    .frame(maxHeight: 200)
                    .background(Color.specCard)
                    .cornerRadius(SpecCornerRadius.standard)
                    .overlay(
                        RoundedRectangle(cornerRadius: SpecCornerRadius.standard)
                            .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                    )
                    .padding(.horizontal, SpecSpacing.md)
                    .accessibilityLabel("Prompt input field")
                
                if let errorMessage {
                    Text(errorMessage)
                        .font(.caption)
                        .foregroundColor(.specError)
                        .padding(.horizontal, SpecSpacing.md)
                        .accessibilityLabel("Error: \(errorMessage)")
                }
                
                Button(action: submitPrompt) {
                    if llmService.isLoading {
                        ProgressView()
                            .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    } else {
                        Text("Compare")
                            .font(.headline)
                    }
                }
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(promptText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty ? Color.gray : Color.specPrimary)
                .foregroundColor(.white)
                .cornerRadius(SpecCornerRadius.standard)
                .padding(.horizontal, SpecSpacing.md)
                .disabled(promptText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || llmService.isLoading)
                .accessibilityLabel("Compare prompt models")
                
                Spacer()
            }
            .padding(.top, SpecSpacing.lg)
            .background(Color.specBackground.ignoresSafeArea())
            .navigationTitle("New Prompt")
            .navigationDestination(for: String.self) { promptId in
                ComparisonView(promptId: promptId)
            }
        }
    }
    
    private func submitPrompt() {
        errorMessage = nil
        Task {
            do {
                let promptId = try await llmService.submitPrompt(promptText)
                promptText = ""
                navPath.append(promptId)
            } catch {
                errorMessage = error.localizedDescription
            }
        }
    }
}
