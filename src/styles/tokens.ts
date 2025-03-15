/**
 * 디자인 시스템 토큰
 * 
 * 이 파일은 애플리케이션 전체에서 사용되는 디자인 토큰을 정의합니다.
 * 색상, 간격, 테두리 반경 등의 디자인 값을 중앙에서 관리하여
 * 일관된 디자인을 유지하고 변경 사항을 쉽게 적용할 수 있도록 합니다.
 */

export const tokens = {
  colors: {
    primary: {
      main: 'emerald-500',
      hover: 'emerald-600',
      light: 'emerald-100',
      text: 'white'
    },
    secondary: {
      main: 'slate-400',
      hover: 'slate-500',
      light: 'slate-100',
      text: 'slate-900'
    },
    warning: {
      main: 'amber-500',
      hover: 'amber-600',
      light: 'amber-50',
      text: 'amber-900'
    },
    danger: {
      main: 'red-500',
      hover: 'red-600',
      light: 'red-50',
      text: 'white'
    },
    success: {
      main: 'emerald-500',
      hover: 'emerald-600',
      light: 'emerald-50',
      text: 'white'
    },
    info: {
      main: 'blue-500',
      hover: 'blue-600',
      light: 'blue-50',
      text: 'white'
    },
    background: {
      primary: 'white',
      secondary: 'gray-50',
      tertiary: 'gray-100'
    },
    text: {
      primary: 'gray-900',
      secondary: 'gray-600',
      muted: 'gray-400'
    },
    border: {
      light: 'gray-200',
      medium: 'gray-300',
      dark: 'gray-400'
    }
  },
  spacing: {
    xs: '0.5rem',  // 8px
    sm: '1rem',    // 16px
    md: '1.5rem',  // 24px
    lg: '2rem',    // 32px
    xl: '3rem',    // 48px
    '2xl': '4rem', // 64px
  },
  borderRadius: {
    sm: '0.25rem', // 4px
    md: '0.5rem',  // 8px
    lg: '1rem',    // 16px
    full: '9999px'
  },
  fontSizes: {
    xs: '0.75rem',  // 12px
    sm: '0.875rem', // 14px
    md: '1rem',     // 16px
    lg: '1.125rem', // 18px
    xl: '1.25rem',  // 20px
    '2xl': '1.5rem', // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  transitions: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms'
  }
};

/**
 * 디자인 토큰을 CSS 클래스로 변환하는 유틸리티 함수
 * 
 * @param type 토큰 타입 (예: 'colors', 'spacing')
 * @param key 토큰 키 (예: 'primary.main', 'md')
 * @returns 해당하는 Tailwind CSS 클래스
 */
export function getTokenClass(type: keyof typeof tokens, key: string): string {
  const parts = key.split('.');
  let value = tokens[type] as any;
  
  for (const part of parts) {
    if (!value[part]) return '';
    value = value[part];
  }
  
  if (typeof value !== 'string') return '';
  
  if (type === 'colors') {
    return value; // 이미 'emerald-500'과 같은 형태로 저장되어 있음
  }
  
  return value;
}

/**
 * 상태에 따른 배지 스타일 클래스를 반환하는 함수
 * 
 * @param status 상태 문자열 ('active', 'inactive', 'pending' 등)
 * @returns 해당 상태에 맞는 Tailwind CSS 클래스
 */
export function getStatusClasses(status: string): string {
  switch (status) {
    case 'active':
      return `bg-${tokens.colors.success.main} hover:bg-${tokens.colors.success.hover} text-${tokens.colors.success.text}`;
    case 'inactive':
      return `bg-${tokens.colors.secondary.main} hover:bg-${tokens.colors.secondary.hover} text-${tokens.colors.secondary.text}`;
    case 'pending':
      return `border border-${tokens.colors.warning.main} text-${tokens.colors.warning.main} hover:bg-${tokens.colors.warning.light}`;
    case 'error':
    case 'failed':
      return `bg-${tokens.colors.danger.main} hover:bg-${tokens.colors.danger.hover} text-${tokens.colors.danger.text}`;
    default:
      return `bg-${tokens.colors.info.main} hover:bg-${tokens.colors.info.hover} text-${tokens.colors.info.text}`;
  }
}
