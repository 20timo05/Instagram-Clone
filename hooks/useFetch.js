import { useState, useEffect, useRef } from "react";

export default function useFetch(
  method,
  url,
  body = null,
  defaultValue = null,
  callback = null,
  options = {}
) {
  const [data, setData] = useState(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const memoizedBody = useRef(null);

  useEffect(() => {
    if (JSON.stringify(body) !== JSON.stringify(memoizedBody?.current))
      memoizedBody.current = body;
  }, [body]);

  useEffect(() => {
    if (memoizedBody?.current?.notReadyYet) return;
    fetchDataHandler();
  }, [memoizedBody]);

  async function fetchDataHandler() {
    setLoading(true);
    setError(null);
    const { ok, data, error } = await fetchData(
      method,
      url,
      body,
      callback,
      options
    );

    setLoading(false);
    if (ok) setData(data);
    else setError(error);
  }

  return [data, setData, loading, error];
}

export async function fetchData(
  method,
  url,
  body = null,
  callback = null,
  options = {}
) {
  let response;
  if (method === "GET") {
    if (body) {
      if (url.endsWith("/")) url = url.slice(0, -1);
      url += "?" + new URLSearchParams(body);
    }
    response = await fetch(url, options);
  } else {
    response = await fetch(
      url,
      {
        method,
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      },
      options
    );
  }
  try {
    const data = await response.json();
    if (response.ok) {
      if (callback) callback({ ok: true, data });
      return { ok: true, data };
    } else {
      if (callback) callback({ ok: false, data: response, error: data });
      return { ok: false, data: response, error: data };
    }
  } catch (err) {
    return { ok: false, error: err };
  }
}
