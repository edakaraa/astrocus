import { Router } from "express";
import { categories, stars } from "../constants";
import { payloadForUser, requireUser } from "../helpers";

const router = Router();

router.get("/health", (_request, response) => {
  response.json({ status: "ok", categories, stars });
});

router.get("/bootstrap", (request, response) => {
  const { rawToken, user } = requireUser(request.headers.authorization);

  if (!user) {
    response.status(401).send("Unauthorized");
    return;
  }

  response.json(payloadForUser(user, rawToken));
});

export default router;
