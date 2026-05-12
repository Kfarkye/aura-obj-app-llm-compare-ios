import SwiftUI

struct SpecMotion {
    static let specEaseInOut = Animation.easeInOut(duration: 0.2)
    static let specTransition = Animation.easeInOut(duration: 0.3)
    static let specPush = Animation.easeInOut(duration: 0.4)
    static let specSpring = Animation.spring(response: 0.5, dampingFraction: 0.8)
    static let specQuickSpring = Animation.spring(response: 0.4, dampingFraction: 0.85)
}
