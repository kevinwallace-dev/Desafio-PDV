import { Router } from "express";
import { z } from "zod";
import { pool } from "../db";
import { asyncHandler } from "../middleware";
import { ValidationError, NotFoundError } from "../errors";

export const settingsRouter = Router({ mergeParams: true });

const PutBody = z.object({
  notificationsEnabled: z.boolean().optional(),
  darkModeEnabled: z.boolean().optional(),
  enableSignature: z.boolean().optional(),
  profileSignature: z.string().max(500).nullable().optional()
});

async function validateUserExists(userId: number) {
  const { rows } = await pool.query("SELECT id FROM users WHERE id = $1", [userId]);
  if (rows.length === 0) {
    throw new NotFoundError(`User ${userId} not found`);
  }
}

async function ensureDefaultSettings(userId: number) {
  await pool.query(
    `INSERT INTO user_settings (user_id) VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING`,
    [userId]
  );

  const { rows } = await pool.query(
    `SELECT user_id,
            notifications_enabled AS "notificationsEnabled",
            dark_mode_enabled AS "darkModeEnabled",
            enable_signature AS "enableSignature",
            profile_signature AS "profileSignature",
            updated_at AS "updatedAt"
     FROM user_settings
     WHERE user_id = $1`,
    [userId]
  );

  return rows[0];
}

settingsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.userId);
    
    if (!Number.isFinite(userId) || userId <= 0) {
      throw new ValidationError("Invalid userId");
    }

    await validateUserExists(userId);

    const settings = await ensureDefaultSettings(userId);
    return res.json(settings);
  })
);

settingsRouter.put(
  "/",
  asyncHandler(async (req, res) => {
    const userId = Number(req.params.userId);
    
    if (!Number.isFinite(userId) || userId <= 0) {
      throw new ValidationError("Invalid userId");
    }

    const parsed = PutBody.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(
        `Invalid request body: ${parsed.error.errors.map((e) => e.message).join(", ")}`
      );
    }

    await validateUserExists(userId);

    const current = await ensureDefaultSettings(userId);
    const incoming = parsed.data;

    const nextNotifications =
      incoming.notificationsEnabled !== undefined ? incoming.notificationsEnabled : current.notificationsEnabled;
    const nextDark =
      incoming.darkModeEnabled !== undefined ? incoming.darkModeEnabled : current.darkModeEnabled;
    const nextEnableSignature =
      incoming.enableSignature !== undefined ? incoming.enableSignature : current.enableSignature;
    const nextSignature =
      incoming.profileSignature !== undefined ? incoming.profileSignature : current.profileSignature;

    const diffs: Array<{ field: string; oldValue: string | null; newValue: string | null }> = [];

    if (incoming.notificationsEnabled !== undefined && nextNotifications !== current.notificationsEnabled) {
      diffs.push({
        field: "notificationsEnabled",
        oldValue: String(current.notificationsEnabled),
        newValue: String(nextNotifications)
      });
    }
    if (incoming.darkModeEnabled !== undefined && nextDark !== current.darkModeEnabled) {
      diffs.push({
        field: "darkModeEnabled",
        oldValue: String(current.darkModeEnabled),
        newValue: String(nextDark)
      });
    }
    if (incoming.enableSignature !== undefined && nextEnableSignature !== current.enableSignature) {
      diffs.push({
        field: "enableSignature",
        oldValue: String(current.enableSignature),
        newValue: String(nextEnableSignature)
      });
    }
    if (incoming.profileSignature !== undefined && nextSignature !== current.profileSignature) {
      diffs.push({
        field: "profileSignature",
        oldValue: current.profileSignature ?? null,
        newValue: nextSignature ?? null
      });
    }

    const { rows } = await pool.query(
      `UPDATE user_settings
         SET notifications_enabled = $2,
             dark_mode_enabled = $3,
             enable_signature = $4,
             profile_signature = $5,
             updated_at = NOW()
       WHERE user_id = $1
       RETURNING user_id,
                 notifications_enabled AS "notificationsEnabled",
                 dark_mode_enabled AS "darkModeEnabled",
                 enable_signature AS "enableSignature",
                 profile_signature AS "profileSignature",
                 updated_at AS "updatedAt"`,
      [userId, nextNotifications, nextDark, nextEnableSignature, nextSignature]
    );

    if (diffs.length > 0) {
      const values: any[] = [];
      const placeholders: string[] = [];
      diffs.forEach((d, idx) => {
        const base = idx * 4;
        placeholders.push(`($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`);
        values.push(userId, d.field, d.oldValue, d.newValue);
      });

      await pool.query(
        `INSERT INTO audit_logs (user_id, field, old_value, new_value)
         VALUES ${placeholders.join(",")}`,
        values
      );
    }

    return res.json(rows[0]);
  })
);

