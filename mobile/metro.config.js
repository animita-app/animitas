const { getDefaultConfig } = require('expo/metro-config')

const config = getDefaultConfig(__dirname)

// Ensure these asset extensions are supported
config.resolver.assetExts.push('db', 'mp3', 'ttf', 'obj', 'png', 'jpg')

module.exports = config