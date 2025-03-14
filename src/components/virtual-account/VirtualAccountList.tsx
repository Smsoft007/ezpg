import React, { useState } from 'react';
import { VirtualAccount, Bank } from '@/docs/interface/virtual-account';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, Filter, ArrowUpDown, Download, Copy, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VirtualAccountListProps {
  virtualAccounts: VirtualAccount[];
  banks?: Bank[];
  isLoading?: boolean;
  onViewDetails?: (account: VirtualAccount) => void;
  onCreateAccount?: () => void;
  onCopyAccountNumber?: (accountNumber: string) => void;
}

export const VirtualAccountList: React.FC<VirtualAccountListProps> = ({
  virtualAccounts,
  banks,
  isLoading = false,
  onViewDetails,
  onCreateAccount,
  onCopyAccountNumber,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bankFilter, setBankFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof VirtualAccount>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // uac00uc0c1uacc4uc88c uc0c1ud0dcuc5d0 ub530ub978 ubc30uc9c0 uc0c9uc0c1 uc124uc815
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'suspended':
        return 'bg-red-500';
      case 'closed':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  // ub0a0uc9dc ud615uc2ddud654 ud568uc218
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  };

  // uc815ub82c ud568uc218
  const handleSort = (field: keyof VirtualAccount) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // uacc4uc88cubc88ud638 ubcf5uc0ac ud568uc218
  const handleCopyAccountNumber = (accountNumber: string) => {
    if (onCopyAccountNumber) {
      onCopyAccountNumber(accountNumber);
    } else {
      navigator.clipboard.writeText(accountNumber)
        .then(() => {
          alert('uacc4uc88cubc88ud638uac00 ubcf5uc0acub418uc5c8uc2b5ub2c8ub2e4.');
        })
        .catch((err) => {
          console.error('ubcf5uc0ac uc911 uc624ub958 ubc1cuc0dd:', err);
          alert('uacc4uc88cubc88ud638 ubcf5uc0acuc5d0 uc2e4ud328ud588uc2b5ub2c8ub2e4.');
        });
    }
  };

  // uc740ud589 uc774ub984 uac00uc838uc624uae30
  const getBankName = (bankCode: string) => {
    if (!banks) return bankCode;
    const bank = banks.find(b => b.bankCode === bankCode);
    return bank ? bank.bankName : bankCode;
  };

  // ud544ud130ub9c1ub41c uac00uc0c1uacc4uc88c ubaa9ub85d
  const filteredAccounts = virtualAccounts
    .filter((account) => {
      // uac80uc0c9uc5b4 ud544ud130ub9c1
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          account.accountNumber.toLowerCase().includes(searchLower) ||
          account.accountHolder.toLowerCase().includes(searchLower) ||
          account.merchantId.toLowerCase().includes(searchLower)
        );
      }
      return true;
    })
    .filter((account) => {
      // uc0c1ud0dc ud544ud130ub9c1
      if (statusFilter !== 'all') {
        return account.status === statusFilter;
      }
      return true;
    })
    .filter((account) => {
      // uc740ud589 ud544ud130ub9c1
      if (bankFilter !== 'all') {
        return account.bankCode === bankFilter;
      }
      return true;
    })
    .sort((a, b) => {
      // uc815ub82c
      if ((a[sortField] ?? '') < (b[sortField] ?? '')) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if ((a[sortField] ?? '') > (b[sortField] ?? '')) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle>uac00uc0c1uacc4uc88c uad00ub9ac</CardTitle>
            <CardDescription>ubaa8ub4e0 uac00uc0c1uacc4uc88cub97c ud655uc778ud558uace0 uad00ub9acud569ub2c8ub2e4.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              ub0b4ubcf4ub0b4uae30
            </Button>
            {onCreateAccount && (
              <Button className="flex items-center gap-2" onClick={onCreateAccount}>
                <Plus className="h-4 w-4" />
                uac00uc0c1uacc4uc88c uc0dduc131
              </Button>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="uacc4uc88cubc88ud638, uc608uae08uc8fc ub610ub294 uac00ub9f9uc810 ID uac80uc0c9..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="uc0c1ud0dc ud544ud130" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ubaa8ub4e0 uc0c1ud0dc</SelectItem>
                <SelectItem value="active">ud65cuc131</SelectItem>
                <SelectItem value="pending">ub300uae30uc911</SelectItem>
                <SelectItem value="suspended">uc815uc9c0ub428</SelectItem>
                <SelectItem value="closed">ud574uc9c0ub428</SelectItem>
              </SelectContent>
            </Select>

            {banks && banks.length > 0 && (
              <Select value={bankFilter} onValueChange={setBankFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="uc740ud589 ud544ud130" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ubaa8ub4e0 uc740ud589</SelectItem>
                  {banks.map((bank) => (
                    <SelectItem key={bank.bankCode} value={bank.bankCode}>
                      {bank.bankName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p>ub85cub529 uc911...</p>
          </div>
        ) : filteredAccounts.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <p>uac00uc0c1uacc4uc88cuac00 uc5c6uc2b5ub2c8ub2e4.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('bankCode')}>
                    <div className="flex items-center">
                      uc740ud589
                      {sortField === 'bankCode' && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('accountNumber')}>
                    <div className="flex items-center">
                      uacc4uc88cubc88ud638
                      {sortField === 'accountNumber' && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('accountHolder')}>
                    <div className="flex items-center">
                      uc608uae08uc8fc
                      {sortField === 'accountHolder' && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                    <div className="flex items-center">
                      uc0c1ud0dc
                      {sortField === 'status' && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('createdAt')}>
                    <div className="flex items-center">
                      uc0dduc131uc77c
                      {sortField === 'createdAt' && (
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">uc791uc5c5</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.map((account) => (
                  <TableRow key={account.accountId}>
                    <TableCell>{getBankName(account.bankCode)}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {account.accountNumber}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleCopyAccountNumber(account.accountNumber)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{account.accountHolder}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadgeColor(account.status)}>
                        {account.status === 'active' && 'ud65cuc131'}
                        {account.status === 'pending' && 'ub300uae30uc911'}
                        {account.status === 'suspended' && 'uc815uc9c0ub428'}
                        {account.status === 'closed' && 'ud574uc9c0ub428'}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(account.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails && onViewDetails(account)}
                      >
                        uc0c1uc138ubcf4uae30
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VirtualAccountList;
