# 구현 계획: 워크숍 Q&A 대기열 타이머 대시보드

> 기반 스펙: [.omc/specs/deep-interview-workshop-qa-dashboard.md](.omc/specs/deep-interview-workshop-qa-dashboard.md)
> Ambiguity: 8% (PASSED)
> 생성일: 2026-04-18

---

## 1. 아키텍처 한눈에

```
┌─────────────────────────────────────────────────────┐
│              단일 URL 대시보드 (Next.js)             │
│  ┌────────────────────────────────────────────────┐  │
│  │ [메인 3영역]                                    │  │
│  │  ① 현재 10분 타이머 (상단, 크게)                │  │
│  │  ② 현재 발표자 이름 + 질문 (중단)               │  │
│  │  ③ 대기열 리스트 (하단)                         │  │
│  │  [운영자 컨트롤 버튼들: 다음/쉬는시간/종료]     │  │
│  │ ────────────────────────────────────────────    │  │
│  │ [인라인 참가자 등록 폼: 이름 + 질문]            │  │
│  └────────────────────────────────────────────────┘  │
│                      ▲                               │
│                      │ Supabase Realtime             │
│                      ▼                               │
│  ┌────────────────────────────────────────────────┐  │
│  │ [쉬는 시간 모드] 전체를 덮는 게 아니라           │  │
│  │  중앙에 큰 "잠시 쉬는 시간" + 카운트다운        │  │
│  │  운영자 "재개" 버튼으로 메인 복귀               │  │
│  └────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                        │
                        ▼
              ┌─────────────────┐
              │    Supabase     │
              │  - sessions     │
              │  - queue_entries│
              │  - realtime sub │
              └─────────────────┘
```

## 2. 기술 스택

| 항목 | 선택 | 사유 |
|------|------|------|
| 프레임워크 | Next.js 15 (App Router) | 단일 페이지+SSR/CSR 모두 간단, Vercel 즉시 배포 |
| 언어 | TypeScript | 타입 안정성 |
| 스타일 | Tailwind CSS v4 | 미니멀 UI를 빠르게 |
| 폰트 | Pretendard (글로벌 규칙) | 한글 최적 |
| 백엔드 | Supabase (Postgres + Realtime) | 참가자 셀프 등록 + 실시간 큐 갱신 |
| 배포 | Vercel | Next.js 기본 |
| 패키지 매니저 | npm | 기본 |

## 3. 데이터 모델

### `sessions` 테이블
한 행사당 1 row. `mode`로 상태 머신 표현.

| 컬럼 | 타입 | 의미 |
|------|------|------|
| id | uuid PK | 세션 ID |
| created_at | timestamptz | 생성 시각 |
| mode | text | `idle` / `qa` / `break` |
| current_entry_id | uuid | 현재 발표 중인 QueueEntry (nullable) |
| timer_started_at | timestamptz | 타이머 시작 시각 (nullable) |
| timer_duration_sec | int | Q&A 기본 600초(10분) |
| break_duration_sec | int | 쉬는 시간 기본 600초 |

### `queue_entries` 테이블

| 컬럼 | 타입 | 의미 |
|------|------|------|
| id | uuid PK | 엔트리 ID |
| session_id | uuid FK | 세션 |
| name | text | 참가자 이름 |
| question | text | 질문 내용 |
| status | text | `waiting` / `current` / `done` / `skipped` |
| created_at | timestamptz | 등록 시각 (대기열 순서 결정) |
| started_at | timestamptz | Q&A 시작 시각 |
| ended_at | timestamptz | Q&A 종료 시각 |

### RLS 정책
인증 없이 공개 접근이 요구되므로 `public` read/write 허용 (스펙 전제).

## 4. 파일 구조 (최종 목표)

```
webinar-opeation/
├── app/
│   ├── layout.tsx             # Pretendard 폰트, 전역 레이아웃
│   ├── page.tsx               # 메인 대시보드 (클라이언트 컴포넌트)
│   ├── globals.css            # Tailwind + Pretendard
│   └── favicon.ico
├── components/
│   ├── TimerDisplay.tsx       # ① 카운트다운 (Q&A/break 공용)
│   ├── CurrentSpeaker.tsx     # ② 현재 이름+질문
│   ├── QueueList.tsx          # ③ 대기자 리스트
│   ├── RegisterForm.tsx       # 인라인 등록 폼
│   ├── BreakMode.tsx          # 중앙 큰 "쉬는 시간" 오버레이
│   └── OperatorControls.tsx   # 운영자 버튼 모음
├── lib/
│   ├── supabase.ts            # Supabase 클라이언트 싱글톤
│   ├── session.ts             # 세션 CRUD + 상태 전환 헬퍼
│   └── types.ts               # DB row 타입
├── .env.local                 # NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
├── .env.local.example
├── .gitignore
├── .obsidianignore            # node_modules, .next 등 (글로벌 규칙)
├── package.json
├── tailwind.config.ts
├── postcss.config.mjs
├── next.config.ts
├── tsconfig.json
└── README.md
```

## 5. 컴포넌트 설계

### `TimerDisplay`
- props: `startedAt: Date | null`, `durationSec: number`, `onZero?: () => void`
- 1초 interval로 남은 시간 계산
- 0 이하 → 빨간색 + 소리(간단 beep) + `onZero` 콜백
- 폰트 크기: `text-8xl md:text-9xl`, mono tabular-nums

### `CurrentSpeaker`
- props: `entry: QueueEntry | null`
- 이름(크게), 질문(본문 크기) 두 줄
- entry가 null이면 "대기 중" 플레이스홀더

### `QueueList`
- props: `entries: QueueEntry[]` (status='waiting' 만)
- 순서 번호 + 이름 + 질문 요약(첫 줄) 리스트
- 운영자 hover시 "삭제"/"위로" 버튼 노출 (MVP: 삭제만)

### `RegisterForm`
- 로컬 state로 name/question
- submit → `queue_entries` insert
- 입력 후 폼 리셋, 성공 토스트 간단히

### `BreakMode`
- mode='break'일 때 렌더
- 중앙 큰 "🍵 잠시 쉬는 시간" + 카운트다운
- 하단 "재개" 버튼 (운영자)
- 메인 레이아웃은 뒤에 흐릿하게 유지 (backdrop-blur)

### `OperatorControls`
- 상태별 버튼 세트
  - mode='idle': "첫 번째 대기자 시작"
  - mode='qa': "다음", "쉬는 시간", "현재 종료"
  - mode='break': "재개"
- 확인 모달 없이 즉시 실행 (운영자 전용 전제)

## 6. 상태 전이 (운영자 액션)

```
idle ──[첫 시작]──▶ qa(current=entry1, timer started)
qa ──[다음]──▶ qa(current=next, timer restarted, prev→done)
qa ──[쉬는시간]──▶ break(timer restarted with break duration)
qa ──[현재 종료]──▶ idle(current→done)
break ──[재개]──▶ qa(current 복원 OR idle로)
```

## 7. Realtime 구독

```ts
supabase.channel('session')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, handleSession)
  .on('postgres_changes', { event: '*', schema: 'public', table: 'queue_entries' }, handleEntries)
  .subscribe()
```

- 세션 row 변경 → mode/current 갱신
- queue_entries insert → 대기열 즉시 업데이트
- 타이머는 `timer_started_at` 기준으로 각 클라이언트가 로컬 계산 (서버 push 없이도 동기화됨)

## 8. 구현 순서 (단계별)

### Phase A: 스캐폴딩 (10분)
1. `npx create-next-app@latest . --typescript --tailwind --app --no-eslint --src-dir=false --turbopack` 변형으로 현재 폴더에 초기화 (이미 .omc/ 있으니 --yes 회피)
2. `npm i @supabase/supabase-js`
3. Pretendard 폰트 `app/layout.tsx`에 로드
4. `.env.local.example` 작성
5. `.obsidianignore`, `.gitignore` 정리

### Phase B: 데이터 레이어 (15분)
6. `lib/supabase.ts` — 클라이언트 싱글톤
7. `lib/types.ts` — Session, QueueEntry 타입
8. `lib/session.ts` — `getOrCreateSession()`, `startNext()`, `startBreak()`, `resume()`, `endCurrent()`, `addEntry()`, `deleteEntry()`

### Phase C: 컴포넌트 (40분)
9. `TimerDisplay`
10. `CurrentSpeaker`
11. `QueueList`
12. `RegisterForm`
13. `BreakMode`
14. `OperatorControls`

### Phase D: 대시보드 조립 (20분)
15. `app/page.tsx` — 상태 훅 + realtime 구독 + 3영역 + 인라인 폼 + break 오버레이

### Phase E: 검증 (15분)
16. `npm run dev` — 브라우저 수동 테스트 (등록, 다음, 쉬는시간, 재개)
17. `npm run build` — 프로덕션 빌드 에러 0
18. 간단한 README 작성 (배포 가이드)

## 9. 수동 작업 (Cowork) — 사용자가 병렬로

1. [ ] Supabase 프로젝트 생성 (webinar-qa, Seoul/Tokyo region)
2. [ ] SQL Editor에 스키마 + RLS 정책 실행 (문서 하단 SQL)
3. [ ] Project Settings → API에서 URL + anon key 복사
4. [ ] `.env.local` 에 붙여넣기 (제가 파일 스켈레톤 만들어 둠)
5. [ ] 로컬 `npm run dev` 확인 후 Vercel 배포

## 10. Acceptance Criteria 체크 (스펙 대응)

| # | 기준 | 어떻게 검증 |
|---|------|-------------|
| 1 | 단일 URL에서 모든 기능 | `app/page.tsx` 1 route |
| 2 | 참가자 셀프 등록 | `RegisterForm` + insert |
| 3 | 3영역 메인 | 그리드 레이아웃 |
| 4 | "다음" 버튼 동작 | `startNext()` 테스트 |
| 5 | 타이머 0에서 자동전환 X | `onZero`는 경고만 |
| 6 | 쉬는 시간 중앙 표시 | `BreakMode` 렌더 |
| 7 | 재개 버튼 | `resume()` |
| 8 | Realtime 큐 갱신 | 두 창에서 동시 확인 |
| 9 | Tailwind 미니멀 | 코드 리뷰 |
| 10 | Vercel 배포 | 배포 URL 확인 |

## 11. 리스크 & 완화

- **Pretendard 로딩 지연**: CDN + `font-display: swap`로 완화
- **다중 클라이언트 충돌**: 모든 쓰기는 UPSERT로 최종 승자 방식 (운영자는 보통 1명)
- **Realtime 끊김**: 페이지 로드 시 전체 fetch로 폴백 복구
- **RLS 공개**: 악용 없음 전제이지만, 프로덕션 내에서 URL을 현장에서만 배포

## 12. Supabase SQL (재현)

```sql
create table sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  mode text default 'idle',
  current_entry_id uuid,
  timer_started_at timestamptz,
  timer_duration_sec int default 600,
  break_duration_sec int default 600
);

create table queue_entries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  name text not null,
  question text not null,
  status text default 'waiting',
  created_at timestamptz default now(),
  started_at timestamptz,
  ended_at timestamptz
);

alter table sessions enable row level security;
alter table queue_entries enable row level security;

create policy "public read sessions" on sessions for select using (true);
create policy "public write sessions" on sessions for all using (true) with check (true);
create policy "public read queue" on queue_entries for select using (true);
create policy "public write queue" on queue_entries for all using (true) with check (true);

alter publication supabase_realtime add table sessions;
alter publication supabase_realtime add table queue_entries;
```

---

**다음 스텝:** 이 계획을 확인하신 뒤 계속 진행하면 Phase A(스캐폴딩)부터 시작합니다.
