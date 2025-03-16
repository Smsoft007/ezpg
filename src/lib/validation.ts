import { ValidationRule } from "@/hooks/useForm";

/**
 * 공통 유효성 검사 규칙 모음
 */
export const validation = {
  /**
   * 필수 입력 필드 검사
   */
  required: <T>(message = '필수 입력 항목입니다.'): ValidationRule<T> => ({
    validate: (value) => {
      if (value === undefined || value === null) return false;
      if (typeof value === 'string') return value.trim() !== '';
      if (typeof value === 'number') return true;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    },
    message,
  }),

  /**
   * 최소 길이 검사
   */
  minLength: <T>(length: number, message?: string): ValidationRule<T> => ({
    validate: (value) => {
      if (typeof value !== 'string') return true;
      return value.length >= length;
    },
    message: message || `최소 ${length}자 이상 입력해주세요.`,
  }),

  /**
   * 최대 길이 검사
   */
  maxLength: <T>(length: number, message?: string): ValidationRule<T> => ({
    validate: (value) => {
      if (typeof value !== 'string') return true;
      return value.length <= length;
    },
    message: message || `최대 ${length}자 이내로 입력해주세요.`,
  }),

  /**
   * 이메일 형식 검사
   */
  email: <T>(message = '올바른 이메일 형식이 아닙니다.'): ValidationRule<T> => ({
    validate: (value) => {
      if (typeof value !== 'string' || value === '') return true;
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return pattern.test(value);
    },
    message,
  }),

  /**
   * 숫자 범위 검사
   */
  numberRange: <T>(min: number, max: number, message?: string): ValidationRule<T> => ({
    validate: (value) => {
      if (typeof value !== 'number') return true;
      return value >= min && value <= max;
    },
    message: message || `${min}에서 ${max} 사이의 값을 입력해주세요.`,
  }),
  
  /**
   * 패턴 검사
   */
  pattern: <T>(pattern: RegExp, message: string): ValidationRule<T> => ({
    validate: (value) => {
      if (typeof value !== 'string' || value === '') return true;
      return pattern.test(value);
    },
    message,
  }),

  /**
   * 전화번호 형식 검사
   */
  phone: <T>(message = '올바른 전화번호 형식이 아닙니다.'): ValidationRule<T> => ({
    validate: (value) => {
      if (typeof value !== 'string' || value === '') return true;
      // 한국 전화번호 패턴 (- 포함 또는 미포함)
      const pattern = /^(01[016789]|02|0[3-9]{1}[0-9]{1})-?[0-9]{3,4}-?[0-9]{4}$/;
      return pattern.test(value);
    },
    message,
  }),

  /**
   * 사업자등록번호 형식 검사
   */
  businessNumber: <T>(message = '올바른 사업자등록번호 형식이 아닙니다.'): ValidationRule<T> => ({
    validate: (value) => {
      if (typeof value !== 'string' || value === '') return true;
      // 사업자등록번호 패턴 (- 포함 또는 미포함)
      const pattern = /^[0-9]{3}-?[0-9]{2}-?[0-9]{5}$/;
      return pattern.test(value);
    },
    message,
  }),

  /**
   * 날짜 유효성 검사
   */
  date: <T>(message = '올바른 날짜 형식이 아닙니다.'): ValidationRule<T> => ({
    validate: (value) => {
      if (typeof value !== 'string' || value === '') return true;
      const date = new Date(value);
      return !isNaN(date.getTime());
    },
    message,
  }),

  /**
   * 두 필드 일치 검사
   */
  match: <T>(fieldToMatch: keyof T, message?: string): ValidationRule<T> => ({
    validate: (value, formData) => {
      return value === formData[fieldToMatch];
    },
    message: message || '입력된 값이 일치하지 않습니다.',
  }),

  /**
   * 사용자 정의 검증 함수
   */
  custom: <T>(validateFn: (value: any, formData: T) => boolean, message: string): ValidationRule<T> => ({
    validate: validateFn,
    message,
  }),
};
