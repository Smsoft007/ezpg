# IndeterminateCheckbox 컴포넌트

## 개요
`IndeterminateCheckbox` 컴포넌트는 기존 Shadcn UI의 `Checkbox` 컴포넌트를 확장하여 중간 상태(indeterminate)를 지원하도록 구현한 컴포넌트입니다. 이 컴포넌트는 주로 테이블에서 전체 선택/부분 선택 상태를 표시하는 데 사용됩니다.

## 사용 방법

```tsx
import { IndeterminateCheckbox } from "@/components/ui/indeterminate-checkbox";

// 기본 사용법
<IndeterminateCheckbox 
  checked={isChecked}
  onCheckedChange={handleChange}
/>

// 중간 상태 사용법
<IndeterminateCheckbox 
  checked={allChecked}
  indeterminate={someChecked && !allChecked}
  onCheckedChange={handleSelectAll}
  aria-label="모든 항목 선택"
/>
```

## Props

| 속성 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| checked | boolean | - | 체크박스의 선택 상태 |
| indeterminate | boolean | false | 중간 상태 여부 (일부 선택됨) |
| onCheckedChange | (checked: boolean) => void | - | 체크박스 상태 변경 시 호출되는 함수 |
| className | string | - | 추가 CSS 클래스 |
| disabled | boolean | false | 비활성화 여부 |

## 구현 세부 사항

이 컴포넌트는 Radix UI의 Checkbox 컴포넌트를 기반으로 하며, 중간 상태일 때는 체크 표시 대신 마이너스(-) 아이콘을 표시합니다. 이를 통해 테이블에서 일부 항목만 선택된 상태를 시각적으로 표현할 수 있습니다.

## 예시

```tsx
// 테이블 헤더에서의 사용 예시
<TableHead>
  <IndeterminateCheckbox 
    checked={allSelected}
    indeterminate={someSelected && !allSelected}
    onCheckedChange={handleSelectAll}
    aria-label="모든 항목 선택"
  />
</TableHead>

// 테이블 행에서의 사용 예시
<TableCell>
  <IndeterminateCheckbox 
    checked={selectedItems.includes(item.id)}
    onCheckedChange={(checked) => handleSelect(item.id, checked)}
    aria-label={`${item.name} 선택`}
  />
</TableCell>
```
