# 이지페이 디자인 시스템 가이드

## 색상 시스템

### 주요 색상
- **Primary**: emerald-500 (#10b981) - 주요 버튼, 활성 상태 표시
- **Secondary**: slate-400 (#94a3b8) - 보조 버튼, 비활성 상태 표시
- **Warning**: amber-500 (#f59e0b) - 경고, 대기 상태 표시
- **Danger**: red-500 (#ef4444) - 오류, 삭제 버튼

### 상태 색상
- **활성 상태**: emerald-500 (#10b981)
- **비활성 상태**: slate-400 (#94a3b8)
- **대기 상태**: amber-500 (#f59e0b)
- **오류 상태**: red-500 (#ef4444)

## 컴포넌트 스타일 가이드

### 버튼
- **기본 버튼**: `<Button>텍스트</Button>`
- **아이콘 버튼**: `<Button><Icon className="h-4 w-4 mr-2" />텍스트</Button>`
- **아웃라인 버튼**: `<Button variant="outline">텍스트</Button>`
- **위험 버튼**: `<Button variant="destructive">텍스트</Button>`

### 배지
- **활성 배지**: `<Badge className="bg-emerald-500 hover:bg-emerald-600">활성</Badge>`
- **비활성 배지**: `<Badge variant="secondary" className="bg-slate-400 hover:bg-slate-500">비활성</Badge>`
- **대기 배지**: `<Badge variant="outline" className="border-amber-500 text-amber-500 hover:bg-amber-50">대기중</Badge>`

### 카드
- **기본 카드**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>제목</CardTitle>
    <CardDescription>설명</CardDescription>
  </CardHeader>
  <CardContent>
    내용
  </CardContent>
</Card>
```

### 테이블
- **기본 테이블**:
```tsx
<div className="rounded-md border">
  <Table>
    <TableHeader>
      <TableRow className="bg-muted/50">
        <TableHead>제목1</TableHead>
        <TableHead>제목2</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow className="hover:bg-muted/50 transition-colors">
        <TableCell>내용1</TableCell>
        <TableCell>내용2</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>
```

### 페이지네이션
```tsx
<Pagination>
  <PaginationContent>
    <PaginationItem>
      <PaginationPrevious 
        onClick={() => handlePageChange(page - 1)}
        className={page <= 1 ? "pointer-events-none opacity-50" : ""}
      />
    </PaginationItem>
    
    {/* 페이지 아이템들 */}
    
    <PaginationItem>
      <PaginationNext 
        onClick={() => handlePageChange(page + 1)}
        className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
      />
    </PaginationItem>
  </PaginationContent>
</Pagination>
```

## 레이아웃 가이드

### 페이지 헤더
```tsx
<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
  <div>
    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
      <Icon className="h-8 w-8 text-primary" />
      페이지 제목
    </h1>
    <p className="text-muted-foreground mt-1">
      페이지 설명
    </p>
  </div>
  <Button>주요 액션</Button>
</div>
```

### 섹션 헤더
```tsx
<div className="flex justify-between items-center mb-4">
  <h2 className="text-xl font-semibold tracking-tight">섹션 제목</h2>
  <Button variant="outline">보조 액션</Button>
</div>
```

### 그리드 레이아웃
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* 카드 또는 컴포넌트 */}
</div>
```

## 간격 시스템

- **xs**: 0.5rem (8px)
- **sm**: 1rem (16px)
- **md**: 1.5rem (24px)
- **lg**: 2rem (32px)
- **xl**: 3rem (48px)

## 반응형 디자인

- **모바일**: < 768px
- **태블릿**: 768px - 1024px
- **데스크톱**: > 1024px

```tsx
// 반응형 예시
<div className="flex flex-col md:flex-row">
  {/* 모바일에서는 세로, 태블릿 이상에서는 가로 */}
</div>
```
