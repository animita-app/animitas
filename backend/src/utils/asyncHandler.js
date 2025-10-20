/**
 * Animitas Mapper - Async Handler Utility
 *
 * Wrapper para manejar errores en funciones async de Express.
 */

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { asyncHandler };