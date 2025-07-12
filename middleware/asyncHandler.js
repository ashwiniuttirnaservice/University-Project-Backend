const asyncHandler = (fn) => {
  return async (req, res, next = () => {}) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      console.error(`Error : ${err}`);
      console.error("STACK TRACE ::: ", err?.stack);
      return res.status(500).json({
        success: false,
        message: err?.message || err?.sqlMessage || "Internal Server Error",
        data: null,
      });
    }
  };
};

export default asyncHandler;
