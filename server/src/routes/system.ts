import { Router } from "express";
import { categories, stars } from "../constants";
import { buildAuthPayload } from "../authPayload";
import { getAuthContext } from "../middlewares/auth";

const router = Router();

router.get("/health", (_request, response) => {
  response.json({ status: "ok", categories, stars });
});

router.get("/bootstrap", async (request, response) => {
  const { rawToken, user } = await getAuthContext(request.headers.authorization);

  if (!user) {
    response.status(401).send("Unauthorized");
    return;
  }

  const payload = await buildAuthPayload(user.id, rawToken);
  response.json(payload);
});

export default router;
