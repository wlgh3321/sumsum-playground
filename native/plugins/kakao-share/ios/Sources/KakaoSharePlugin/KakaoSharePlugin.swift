import Foundation
import UIKit
import Capacitor
import KakaoSDKCommon
import KakaoSDKShare

/// 카카오톡으로 점수 이미지 카드를 바로 보내요.
/// JS: KakaoShare.shareImage({ image: base64(png), title, desc, url, buttons: [{title, url}] })
@objc(KakaoSharePlugin)
public class KakaoSharePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "KakaoSharePlugin"
    public let jsName = "KakaoShare"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "shareImage", returnType: CAPPluginReturnPromise)
    ]

    private var ready = false

    override public func load() {
        // Info.plist 의 KAKAO_APP_KEY (네이티브 앱 키)
        if let key = Bundle.main.object(forInfoDictionaryKey: "KAKAO_APP_KEY") as? String, !key.isEmpty {
            KakaoSDK.initSDK(appKey: key)
            ready = true
        }
    }

    @objc func isAvailable(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            call.resolve(["value": self.ready && ShareApi.isKakaoTalkSharingAvailable()])
        }
    }

    @objc func shareImage(_ call: CAPPluginCall) {
        guard ready else { call.reject("no key"); return }
        guard let b64 = call.getString("image"),
              let data = Data(base64Encoded: b64, options: .ignoreUnknownCharacters),
              let image = UIImage(data: data) else { call.reject("bad image"); return }
        let title = call.getString("title") ?? ""
        let desc = call.getString("desc") ?? ""
        let url = call.getString("url") ?? "https://sumsum.studiojhl.com/"
        // 버튼: [{ title, url, exec? }] (최대 2개)
        // exec(실행 파라미터)가 있으면 '앱 실행' 버튼: 받는 사람 폰에 앱이 있으면 앱이 열리면서
        // kakao{앱키}://kakaolink?{exec} 로 들어와요. 앱이 없으면 카카오 설정의 스토어로 가요.
        var buttons: [[String: Any]] = []
        for b in (call.getArray("buttons") as? [[String: Any]] ?? []).prefix(2) {
            let u = (b["url"] as? String) ?? url
            var link: [String: Any] = ["web_url": u, "mobile_web_url": u]
            if let exec = b["exec"] as? String, !exec.isEmpty {
                link["android_execution_params"] = exec
                link["ios_execution_params"] = exec
            }
            buttons.append(["title": (b["title"] as? String) ?? "", "link": link])
        }
        let width = call.getInt("width") ?? Int(image.size.width * image.scale)
        let height = call.getInt("height") ?? Int(image.size.height * image.scale)

        DispatchQueue.main.async {
            guard ShareApi.isKakaoTalkSharingAvailable() else { call.reject("no talk"); return }
            ShareApi.shared.imageUpload(image: image) { result, error in
                guard let imageUrl = result?.infos.original.url, error == nil else {
                    call.reject("upload failed", nil, error); return
                }
                let link: [String: Any] = ["web_url": url, "mobile_web_url": url]
                let template: [String: Any] = [
                    "object_type": "feed",
                    "content": [
                        "title": title,
                        "description": desc,
                        "image_url": imageUrl.absoluteString,
                        "image_width": width,
                        "image_height": height,
                        "link": link
                    ],
                    "buttons": buttons.isEmpty ? [["title": "앱 받기", "link": link]] : buttons
                ]
                ShareApi.shared.shareDefault(templateObject: template) { sharing, error in
                    guard let sharing = sharing, error == nil else {
                        call.reject("share failed", nil, error); return
                    }
                    DispatchQueue.main.async {
                        UIApplication.shared.open(sharing.url, options: [:]) { ok in
                            ok ? call.resolve() : call.reject("open failed")
                        }
                    }
                }
            }
        }
    }
}
