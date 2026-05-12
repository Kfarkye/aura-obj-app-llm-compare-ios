import SwiftUI

struct SpecColors {
    static let background = Color(hex: "#F5F2EC")    // Warm off-white
    static let ink = Color(hex: "#1A1A1A")           // Off-black
    static let border = Color(hex: "#E5E0D8")        // Soft border
    static let primary = Color(hex: "#2B5F3F")       // Accent Green
    static let destructive = Color(hex: "#8B3A3A")   // Destructive Red
}

struct SpecSpacing {
    static let micro: CGFloat = 4
    static let xs: CGFloat = 8
    static let sm: CGFloat = 12
    static let md: CGFloat = 16
    static let lg: CGFloat = 20
    static let xl: CGFloat = 24
    static let xxl: CGFloat = 32
    static let xxxl: CGFloat = 40
    static let gap48: CGFloat = 48
    static let gap64: CGFloat = 64
}

struct SpecRadius {
    static let badge: CGFloat = 4
    static let input: CGFloat = 8
    static let button: CGFloat = 10
    static let card: CGFloat = 12
}

struct SpecTypography {
    static let displayLarge = Font.system(size: 32, weight: .semibold, design: .default)
    static let displayMedium = Font.system(size: 24, weight: .semibold, design: .default)
    static let displaySmall = Font.system(size: 20, weight: .medium, design: .default)
    
    static let bodyLarge = Font.system(size: 17, weight: .regular, design: .default)
    static let body = Font.system(size: 15, weight: .regular, design: .default)
    static let caption = Font.system(size: 13, weight: .regular, design: .default)
    
    static let micro = Font.system(size: 11, weight: .medium, design: .default) // Use with +0.08em tracking where possible
}

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: // RGB (12-bit)
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: // RGB (24-bit)
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8: // ARGB (32-bit)
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue:  Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
