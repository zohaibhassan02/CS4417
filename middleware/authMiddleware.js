function requireAuth(req, res, next) {
  console.log("requireAuth middleware hit");

  if (!req.session || !req.session.user) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  next();
}

function requireAdmin(req, res, next) {
  console.log("requireAdmin middleware hit");

  if (!req.session || !req.session.user) {
    return res.status(401).json({
      message: "Authentication required"
    });
  }

  if (req.session.user.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required"
    });
  }

  next();
}

module.exports = {
  requireAuth,
  requireAdmin
};