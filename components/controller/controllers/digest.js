module.exports = () => {
  const start = async ({ logger }) => {
    const digestRepo = () => {
      logger.info('Digesting repository');
    };
    return { digestRepo };
  };
  return { start };
};
