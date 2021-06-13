const filterByState = (array, state) => (
  array.filter(item => item.state === state)
);

module.exports = {
  filterByState,
};
