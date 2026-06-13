import localforage from 'localforage';

localforage.config({
  name: 'SanaLabOffline',
  storeName: 'offlineRequests'
});

export const queueRequest = async (url, method, body, headers) => {
  const request = {
    id: Date.now().toString(),
    url,
    method,
    body,
    headers,
    timestamp: Date.now()
  };
  
  const queue = await localforage.getItem('requestQueue') || [];
  queue.push(request);
  await localforage.setItem('requestQueue', queue);
  return request.id;
};

export const syncOfflineRequests = async () => {
  if (!navigator.onLine) return;

  const queue = await localforage.getItem('requestQueue') || [];
  if (queue.length === 0) return;

  console.log(`Attempting to sync ${queue.length} offline requests...`);
  
  const failedQueue = [];

  for (const req of queue) {
    try {
      const response = await fetch(req.url, {
        method: req.method,
        headers: req.headers,
        body: JSON.stringify(req.body)
      });
      if (!response.ok) {
        console.error('Failed to sync request', req);
        failedQueue.push(req); // Retry later if it failed structurally
      }
    } catch (err) {
      console.error('Network error during sync', err);
      failedQueue.push(req); // Network error, keep in queue
    }
  }

  await localforage.setItem('requestQueue', failedQueue);
  if (failedQueue.length < queue.length) {
    console.log(`Successfully synced ${queue.length - failedQueue.length} offline requests.`);
  }
};

export const fetchWithOfflineSupport = async (url, options = {}) => {
  if (navigator.onLine) {
    try {
      const response = await fetch(url, options);
      return response;
    } catch (err) {
      // Fallback to queue if network fails despite navigator.onLine being true
      if (options.method && options.method !== 'GET') {
        await queueRequest(url, options.method, JSON.parse(options.body), options.headers);
        return { ok: true, offlineQueued: true };
      }
      throw err;
    }
  } else {
    if (options.method && options.method !== 'GET') {
      await queueRequest(url, options.method, JSON.parse(options.body), options.headers);
      return { ok: true, offlineQueued: true };
    }
    throw new Error("You are offline and this is a GET request.");
  }
};
