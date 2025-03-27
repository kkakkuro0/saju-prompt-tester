"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from "@/lib/supabase";

// 아이콘 컴포넌트
const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
  </svg>
);

const ProjectIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
  </svg>
);

const TemplateIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"></path>
  </svg>
);

const SystemPromptIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"></path>
  </svg>
);

const PromptTestIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
  </svg>
);

const AdminIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
  </svg>
);

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState("/imgs/beak1.jpg");

  useEffect(() => {
    checkSession();
    
    // 랜덤 프로필 이미지 선택
    const images = [
      "/imgs/cheyoung1.jpg",
      "/imgs/beak1.jpg",
      "/imgs/julli1.jpg",
      "/imgs/gyujin1.webp",
      "/imgs/jijel1.jpg",
      "/imgs/yena1.jpg"
    ];
    setProfileImage(images[Math.floor(Math.random() * images.length)]);
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        
        // 관리자 확인
        if (session.user.email === 'admin@example.com') {
          setIsAdmin(true);
        } else {
          try {
            const { data } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .single();
              
            setIsAdmin(data?.role === 'admin');
          } catch (error) {
            console.error("Admin check error:", error);
          }
        }
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Session check error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const navigation = [
    { name: '대시보드', href: '/dashboard', icon: HomeIcon },
    { name: '프로젝트', href: '/projects', icon: ProjectIcon },
    { name: '템플릿', href: '/templates', icon: TemplateIcon },
    { name: '시스템 프롬프트', href: '/system-prompts', icon: SystemPromptIcon },
    { name: '프롬프트 테스터', href: '/prompt-test', icon: PromptTestIcon },
  ];

  const adminNavigation = [
    { name: '관리자', href: '/admin', icon: AdminIcon },
  ];

  const isActive = (path: string) => {
    return pathname?.startsWith(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 모바일 메뉴 */}
      <div className="lg:hidden">
        <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
          <div className="px-4 py-3 flex justify-between items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <div className="text-lg font-semibold text-gray-900">사주 프롬프트 테스터</div>
            <div className="relative w-8 h-8 rounded-full overflow-hidden">
              <Image
                src={profileImage}
                alt="Profile"
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>
          </div>
        </div>

        {/* 모바일 사이드바 */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={() => setIsMobileMenuOpen(false)}
            ></div>
            <div className="relative flex-1 flex flex-col max-w-xs w-full pt-5 pb-4 bg-white">
              <div className="px-4 flex items-center justify-between">
                <div className="text-xl font-bold text-gray-900">사주 프롬프트 테스터</div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mt-8 flex-1 h-0 overflow-y-auto">
                <nav className="px-2 space-y-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        isActive(item.href)
                          ? 'bg-purple-50 text-purple-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      } group flex items-center px-3 py-3 text-sm font-medium rounded-md`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon />
                      <span className="ml-3">{item.name}</span>
                    </Link>
                  ))}
                  
                  {isAdmin && adminNavigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        isActive(item.href)
                          ? 'bg-purple-50 text-purple-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      } group flex items-center px-3 py-3 text-sm font-medium rounded-md`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon />
                      <span className="ml-3">{item.name}</span>
                    </Link>
                  ))}
                </nav>
              </div>
              <div className="px-4 py-4 border-t border-gray-200">
                <div className="flex items-center">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
                    <Image
                      src={profileImage}
                      alt="Profile"
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    로그아웃
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 데스크톱 레이아웃 */}
      <div className="hidden lg:flex h-screen">
        {/* 사이드바 */}
        <div className="w-64 bg-white shadow-md flex flex-col">
          {/* 로고 */}
          <div className="h-16 flex items-center px-6 border-b border-gray-200">
            <div className="text-xl font-bold text-gray-900">사주 프롬프트 테스터</div>
          </div>
          
          {/* 네비게이션 */}
          <div className="flex-1 overflow-y-auto py-6">
            <nav className="px-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`${
                    isActive(item.href)
                      ? 'bg-purple-50 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  } group flex items-center px-3 py-3 text-sm font-medium rounded-md`}
                >
                  <item.icon />
                  <span className="ml-3">{item.name}</span>
                </Link>
              ))}
              
              {/* 관리자 메뉴 */}
              {isAdmin && (
                <div className="mt-8">
                  <div className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    관리자 메뉴
                  </div>
                  <div className="mt-2 space-y-2">
                    {adminNavigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`${
                          isActive(item.href)
                            ? 'bg-purple-50 text-purple-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        } group flex items-center px-3 py-3 text-sm font-medium rounded-md`}
                      >
                        <item.icon />
                        <span className="ml-3">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </nav>
          </div>
          
          {/* 프로필 영역 */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="relative w-10 h-10 rounded-full overflow-hidden">
                <Image
                  src={profileImage}
                  alt="Profile"
                  fill
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>
        
        {/* 메인 콘텐츠 */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <main className="py-6 px-8">
            {children}
          </main>
        </div>
      </div>
      
      {/* 모바일 메인 콘텐츠 */}
      <div className="lg:hidden pt-16 pb-6 px-4">
        <main>{children}</main>
      </div>
    </div>
  );
}
