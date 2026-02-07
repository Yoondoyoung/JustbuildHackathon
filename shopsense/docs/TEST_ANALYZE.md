# Analyze 플로우 테스트 방법

Analyze Page 버튼 → 페이지 데이터 추출 → 서버 analyze 에이전트 → 결과 + 추천 질문 표시까지 확인하는 방법입니다.

---

## 1. 사전 준비

- **Node.js** 설치됨
- **Chrome** (또는 Chromium 계열)
- (실제 LLM 쓰려면) **OpenAI API 키**  
  → 없으면 **목(mock) 모드**로 테스트 가능

---

## 2. 서버 실행

```bash
cd shopsense/apps/server
npm install   # 최초 1회
npm run dev
```

- 정상이면 `Server running at http://localhost:8787` 출력됩니다.

**OpenAI 없이 테스트하려면 (목 데이터):**

```bash
npm run dev:mock
```

- 이때는 `analyze` 에이전트가 LLM 대신 고정 문구를 반환합니다.

---

## 3. 익스텐션 빌드 & 로드

**빌드:**

```bash
cd shopsense/apps/extension
npm install   # 최초 1회
npm run build
```

- `dist/` 폴더가 생깁니다.

**Chrome에 로드:**

1. Chrome 주소창에 `chrome://extensions` 입력
2. 우측 상단 **개발자 모드** 켜기
3. **압축 해제된 확장 프로그램을 로드합니다** 클릭
4. `shopsense/apps/extension/dist` 폴더 선택

코드 수정 후에는 다시 `npm run build` 하고, `chrome://extensions`에서 해당 익스텐션의 **새로고침** 버튼 클릭하면 됩니다.

---

## 4. 테스트 순서

1. **상품 페이지 열기**  
   - 예: Amazon, Walmart, Best Buy 상품 페이지  
   - **그 탭이 현재 포커스된 탭**이어야 합니다.

2. **사이드패널 열기**  
   - Chrome 툴바에서 **ShopSense 아이콘** 클릭  
   - 또는 확장 프로그램 목록에서 ShopSense 옆 **사이드 패널** 사용

3. **(Auth 사용 시)** 로그인  
   - 로그인 화면이 나오면 로그인 후 메인 화면으로 진행

4. **Analyze Page 클릭**  
   - 버튼 한 번 누르기

5. **확인할 것**  
   - 상태 문구: `Extracting page data...` → `Calling analyze API...` → `Analyze completed`  
   - 패널에 **제목, 요약, 가격/평점/리뷰 수**(있으면), **Key points**, **Specs**(있으면)  
   - 맨 아래 **Suggested questions** 섹션에 추천 질문 3개

---

## 5. 문제 해결

| 증상 | 확인할 것 |
|------|------------|
| "Analyze API failed" / "using fallback" | 서버가 `http://localhost:8787`에서 떠 있는지, 익스텐션 `apiClient`의 기본 주소가 `http://localhost:8787`인지 확인 |
| 아무 반응 없음 | 개발자 도구 → 해당 탭 또는 Service Worker에서 에러 메시지 확인 |
| 추출이 안 됨 | 상품 페이지가 **현재 탭**인지, 해당 사이트가 content script 허용 URL인지 확인 (manifest는 `<all_urls>`라 대부분 가능) |
| LLM 에러 (dev 시) | `.env`에 `OPENAI_API_KEY` 설정, 또는 `npm run dev:mock`으로 목 테스트 |

---

## 6. 한 줄 요약

```text
터미널1: cd shopsense/apps/server && npm run dev
터미널2: cd shopsense/apps/extension && npm run build
Chrome: chrome://extensions → dist 로드 → 상품 페이지 열기 → 아이콘 클릭 → Analyze Page
```
