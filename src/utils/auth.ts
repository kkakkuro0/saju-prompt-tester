// 간단한 임시 인증 솔루션

// 하드코딩된 어드민 계정
const ADMIN_USER = {
  id: 'admin-id',
  email: 'admin', 
  username: 'admin',
  role: 'admin'
};

// 세션 저장 키
const SESSION_KEY = 'app_session';
const USERS_KEY = 'app_users';

// 초기 사용자 설정 (처음 로드될 때만)
if (typeof window !== 'undefined' && !localStorage.getItem(USERS_KEY)) {
  localStorage.setItem(USERS_KEY, JSON.stringify([ADMIN_USER]));
}

export function setSession(user: any) {
  // 브라우저에서만 동작
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
}

export function getSession() {
  // 브라우저에서만 동작
  if (typeof window !== 'undefined') {
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      try {
        return JSON.parse(session);
      } catch (e) {
        return null;
      }
    }
  }
  return null;
}

export function clearSession() {
  // 브라우저에서만 동작
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}

export async function login(username: string, password: string) {
  if (typeof window === 'undefined') {
    return { success: false, error: '브라우저 환경에서만 로그인이 가능합니다' };
  }

  // 관리자 계정 확인
  if (username === 'admin' && password === 'admin!23') {
    setSession(ADMIN_USER);
    return { success: true, user: ADMIN_USER };
  }
  
  // 다른 사용자 확인
  const usersJson = localStorage.getItem(USERS_KEY);
  if (usersJson) {
    const users = JSON.parse(usersJson);
    const user = users.find((u: any) => u.email === username && u.password === password);
    
    if (user) {
      // 마지막 로그인 시간 업데이트
      user.last_sign_in_at = new Date().toISOString();
      
      // 사용자 목록 업데이트
      const updatedUsers = users.map((u: any) => 
        u.id === user.id ? user : u
      );
      
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      setSession(user);
      return { success: true, user };
    }
  }
  
  return { success: false, error: '아이디 또는 비밀번호가 올바르지 않습니다' };
}

export function isLoggedIn() {
  return getSession() !== null;
}

export function isAdmin() {
  const session = getSession();
  return session && session.role === 'admin';
}

export function logout() {
  clearSession();
}
