"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import { testDatabaseConnection } from "@/app/api/database/client";

interface ConnectionStatusProps {
  className?: string;
}

export function ConnectionStatus({ className }: ConnectionStatusProps) {
  const [status, setStatus] = useState<"loading" | "connected" | "error">("loading");
  const [message, setMessage] = useState<string>("");
  const [timestamp, setTimestamp] = useState<string>("");
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const checkConnection = async () => {
    setIsChecking(true);
    setStatus("loading");
    
    try {
      const result = await testDatabaseConnection();
      
      if (result.success) {
        setStatus("connected");
        setMessage(result.message ?? "데이터베이스 연결이 성공적으로 설정되었습니다.");
      } else {
        setStatus("error");
        setMessage(result.error ?? "알 수 없는 오류가 발생했습니다.");
      }
      
      setTimestamp(result.timestamp ?? new Date().toISOString());
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "데이터베이스 연결을 확인할 수 없습니다.");
      setTimestamp(new Date().toISOString());
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>데이터베이스 연결 상태</CardTitle>
          {status === "connected" ? (
            <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800">
              연결됨
            </Badge>
          ) : status === "error" ? (
            <Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border-red-200 dark:border-red-800">
              연결 오류
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800">
              확인 중...
            </Badge>
          )}
        </div>
        <CardDescription>
          데이터베이스 서버 연결 상태를 확인합니다
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status === "loading" ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : status === "connected" ? (
          <Alert variant="default" className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle>연결 성공</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>연결 오류</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        
        {timestamp && (
          <p className="text-xs text-muted-foreground mt-4">
            마지막 확인: {new Date(timestamp).toLocaleString()}
          </p>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full" 
          onClick={checkConnection}
          disabled={isChecking}
        >
          {isChecking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              확인 중...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              연결 상태 다시 확인
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
