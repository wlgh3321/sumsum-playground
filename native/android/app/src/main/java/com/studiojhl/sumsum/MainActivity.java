package com.studiojhl.sumsum;

import android.content.pm.ActivityInfo;
import android.content.res.Configuration;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    // 화면 방향: 보통 폰은 세로만, 큰 화면(폴더블을 펼쳤을 때·태블릿)은 가로도 돼요.
    private void applyOrientation(Configuration c) {
        setRequestedOrientation(c.smallestScreenWidthDp >= 600
            ? ActivityInfo.SCREEN_ORIENTATION_UNSPECIFIED
            : ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(IntentLinkPlugin.class); // 카카오톡 공유(intent:// 주소) 열기
        registerPlugin(KakaoSharePlugin.class); // 카카오톡으로 점수 이미지 카드 바로 보내기 (아이폰과 같게)
        super.onCreate(savedInstanceState);
        applyOrientation(getResources().getConfiguration());
        // 휴대폰 설정의 '글자 크기'를 키워 둬도 게임 화면이 깨지지 않게, 아이폰처럼 글자 크기를 고정해요
        try {
            android.webkit.WebSettings ws = getBridge().getWebView().getSettings();
            ws.setTextZoom(100);
            // 화면 폭 설정(viewport)을 크롬처럼 그대로 따르게 → 폴드 바깥 화면처럼 좁은 폰에서 화면에 맞게 줄여 그려요
            ws.setUseWideViewPort(true);
            ws.setLoadWithOverviewMode(true);
        } catch (Exception ignored) {}
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        applyOrientation(newConfig);
    }
}
