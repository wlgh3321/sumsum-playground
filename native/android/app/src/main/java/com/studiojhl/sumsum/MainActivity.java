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
        super.onCreate(savedInstanceState);
        applyOrientation(getResources().getConfiguration());
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        applyOrientation(newConfig);
    }
}
