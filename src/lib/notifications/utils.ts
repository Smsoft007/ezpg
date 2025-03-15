/**
 * 텔레그램 알림 관련 유틸리티 함수
 */

/**
 * 금액을 한국어 형식으로 포맷팅하는 함수
 * @param amount 포맷팅할 금액
 * @returns 포맷팅된 금액 문자열 (예: 1,234,567원)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    currencyDisplay: 'symbol',
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * 날짜를 한국어 형식으로 포맷팅하는 함수
 * @param date 포맷팅할 날짜
 * @param includeTime 시간 포함 여부
 * @returns 포맷팅된 날짜 문자열 (예: 2025. 3. 15. 또는 2025. 3. 15. 오전 11:26:17)
 */
export function formatDate(date: Date, includeTime: boolean = false): string {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  };
  
  if (includeTime) {
    options.hour = 'numeric';
    options.minute = 'numeric';
    options.second = 'numeric';
    options.hour12 = true;
  }
  
  return new Intl.DateTimeFormat('ko-KR', options).format(date);
}

/**
 * 객체를 텔레그램 메시지 형식의 문자열로 변환하는 함수
 * @param obj 변환할 객체
 * @param indent 들여쓰기 수준
 * @returns 포맷팅된 문자열
 */
export function formatObjectForMessage(obj: Record<string, any>, indent: number = 0): string {
  const indentStr = '  '.repeat(indent);
  
  return Object.entries(obj)
    .map(([key, value]) => {
      if (value === null || value === undefined) {
        return `${indentStr}${key}: 없음`;
      }
      
      if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        return `${indentStr}${key}:\n${formatObjectForMessage(value, indent + 1)}`;
      }
      
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return `${indentStr}${key}: []`;
        }
        
        return `${indentStr}${key}:\n${value.map(item => {
          if (typeof item === 'object' && item !== null) {
            return formatObjectForMessage(item, indent + 1);
          }
          return `${indentStr}  - ${item}`;
        }).join('\n')}`;
      }
      
      if (value instanceof Date) {
        return `${indentStr}${key}: ${formatDate(value, true)}`;
      }
      
      if (typeof value === 'number' && key.toLowerCase().includes('amount')) {
        return `${indentStr}${key}: ${formatCurrency(value)}`;
      }
      
      return `${indentStr}${key}: ${value}`;
    })
    .join('\n');
}

/**
 * 텔레그램 메시지에서 특수 문자를 이스케이프하는 함수
 * @param text 이스케이프할 텍스트
 * @returns 이스케이프된 텍스트
 */
export function escapeMarkdown(text: string): string {
  return text
    .replace(/_/g, '\\_')
    .replace(/\*/g, '\\*')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    .replace(/~/g, '\\~')
    .replace(/`/g, '\\`')
    .replace(/>/g, '\\>')
    .replace(/#/g, '\\#')
    .replace(/\+/g, '\\+')
    .replace(/-/g, '\\-')
    .replace(/=/g, '\\=')
    .replace(/\|/g, '\\|')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/\./g, '\\.')
    .replace(/!/g, '\\!');
}

/**
 * 텔레그램 메시지에서 HTML 태그를 이스케이프하는 함수
 * @param text 이스케이프할 텍스트
 * @returns 이스케이프된 텍스트
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 텔레그램 메시지 길이를 제한하는 함수
 * @param text 제한할 텍스트
 * @param maxLength 최대 길이 (기본값: 4096)
 * @returns 제한된 텍스트
 */
export function limitMessageLength(text: string, maxLength: number = 4096): string {
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - 3) + '...';
}
