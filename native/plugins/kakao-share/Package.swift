// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "SumsumKakaoShare",
    platforms: [.iOS(.v15)],
    products: [
        .library(name: "SumsumKakaoShare", targets: ["KakaoSharePlugin"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "8.0.0"),
        .package(url: "https://github.com/kakao/kakao-ios-sdk", from: "2.30.0")
    ],
    targets: [
        .target(
            name: "KakaoSharePlugin",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "KakaoSDKCommon", package: "kakao-ios-sdk"),
                .product(name: "KakaoSDKShare", package: "kakao-ios-sdk")
            ],
            path: "ios/Sources/KakaoSharePlugin")
    ]
)
