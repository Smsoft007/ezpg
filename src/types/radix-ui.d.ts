declare module '@radix-ui/react-dropdown-menu' {
  import * as React from 'react';

  // Root
  export const Root: React.FC<{
    children?: React.ReactNode;
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
  }>;

  // Trigger
  export const Trigger: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLButtonElement> & React.RefAttributes<HTMLButtonElement>
  >;

  // Portal
  export const Portal: React.FC<{
    children?: React.ReactNode;
    container?: HTMLElement;
  }>;

  // Content
  export const Content: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & {
      align?: 'start' | 'center' | 'end';
      sideOffset?: number;
      alignOffset?: number;
      avoidCollisions?: boolean;
    } & React.RefAttributes<HTMLDivElement>
  >;

  // Item
  export const Item: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & {
      disabled?: boolean;
      onSelect?: (event: Event) => void;
    } & React.RefAttributes<HTMLDivElement>
  >;

  // CheckboxItem
  export const CheckboxItem: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & {
      checked?: boolean;
      onCheckedChange?: (checked: boolean) => void;
      disabled?: boolean;
    } & React.RefAttributes<HTMLDivElement>
  >;

  // RadioGroup
  export const RadioGroup: React.FC<{
    value?: string;
    onValueChange?: (value: string) => void;
    children?: React.ReactNode;
  }>;

  // RadioItem
  export const RadioItem: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & {
      value: string;
      disabled?: boolean;
    } & React.RefAttributes<HTMLDivElement>
  >;

  // Label
  export const Label: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
  >;

  // Separator
  export const Separator: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>
  >;

  // Sub components
  export const Sub: React.FC<{
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    children?: React.ReactNode;
  }>;

  export const SubTrigger: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & {
      disabled?: boolean;
    } & React.RefAttributes<HTMLDivElement>
  >;

  export const SubContent: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLDivElement> & {
      sideOffset?: number;
      alignOffset?: number;
      avoidCollisions?: boolean;
    } & React.RefAttributes<HTMLDivElement>
  >;

  // ItemIndicator
  export const ItemIndicator: React.ForwardRefExoticComponent<
    React.HTMLAttributes<HTMLSpanElement> & {
      forceMount?: boolean;
    } & React.RefAttributes<HTMLSpanElement>
  >;
}
