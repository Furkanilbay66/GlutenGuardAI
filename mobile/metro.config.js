const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const polyfillPath = path.resolve(__dirname, 'src/polyfill.js');

const origGetModules = config.serializer?.getModulesRunBeforeMainModule;

config.serializer = {
  ...config.serializer,
  getModulesRunBeforeMainModule: (entryFilePath) => {
    const prev = origGetModules ? origGetModules(entryFilePath) : [];
    return [polyfillPath, ...prev];
  }
};

module.exports = config;
