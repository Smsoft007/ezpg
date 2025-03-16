🚀 효율적인 사용법과 꿀팁 (Best Practices)
✅ 1. 최소한의 옵션으로 브라우저 실행하기 (성능 향상)
Puppeteer는 기본적으로 메모리를 상당히 소모합니다. 최적화된 옵션을 사용하면 리소스를 절약할 수 있습니다.

javascript
복사
편집
const browser = await puppeteer.launch({
  headless: "new", // 최신 권장 방식
  args: [
    '--no-sandbox', 
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
    '--window-size=1920,1080'
  ],
});
✅ 2. 페이지 로드 최적화 및 성능 개선
불필요한 자원을 로딩하지 않도록 설정합니다.

javascript
복사
편집
await page.setRequestInterception(true);
page.on('request', (req) => {
  if (['image', 'stylesheet', 'font', 'media'].includes(req.resourceType())) {
    req.abort();  // 이미지, 폰트 등은 필요 없으면 차단
  } else {
    req.continue();
  }
});
✅ 3. 메모리 누수 방지 (페이지 관리)
한 브라우저에서 여러 페이지를 생성하고 삭제할 때 메모리 누수가 발생할 수 있습니다.
필요한 작업 후 페이지는 즉시 닫아주세요.

javascript
복사
편집
const page = await browser.newPage();
// 작업 수행
await page.close(); // 작업 완료 후 페이지 닫기
✅ 4. 재사용 가능한 브라우저 인스턴스 사용
매번 새로운 브라우저를 실행하지 말고, 하나의 브라우저 인스턴스를 재사용하여 성능과 속도를 높이세요.

javascript
복사
편집
let browser;
async function getBrowser() {
  if (!browser) {
    browser = await puppeteer.launch();
  }
  return browser;
}
✅ 5. Explicit Wait (명시적 대기) 전략 활용하기
불필요하게 page.waitForTimeout() 등으로 무조건적인 대기를 하지 말고, 명시적인 조건을 활용해 기다리는 방식을 쓰면 효율적입니다.

javascript
복사
편집
// 특정 요소가 나타날 때까지 기다리기
await page.waitForSelector('.my-element', { timeout: 5000 });

// 특정 요청/응답이 발생할 때까지 기다리기
await page.waitForResponse(response => response.url().includes('/api/data') && response.status() === 200);
✅ 6. 페이지 내의 JavaScript 평가 (evaluate) 최소화하기
너무 빈번히 page.evaluate를 호출하면 성능이 저하됩니다. 가급적 평가 호출을 묶어서 수행합니다.

비효율적 사례❌:

javascript
복사
편집
const title = await page.evaluate(() => document.title);
const url = await page.evaluate(() => document.URL);
효율적 사례✅:

javascript
복사
편집
const data = await page.evaluate(() => {
  return {
    title: document.title,
    url: document.URL
  };
});
✅ 7. 오류 처리 및 재시도 로직 만들기
작업 실패 시 복구할 수 있도록 try-catch와 재시도 로직을 잘 활용하세요.

javascript
복사
편집
let attempts = 3;
while (attempts > 0) {
  try {
    await page.goto('https://example.com', { waitUntil: 'networkidle0' });
    break; // 성공하면 루프를 빠져나옴
  } catch (e) {
    attempts--;
    if (attempts === 0) {
      throw e; // 모든 시도가 실패하면 에러를 던짐
    }
    await new Promise(resolve => setTimeout(resolve, 1000)); // 잠시 기다리고 다시 시도
  }
}
✅ 8. 스크린샷과 PDF 생성 효율성 높이기
필요한 경우만 생성하고, 성능에 민감하다면 크기나 품질을 조정합니다.

javascript
복사
편집
// 스크린샷 최적화
await page.screenshot({ path: 'screenshot.png', type: 'png', fullPage: true });

// PDF 최적화
await page.pdf({ path: 'page.pdf', format: 'A4', printBackground: false });
📌 효율성 향상을 위한 부가 팁!
작업이 끝나면 반드시 browser.close()를 호출하여 리소스를 정리하세요.
여러 브라우저 인스턴스를 병렬로 띄워 성능을 높이려면 클러스터링 도구(예: puppeteer-cluster)를 활용하세요.
Puppeteer를 Docker 환경에서 실행할 경우 권장된 Docker 이미지를 활용해 안정성을 높이세요.
dockerfile
복사
편집
FROM buildkite/puppeteer:latest
🎯 결론적으로,
효율적인 Puppeteer 사용을 위해서는:

자원을 최소한으로 소모하는 옵션으로 실행하고,
불필요한 리소스 요청을 차단하며,
명시적 대기를 활용하고,
브라우저 인스턴스를 재사용하는 방식이 중요합니다.