
  // /app/utils/auth.ts
// 设置 session_id cookie
export const setSessionId = (sessionId: string) => {
  //清空原有的session
  document.cookie = `session_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
  if (typeof document === 'undefined') return;
  document.cookie = `session_id=${sessionId}; path=/`;
};

// 获取 session_id 从 cookie
export const getSessionId = () => {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('session_id='));
  return sessionCookie ? sessionCookie.trim().split('=')[1] : null;
};

export const validateAccess = (userid: string, verify: string) => {
  if (!userid) return false;
  // 将 URL 中的 userid 设置为 session_id
  setSessionId(userid);
  return true;
}

export const getUrlParams = () => {
  if (typeof window === 'undefined') return {};
  const urlParams = new URLSearchParams(window.location.search);
  return {
    userid: urlParams.get('userid'),
    verify: urlParams.get('verify'),
  };
};