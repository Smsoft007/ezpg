import React, { ReactNode } from 'react';
import { Button, ButtonProps } from './button';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  /**
   * 페이지 제목
   */
  title: string;
  
  /**
   * 페이지 설명 (선택사항)
   */
  description?: string;
  
  /**
   * 제목 옆에 표시할 아이콘 (선택사항)
   */
  icon?: LucideIcon;
  
  /**
   * 헤더 오른쪽에 표시할 액션 버튼 (선택사항)
   */
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: LucideIcon;
    variant?: ButtonProps['variant'];
  };
  
  /**
   * 추가 컨텐츠 (선택사항)
   */
  children?: ReactNode;
  
  /**
   * 추가 CSS 클래스 (선택사항)
   */
  className?: string;
}

/**
 * 페이지 헤더 컴포넌트
 * 
 * 모든 페이지 상단에 일관된 디자인의 헤더를 제공합니다.
 * 제목, 설명, 아이콘, 액션 버튼을 포함할 수 있습니다.
 */
export function PageHeader({
  title,
  description,
  icon: Icon,
  action,
  children,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 ${className}`}>
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          {Icon && <Icon className="h-8 w-8 text-primary" />}
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {children}
      </div>
      
      {action && (
        <div>
          {action.href ? (
            <a href={action.href}>
              <Button variant={action.variant || 'default'} className="flex items-center gap-2">
                {action.icon && <action.icon className="h-4 w-4" />}
                {action.label}
              </Button>
            </a>
          ) : (
            <Button 
              variant={action.variant || 'default'} 
              onClick={action.onClick}
              className="flex items-center gap-2"
            >
              {action.icon && <action.icon className="h-4 w-4" />}
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
