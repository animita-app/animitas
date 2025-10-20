/**
 * Animita Model (Scoped Memorial)
 *
 * Backwards compatible facade that keeps existing Animita calls working while
 * delegating storage and logic to the broader Memorial model.
 */

const buildMemorialModel = require('./memorial');

const ENFORCED_TYPE = 'animita';

const cloneStaticMethod = (target, source, methodName) => {
  if (typeof source[methodName] === 'function') {
    // eslint-disable-next-line no-param-reassign
    target[methodName] = source[methodName].bind(source);
  }
};

const ensureAnimitaType = (payload = {}) => ({
  ...payload,
  type: ENFORCED_TYPE,
});

module.exports = (sequelize) => {
  const Memorial = buildMemorialModel(sequelize);
  const Animita = Memorial.scope(ENFORCED_TYPE);

  // Ensure creation helpers always persist records as `animita`.
  Animita.create = (values, options) => Memorial.create(ensureAnimitaType(values), options);
  Animita.build = (values, options) => Memorial.build(ensureAnimitaType(values), options);
  Animita.upsert = (values, options) => Memorial.upsert(ensureAnimitaType(values), options);
  Animita.bulkCreate = (records, options) =>
    Memorial.bulkCreate(records.map((record) => ensureAnimitaType(record)), options);

  // Re-expose base class spatial utilities and stats.
  [
    'findByBoundingBox',
    'findNearby',
    'getStatsByType',
  ].forEach((methodName) => cloneStaticMethod(Animita, Memorial, methodName));

  // Preserve existing serialization helper.
  Animita.prototype.toPublicJSON = Memorial.prototype.toPublicJSON;

  return Animita;
};
