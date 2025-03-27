module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    'react-hooks/exhaustive-deps': 'warn', // useEffect 의존성 배열 경고로 변경
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_', 
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true 
    }], // 사용하지 않는 변수는 _로 시작하는 경우에만 허용
    'react/no-unescaped-entities': 'warn', // 이스케이프되지 않은 엔티티는 경고로 변경
    'prefer-const': 'warn', // 재할당하지 않는 변수는 const 사용 권장 (경고로 변경)
    // API 백엔드 코드는 any 타입을 허용 (추후 점진적으로 개선 예정)
    '@typescript-eslint/no-explicit-any': ['error', {
      ignoreRestArgs: true,
      allowExplicitAny: false
    }]
  },
  overrides: [
    {
      // API 라우트 파일에서는 특정 규칙 완화
      files: ['src/app/api/**/*.ts', 'src/app/api/**/*.tsx'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'warn'
      }
    }
  ],
}