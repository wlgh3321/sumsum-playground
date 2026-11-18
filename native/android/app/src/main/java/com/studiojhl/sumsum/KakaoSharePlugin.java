package com.studiojhl.sumsum;

import android.content.Intent;
import android.util.Base64;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.kakao.sdk.common.KakaoSdk;
import com.kakao.sdk.share.ShareClient;
import com.kakao.sdk.template.model.Button;
import com.kakao.sdk.template.model.Content;
import com.kakao.sdk.template.model.FeedTemplate;
import com.kakao.sdk.template.model.Link;
import java.io.File;
import java.io.FileOutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.json.JSONObject;

/**
 * 카카오톡으로 점수 이미지 카드를 바로 보내요 (아이폰 KakaoSharePlugin.swift 와 똑같이 동작).
 * JS: KakaoShare.shareImage({ image: base64(png), title, desc, url, buttons: [{title, url, exec}] })
 */
@CapacitorPlugin(name = "KakaoShare")
public class KakaoSharePlugin extends Plugin {
    static final String APP_KEY = "54d1d873e900c66d439b9ac2723415ad"; // 카카오 네이티브 앱 키 (아이폰 Info.plist 와 같음)
    private boolean ready = false;

    @Override
    public void load() {
        try {
            KakaoSdk.init(getContext(), APP_KEY);
            ready = true;
        } catch (Exception e) {
            ready = false;
        }
    }

    @PluginMethod
    public void isAvailable(PluginCall call) {
        boolean ok = false;
        try { ok = ready && ShareClient.getInstance().isKakaoTalkSharingAvailable(getContext()); } catch (Exception ignored) {}
        JSObject r = new JSObject();
        r.put("value", ok);
        call.resolve(r);
    }

    // "cn=a&cs=b" → {cn: a, cs: b}
    private static Map<String, String> params(String q) {
        Map<String, String> m = new HashMap<>();
        if (q == null) return m;
        for (String part : q.split("&")) {
            if (part.isEmpty()) continue;
            int i = part.indexOf('=');
            String k = i < 0 ? part : part.substring(0, i);
            String v = i < 0 ? "" : part.substring(i + 1);
            try { v = java.net.URLDecoder.decode(v, "UTF-8"); } catch (Exception ignored) {}
            m.put(k, v);
        }
        return m;
    }

    @PluginMethod
    public void shareImage(PluginCall call) {
        if (!ready) { call.reject("no key"); return; }
        String b64 = call.getString("image");
        if (b64 == null) { call.reject("bad image"); return; }
        final String title = call.getString("title", "");
        final String desc = call.getString("desc", "");
        final String url = call.getString("url", "https://sumsum.studiojhl.com/");
        final Integer width = call.getInt("width");
        final Integer height = call.getInt("height");

        // 버튼: [{ title, url, exec? }] (최대 2개). exec 가 있으면 '앱 실행' 버튼 (앱이 없으면 스토어로)
        final List<Button> buttons = new ArrayList<>();
        try {
            JSArray arr = call.getArray("buttons", new JSArray());
            for (int i = 0; i < arr.length() && i < 2; i++) {
                JSONObject b = arr.getJSONObject(i);
                String u = b.optString("url", url);
                String exec = b.optString("exec", "");
                Link link = exec.isEmpty()
                    ? new Link(u, u, null, null)
                    : new Link(u, u, params(exec), params(exec));
                buttons.add(new Button(b.optString("title", ""), link));
            }
        } catch (Exception ignored) {}

        final File img;
        try {
            byte[] data = Base64.decode(b64, Base64.DEFAULT);
            img = new File(getContext().getCacheDir(), "sumsum-share.png");
            try (FileOutputStream out = new FileOutputStream(img)) { out.write(data); }
        } catch (Exception e) { call.reject("bad image"); return; }

        if (!ShareClient.getInstance().isKakaoTalkSharingAvailable(getContext())) { call.reject("no talk"); return; }

        ShareClient.getInstance().uploadImage(img, (result, error) -> {
            if (error != null || result == null) { call.reject("upload failed"); return null; }
            String imageUrl = result.getInfos().getOriginal().getUrl();
            Integer w = width != null ? width : result.getInfos().getOriginal().getWidth();
            Integer h = height != null ? height : result.getInfos().getOriginal().getHeight();
            Link link = new Link(url, url, null, null);
            Content content = new Content(title, imageUrl, link, desc, w, h);
            List<Button> btns = buttons.isEmpty() ? java.util.Collections.singletonList(new Button("앱 받기", link)) : buttons;
            FeedTemplate template = new FeedTemplate(content, null, null, btns, null);
            getActivity().runOnUiThread(() ->
                ShareClient.getInstance().shareDefault(getContext(), template, null, (sharing, err) -> {
                    if (err != null || sharing == null) { call.reject("share failed"); return null; }
                    try {
                        Intent it = sharing.getIntent();
                        it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                        getContext().startActivity(it);
                        call.resolve();
                    } catch (Exception e) { call.reject("open failed"); }
                    return null;
                }));
            return null;
        });
    }
}
