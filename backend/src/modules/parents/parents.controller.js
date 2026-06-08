import { asyncHandler } from "../../utils/async-handler.js";
import { sendSuccess } from "../../utils/api-response.js";
import * as svc from "./parents.service.js";

export const list = asyncHandler(async (_req, res) => {
  const data = await svc.listParents();
  return sendSuccess(res, data);
});
