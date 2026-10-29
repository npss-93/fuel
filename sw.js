// Service worker แบบง่าย: ให้ติดตั้งเป็นแอปได้ + เปิดได้แม้ออฟไลน์ (เฉพาะไฟล์ของแอปเอง)
// ใช้ network-first จึงได้เวอร์ชันล่าสุดเสมอเมื่อออนไลน์ ไม่ต้องล้างแคชเองหลังอัปเดตโค้ด
const CACHE = "fullfuel-v1";
const SHELL = ["./", "./index.html", "./styles.css", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).catch(() => {}));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});
self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  // แคชเฉพาะไฟล์ของแอปเอง ส่วน Google Sheet / Firebase / แผนที่ / CDN ให้ผ่านตรง ๆ
  if (req.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((r) => r || caches.match("./index.html"))),
  );
});
