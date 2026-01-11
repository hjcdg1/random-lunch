# 당근 랜덤 런치 조 편성기

당근에서 매주 랜덤 런치를 하기 위한 최적의 조를 편성하는 Electron 데스크탑 애플리케이션입니다.

<img width="456" height="300" alt="image" src="https://github.com/user-attachments/assets/8947aa3e-d216-468e-85a8-f82fa6e5d181" />

<br>

## 주요 기능

### 지능형 조 편성 알고리즘

- **Simulated Annealing** 알고리즘 사용
- 과거 조 편성 이력을 기반으로 최대한 겹치지 않게 조 편성
- 약 100명 규모, 1분 내 최적화된 결과 제공
- 4명 기본 조 (3-5명 유연 대응)

### 조 편성 이력 관리

- 모든 조 편성 이력 자동 저장
- 과거 조 편성 이력 조회 및 상세 보기
- 파일 시스템 기반 영구 저장

### 매칭 수 확인

- 특정 구성원의 닉네임으로 검색
- 해당 구성원이 누구와 가장 많이 조 편성되었는지 확인
- 매칭 횟수를 내림차순으로 정렬하여 표시
- 과거 이력 기반 통계 제공

<br>

## 기술 스택

- **프레임워크**: Electron Forge
- **UI**: React + TypeScript
- **스타일링**: Tailwind CSS
- **알고리즘**: Simulated Annealing
- **빌드**: Webpack

<br>

## 개발 환경 설정

### 요구사항

- Node.js 18+ (LTS)
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 모드 실행
npm start

# 프로덕션 빌드
npm run build
```

### 코드 품질 검사

```bash
# 타입 검사
npm run type-check

# 린트 검사
npm run lint

# 린트 자동 수정
npm run lint:fix

# 포맷팅 검사
npm run format:check

# 포맷팅 자동 적용
npm run format

# 전체 검사 (타입 + 린트 + 포맷팅)
npm run check-all
```

### 데이터 관리

```bash
# 초기 데이터 적용 (2026.01.0까지 17번의 과거 조 편성 이력 적용)
npm run init-data

# 모든 데이터 삭제 (조 편성 이력, 엣지 가중치, 설정)
npm run clean-data
```

<br>

## 프로젝트 구조

```
random-lunch/
├── src/
│   ├── index.ts            # 메인 프로세스 진입점, IPC 핸들러
│   ├── preload.ts          # IPC 브릿지
│   ├── main/               # 메인 프로세스 로직
│   ├── renderer/           # React 렌더러 프로세스
│   ├── algorithm/          # 조 편성 알고리즘 (SA)
│   └── shared/             # 공유 타입 및 상수
├── scripts/                # 유틸리티 스크립트
│   ├── init-data.js        # 초기 데이터 적용
│   └── clean-data.js       # 모든 데이터 삭제
└── migration/              # 과거 데이터 마이그레이션
    ├── result/             # 초기 데이터 (과거 조 편성 이력)
    ├── migrate.js          # 마이그레이션 스크립트
    ├── HISTORIES.md        # 과거 조 편성 이력
    └── CURRENT_MEMBERS.md  # 현재 재직 구성원 목록
```

<br>

## 알고리즘 상세

### Simulated Annealing (모의 담금질)

1. **초기화**: 구성원을 랜덤으로 섞어 4명씩 그룹 생성
2. **반복**:
   - 두 그룹에서 멤버 1명씩 선택하여 swap
   - 새로운 해의 비용(엣지 가중치 합) 계산
   - 더 나은 해면 무조건 수용
   - 나쁜 해도 일정 확률로 수용 (지역 최적해 탈출)
3. **냉각**: 온도를 점진적으로 낮춤
4. **종료**: 최소 온도 도달 시 최적해 반환

### 비용 함수

- 각 그룹 내 모든 멤버 쌍의 엣지 가중치 합
- 엣지 가중치 = 과거에 같은 조였던 횟수
- **목표**: 전체 비용 최소화 (새로운 사람과 만나도록)

<br>

## 데이터 저장

### 파일 위치

- **macOS**: `~/Library/Application Support/당근 랜덤 런치 조 편성기/data/`
- **Windows**: `%APPDATA%/당근 랜덤 런치 조 편성기/data/`

### 파일 형식

**조 편성 이력** (`assignments/assignment-{timestamp}.json`):

```json
{
  "timestamp": 1704931200000,
  "participatingMembers": [1, 2, 3, ..., 90],
  "groups": [
    { "members": [1, 2, 3, 4] },
    { "members": [5, 6, 7, 8] },
    ...
  ],
  "edgeUpdates": [
    { "pair": "1-2", "incrementBy": 1 },
    ...
  ]
}
```

**엣지 가중치** (`edge-weights.json`):

```json
{
  "1-2": 3,
  "1-5": 1,
  "2-5": 2
}
```

**설정** (`settings.json`):

```json
{
  "theme": "system",
  "apiToken": "",
  "departmentName": ""
}
```
