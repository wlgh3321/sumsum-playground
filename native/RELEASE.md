# 셈셈 놀이터 앱 출시 규칙 — 갤럭시·아이폰은 항상 완전히 똑같이

지홍 요청(2026-11-18): 안드로이드와 아이폰은 기능·화면·버전·문구가 늘 같아야 한다. 따로 더블체크하지 않아도 되게.

## 원칙
1. 게임 코드는 하나뿐: `app/` → `native/build.mjs` → 두 앱에 똑같이 들어감. 플랫폼별 분기(`native-ios`/`native-android`)는
   스토어·OS가 강제하는 것(결제 창, 공유 창, 광고 단위 ID 등)만. 화면·규칙·문구는 절대 다르게 만들지 않는다.
2. 한 번 고치면 두 앱을 같은 날 함께 빌드·제출한다. 한쪽만 올리지 않는다.
3. 버전 이름은 항상 같게: 안드로이드 `versionName` = 아이폰 `MARKETING_VERSION`. (빌드 번호는 각자 올림)
4. 새 기능 문구(출시 노트)·스토어 설명·프로모션 문구는 한국어·영어 모두 두 스토어에 같은 글을 넣는다.

5. 네이티브 기능(플러그인)은 두 플랫폼에 다 있어야 한다. 아이폰에만 있는 `native/plugins/*/ios` 기능이 생기면
   안드로이드(`native/android/app/src/main/java/...`)에도 같은 이름·같은 동작으로 만든다. (예: KakaoShare — 2026-11-18 갤럭시에 빠져 있던 것 수정)
   `native/src/native.js` 에서 `P.이름` 으로 쓰는 플러그인 목록 = 두 플랫폼 모두 등록되어 있는지 매번 확인.
6. 출시 노트·스토어 문구는 사용자가 보는 글이다. 우리끼리 대화한 내용(특정 기기 이름, 내부 사정)은 넣지 않는다.

## 출시 체크리스트 (매번)
- [ ] `native/android/app/build.gradle` versionCode +1, versionName = X
- [ ] `native/ios/App/App.xcodeproj/project.pbxproj` CURRENT_PROJECT_VERSION +1, MARKETING_VERSION = X
- [ ] Mac: `git pull` → `cd native && npm run sync` (두 플랫폼 public 폴더에 같은 파일 확인)
- [ ] 안드로이드: 서명 번들 빌드 → 플레이 콘솔 프로덕션 → 같은 출시 노트 → 제출
- [ ] 아이폰: Archive(또는 깃허브 Actions "iOS 빌드·업로드") → App Store Connect 새 버전 → 같은 새 기능 문구 → 빌드 붙이기 → 제출
- [ ] 공유(결과·친구 초대)·광고·결제·링크 열기를 두 플랫폼 코드 경로로 확인 (`N.kakao`, `P.KakaoShare` 등이 양쪽에 있는지)
- [ ] 스토어 동영상: 아이폰 앱 미리보기와 같은 영상을 플레이 스토어(유튜브 링크)에도
- [ ] 두 스토어 설명이 다르면 같은 글로 맞추기 (TOP 20, 게임 이름: 문제 비·1분 도전·60문제 타임어택·풍선 팡팡·시간 버티기·참 거짓 스피드)
