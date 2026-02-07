# 익스텐션 ↔ 에이전트 통합 설계

## 1. 현재 구조 요약

### 익스텐션 (Extension)

| 기능 | 흐름 | API |
|------|------|-----|
| **Analyze Page** | 사이드패널 클릭 → content script 추출(`Extracted`) → 백그라운드 `postAnalyze(extracted)` | `POST /analyze` ✅ |
| **Chat** | 사용자 질문 → 백그라운드 `postChat({ question, analyze?, extracted? })` | `POST /chat` ❌ 미구현 |

- **캐시**: 탭별 `extractedCache`, `analyzeCache`, `chatCache` (히스토리)
- **타입**: `apps/extension/src/shared/types.ts` (Extracted, AnalyzeResult, ChatMessage, ChatResponse 등)

### 서버 (에이전트)

| 구성요소 | 역할 |
|----------|------|
| **POST /analyze** | `extracted` 수신 → `NormalizedProduct` 변환 → `agent/analyze` `runAnalyze()` → `AnalyzeResult` 반환 ✅ |
| **POST /chat** | 라우트 없음 (`routes/chat.ts` 비어 있음) ❌ |
| **orchestrator** | 질문 분류(price/review/spec/policy/general) → 해당 에이전트 병렬 실행 → 답변 합침 |
| **에이전트** | price, review, spec, policy, general (각각 `ChatPayload` 받아 `AgentAnswer` 반환) |

- **타입**: `server/src/types/api.ts` (ChatPayload, AgentAnswer, AgentCategory), `normalized.ts` (NormalizedProduct)

---

## 2. 갭 정리

1. **서버에 `/chat` 라우트 없음**  
   - 익스텐션은 이미 `POST /chat` 호출 준비됨. 서버만 구현하면 됨.

2. **페이로드 매핑**  
   - 익스텐션: `{ question, analyze?, extracted? }`  
   - 서버 `ChatPayload`: `{ question, normalized?, analyze? }`  
   → `/chat`에서 `extracted` 수신 시 `normalized`로 변환 후 `orchestrator.run(payload)` 호출.

3. **응답 형태**  
   - 익스텐션 기대: `ChatResponse = { message: ChatMessage }`, `ChatMessage = { role, content, citations? }`  
   - 오케스트레이터 반환: `{ content: string }`  
   → 라우트에서 `{ message: { role: "assistant", content } }` 형태로 감싸서 반환.

---

## 3. 통합 설계 (디자인)

### 3.1 아키텍처 다이어그램

```
[Extension Side Panel]
       │
       │ Analyze 클릭
       ▼
[Content Script] ── extractPage() ──► Extracted
       │
       │ EXTRACT_REQUEST / 응답
       ▼
[Background SW] ── postAnalyze(extracted) ──► POST /analyze
       │                                              │
       │                                              ▼
       │                                    [Server] routes/analyze
       │                                              │
       │                                    toNormalized(extracted)
       │                                              │
       │                                              ▼
       │                                    agent/analyze runAnalyze()
       │                                              │
       │◄──────────────── AnalyzeResult ──────────────┘
       │
       │ sendAnalyzeResult() → 사이드패널 UI

───────────────────────────────────────────────────────────────

[Extension Side Panel]  사용자 질문 입력
       │
       │ CHAT_SEND { tabId, question }
       ▼
[Background SW]  (캐시에서 analyze, extracted 조회)
       │
       │ postChat({ question, analyze?, extracted? })
       ▼
POST /chat  ──────────────────────────────────────────► [Server] routes/chat
       │                                                          │
       │                                                          │ extracted → normalized
       │                                                          │ ChatPayload = { question, normalized?, analyze? }
       │                                                          │
       │                                                          ▼
       │                                                agent/orchestrator run(payload)
       │                                                          │
       │                                                          │ classify(question)
       │                                                          │ → price / review / spec / policy / general
       │                                                          │
       │                                                          ▼
       │                                                [Agents] runPrice, runReview, runSpec, runPolicy, runGeneral
       │                                                          │
       │                                                          ▼
       │                                                { content } 합쳐서 반환
       │                                                          │
       │◄──────────── { message: { role: "assistant", content } } ─┘
       │
       │ sendChatResponse() → 사이드패널 UI
```

### 3.2 데이터 매핑

| 익스텐션 → 서버 | 서버 내부 |
|-----------------|-----------|
| `extracted` (Analyze 시) | `toNormalized()` → `NormalizedProduct` → `runAnalyze()` |
| `extracted` (Chat 시) | `toNormalized()` → `normalized` in `ChatPayload` |
| `analyze` (캐시된 AnalyzeResult) | `ChatPayload.analyze` 그대로 전달 |
| `question` | `ChatPayload.question` |

### 3.3 구현 체크리스트

- [x] **서버** `routes/chat.ts`: POST body 파싱, extracted → normalized 변환, `orchestrator.run(payload)` 호출, `{ message: { role: "assistant", content } }` 반환.
- [x] **서버** `index.ts`: `app.route("/chat", chatRoute)` 등록.
- [x] **서버** `lib/normalize.ts`: `toNormalized` / `ExtractedLike` 공통화. `analyze.ts`와 `chat.ts`에서 사용.

---

## 4. 이후 확장 시 고려사항

- **agent/chat/index.ts**: 현재는 “미구현” 스텁. 오케스트레이터가 이미 통합 채팅 역할을 하므로, 단일 “chat” 에이전트가 필요하면 여기에 로직 추가하거나 오케스트레이터에서 호출하도록 연결.
- **Citation**: 오케스트레이터/에이전트가 `citations`를 반환하도록 확장하면, 라우트에서 `message.citations`까지 채워서 익스텐션에 전달 가능.
- **에러/재시도**: 익스텐션 쪽 fallback(API 실패 시 짧은 메시지)은 유지하고, 서버는 4xx/5xx와 메시지로 구체적인 실패 사유 전달.

이 설계대로 `/chat` 라우트만 구현하면 익스텐션과 에이전트가 end-to-end로 연결된다.
