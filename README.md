# webinar-opeation

워크숍 Q&A 대기열 대시보드. 그런데 만들어진 과정이 본론이다.

**Live:** https://webinar-qa-snowy.vercel.app
**Repo:** https://github.com/softsoft0504/webinar-opeation

---

## 이 프로젝트의 진짜 목적

워크숍 현장에서 "AI 에이전트만으로 소프트웨어가 만들어지고, 배포되고, 돌아간다"를 보여주기 위해 만들어졌다.

- 입력은 **음성 덤프** (그냥 말로 뱉은 생각 덩어리)
- 요구사항 정리는 **OMC Deep Interview** (7라운드 소크라테스식 문답)
- 구현은 **Autopilot** (에이전트가 자동으로 스펙 → 계획 → 코드 → 빌드)
- 외부 서비스 연동(Supabase / GitHub / Vercel)도 모두 에이전트 가이드 기반
- 사람(강형석)은 **코드 한 줄도 직접 타이핑하지 않음**

그래서 이 repo는 "결과물"보다는 "과정의 증거"에 가깝다.

## 시연에서 사람이 한 일 / 에이전트가 한 일

| 단계 | 사람 | AI |
|------|------|-----|
| 아이디어 | 음성으로 구술 | 이해·요약 |
| 요구사항 | 질문에 답만 | 7라운드 문답 + ambiguity 점수 |
| 구현 | 안 함 | 전체 코드 작성 |
| DB 세팅 | SQL 붙여넣기 | 스키마·정책 SQL 생성 |
| 가입·키 발급 | 회원가입만 | 단계별 가이드 |
| Git push, 배포 | 토큰 붙여넣기, Deploy 클릭 | remote 설정, 문서화 |
| 버그 수정 | "이거 안 돼" | 원인 분석 + 패치 + commit |

## 만들어진 앱 (간단히)

- 참가자가 이름·질문을 **셀프 등록** → 대기열에 바로 추가
- 운영자가 **10분 타이머**를 수동 제어 (다음 / 쉬는 시간 / 종료)
- **쉬는 시간 모드**: 중앙에 큰 카운트다운
- 여러 화면 **실시간 동기화** (Supabase Realtime)

단일 페이지, 인증 없음, "현장 URL만 공유하고 악용 없다는 전제" 로 단순화되어 있다.

## 스택

Next.js 15 · TypeScript · Tailwind · Supabase · Vercel

## 재현하기

1. Supabase 새 프로젝트 만들고 SQL 실행 ([`PLAN.md`](./PLAN.md) 하단에 SQL 포함)
2. `.env.local` 에 URL + anon key 넣기
3. `npm install && npm run dev`
4. Vercel에 repo import + 환경변수 2개 넣고 Deploy

`.env.local` 없이 실행하면 **데모 모드**로 UI만 확인 가능.

## 보안

`/security-review` 결과 HIGH 취약점 없음. 설계상 RLS가 public read/write이므로 워크숍 끝나면 프로젝트 pause 권장.

## 더 깊이 보기

- [`PLAN.md`](./PLAN.md) - 아키텍처·파일 구조·상태 전이·SQL 스키마 전문
- [`.omc/specs/deep-interview-workshop-qa-dashboard.md`](./.omc/specs/deep-interview-workshop-qa-dashboard.md) - Deep Interview 7라운드 전체 문답 + ambiguity 점수 변화
- [oh-my-claudecode](https://github.com/bestwardone/oh-my-claudecode) - 사용된 오케스트레이션 프레임워크
