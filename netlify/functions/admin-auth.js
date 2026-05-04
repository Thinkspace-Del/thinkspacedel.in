import { json, requireAdminKey } from "./_adminShared.js";

export const handler = async (event) => {
  const denied = requireAdminKey(event);
  if (denied) return denied;

  return json(200, { ok: true });
};
