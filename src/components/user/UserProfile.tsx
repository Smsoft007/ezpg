import React from 'react';
import { User } from '@/docs/interface/user';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface UserProfileProps {
  user: User;
  onEdit?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onEdit }) => {
  // 사용자 이니셜 생성 함수
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={user.profileImage} alt={user.userName} />
          <AvatarFallback>{getUserInitials(user.userName)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-xl">{user.userName}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
          <div className="mt-2">
            {user.adminYn === 'Y' ? (
              <Badge className="bg-blue-500">관리자</Badge>
            ) : (
              <Badge className="bg-green-500">가맹점</Badge>
            )}
            {user.status === 'active' ? (
              <Badge className="ml-2 bg-emerald-500">활성</Badge>
            ) : (
              <Badge className="ml-2 bg-red-500">비활성</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-500">사용자 ID</span>
            <span className="text-sm">{user.userId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-500">전화번호</span>
            <span className="text-sm">{user.phone || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-500">마지막 로그인</span>
            <span className="text-sm">{user.lastLoginAt || '-'}</span>
          </div>
          {user.adminYn !== 'Y' && user.merchantId && (
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">가맹점</span>
              <span className="text-sm">{user.merchantName || user.merchantId}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-500">가입일</span>
            <span className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
      {onEdit && (
        <CardFooter>
          <Button onClick={onEdit} className="w-full">프로필 수정</Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default UserProfile;
