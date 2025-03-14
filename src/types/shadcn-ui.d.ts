// 이 파일은 Shadcn UI 컴포넌트에 대한 타입 선언을 제공합니다.

declare module '@/components/ui/badge' {
  import * as React from 'react';
  import { VariantProps } from 'class-variance-authority';
  
  const badgeVariants: (props?: any) => string;
  
  export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
      VariantProps<typeof badgeVariants> {}
  
  export const Badge: React.FC<BadgeProps>;
  export { badgeVariants };
}

declare module '@/components/ui/table' {
  import * as React from 'react';
  
  export const Table: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLTableElement> & React.RefAttributes<HTMLTableElement>>;
  export const TableHeader: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLTableSectionElement> & React.RefAttributes<HTMLTableSectionElement>>;
  export const TableBody: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLTableSectionElement> & React.RefAttributes<HTMLTableSectionElement>>;
  export const TableFooter: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLTableSectionElement> & React.RefAttributes<HTMLTableSectionElement>>;
  export const TableHead: React.ForwardRefExoticComponent<React.ThHTMLAttributes<HTMLTableCellElement> & React.RefAttributes<HTMLTableCellElement>>;
  export const TableRow: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLTableRowElement> & React.RefAttributes<HTMLTableRowElement>>;
  export const TableCell: React.ForwardRefExoticComponent<React.TdHTMLAttributes<HTMLTableCellElement> & React.RefAttributes<HTMLTableCellElement>>;
  export const TableCaption: React.ForwardRefExoticComponent<React.HTMLAttributes<HTMLTableCaptionElement> & React.RefAttributes<HTMLTableCaptionElement>>;
}

declare module '@/components/ui/switch' {
  import * as React from 'react';
  import * as SwitchPrimitives from '@radix-ui/react-switch';
  
  export const Switch: React.ForwardRefExoticComponent<
    React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> & React.RefAttributes<React.ElementRef<typeof SwitchPrimitives.Root>>
  >;
}

declare module '@/components/ui/textarea' {
  import * as React from 'react';
  
  export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}
  
  export const Textarea: React.ForwardRefExoticComponent<
    TextareaProps & React.RefAttributes<HTMLTextAreaElement>
  >;
}
