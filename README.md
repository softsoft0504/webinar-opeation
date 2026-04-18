# webinar-opeation

이 repo는 워크숍 Q&A 대시보드를 "만드는 과정 그 자체"를 담아낸 기록물이다.
실제 강의 중, 회원가입부터 프로덕션 배포까지 **전 과정을 보이스 덤프 + AI 에이전트로만** 진행했다.

**Live:** https://webinar-qa-snowy.vercel.app
**Repo:** https://github.com/softsoft0504/webinar-opeation

---

## 이 프로젝트의 진짜 목적

실질적인 용도는 "워크숍 Q&A 대기열 관리 대시보드"를 만드는 것이지만,
**진짜 이유는 다음과 같은 워크플로우를 End-to-End 로 시연하는 것이다:**

1. **보이스 덤프 기반 바이브 코딩** - 기획서 없이, 말 그대로 음성으로 뱉은 생각 덩어리가 입력의 시작.
2. **OMC Deep Interview** - 보이스 덤프의 모호성을 소크라테스식 7라운드 문답으로 ambiguity 8%까지 수학적으로 낮춘 뒤 스펙 문서로 크리스탈화.
3. **Autopilot 파이프라인** - 스펙 → 구현 계획 → 6개 컴포넌트 + 세션 헬퍼 + 대시보드 조립 → 빌드 검증까지 단계별 자동 진행.
4. **Claude Browser Use / 에이전트 오케스트레이션** - 코드 한 줄 직접 타이핑하지 않고, 필요한 외부 서비스(Supabase, GitHub, Vercel) 연동도 에이전트가 브라우저/CLI로 수행.
5. **실 라이브 배포** - Supabase 회원가입·SQL 실행, GitHub repo 연결과 PAT 발급, Vercel 회원가입·환경변수 투입·배포까지 전부 실시간 진행.

즉, 이 repo는 "결과물"이라기보다는 "과정의 증거"에 가깝다.
`PLAN.md` 와 `.omc/specs/deep-interview-workshop-qa-dashboard.md` 안에 그 과정의 로그가 그대로 남아있다.

> 워크숍 컨텍스트에서 Q&A 운영 도구가 필요하다는 착상이 있었고, 그 실질적 필요를 재료 삼아 "이런 앱을 이렇게 만드는 흐름" 자체를 시연하는 데 사용되었다.

---

## 시연에 포함된 "직접 손 대지 않은" 단계들

| 단계 | 사용자가 한 일 | AI가 한 일 |
|------|--------------|-----------|
| 아이디어 수집 | 음성으로 "이런 거 만들고 싶다" 구술 | 음성 덤프를 이해·요약 |
| 요구사항 정제 | Deep Interview 문항에 답변만 | 7라운드 소크라테스식 질문 + ambiguity 스코어링 |
| 기술 스택 선택 | 추천 중 선택만 | Next.js + Tailwind + Supabase 조합 제안 |
| 계획 작성 | 한 번 훑어봄 | PLAN.md 생성 (아키텍처·파일 구조·상태 전이 포함) |
| 코드 작성 | 전혀 안 함 | 모든 컴포넌트·라이브러리·페이지 작성 |
| DB 설계 | SQL 실행만 | 스키마·RLS 정책·Realtime publication SQL 제공 |
| Supabase 가입 | 회원가입 + API 키 복사 | 가이드 제공, 키 연동 |
| GitHub push | PAT 발급·붙여넣기 | credential 저장, remote 설정, push |
| Vercel 배포 | 회원가입, 환경변수 붙여넣기, Deploy 클릭 | 단계별 브라우저 가이드 제공 |
| 버그 수정 | "이거 안 돼" 한마디 | 원인 분석 + 패치 + commit + push |

강의 청중은 "그래서 이거 진짜로 되나?"를 끝까지 지켜본다.
**대답은 위 Live URL에 있다.**

---

## 만들어진 앱 자체에 대해

워크숍이나 세미나 운영 중, 참가자가 줄을 서서 10분씩 Q&A를 받는 상황에 쓸 수 있는 단일 페이지 대시보드.

### 핵심 기능

- **단일 URL, 양방향**: 참가자와 운영자가 같은 페이지를 본다. 인증·권한 분리 없이 "악용 없음" 전제로 단순하게.
- **셀프 등록**: 참가자가 하단 인라인 폼에 이름·질문을 입력하면 바로 대기열에 추가.
- **10분 수동 타이머**: 0이 되어도 자동 전환하지 않음. 운영자가 "다음" / "쉬는 시간" / "현재 종료" 버튼으로 리듬 제어.
- **쉬는 시간 모드**: 중앙 큰 카운트다운으로 화면 덮기. 재개하면 원상태 복귀.
- **실시간 동기화**: Supabase Realtime. 이벤트 누락 시에도 mutation 직후 재fetch로 UI 즉시 갱신.
- **데모 모드**: `.env.local` 없이 실행 시 목업 데이터로 UI 만 확인 가능.

### 스택

Next.js 15 (App Router) / TypeScript / Tailwind v4 / Pretendard / Supabase / Vercel

### 파일 구조

```
app/               메인 페이지 + 레이아웃 + 전역 CSS
components/        Timer, CurrentSpeaker, QueueList, RegisterForm, BreakMode, OperatorControls
lib/               Supabase 클라이언트, 세션 헬퍼, 타입, 데모 모드
.omc/specs/        Deep interview 결과 스펙 (이 repo를 낳은 문서)
PLAN.md            구현 계획 (아키텍처·상태 전이·검증 기준)
```

---

## 재현하기

### 1. Supabase

[supabase.com](https://supabase.com)에서 새 프로젝트를 만들고 SQL Editor에 실행:

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

### 2. 환경변수

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

`.env.local.example` 참고.

### 3. 로컬 실행

```bash
npm install
npm run dev
```

### 4. 배포

Vercel에서 GitHub repo import → 위 환경변수 2개 추가 → Deploy.
이후 push 시 자동 재배포.

---

## 한계 / 의도적 단순화

- 인증 없음. 누구나 모든 버튼 누를 수 있음 (현장 운영 모델 전제).
- 단일 행사 세션. 여러 워크숍 동시 운영 불가.
- 타이머 자동 전환 없음. 실제 대화 흐름을 보고 운영자가 판단.

---

## 보안 리뷰 (에이전트 자체 점검)

배포 직후 `/security-review` 커맨드로 전수 검사를 실시했다. 이것도 시연의 일부다.

**결과: HIGH 등급 취약점 없음.**

- XSS: React 자동 이스케이프로 방어됨 (`dangerouslySetInnerHTML` 미사용)
- SQL Injection: Supabase SDK의 파라미터 바인딩으로 방어됨
- 비밀정보 노출: `.env.local` 은 `.gitignore` 등록됨. `anon key` 는 Supabase 설계상 공개되어도 되는 키
- 설계상 허용된 "누구나 삭제·조작 가능"은 "현장 URL만 공유·악용 없음 전제" 라는 스펙의 의도된 단순화

**단 한 가지 운영 주의사항**: 현재 RLS 정책은 "누구나 읽기/쓰기" 다. 이 URL이 외부(SNS, 검색 등)로 유출되면 외부인이 대기열을 조작할 수 있다. 워크숍이 끝나면:
1. Supabase 프로젝트를 일시 중지하거나
2. 재사용 계획이 있으면 "운영자만 쓰기 가능" 으로 RLS 정책을 좁히고 인증을 추가한다.

이번 일회성 워크숍 시연 목적에는 그대로 사용해도 문제없다.

---

## 참고

이 repo가 만들어진 과정이 궁금하다면:

- [`PLAN.md`](./PLAN.md) - 에이전트가 작성한 구현 계획 전문
- [`.omc/specs/deep-interview-workshop-qa-dashboard.md`](./.omc/specs/deep-interview-workshop-qa-dashboard.md) - Deep Interview 7라운드 전체 문답 + ambiguity 스코어 변화
- [oh-my-claudecode](https://github.com/bestwardone/oh-my-claudecode) - 사용된 Claude Code 오케스트레이션 프레임워크
