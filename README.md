# Workshop Q&A Dashboard

4시간 워크숍·세미나에서 참가자 Q&A를 10분씩 돌아가며 운영하기 위한 단일 페이지 대시보드.
참가자는 이름과 질문을 셀프로 등록하고, 운영자는 타이머 · 다음 순서 · 쉬는 시간을 수동으로 제어한다.

**Live:** https://webinar-qa-snowy.vercel.app
**Repo:** https://github.com/softsoft0504/webinar-opeation

---

## 핵심 기능

- **단일 URL, 양방향**: 참가자도 운영자도 같은 페이지를 본다. 인증·권한 분리 없이 "악용 없음" 전제로 단순하게 유지.
- **셀프 등록**: 참가자는 페이지 하단 인라인 폼에서 이름 + 질문을 입력해 대기열에 바로 추가된다.
- **10분 수동 타이머**: 0이 되어도 자동 전환하지 않는다. 운영자가 "다음", "쉬는 시간", "현재 종료" 버튼으로 리듬을 제어한다.
- **쉬는 시간 모드**: 중앙에 큰 카운트다운을 덮어쓰고, 재개하면 이전 상태로 복귀한다.
- **실시간 동기화**: Supabase Realtime 구독으로 여러 창·기기에서 동시에 같은 상태를 본다. 실시간 이벤트 누락 시에도 mutation 직후 즉시 재fetch로 UI가 갱신된다.
- **데모 모드**: Supabase 환경변수 없이 로컬 실행 시 목업 데이터로 UI가 뜬다 (디자인 확인용).

---

## 스택

- **프레임워크**: Next.js 15 (App Router) + TypeScript
- **스타일**: Tailwind CSS v4, Pretendard 웹폰트
- **백엔드**: Supabase (Postgres + Realtime)
- **배포**: Vercel (GitHub push 자동 배포)

---

## 사용 방법

### 참가자
1. 공유된 URL 접속
2. 페이지 하단 폼에 이름·질문 입력 → **줄 서기**
3. 대기열 순서 기다리다 자기 차례 오면 운영자와 Q&A

### 운영자
- **첫 번째 대기자 시작** / **다음 →**: 다음 발표자로 전환, 10분 타이머 리셋
- **쉬는 시간**: 중앙에 큰 카운트다운 표시, 다른 UI 잠금
- **재개하기**: 쉬는 시간 종료
- **현재 종료**: 대기자 없을 때 현재 세션을 idle로
- 대기열 항목에 hover하면 **삭제** 버튼 나옴

---

## 로컬 실행

### 1. Supabase 준비

[supabase.com](https://supabase.com)에서 새 프로젝트 생성 후 SQL Editor에 아래 실행:

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

> **주의**: 위 정책은 "악용 없음 전제로 단순하게"라는 스펙 조건을 그대로 따른다. 프로덕션 공개 배포라면 RLS를 더 좁히거나 운영자 전용 쓰기 경로를 추가해야 한다.

### 2. 환경변수

```bash
cp .env.local.example .env.local
```

`.env.local`에 Supabase Project Settings → API 에서 복사한 값 붙여넣기:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 실행

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 (또는 3000이 점유 중이면 Next.js가 자동으로 다른 포트 사용).

환경변수 없이 실행하면 **Demo mode** 배지와 함께 목업 데이터가 표시된다.

### 4. 프로덕션 빌드

```bash
npm run build
npm start
```

---

## 배포 (Vercel)

1. Vercel Dashboard → **New Project** → GitHub에서 이 repo 선택
2. **Environment Variables** 섹션에 `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` 2개 추가 (Production + Preview + Development 모두 체크)
3. **Deploy**

이후 `git push` 할 때마다 자동 재배포된다.

---

## 파일 구조

```
webinar-opeation/
├── app/
│   ├── layout.tsx          # Pretendard 로드, 전역 레이아웃
│   ├── globals.css         # Tailwind v4 + 다크 테마 CSS 변수
│   └── page.tsx            # 메인 대시보드 (realtime 구독 + mutation 재fetch)
├── components/
│   ├── TimerDisplay.tsx    # 카운트다운 (Q&A / 쉬는 시간 공용)
│   ├── CurrentSpeaker.tsx  # 현재 발표자 이름 + 질문
│   ├── QueueList.tsx       # 대기자 리스트 (삭제 버튼 hover 노출)
│   ├── RegisterForm.tsx    # 참가자 셀프 등록 인라인 폼
│   ├── BreakMode.tsx       # 쉬는 시간 전체 오버레이
│   └── OperatorControls.tsx# 운영자 버튼들 (mode 별 다르게)
├── lib/
│   ├── supabase.ts         # Supabase 클라이언트 싱글톤
│   ├── session.ts          # 세션·대기열 CRUD, 상태 전이
│   ├── mock.ts             # 데모 모드 인메모리 상태
│   └── types.ts            # Session, QueueEntry 타입
├── .omc/specs/             # Deep interview 스펙 (이 repo를 만든 근거)
├── PLAN.md                 # 구현 계획 문서
└── README.md
```

---

## 데이터 모델

### `sessions`
행사당 한 row만 사용. 상태 머신은 `mode` 컬럼 (`idle` / `qa` / `break`).

| 컬럼 | 용도 |
|------|------|
| `mode` | 현재 상태 |
| `current_entry_id` | 지금 발표 중인 QueueEntry (nullable) |
| `timer_started_at` | 타이머 시작 시각. 각 클라이언트가 로컬에서 경과시간 계산 |
| `timer_duration_sec` / `break_duration_sec` | 기본 600초(10분) |

### `queue_entries`

| 컬럼 | 용도 |
|------|------|
| `status` | `waiting` / `current` / `done` / `skipped` |
| `created_at` | 대기열 순서 결정 |
| `started_at` / `ended_at` | 실제 Q&A 시작/종료 시각 |

타이머가 서버에서 push되지 않고 `timer_started_at` 기준으로 각 클라이언트가 로컬 계산하므로, 네트워크 끊김에도 타이머는 멈추지 않는다.

---

## 한계 / 의도적인 단순화

- **인증 없음**: 누구나 모든 버튼을 누를 수 있다. 워크숍 현장에서 URL만 공유하는 운영 모델 기준이다.
- **단일 행사 세션**: 여러 워크숍을 동시에 운영하지 못한다. 새 행사 시작 시 이전 `queue_entries` 를 Supabase에서 직접 정리하거나 새 `sessions` row를 만들어 사용하는 식으로 운영한다.
- **자동 타이머 전환 없음**: 타이머가 0이 되어도 스스로 다음으로 넘어가지 않는다. 운영자가 실제 대화 흐름을 보고 결정한다는 설계 의도.

---

## 개발 배경

이 프로젝트는 [oh-my-claudecode](https://github.com/AnthropicProject/oh-my-claudecode) 의 **Deep Interview → Autopilot** 파이프라인을 따라 만들어졌다. 요구사항은 7라운드 소크라테스식 문답으로 ambiguity 8% 까지 낮춘 뒤 스펙 파일로 크리스탈화되었고, 그 스펙이 Next.js 앱 구현으로 이어졌다. 전체 맥락은 `.omc/specs/deep-interview-workshop-qa-dashboard.md` 와 `PLAN.md` 에 남아있다.
