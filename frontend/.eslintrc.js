module.exports = {
  extends: 'expo',
  rules: {
    // Allow __DEV__ global
    'no-undef': ['error', { typeof: true }],
    // Allow console in development
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // Prefer const
    'prefer-const': 'warn',
    // Unused vars warning
    'no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
  },
  globals: {
    __DEV__: 'readonly',
  },
};



