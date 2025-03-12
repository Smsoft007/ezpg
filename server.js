const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

// 로그 디렉토리 생성
const LOG_DIR = path.join(__dirname, "logs");
const SERVER_LOG_DIR = path.join(LOG_DIR, "server");

if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

if (!fs.existsSync(SERVER_LOG_DIR)) {
  fs.mkdirSync(SERVER_LOG_DIR, { recursive: true });
}

// 로그 파일 경로
const SERVER_LOG_FILE = path.join(
  SERVER_LOG_DIR,
  `server_${new Date().toISOString().split("T")[0].replace(/-/g, "")}.log`,
);

// 로그 함수
function logToFile(message, data = null) {
  const timestamp = new Date().toISOString();
  let logMessage = `[${timestamp}] ${message}`;

  if (data) {
    logMessage += `\n데이터: ${JSON.stringify(data, null, 2)}`;
  }

  logMessage += "\n";

  try {
    fs.appendFileSync(SERVER_LOG_FILE, logMessage);
    console.log(logMessage);
  } catch (error) {
    console.error("로그 파일 기록 중 오류 발생:", error);
  }
}

// 서버 설정
const app = express();
const PORT = process.env.PORT || 4000;

// 미들웨어
app.use(cors());
app.use(bodyParser.json());

// 요청 로깅 미들웨어
app.use((req, res, next) => {
  const requestId = `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  req.requestId = requestId;

  logToFile(`요청 수신 [${requestId}]`, {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body,
    ip: req.ip,
  });

  // 응답 로깅
  const originalSend = res.send;
  res.send = function (body) {
    logToFile(`응답 전송 [${requestId}]`, {
      statusCode: res.statusCode,
      body: body,
    });
    return originalSend.call(this, body);
  };

  next();
});

// 테스트 사용자 데이터
const users = [
  {
    userId: "admin",
    password: "admin123",
    userName: "관리자",
    adminYn: "Y",
    lastLoginDt: new Date().toISOString(),
  },
  {
    userId: "merchant",
    password: "merchant123",
    userName: "가맹점",
    adminYn: "N",
    merchantId: "M001",
    merchantName: "테스트 가맹점",
    lastLoginDt: new Date().toISOString(),
  },
];

// 입금 내역 저장소
let deposits = [];

// 로그인 API
app.post("/api/login", (req, res) => {
  const { userId, password } = req.body;

  if (!userId || !password) {
    return res.status(400).json({
      resultCode: "1001",
      resultMsg: "아이디와 비밀번호를 입력해주세요.",
    });
  }

  const user = users.find((u) => u.userId === userId && u.password === password);

  if (!user) {
    return res.status(401).json({
      resultCode: "1002",
      resultMsg: "아이디 또는 비밀번호가 올바르지 않습니다.",
    });
  }

  // 비밀번호 제외하고 사용자 정보 반환
  const { password: _, ...userInfo } = user;
  userInfo.lastLoginDt = new Date().toISOString();

  return res.status(200).json({
    resultCode: "0000",
    resultMsg: "로그인 성공",
    userInfo,
    token: `dummy-token-for-${userId}`,
  });
});

// 입금 알림 API
app.post("/api/deposit", (req, res) => {
  const { merchantId, amount, txId, accountNumber, depositor } = req.body;

  if (!merchantId || !amount || !txId) {
    return res.status(400).json({
      resultCode: "1001",
      resultMsg: "필수 정보가 누락되었습니다.",
      requestId: req.requestId,
    });
  }

  const depositInfo = {
    requestId: req.requestId,
    merchantId,
    amount,
    txId,
    accountNumber: accountNumber || "Unknown",
    depositor: depositor || "Unknown",
    timestamp: new Date().toISOString(),
    status: "COMPLETED",
    processedAt: new Date().toISOString(),
  };

  // 입금 내역 저장
  deposits.push(depositInfo);

  // 텔레그램 알림 메시지 형식 (실제 발송은 구현되지 않음)
  const telegramMessage = `
    💰 입금 알림 💰
    -------------------
    🆔 요청 ID: ${depositInfo.requestId}
    🏢 가맹점: ${merchantId}
    💵 금액: ${amount}원
    🔢 계좌번호: ${depositInfo.accountNumber}
    👤 입금자: ${depositInfo.depositor}
    🕒 시간: ${depositInfo.timestamp}
    ✅ 처리 시간: ${depositInfo.processedAt}
    -------------------
  `;

  logToFile(`텔레그램 알림 메시지 [${req.requestId}]`, { message: telegramMessage });

  return res.status(200).json({
    resultCode: "0000",
    resultMsg: "입금 처리가 완료되었습니다.",
    depositInfo,
    requestId: req.requestId,
    processingTime: "10ms",
  });
});

// 입금 내역 조회 API
app.get("/api/deposits", (req, res) => {
  const { merchantId } = req.query;

  let filteredDeposits = deposits;

  // 가맹점 ID로 필터링
  if (merchantId) {
    filteredDeposits = deposits.filter((d) => d.merchantId === merchantId);
  }

  return res.status(200).json({
    resultCode: "0000",
    resultMsg: "입금 내역 조회 성공",
    deposits: filteredDeposits,
    total: filteredDeposits.length,
  });
});

// 입금 테스트 도구 페이지
app.get("/deposit-tester", (req, res) => {
  const html = `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>EzPG 입금 테스트 도구</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          color: #2563eb;
          border-bottom: 2px solid #e5e7eb;
          padding-bottom: 10px;
        }
        .form-group {
          margin-bottom: 15px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        input, select {
          width: 100%;
          padding: 8px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
        }
        button {
          background-color: #2563eb;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background-color: #1d4ed8;
        }
        .result {
          margin-top: 20px;
          padding: 15px;
          background-color: #f3f4f6;
          border-radius: 4px;
          white-space: pre-wrap;
        }
        .error {
          color: #dc2626;
        }
      </style>
    </head>
    <body>
      <h1>EzPG 입금 테스트 도구</h1>
      <p>이 페이지에서 입금 알림 API를 테스트할 수 있습니다.</p>
      
      <div class="form-group">
        <label for="endpoint">엔드포인트</label>
        <select id="endpoint">
          <option value="http://localhost:4000/api/deposit">테스트 서버 API</option>
          <option value="http://localhost:3000/api/deposit">Next.js API</option>
          <option value="http://localhost:3000/api/test-deposit">Next.js 테스트 API</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="merchantId">가맹점 ID</label>
        <input type="text" id="merchantId" value="M001">
      </div>
      
      <div class="form-group">
        <label for="amount">금액</label>
        <input type="number" id="amount" value="10000">
      </div>
      
      <div class="form-group">
        <label for="txId">거래 ID</label>
        <input type="text" id="txId" value="TX-${Date.now()}">
      </div>
      
      <div class="form-group">
        <label for="accountNumber">계좌번호</label>
        <input type="text" id="accountNumber" value="123-456-789">
      </div>
      
      <div class="form-group">
        <label for="depositor">입금자</label>
        <input type="text" id="depositor" value="홍길동">
      </div>
      
      <button id="sendBtn">입금 알림 전송</button>
      
      <div class="result" id="result">결과가 여기에 표시됩니다.</div>
      
      <script>
        document.getElementById('sendBtn').addEventListener('click', async () => {
          const endpoint = document.getElementById('endpoint').value;
          const merchantId = document.getElementById('merchantId').value;
          const amount = parseInt(document.getElementById('amount').value);
          const txId = document.getElementById('txId').value;
          const accountNumber = document.getElementById('accountNumber').value;
          const depositor = document.getElementById('depositor').value;
          
          const resultElement = document.getElementById('result');
          
          if (!merchantId || !amount || !txId) {
            resultElement.innerHTML = '<span class="error">필수 정보(가맹점 ID, 금액, 거래 ID)를 모두 입력해주세요.</span>';
            return;
          }
          
          try {
            resultElement.textContent = '요청 중...';
            
            const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'mkey': 'test-mkey',
                'mid': 'test-mid'
              },
              body: JSON.stringify({
                merchantId,
                amount,
                txId,
                accountNumber,
                depositor,
                timestamp: new Date().toISOString()
              })
            });
            
            const data = await response.json();
            resultElement.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            resultElement.innerHTML = '<span class="error">오류 발생: ' + error.message + '</span>';
          }
        });
        
        // 거래 ID 자동 생성
        document.getElementById('txId').value = 'TX-' + Date.now();
      </script>
    </body>
    </html>
  `;

  res.send(html);
});

// 서버 시작
app.listen(PORT, () => {
  logToFile(`서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});
