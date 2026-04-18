# Workshop Q&A Dashboard

4시간 워크숍 Q&A 운영을 위한 단일 웹 대시보드.
참가자가 셀프로 이름+질문을 등록하면 운영자가 10분씩 돌아가며 진행한다.

**Live:** https://webinar-qa-snowy.vercel.app

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS v4
- Supabase (Postgres + Realtime)
- Pretendard (웹폰트)

## 시작하기

### 1. Supabase 준비

[Supabase](https://supabase.com)에서 프로젝트를 만든 뒤 SQL Editor에서 실행:

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

### 2. 환경 변수

`.env.local.example` 를 복사해서 `.env.local` 로 두고 Supabase 키를 채운다:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. 실행

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속.

## 사용 방법

- **참가자**: 화면 하단 폼에서 이름+질문 입력 → "줄 서기"
- **운영자**:
  - `첫 번째 대기자 시작` / `다음 →`: 다음 발표자로 전환 + 10분 타이머 리셋
  - `쉬는 시간`: 중앙에 큰 쉬는 시간 타이머, 다른 화면 잠금
  - `재개하기`: 쉬는 시간 종료, 이전 상태로 복귀
  - `현재 종료`: 현재 발표를 종료하고 대기 상태로

## 배포

Vercel에 연결 후 환경변수 2개를 Project Settings에 등록하면 된다.

## 파일 구조

```
app/            메인 페이지 + 레이아웃
components/     6개 컴포넌트
lib/            Supabase 클라이언트, 세션 헬퍼, 타입
```
