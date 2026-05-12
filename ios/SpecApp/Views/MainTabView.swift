import SwiftUI

struct MainTabView: View {
    @State private var promptService = PromptService()
    
    var body: some View {
        TabView {
            PromptInputView()
                .tabItem {
                    Label("Compare", systemImage: "arrow.left.and.right.square")
                }
            
            HistoryView()
                .environment(promptService)
                .tabItem {
                    Label("History", systemImage: "clock.arrow.circlepath")
                }
            
            RankingsView()
                .tabItem {
                    Label("Rankings", systemImage: "list.number")
                }
                
            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gearshape")
                }
        }
    }
}
