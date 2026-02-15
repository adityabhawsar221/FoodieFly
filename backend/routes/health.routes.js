const express = require("express");
const { verifyMailTransport } = require("../utils/mail");

const healthRouter = express.Router();

// Protected health check to avoid exposing infra details publicly.
// Call with header: x-health-key: <HEALTH_KEY> (or ?key=...)
healthRouter.get("/mail", async (req, res) => {
  try {
    const healthKey = process.env.HEALTH_KEY;
    if (!healthKey) {
      return res.status(501).json({
        ok: false,
        message: "HEALTH_KEY is not configured on the server",
      });
    }

    const providedKey = req.get("x-health-key") || req.query.key;
    if (providedKey !== healthKey) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    await verifyMailTransport();
    return res.status(200).json({ ok: true, message: "Mail transport verified" });
  } catch (err) {
    const code = err?.code;
    const message = err?.message || String(err);

    return res.status(503).json({
      ok: false,
      code,
      message,
    });
  }
});

module.exports = healthRouter;
