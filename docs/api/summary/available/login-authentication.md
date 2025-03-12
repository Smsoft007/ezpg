# 로그인 및 인증 관련 API (구현 완료)

## 개요

이 문서는 EzPG 전자결제 시스템의 로그인 및 인증 관련 API 중 현재 구현이 완료되어 사용 가능한 API들을 설명합니다.

## API 목록

| 순번 | API 명       | 설명          | 문서 위치                   | 구현 상태 |
| ---- | ------------ | ------------- | --------------------------- | --------- |
| 1    | 로그인 API   | 사용자 인증   | docs/api/additional-apis.md | 구현 완료 |
| 2    | OTP 인증 API | 구글 OTP 인증 | docs/api/additional-apis.md | 구현 완료 |

## API 상세 정보

### 1. 로그인 API

#### 기능 설명

- 사용자 ID와 비밀번호를 검증하여 인증을 수행합니다.
- 인증 성공 시 JWT 토큰을 발급합니다.
- OTP 인증은 선택 사항입니다.

#### 요청 정보

- URL: `/auth/login`
- Method: POST
- Content-Type: application/json

#### 요청 파라미터

```json
{
  "userId": "사용자 ID",
  "password": "비밀번호"
}
```

#### 응답 정보

```json
{
  "resultCode": "0000",
  "resultMsg": "성공",
  "token": "JWT 토큰",
  "userInfo": {
    "userId": "사용자 ID",
    "userName": "사용자 이름",
    "role": "사용자 권한"
  },
  "requireOtp": false
}
```

#### 테스트 코드 예시

```javascript
async function testLogin() {
  try {
    const response = await fetch(`${process.env.API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: process.env.MERCHANT_ID,
        password: process.env.MERCHANT_KEY,
      }),
    });

    const data = await response.json();
    console.log("로그인 결과:", data);

    return data;
  } catch (error) {
    console.error("로그인 테스트 오류:", error);
  }
}
```

### 2. OTP 인증 API

#### 기능 설명

- 구글 OTP 인증 코드를 검증합니다.
- 인증 성공 시 완전한 접근 권한이 부여된 JWT 토큰을 발급합니다.

#### 요청 정보

- URL: `/auth/verify-otp`
- Method: POST
- Content-Type: application/json

#### 요청 파라미터

```json
{
  "userId": "사용자 ID",
  "otpCode": "OTP 코드"
}
```

#### 응답 정보

```json
{
  "resultCode": "0000",
  "resultMsg": "성공",
  "token": "완전한 접근 권한이 부여된 JWT 토큰"
}
```

## 테스트 시나리오

### 로그인 및 OTP 인증 테스트

#### 테스트 목적

- 로그인 기능 검증
- 구글 OTP 인증 기능 검증

#### 테스트 단계

1. 로그인 페이지 접속
2. 사용자 ID/PW 입력 (ys1234/letsgo123)
3. 로그인 버튼 클릭
4. OTP 인증 화면 전환 확인
5. OTP 코드 입력
6. 인증 버튼 클릭
7. 대시보드 페이지 이동 확인

#### 예상 결과

- 올바른 ID/PW 입력 시 OTP 인증 화면으로 전환
- 올바른 OTP 코드 입력 시 대시보드로 이동
- 잘못된 ID/PW 또는 OTP 코드 입력 시 오류 메시지 표시
