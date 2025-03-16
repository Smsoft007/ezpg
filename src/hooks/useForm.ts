import { useState, useCallback, ChangeEvent, FormEvent } from 'react';

export type ValidationRule<T> = {
  validate: (value: any, formData: T) => boolean;
  message: string;
};

export type FieldRules<T> = {
  [K in keyof T]?: ValidationRule<T>[];
};

export type FormErrors<T> = {
  [K in keyof T]?: string;
};

/**
 * 폼 상태 및 유효성 검사를 관리하는 훅
 * 
 * @param initialValues - 폼의 초기 값
 * @param validationRules - 각 필드별 유효성 검사 규칙
 * @param onSubmit - 폼 제출 시 호출될 함수
 */
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationRules?: FieldRules<T>,
  onSubmit?: (values: T) => void | Promise<void>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 단일 필드 유효성 검사
  const validateField = useCallback(
    (name: keyof T, value: any) => {
      if (!validationRules || !validationRules[name]) return true;

      for (const rule of validationRules[name]!) {
        if (!rule.validate(value, values)) {
          setErrors((prev) => ({ ...prev, [name]: rule.message }));
          return false;
        }
      }

      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
      return true;
    },
    [validationRules, values]
  );

  // 모든 필드 유효성 검사
  const validateForm = useCallback(() => {
    if (!validationRules) return true;

    let isValid = true;
    const newErrors: FormErrors<T> = {};

    // 모든 필드에 대해 유효성 검사 규칙 적용
    for (const field in validationRules) {
      const fieldName = field as keyof T;
      const fieldRules = validationRules[fieldName];
      
      if (!fieldRules) continue;

      for (const rule of fieldRules) {
        if (!rule.validate(values[fieldName], values)) {
          newErrors[fieldName] = rule.message;
          isValid = false;
          break;
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  }, [validationRules, values]);

  // 입력값 변경 핸들러
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value, type } = e.target as HTMLInputElement;
      let fieldValue: any = value;

      // 체크박스인 경우 checked 속성 사용
      if (type === 'checkbox') {
        fieldValue = (e.target as HTMLInputElement).checked;
      }
      // 숫자 타입인 경우 숫자로 변환
      else if (type === 'number') {
        fieldValue = value === '' ? '' : Number(value);
      }

      setValues((prev) => ({ ...prev, [name]: fieldValue }));
      
      // 이미 터치된 필드인 경우 실시간으로 유효성 검사
      if (touched[name as keyof T]) {
        validateField(name as keyof T, fieldValue);
      }
    },
    [touched, validateField]
  );

  // 필드 터치 핸들러
  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      
      setTouched((prev) => ({ ...prev, [name]: true }));
      validateField(name as keyof T, value);
    },
    [validateField]
  );

  // 필드 값 수동 설정
  const setFieldValue = useCallback(
    (name: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  // 폼 제출 핸들러
  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      if (e) e.preventDefault();

      // 모든 필드를 터치 상태로 변경
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Record<keyof T, boolean>
      );
      setTouched(allTouched);

      const isValid = validateForm();
      if (!isValid || !onSubmit) return;

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, validateForm, values]
  );

  // 폼 리셋
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({} as Record<keyof T, boolean>);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    resetForm,
    validateForm,
    validateField,
  };
}
