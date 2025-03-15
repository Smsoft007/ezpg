import { Badge } from "@/components/ui/badge";
import { PaymentMethod } from "@/types/transaction";
import { CreditCard, Building, Wallet, Bitcoin, HelpCircle } from "lucide-react";

interface PaymentMethodBadgeProps {
  method: PaymentMethod;
  showIcon?: boolean;
}

export function PaymentMethodBadge({ method, showIcon = true }: PaymentMethodBadgeProps) {
  const getMethodInfo = (method: PaymentMethod) => {
    switch (method) {
      case "card":
        return {
          label: "신용카드",
          icon: <CreditCard className="h-3 w-3 mr-1" />,
          className: "bg-blue-50 text-blue-700 border-blue-200"
        };
      case "bank":
        return {
          label: "계좌이체",
          icon: <Building className="h-3 w-3 mr-1" />,
          className: "bg-green-50 text-green-700 border-green-200"
        };
      case "virtual":
        return {
          label: "가상계좌",
          icon: <Wallet className="h-3 w-3 mr-1" />,
          className: "bg-purple-50 text-purple-700 border-purple-200"
        };
      case "crypto":
        return {
          label: "암호화폐",
          icon: <Bitcoin className="h-3 w-3 mr-1" />,
          className: "bg-orange-50 text-orange-700 border-orange-200"
        };
      case "other":
        return {
          label: "기타",
          icon: <HelpCircle className="h-3 w-3 mr-1" />,
          className: "bg-gray-50 text-gray-700 border-gray-200"
        };
      default:
        return {
          label: method,
          icon: <HelpCircle className="h-3 w-3 mr-1" />,
          className: "bg-gray-50 text-gray-700 border-gray-200"
        };
    }
  };

  const { label, icon, className } = getMethodInfo(method);

  return (
    <Badge className={`flex items-center ${className}`}>
      {showIcon && icon}
      {label}
    </Badge>
  );
}
