import express from "express";
import cors from "cors";
import { settingsRouter } from "./routes/settings";
import { auditRouter } from "./routes/audit";
import { errorHandler } from "./middleware";

const app = express();
app.use(cors());
app.use(express.json());
app.get("/health", (_req, res) => res.json({ ok: true }));
const v1 = express.Router();
v1.use("/users/:userId/settings", settingsRouter);
v1.use("/users/:userId/audit", auditRouter);

app.use("/v1", v1);
app.use(errorHandler as any);

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
  console.log(`API v1 listening on :${port}`);
});
