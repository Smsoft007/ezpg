/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // 공통 환경 변수를 여기에 추가할 수 있습니다.
    // 이 변수들은 클라이언트와 서버 모두에서 접근 가능합니다.
    APP_NAME: 'EZPG Payment System',
    // 결제 관련 키 (소문자로 설정)
    mkey: 'dBztxCbxPjc19h5rmZbZwvmyFb7O9nJX3ftwcKiW07nNdTJKg9bw8EEOniOinNhz0r2ifdJgnxo2UbmlRC7DyA',
    mid: 'test03',
    PORT: '46566',
  },
  // 필요한 경우 API 경로 재작성 설정
  // rewrites: async () => {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: 'http://localhost:3001/api/:path*',
  //     },
  //   ];
  // },
  
  // Node.js 내장 모듈을 클라이언트에서 사용하지 않도록 설정
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 클라이언트 측 번들에서 Node.js 내장 모듈 사용 방지
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        os: false,
        path: false,
        stream: false,
        constants: false,
        crypto: false,
        dgram: false, 
        child_process: false, 
        http: false, 
        https: false, 
        zlib: false, 
        url: false, 
      };
    }
    return config;
  },
  serverRuntimeConfig: {
    PORT: '46566'
  },
  publicRuntimeConfig: {
    PORT: '46566'
  },
};

module.exports = nextConfig;
