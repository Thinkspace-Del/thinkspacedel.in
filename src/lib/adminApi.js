const STORAGE_KEY = "thinkspace_admin_review_key";

export function getStoredAdminKey() {
  try {
    return (localStorage.getItem(STORAGE_KEY) || "").trim();
  } catch {
    return "";
  }
}

export function setStoredAdminKey(key) {
  try {
    localStorage.setItem(STORAGE_KEY, String(key || "").trim());
  } catch {
    // ignore
  }
}

export function clearStoredAdminKey() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export async function adminInvoke(
  functionName,
  { method = "POST", body, query } = {},
) {
  const adminKey = getStoredAdminKey();
  if (!adminKey) throw new Error("Missing admin key.");

  const path = query
    ? `${functionName}?${new URLSearchParams(query).toString()}`
    : functionName;

  const url = new URL(`/.netlify/functions/${path}`, window.location.origin);

  const res = await fetch(url.toString(), {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Admin-Key": adminKey,
    },
    body: body == null || method === "GET" ? undefined : JSON.stringify(body),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const msg =
      data?.error || data?.message || res.statusText || "Request failed";
    throw new Error(`${res.status}: ${msg}`);
  }

  if (!data?.ok) throw new Error(data?.error || "Request failed");
  return data;
}
