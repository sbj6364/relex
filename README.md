# relex

`relex`는 flex 사용자를 위한 비공식 근무시간 계산기입니다. 주간 잔여 근무시간과 오늘 출근 시간을 입력하면 “오늘 가장 빠른 퇴근 가능 시간”을 빠르게 계산합니다.

> Unofficial flex time helper. flex 공식 제품 또는 공식 연동 서비스가 아닙니다.

## 기능

- 오늘 가장 빠른 퇴근 가능 시간 계산
- 현재까지 인정 근무시간, 퇴근까지 남은 시간, 오늘 이후 예상 주간 잔여시간 표시
- 기본 점심시간 및 추가 휴게시간 반영
- 코어타임(기본 10:00-16:00) 충족 여부 안내
- 설정 localStorage 저장
- iPhone Safari “홈 화면에 추가”를 위한 기본 PWA manifest 및 iOS meta tag
- 계산 로직 Vitest 테스트

## 시작하기

```bash
npm install
npm run dev
```

## 테스트

```bash
npm test
npm run build
```

## Vercel 배포

Vercel에서 Application/Framework Preset은 `Vite`를 선택합니다. 기본 설정은 아래와 같습니다.

- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

앱 빌드용 TypeScript 설정은 `src/tests`를 제외하고, Vitest 설정은 `vitest.config.ts`로 분리되어 있습니다.

## 기술 스택

- Vite
- React
- TypeScript
- Tailwind CSS
- lucide-react
- Vitest

## 기본 근무 규칙

- 주간 목표 근무시간: 40시간
- 근무 가능 시간: 07:00-22:00
- 코어타임: 10:00-16:00
- 기본 휴게시간: 12:00-13:00
- 근무 요일: 월-금

## 개인정보

백엔드는 없으며 입력값과 설정은 브라우저 localStorage에만 저장됩니다. flex 로그인 정보나 민감한 HR 데이터를 요구하지 않습니다.
