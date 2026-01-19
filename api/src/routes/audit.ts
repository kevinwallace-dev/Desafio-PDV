import { Router } from "express";
import { pool } from "../db";
import { asyncHandler } from "../middleware";
import { ValidationError } from "../errors";

export const auditRouter = Router({ mergeParams: true });
auditRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.userId);
    if (!Number.isFinite(userId) || userId <= 0) {
      throw new ValidationError("Invalid userId");
    }

    const rawLimit = Number(req.query.limit ?? 50);
    const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(rawLimit, 200)) : 50;

    const { rows } = await pool.query(
      `SELECT id,
              user_id AS "userId",
              field,
              old_value AS "oldValue",
              new_value AS "newValue",
              changed_at AS "changedAt"
       FROM audit_logs
       WHERE user_id = $1
       ORDER BY changed_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return res.json({ items: rows });
  })
);
