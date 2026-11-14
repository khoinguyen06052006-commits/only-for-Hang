/**
 * ==============================================================================
 * SERVICE WORKER - THIỆP ĐIỆN TỬ TÌNH YÊU (PWA CACHE ENGINE)
 * Giúp website tải tức thì (Instant Load), hoạt động offline mượt mà
 * Bỏ qua cache đối với Telegram API và ưu tiên mạng cho Google Sheets
 * ==============================================================================
 */

const CACHE_NAME = "love-card-cache-v1";

// Danh sách các tài nguyên tĩnh cần cache ngay khi cài đặt
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.json",
  "./data.json",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png"
];

/* ------------------ SỰ KIỆN CÀI ĐẶT (INSTALL) ------------------ */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("[Service Worker] Đang cache bộ tài nguyên ứng dụng...");
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

/* ------------------ SỰ KIỆN KÍCH HOẠT (ACTIVATE) ------------------ */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(name => {
          if (name !== CACHE_NAME) {
            console.log("[Service Worker] Xóa bộ nhớ cache cũ:", name);
            return caches.delete(name);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

/* ------------------ CHIẾN LƯỢC PHỤC VỤ TÀI NGUYÊN (FETCH) ------------------ */
self.addEventListener("fetch", event => {
  const requestUrl = new URL(event.request.url);

  // 1. Tuyệt đối KHÔNG cache Telegram API (để tin nhắn gửi đi luôn theo thời gian thực)
  if (requestUrl.hostname.includes("api.telegram.org")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2. Với Google Sheets: Network-First (Ưu tiên mạng để lấy thư mới nhất, nếu mất mạng dùng bản lưu)
  if (requestUrl.hostname.includes("docs.google.com") || requestUrl.pathname.includes(".csv")) {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // 3. Với các tài nguyên tĩnh (HTML, CSS, JS, Fonts, Ảnh):
  // Chiến lược Stale-While-Revalidate (Trả cache tức thì cho mượt, sau đó ngầm cập nhật bản mới)
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const fetchPromise = fetch(event.request)
        .then(networkResponse => {
          // Lưu vào cache nếu phản hồi hợp lệ
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (event.request.method === "GET")
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(err => {
          // Khi offline hoàn toàn và không có cache:
          if (event.request.mode === "navigate") {
            return caches.match("./index.html");
          }
        });

      return cachedResponse || fetchPromise;
    })
  );
});
