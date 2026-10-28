package com.studiojhl.sumsum;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import com.getcapacitor.Plugin;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * 웹 화면에서 여는 "intent://…" 주소(카카오톡 공유 등)를 안드로이드 앱 실행으로 바꿔 줘요.
 * Capacitor 기본 동작은 이런 주소를 열지 못해서 카톡 공유가 조용히 실패해요.
 */
@CapacitorPlugin(name = "IntentLink")
public class IntentLinkPlugin extends Plugin {
    @Override
    public Boolean shouldOverrideLoad(Uri url) {
        String scheme = url.getScheme();
        if (scheme == null) return null;
        if (scheme.equals("intent")) {
            try {
                Intent intent = Intent.parseUri(url.toString(), Intent.URI_INTENT_SCHEME);
                intent.addCategory(Intent.CATEGORY_BROWSABLE);
                intent.setComponent(null);
                intent.setSelector(null);
                try {
                    getActivity().startActivity(intent);
                } catch (ActivityNotFoundException e) {
                    // 앱이 없으면: 안내 주소 → 플레이 스토어 앱 화면
                    String fallback = intent.getStringExtra("browser_fallback_url");
                    String pkg = intent.getPackage();
                    Uri next = fallback != null ? Uri.parse(fallback)
                        : pkg != null ? Uri.parse("market://details?id=" + pkg) : null;
                    if (next != null) {
                        try { getActivity().startActivity(new Intent(Intent.ACTION_VIEW, next)); } catch (Exception ignored) {}
                    }
                }
            } catch (Exception ignored) {}
            return true;
        }
        if (scheme.equals("kakaolink") || scheme.equals("kakaotalk") || scheme.equals("market")) {
            try {
                getActivity().startActivity(new Intent(Intent.ACTION_VIEW, url));
            } catch (ActivityNotFoundException e) {
                try {
                    getActivity().startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=com.kakao.talk")));
                } catch (Exception ignored) {}
            }
            return true;
        }
        return null;
    }
}
