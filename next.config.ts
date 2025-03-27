/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // 경고는 허용하되 빌드는 실패하지 않도록 설정
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 타입 오류가 있어도 빌드는 계속 진행
    ignoreBuildErrors: true,
  }
}

export default nextConfig;
