/**
 * 더미 데이터 생성 및 삽입 유틸리티
 */
import { executeQuery, executeProcedure } from '@/db';
import { v4 as uuidv4 } from 'uuid';

// 더미 데이터 생성 타입
type DummyDataType = 'merchants' | 'users' | 'transactions' | 'settlements' | 'payments';

/**
 * 랜덤 날짜 생성 (최근 30일 이내)
 */
function getRandomDate(daysAgo = 30): Date {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  return date;
}

/**
 * 랜덤 금액 생성 (1만원 ~ 100만원)
 */
function getRandomAmount(): number {
  return Math.floor(Math.random() * 990000 + 10000);
}

/**
 * 랜덤 상태 생성
 */
function getRandomStatus<T extends string>(statuses: T[]): T {
  return statuses[Math.floor(Math.random() * statuses.length)];
}

/**
 * 더미 가맹점 데이터 생성
 * @param count 생성할 데이터 수
 */
async function createDummyMerchants(count: number): Promise<void> {
  const merchantTypes = ['개인', '법인', '개인사업자'];
  const businessTypes = ['쇼핑몰', '게임', '서비스', '콘텐츠', '기타'];
  
  for (let i = 0; i < count; i++) {
    const merchantId = `M${Date.now().toString().slice(-8)}${i}`;
    const merchantName = `테스트 가맹점 ${i + 1}`;
    const businessName = `${businessTypes[i % businessTypes.length]} 비즈니스`;
    const merchantType = merchantTypes[i % merchantTypes.length];
    const email = `merchant${i + 1}@example.com`;
    const phone = `010${Math.floor(1000 + Math.random() * 9000)}${Math.floor(1000 + Math.random() * 9000)}`;
    const createdAt = getRandomDate(60);
    const paymentFee = (Math.random() * 3 + 1).toFixed(2);
    const withdrawalFee = (Math.random() * 1 + 0.5).toFixed(2);
    
    try {
      await executeQuery(`
        INSERT INTO Merchants (
          merchantId, merchantName, businessName, merchantType, email, phone, 
          createdAt, status, paymentFee, withdrawalFee
        ) VALUES (
          @merchantId, @merchantName, @businessName, @merchantType, @email, @phone, 
          @createdAt, 'active', @paymentFee, @withdrawalFee
        )
      `, {
        merchantId, merchantName, businessName, merchantType, email, phone,
        createdAt, paymentFee, withdrawalFee
      });
      
      console.log(`더미 가맹점 생성 완료: ${merchantName}`);
    } catch (error) {
      console.error(`가맹점 ${merchantName} 생성 중 오류:`, error);
    }
  }
}

/**
 * 더미 사용자 데이터 생성
 * @param count 생성할 데이터 수
 */
async function createDummyUsers(count: number): Promise<void> {
  const roles = ['admin', 'merchant', 'user'];
  
  for (let i = 0; i < count; i++) {
    const userId = uuidv4();
    const userName = `테스트 사용자 ${i + 1}`;
    const email = `user${i + 1}@example.com`;
    const role = roles[i % roles.length];
    const createdAt = getRandomDate(90);
    const profileImage = i % 3 === 0 ? `https://randomuser.me/api/portraits/${i % 2 ? 'men' : 'women'}/${i % 10}.jpg` : null;
    
    try {
      await executeQuery(`
        INSERT INTO Users (
          userId, userName, email, role, createdAt, profileImage
        ) VALUES (
          @userId, @userName, @email, @role, @createdAt, @profileImage
        )
      `, {
        userId, userName, email, role, createdAt, profileImage
      });
      
      console.log(`더미 사용자 생성 완료: ${userName}`);
    } catch (error) {
      console.error(`사용자 ${userName} 생성 중 오류:`, error);
    }
  }
}

/**
 * 더미 거래 데이터 생성
 * @param count 생성할 데이터 수
 */
async function createDummyTransactions(count: number): Promise<void> {
  // 가맹점 ID 목록 조회
  const merchants = await executeQuery<{ merchantId: string }>('SELECT merchantId FROM Merchants');
  
  if (merchants.length === 0) {
    console.error('거래 데이터 생성을 위한 가맹점이 없습니다. 먼저 가맹점 데이터를 생성하세요.');
    return;
  }
  
  const paymentMethods = ['card', 'bank', 'virtual', 'phone'];
  const statuses = ['pending', 'completed', 'failed', 'refunded'];
  
  for (let i = 0; i < count; i++) {
    const transactionId = `T${Date.now().toString().slice(-8)}${i}`;
    const merchantId = merchants[i % merchants.length].merchantId;
    const amount = getRandomAmount();
    const fee = Math.floor(amount * 0.035);
    const netAmount = amount - fee;
    const paymentMethod = paymentMethods[i % paymentMethods.length];
    const status = getRandomStatus(statuses);
    const createdAt = getRandomDate(30);
    const completedAt = status === 'completed' || status === 'refunded' ? new Date(createdAt.getTime() + 1000 * 60 * 5) : null;
    
    try {
      await executeQuery(`
        INSERT INTO Transactions (
          transactionId, merchantId, amount, fee, netAmount, paymentMethod, 
          status, createdAt, completedAt
        ) VALUES (
          @transactionId, @merchantId, @amount, @fee, @netAmount, @paymentMethod, 
          @status, @createdAt, @completedAt
        )
      `, {
        transactionId, merchantId, amount, fee, netAmount, paymentMethod,
        status, createdAt, completedAt
      });
      
      console.log(`더미 거래 생성 완료: ${transactionId}`);
    } catch (error) {
      console.error(`거래 ${transactionId} 생성 중 오류:`, error);
    }
  }
}

/**
 * 더미 정산 데이터 생성
 * @param count 생성할 데이터 수
 */
async function createDummySettlements(count: number): Promise<void> {
  // 가맹점 ID 목록 조회
  const merchants = await executeQuery<{ merchantId: string }>('SELECT merchantId FROM Merchants');
  
  if (merchants.length === 0) {
    console.error('정산 데이터 생성을 위한 가맹점이 없습니다. 먼저 가맹점 데이터를 생성하세요.');
    return;
  }
  
  const statuses = ['pending', 'processing', 'completed', 'failed'];
  
  for (let i = 0; i < count; i++) {
    const settlementId = `S${Date.now().toString().slice(-8)}${i}`;
    const merchantId = merchants[i % merchants.length].merchantId;
    const amount = getRandomAmount() * 10;
    const fee = Math.floor(amount * 0.01);
    const netAmount = amount - fee;
    const status = getRandomStatus(statuses);
    const createdAt = getRandomDate(30);
    const completedAt = status === 'completed' ? new Date(createdAt.getTime() + 1000 * 60 * 60 * 24) : null;
    
    try {
      await executeQuery(`
        INSERT INTO Settlements (
          settlementId, merchantId, amount, fee, netAmount, 
          status, createdAt, completedAt
        ) VALUES (
          @settlementId, @merchantId, @amount, @fee, @netAmount, 
          @status, @createdAt, @completedAt
        )
      `, {
        settlementId, merchantId, amount, fee, netAmount,
        status, createdAt, completedAt
      });
      
      console.log(`더미 정산 생성 완료: ${settlementId}`);
    } catch (error) {
      console.error(`정산 ${settlementId} 생성 중 오류:`, error);
    }
  }
}

/**
 * 더미 결제 데이터 생성
 * @param count 생성할 데이터 수
 */
async function createDummyPayments(count: number): Promise<void> {
  // 가맹점 ID 목록 조회
  const merchants = await executeQuery<{ merchantId: string }>('SELECT merchantId FROM Merchants');
  
  if (merchants.length === 0) {
    console.error('결제 데이터 생성을 위한 가맹점이 없습니다. 먼저 가맹점 데이터를 생성하세요.');
    return;
  }
  
  const paymentMethods = ['card', 'bank', 'virtual', 'phone'];
  const statuses = ['pending', 'authorized', 'completed', 'failed', 'refunded'];
  const cardTypes = ['visa', 'mastercard', 'amex', 'discover', 'jcb'];
  
  for (let i = 0; i < count; i++) {
    const paymentId = `P${Date.now().toString().slice(-8)}${i}`;
    const merchantId = merchants[i % merchants.length].merchantId;
    const amount = getRandomAmount();
    const fee = Math.floor(amount * 0.035);
    const netAmount = amount - fee;
    const paymentMethod = paymentMethods[i % paymentMethods.length];
    const status = getRandomStatus(statuses);
    const createdAt = getRandomDate(30);
    const completedAt = status === 'completed' || status === 'refunded' ? new Date(createdAt.getTime() + 1000 * 60 * 5) : null;
    const cardType = paymentMethod === 'card' ? cardTypes[i % cardTypes.length] : null;
    const customerName = `고객 ${i + 1}`;
    const customerEmail = `customer${i + 1}@example.com`;
    
    try {
      await executeQuery(`
        INSERT INTO Payments (
          paymentId, merchantId, amount, fee, netAmount, paymentMethod, 
          status, createdAt, completedAt, cardType, customerName, customerEmail
        ) VALUES (
          @paymentId, @merchantId, @amount, @fee, @netAmount, @paymentMethod, 
          @status, @createdAt, @completedAt, @cardType, @customerName, @customerEmail
        )
      `, {
        paymentId, merchantId, amount, fee, netAmount, paymentMethod,
        status, createdAt, completedAt, cardType, customerName, customerEmail
      });
      
      console.log(`더미 결제 생성 완료: ${paymentId}`);
    } catch (error) {
      console.error(`결제 ${paymentId} 생성 중 오류:`, error);
    }
  }
}

/**
 * 더미 데이터 생성 함수
 * @param type 생성할 데이터 타입
 * @param count 생성할 데이터 수
 */
export async function generateDummyData(type: DummyDataType, count: number): Promise<void> {
  console.log(`${count}개의 ${type} 더미 데이터 생성 시작...`);
  
  switch (type) {
    case 'merchants':
      await createDummyMerchants(count);
      break;
    case 'users':
      await createDummyUsers(count);
      break;
    case 'transactions':
      await createDummyTransactions(count);
      break;
    case 'settlements':
      await createDummySettlements(count);
      break;
    case 'payments':
      await createDummyPayments(count);
      break;
    default:
      console.error('지원하지 않는 데이터 타입입니다.');
  }
  
  console.log(`${type} 더미 데이터 생성 완료!`);
}

/**
 * 모든 타입의 더미 데이터 생성
 * @param count 각 타입별 생성할 데이터 수
 */
export async function generateAllDummyData(count: number = 10): Promise<void> {
  console.log(`모든 타입의 더미 데이터 생성 시작 (각 ${count}개)...`);
  
  try {
    // 순서대로 생성 (의존성 고려)
    await createDummyMerchants(count);
    await createDummyUsers(count);
    await createDummyTransactions(count * 3);
    await createDummySettlements(count);
    await createDummyPayments(count * 5);
    
    console.log('모든 더미 데이터 생성 완료!');
  } catch (error) {
    console.error('더미 데이터 생성 중 오류:', error);
  }
}
