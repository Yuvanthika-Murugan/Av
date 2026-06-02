const normalize = (data) => {
  if (Array.isArray(data)) {
    return data.map(normalize);
  }
  if (data && typeof data === 'object') {
    const raw = typeof data.get === 'function' ? data.get({ plain: true }) : data;
    const result = {};
    Object.entries(raw).forEach(([key, value]) => {
      result[key] = normalize(value);
    });
    if (result.user && result.userId === undefined) {
      result.userId = result.user;
      delete result.user;
    }
    if (result.post && result.postId === undefined) {
      result.postId = result.post;
      delete result.post;
    }
    if (result.approvedByUser && result.approvedBy === undefined) {
      result.approvedBy = result.approvedByUser;
      delete result.approvedByUser;
    }
    if (result.id !== undefined && result._id === undefined) {
      result._id = result.id;
    }
    return result;
  }
  return data;
};

module.exports = { normalize };