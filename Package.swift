// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "SpecApp",
    platforms: [.iOS(.v17)],
    products: [
        .iOSApplication(
            name: "Spec",
            targets: ["SpecApp"],
            bundleIdentifier: "com.spec.app",
            teamIdentifier: "TEAM123456",
            displayVersion: "1.0",
            bundleVersion: "1",
            iconAssetName: "AppIcon",
            supportedDeviceFamilies: [.pad, .phone],
            supportedInterfaceOrientations: [.portrait],
            capabilities: [
                .signInWithApple()
            ]
        )
    ],
    dependencies: [
        .package(url: "https://github.com/firebase/firebase-ios-sdk.git", .upToNextMajor(from: "10.22.0"))
    ],
    targets: [
        .executableTarget(
            name: "SpecApp",
            dependencies: [
                .product(name: "FirebaseAuth", package: "firebase-ios-sdk"),
                .product(name: "FirebaseFirestore", package: "firebase-ios-sdk"),
                .product(name: "FirebaseFunctions", package: "firebase-ios-sdk")
            ],
            path: "ios/SpecApp"
        )
    ]
)
