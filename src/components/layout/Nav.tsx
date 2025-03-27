"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Nav() {
  const pathname = usePathname();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.log("No session found");
        setIsAdminUser(false);
        setLoading(false);
        return;
      }
      
      console.log("Session found, user:", session.user.email);
      
      // 바로 admin@example.com 확인
      if (session.user.email === 'admin@example.com') {
        console.log("Admin email detected, setting as admin");
        setIsAdminUser(true);
        setLoading(false);
        return;
      }
      
      // user_roles 테이블 확인
      try {
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
          
        if (roleError) {
          console.error("Role check error:", roleError);
          setIsAdminUser(false);
        } else if (roleData && roleData.role === 'admin') {
          console.log("Admin role found in database");
          setIsAdminUser(true);
        } else {
          console.log("Not an admin role");
          setIsAdminUser(false);
        }
      } catch (err) {
        console.error("Error during role check:", err);
        setIsAdminUser(false);
      }
    } catch (err) {
      console.error("Session check error:", err);
      setIsAdminUser(false);
    } finally {
      setLoading(false);
    }
  };

  const isActive = (path: string) => {
    return pathname?.startsWith(path);
  };

  return (
    <nav className="px-4 py-6 space-y-1">
      <Link
        href="/dashboard"
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
          isActive("/dashboard")
            ? "bg-primary-50 text-primary-600"
            : "text-gray-900 hover:bg-gray-50"
        }`}
      >
        <svg
          className={`w-5 h-5 mr-3 ${
            isActive("/dashboard") ? "text-primary-500" : "text-gray-500"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
        대시보드
      </Link>
      <Link
        href="/projects"
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
          isActive("/projects")
            ? "bg-primary-50 text-primary-600"
            : "text-gray-900 hover:bg-gray-50"
        }`}
      >
        <svg
          className={`w-5 h-5 mr-3 ${
            isActive("/projects") ? "text-primary-500" : "text-gray-500"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
          />
        </svg>
        프로젝트
      </Link>
      <Link
        href="/templates"
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
          isActive("/templates")
            ? "bg-primary-50 text-primary-600"
            : "text-gray-900 hover:bg-gray-50"
        }`}
      >
        <svg
          className={`w-5 h-5 mr-3 ${
            isActive("/templates") ? "text-primary-500" : "text-gray-500"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
          />
        </svg>
        템플릿
      </Link>
      <Link
        href="/system-prompts"
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
          isActive("/system-prompts")
            ? "bg-primary-50 text-primary-600"
            : "text-gray-900 hover:bg-gray-50"
        }`}
      >
        <svg
          className={`w-5 h-5 mr-3 ${
            isActive("/system-prompts") ? "text-primary-500" : "text-gray-500"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
          />
        </svg>
        시스템 프롬프트
      </Link>
      <Link
        href="/prompt-test"
        className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
          isActive("/prompt-test")
            ? "bg-primary-50 text-primary-600"
            : "text-gray-900 hover:bg-gray-50"
        }`}
      >
        <svg
          className={`w-5 h-5 mr-3 ${
            isActive("/prompt-test") ? "text-primary-500" : "text-gray-500"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        프롬프트 테스터
      </Link>
      
      {isAdminUser && (
        <Link
          href="/admin"
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
            isActive("/admin")
              ? "bg-primary-50 text-primary-600"
              : "text-gray-900 hover:bg-gray-50"
          }`}
        >
          <svg
            className={`w-5 h-5 mr-3 ${
              isActive("/admin") ? "text-primary-500" : "text-gray-500"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          관리자
        </Link>
      )}
    </nav>
  );
}
