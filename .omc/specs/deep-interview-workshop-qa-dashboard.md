# Deep Interview Spec: 워크숍 Q&A 대기열 타이머 대시보드

## Metadata
- Interview ID: di-2026-04-18-workshop-qa
- Rounds: 7
- Final Ambiguity Score: 8.0%
- Type: greenfield
- Generated: 2026-04-18
- Threshold: 20%
- Status: PASSED

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.95 | 0.40 | 0.38 |
| Constraint Clarity | 0.90 | 0.30 | 0.27 |
| Success Criteria | 0.90 | 0.30 | 0.27 |
| **Total Clarity** | | | **0.92** |
| **Ambiguity** | | | **0.08** |

## Goal
4시간 워크숍/세미나 동안 참가자가 셀프로 대기열에 등록하고, 운영자가 10분씩 돌아가며 Q&A를 진행하는 흐름을 한 화면에서 운영/공유하기 위한 단일 웹 대시보드. 운영자와 참가자가 같은 URL을 보며, 운영자가 모든 전환(다음 사람, 쉬는 시간, 재개)을 수동으로 제어한다.

## Constraints
- 단일 대시보드 URL: 운영자와 참가자가 같은 화면을 공유 (인증/권한 분리 없음, 악의적 조작 없다는 전제)
- 백엔드: Supabase (DB + 실시간 구독)
- 프론트: Next.js (App Router) + Tailwind CSS
- 디자인: 미니멀리즘, 심플
- 배포: Vercel (퍼블릭 URL)
- 1세션 = 1일 행사 단위 (4시간 운영, 영속 세션 관리 없음)
- 모바일에서도 동일 URL 접속 (참가자가 핸드폰에서 등록)

## Non-Goals
- 사용자 인증/로그인 시스템
- 참가자 권한 분리 (참가자도 이론상 대기열 조작 가능, 악용 안 한다는 전제)
- 자동 타이머 전환 (모든 전환은 운영자 수동 클릭)
- 이전 세션 기록/통계 기능
- 결제, 예약, 이메일 알림 등 부가 기능
- 다중 워크숍 병행 운영

## Acceptance Criteria
- [ ] 단일 URL에서 모든 기능이 동작한다 (별도 페이지 없음)
- [ ] 참가자가 이름 + 질문을 입력해 대기열에 등록할 수 있다 (인라인 폼)
- [ ] 대시보드 메인이 3영역으로 구성된다: (1) 현재 타이머, (2) 현재 발표자 이름+질문, (3) 대기열 리스트
- [ ] 운영자가 "다음" 버튼으로 다음 대기자로 전환할 수 있고, 10분 타이머가 리셋된다
- [ ] 10분 타이머가 0이 되어도 자동 전환하지 않고 경고(소리/색)만 한다
- [ ] 운영자가 "쉬는 시간" 버튼을 누르면 중앙에 큰 메시지 + 카운트다운 타이머가 표시된다
- [ ] 운영자가 쉬는 시간 종료 버튼을 누르면 원래 3영역 레이아웃으로 복귀한다
- [ ] Supabase 실시간 구독으로 참가자 등록 시 대기열이 즉시 갱신된다
- [ ] Tailwind 기반 미니멀 UI (불필요한 장식 없음)
- [ ] Vercel에 배포되어 공개 URL로 접근 가능하다

## Assumptions Exposed & Resolved
| Assumption | Challenge | Resolution |
|------------|-----------|------------|
| "줄을 선다"가 물리적 줄인지 앱 큐인지 | 둘 다 가능함을 제시 | 참가자 셀프 등록(이름+질문) 디지털 큐 |
| 운영자 전용 화면인지 공개 화면인지 | 3가지 옵션 제시 | 단일 대시보드 공유, 악용 없음 전제 |
| 참가자가 꼭 핸드폰에서 직접 등록해야 하는가 | Contrarian: 운영자 노트북만으로도 충분할 수 있음 | 참가자 직접 입력 필요 확정 → Supabase 도입 |
| 타이머 종료 시 자동 전환 | 자동/수동/하이브리드 3안 | 전부 운영자 수동 제어로 확정 |
| 참가자 등록 폼 위치 | 별도 URL/모달/인라인 3안 | Simplifier: 동일 URL 하단 인라인 폼 |
| 쉬는 시간 표현 방식 | 3가지 UI 안 제시 | 중앙 큰 표시 + 카운트다운 타이머 |

## Technical Context
- **Framework**: Next.js 15+ (App Router), TypeScript
- **Styling**: Tailwind CSS, Pretendard 폰트 (글로벌 규칙)
- **State/DB**: Supabase (Postgres + Realtime)
- **Deployment**: Vercel
- **단일 페이지 구조**: 메인 페이지 하나에 3영역 + 인라인 등록 폼 + 운영자 컨트롤 버튼 모두 포함

### Supabase 스키마 초안
```
sessions (id, created_at, current_entry_id, timer_started_at, timer_duration_sec, mode)
  mode: 'qa' | 'break' | 'idle'
queue_entries (id, session_id, name, question, status, created_at, started_at, ended_at)
  status: 'waiting' | 'current' | 'done' | 'skipped'
```

## Ontology (Key Entities)

| Entity | Type | Fields | Relationships |
|--------|------|--------|---------------|
| Session | core domain | id, mode, current_entry_id, timer_started_at, timer_duration | has many QueueEntry |
| QueueEntry | core domain | id, name, question, status, timestamps | belongs to Session |
| Participant | supporting | name (직접 입력) | creates QueueEntry |
| Operator | supporting | (인증 없음, 운영자 액션 = 컨트롤 버튼 클릭) | controls Session |
| Timer | supporting | duration, started_at, state | part of Session |
| Break | supporting | duration, started_at | Session.mode='break' |
| Dashboard | view | 3영역 레이아웃 + 인라인 폼 + 컨트롤 | renders Session |
| Question | value | text | field of QueueEntry |
| Supabase | infrastructure | realtime channel | persists Session/QueueEntry |

## Ontology Convergence

| Round | Entity Count | New | Changed | Stable | Stability Ratio |
|-------|-------------|-----|---------|--------|----------------|
| 1 | 7 | 7 | - | - | N/A |
| 2 | 8 | 1 (QueueEntry) | - | 7 | 87.5% |
| 3 | 8 | - | - | 8 | 100% |
| 4 | 9 | 1 (Supabase) | - | 8 | 89% |
| 5 | 9 | - | - | 9 | 100% |
| 6 | 9 | - | - | 9 | 100% |
| 7 | 9 | - | - | 9 | 100% |

Round 3 이후 도메인 모델이 안정화됨. Supabase(round 4)만 인프라 엔티티로 추가되었고 도메인 엔티티는 round 2부터 고정.

## Interview Transcript
<details>
<summary>Full Q&A (7 rounds)</summary>

### Round 1 — Goal Clarity
**Q:** 이 대시보드는 누구를 위해, 어디서 보여지는 화면인가요?
**A:** 하나의 대시보드이고 양쪽이 모두 사용. 참가자/운영자 모두 쓸 수 있고 참가자가 악용 안 한다는 전제로 간단히.
**Ambiguity:** 62.5%

### Round 2 — Goal Clarity (queue flow)
**Q:** 대기열에 사람이 올라가는 방식은? (물리적 줄 vs 앱 버튼)
**A:** 참가자 셀프 등록 (이름 + 질문)
**Ambiguity:** 53.5%

### Round 3 — Goal Clarity (timer flow)
**Q:** 10분 타이머가 0이 되면 어떻게? 쉬는 시간/서보기 모드는 누가 정해요?
**A:** 전부 운영자 수동 제어
**Ambiguity:** 46.5%

### Round 4 — Contrarian / Constraints
**Q:** 참가자가 자기 핸드폰에서 직접 줄 서야 할 필요가 사실 없다면?
**A:** 참가자 직접 입력 필요. Supabase 사용.
**Ambiguity:** 36.0%

### Round 5 — Success Criteria (layout)
**Q:** 메인에 보여야 하는 영역 조합은?
**A:** 3영역 (타이머/현재/대기열), 심플하고 미니멀하게
**Ambiguity:** 25.0%

### Round 6 — Simplifier / Success Criteria (form)
**Q:** 참가자 셀프 등록 폼은 어디에?
**A:** 동일 URL 하단에 인라인 폼
**Ambiguity:** 15.5%

### Round 7 — 마무리 (stack + break UI)
**Q1:** 스택 조합은?
**A1:** Next.js + Tailwind + Supabase
**Q2:** 쉬는 시간 UI?
**A2:** 중앙 큰 표시 + 카운트다운 타이머
**Ambiguity:** 8.0%

</details>
