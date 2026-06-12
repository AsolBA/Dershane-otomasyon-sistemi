import { asyncHandler } from "../../utils/async-handler.js";
import { sendSuccess } from "../../utils/api-response.js";
import { parseId } from "../../utils/query-params.js";
import * as svc from "./password-reset.service.js";

export const approve = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, "requestId");
  const result = await svc.approvePasswordReset(id, req.user.id);
  return sendSuccess(res, result, "Sifre sifirlama talebi onaylandi.");
});

export const reject = asyncHandler(async (req, res) => {
  const id = parseId(req.params.id, "requestId");
  const result = await svc.rejectPasswordReset(id, req.user.id);
  return sendSuccess(res, result, "Sifre sifirlama talebi reddedildi.");
});
