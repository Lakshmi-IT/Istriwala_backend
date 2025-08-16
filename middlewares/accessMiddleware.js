export const access = (...roles) => {
  return (req, res, next) => {
    const role = req?.role;

    if (role && roles.includes(role)) {
      next();
    } else {
      return res.status(403).json({ message: "Access Denied" });
    }
  };
};


