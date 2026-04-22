# ShortENT · 짧은 엔트리

![image](https://github.com/user-attachments/assets/dcc744cb-ae2f-4fae-92e8-ff00580b749f)

[엔트리.org](https://xn--oy2b95t44j.org/) — 엔트리(playentry.org) 전용 단축 URL 생성 서비스

엔트리 작품, 마이페이지, 월드, 노하우&팁 링크의 긴 주소를 기억하기 쉬운 짧은 주소로 변환합니다.

```
https://playentry.org/project/67d8e0749f2115a5e11d284f
           ↓
https://엔트리.org/민게임
```

## 주요 기능

- **4가지 분류 지원** — 엔트리 작품 / 마이페이지 / 월드 / 노하우&팁
- **한글 별명** — 입력된 한글은 Punycode(`xn--...`)로 변환해 Firestore에 저장, 표시·공유는 한글 그대로
- **쿼리 파라미터 자동 제거** — `?sort=created&term=all` 같은 URL 파라미터가 붙어도 정상 처리
- **마이페이지 서브탭 정규화** — `/profile/.../project`, `/following` 등 하위 경로를 기본 프로필 URL로 정리
- **의심 주소 경고** — 저장된 id가 엔트리 id 패턴이 아닐 경우 이동 전 경고 화면 표시

## 동작 방식

1. 사용자가 원본 URL과 별명을 입력 → 분류 라디오에 맞춰 URL 형식 검증
2. 한글 별명은 `punycode.toASCII()`로 변환한 뒤 Firestore `EntWork/{별명}` 문서로 저장
3. 단축 주소 접속 시 path를 `decodeURIComponent` → `punycode.toASCII` 정규화하여 Firestore 조회
4. 저장된 `type`·`id` 조합으로 원본 URL을 재구성해 리다이렉트

## 기술 스택

- HTML / CSS / JavaScript (바닐라)
- jQuery, Bootstrap 5
- [punycode.js](https://github.com/mathiasbynens/punycode.js) 2.3.1
- Firebase — Firestore(저장소), Hosting(배포)

## 프로젝트 구조

```
.
├── public/              # Firebase Hosting 배포 대상
│   ├── index.html       # 메인 페이지 UI
│   ├── main.js          # URL 검증, Firestore 읽기/쓰기, 리다이렉트
│   ├── style.css        # 엔트리 스타일 디자인 토큰
│   └── apikey.js        # Firebase 설정 (gitignore)
├── firestore.rules      # Firestore 보안 규칙
├── firestore.indexes.json
├── firebase.json        # Hosting·Firestore 배포 설정
└── .firebaserc
```

## 로컬 개발

Firebase Emulator 사용 (Firebase SDK의 `/__/firebase/...` 경로까지 서빙):

```bash
npx firebase-tools emulators:start --only hosting
# → http://localhost:5000
```

> 단순 정적 서버(http-server 등)로는 Firebase SDK가 로드되지 않습니다.

## 배포

```bash
npx firebase-tools login
npx firebase-tools deploy --only hosting          # 호스팅만
npx firebase-tools deploy                         # 호스팅 + Firestore 규칙
```

롤백:

```bash
npx firebase-tools hosting:rollback
```

## Firestore 스키마

컬렉션: `EntWork`, 문서 ID: 별명(Punycode 정규화)

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | string | 엔트리 리소스 id (20~30자 영숫자) |
| `type` | string | `project` / `profile` / `world` / `tips` |
| `time` | string | ISO 8601 생성 시각 |

보안 규칙: 누구나 읽기 가능, 생성은 필수 필드·타입 검증 통과 시만 허용, 수정·삭제 불가.

## 면책

본 서비스는 엔트리([playentry.org](https://playentry.org/)) 공식 서비스가 아닙니다. 서비스 이용과 관련하여 사용자에게 발생한 손해에 대하여 책임을 지지 않습니다.

## 참고

- [개발 일지](https://xn--vj5bn0ab83a.com/Firebase-JavaScript-HTML-URL-11a5b696de7b801d9330e9ce6c62acd7)
- [LICENSE](LICENSE)
