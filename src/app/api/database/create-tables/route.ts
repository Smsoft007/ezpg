import { NextRequest, NextResponse } from 'next/server';
import { executeQuery, tableExists } from '@/db';

/**
 * 테이블 생성 쿼리 목록
 */
const CREATE_TABLE_QUERIES = {
  // 가맹점 테이블
  Merchants: `
    CREATE TABLE Merchants (
      merchantId VARCHAR(50) PRIMARY KEY,
      merchantName NVARCHAR(100) NOT NULL,
      businessName NVARCHAR(100) NOT NULL,
      merchantType VARCHAR(20) NOT NULL,
      email VARCHAR(100) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT GETDATE(),
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      paymentFee DECIMAL(5,2) NOT NULL DEFAULT 3.5,
      withdrawalFee DECIMAL(5,2) NOT NULL DEFAULT 1.0
    )
  `,
  
  // 사용자 테이블
  Users: `
    CREATE TABLE Users (
      userId VARCHAR(50) PRIMARY KEY,
      userName NVARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL,
      role VARCHAR(20) NOT NULL DEFAULT 'user',
      createdAt DATETIME NOT NULL DEFAULT GETDATE(),
      lastLogin DATETIME NULL,
      profileImage VARCHAR(255) NULL
    )
  `,
  
  // 거래 테이블
  Transactions: `
    CREATE TABLE Transactions (
      transactionId VARCHAR(50) PRIMARY KEY,
      merchantId VARCHAR(50) NOT NULL,
      amount DECIMAL(18,2) NOT NULL,
      fee DECIMAL(18,2) NOT NULL,
      netAmount DECIMAL(18,2) NOT NULL,
      paymentMethod VARCHAR(20) NOT NULL,
      status VARCHAR(20) NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT GETDATE(),
      completedAt DATETIME NULL,
      FOREIGN KEY (merchantId) REFERENCES Merchants(merchantId)
    )
  `,
  
  // 정산 테이블
  Settlements: `
    CREATE TABLE Settlements (
      settlementId VARCHAR(50) PRIMARY KEY,
      merchantId VARCHAR(50) NOT NULL,
      amount DECIMAL(18,2) NOT NULL,
      fee DECIMAL(18,2) NOT NULL,
      netAmount DECIMAL(18,2) NOT NULL,
      status VARCHAR(20) NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT GETDATE(),
      completedAt DATETIME NULL,
      FOREIGN KEY (merchantId) REFERENCES Merchants(merchantId)
    )
  `,
  
  // 결제 테이블
  Payments: `
    CREATE TABLE Payments (
      paymentId VARCHAR(50) PRIMARY KEY,
      merchantId VARCHAR(50) NOT NULL,
      amount DECIMAL(18,2) NOT NULL,
      fee DECIMAL(18,2) NOT NULL,
      netAmount DECIMAL(18,2) NOT NULL,
      paymentMethod VARCHAR(20) NOT NULL,
      status VARCHAR(20) NOT NULL,
      createdAt DATETIME NOT NULL DEFAULT GETDATE(),
      completedAt DATETIME NULL,
      cardType VARCHAR(20) NULL,
      customerName NVARCHAR(100) NULL,
      customerEmail VARCHAR(100) NULL,
      FOREIGN KEY (merchantId) REFERENCES Merchants(merchantId)
    )
  `,
  
  // 메뉴 테이블
  Menus: `
    CREATE TABLE Menus (
      menuId INT IDENTITY(1,1) PRIMARY KEY,
      parentId INT NULL,
      menuName NVARCHAR(100) NOT NULL,
      menuPath VARCHAR(255) NULL,
      menuIcon VARCHAR(50) NULL,
      menuOrder INT NOT NULL DEFAULT 0,
      isActive BIT NOT NULL DEFAULT 1,
      requiredRole VARCHAR(20) NULL,
      FOREIGN KEY (parentId) REFERENCES Menus(menuId)
    )
  `,
  
  // 알림 테이블
  Notifications: `
    CREATE TABLE Notifications (
      notificationId VARCHAR(50) PRIMARY KEY,
      userId VARCHAR(50) NOT NULL,
      title NVARCHAR(100) NOT NULL,
      message NVARCHAR(500) NOT NULL,
      type VARCHAR(20) NOT NULL,
      isRead BIT NOT NULL DEFAULT 0,
      createdAt DATETIME NOT NULL DEFAULT GETDATE(),
      FOREIGN KEY (userId) REFERENCES Users(userId)
    )
  `
} as const;

// 테이블 이름 타입 정의
type TableName = keyof typeof CREATE_TABLE_QUERIES;

/**
 * POST: 테이블 생성
 * 
 * 요청 본문 예시:
 * {
 *   "tables": ["Merchants", "Users"] // 생성할 테이블 이름 배열, 비어있으면 모든 테이블 생성
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tables = Object.keys(CREATE_TABLE_QUERIES) } = body;
    
    const results: Record<string, { created: boolean; message: string }> = {};
    
    // 요청된 테이블 생성
    for (const tableName of tables) {
      if (!CREATE_TABLE_QUERIES[tableName as TableName]) {
        results[tableName] = {
          created: false,
          message: '정의되지 않은 테이블입니다.'
        };
        continue;
      }
      
      // 테이블 존재 여부 확인
      const exists = await tableExists(tableName as TableName);
      if (exists) {
        results[tableName] = {
          created: false,
          message: '이미 존재하는 테이블입니다.'
        };
        continue;
      }
      
      try {
        // 테이블 생성
        await executeQuery(CREATE_TABLE_QUERIES[tableName as TableName]);
        results[tableName] = {
          created: true,
          message: '테이블이 성공적으로 생성되었습니다.'
        };
      } catch (error) {
        results[tableName] = {
          created: false,
          message: error instanceof Error ? error.message : '테이블 생성 중 오류가 발생했습니다.'
        };
      }
    }
    
    return NextResponse.json({
      success: Object.values(results).some(r => r.created),
      results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('테이블 생성 중 오류:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '테이블을 생성할 수 없습니다.',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
