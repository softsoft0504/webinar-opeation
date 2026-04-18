# webinar-opeation

워크숍에서 "회원가입부터 배포까지 전부 AI 에이전트로 시연" 한 흔적.
실용 목적은 Q&A 대기열 대시보드지만, 진짜 목적은 과정 그 자체다.

**Live:** https://webinar-qa-snowy.vercel.app

## 이 repo가 보여주는 것

- 음성으로 뱉은 아이디어 → Deep Interview로 스펙화 → Autopilot으로 구현 → 실배포
- 코드 한 줄도 직접 타이핑하지 않음
- Supabase·GitHub·Vercel 가입과 연동도 전부 에이전트 가이드로 진행

## 만든 것

참가자가 이름·질문을 셀프 등록하면 운영자가 10분씩 돌아가며 Q&A를 진행하는 단일 페이지 대시보드.
쉬는 시간 모드, 실시간 동기화 포함.

스택: Next.js + Supabase + Vercel

## 과정이 궁금하면

- [`PLAN.md`](./PLAN.md) - 구현 계획 전문
- [`.omc/specs/deep-interview-workshop-qa-dashboard.md`](./.omc/specs/deep-interview-workshop-qa-dashboard.md) - Deep Interview 7라운드 문답 전체
