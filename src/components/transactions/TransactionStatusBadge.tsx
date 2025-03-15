import { Badge } from "@/components/ui/badge";
import { TransactionStatus } from "@/types/transaction";

interface TransactionStatusBadgeProps {
  status: TransactionStatus;
}

export function TransactionStatusBadge({ status }: TransactionStatusBadgeProps) {
  switch (status) {
    case "completed":
      return <Badge className="bg-green-100 text-green-800 border-green-300">완료</Badge>;
    case "pending":
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">대기중</Badge>;
    case "failed":
      return <Badge className="bg-red-100 text-red-800 border-red-300">실패</Badge>;
    case "cancelled":
      return <Badge className="bg-gray-100 text-gray-800 border-gray-300">취소됨</Badge>;
    case "refunded":
      return <Badge className="bg-blue-100 text-blue-800 border-blue-300">환불됨</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800 border-gray-300">{status}</Badge>;
  }
}
