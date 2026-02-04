const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add platform extensions for web
config.resolver.sourceExts = [...config.resolver.sourceExts, 'web.tsx', 'web.ts', 'web.jsx', 'web.js'];

// Exclude native modules from web bundle
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
