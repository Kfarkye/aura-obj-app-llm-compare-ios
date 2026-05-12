import Foundation
import FirebaseFirestore

struct Prompt: Identifiable, Codable, Hashable {
    @DocumentID var id: String?
    var userId: String
    var text: String
    var createdAt: Date
    var flagged: Bool?
}

struct LLMResponse: Identifiable, Codable, Hashable {
    @DocumentID var id: String?
    var promptId: String
    var model: String // "openai", "anthropic", "gemini"
    var text: String
    var error: String?
    var latencyMs: Int?
    var createdAt: Date
}

struct Rating: Identifiable, Codable, Hashable {
    @DocumentID var id: String?
    var userId: String
    var promptId: String
    var model: String
    var score: Int // 1 to 5
    var createdAt: Date
    var updatedAt: Date
}

struct Ranking: Identifiable, Codable, Hashable {
    @DocumentID var id: String? // "openai", "anthropic", "gemini"
    var model: String
    var averageRating: Double
    var totalRatings: Int
    var updatedAt: Date
}
