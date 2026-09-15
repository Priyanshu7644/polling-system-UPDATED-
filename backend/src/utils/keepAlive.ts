import https from 'https';
import http from 'http';

/**
 * Self-ping Keep-Alive utility to prevent Render free-tier cold starts & sleep timeouts.
 * Render puts services to sleep after 15 minutes of inactivity.
 * This pings the public endpoint every 10 minutes to keep the container active and warm.
 */
export function startKeepAlive() {
  const serviceUrl =
    process.env.RENDER_EXTERNAL_URL ||
    process.env.BACKEND_URL ||
    'https://polling-backend.onrender.com';

  const healthUrl = serviceUrl.endsWith('/')
    ? `${serviceUrl}api/health`
    : `${serviceUrl}/api/health`;

  const PING_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

  console.log(`[KeepAlive] Service keep-alive initialized targeting: ${healthUrl}`);

  const ping = () => {
    try {
      const client = healthUrl.startsWith('https') ? https : http;
      const req = client.get(healthUrl, (res) => {
        if (res.statusCode === 200) {
          console.log(`[KeepAlive] 🟢 Health ping successful at ${new Date().toISOString()} (Status: ${res.statusCode})`);
        } else {
          console.warn(`[KeepAlive] 🟡 Health ping returned status ${res.statusCode}`);
        }
      });

      req.on('error', (err) => {
        // Log quietly so it doesn't clutter error monitoring
        console.log(`[KeepAlive] ℹ️ Health ping note: ${err.message}`);
      });

      req.setTimeout(10000, () => {
        req.destroy();
      });
    } catch (error: any) {
      console.log(`[KeepAlive] Ping error: ${error.message}`);
    }
  };

  // Initial delay of 2 minutes before first ping so server has finished starting up
  setTimeout(() => {
    ping();
    setInterval(ping, PING_INTERVAL_MS);
  }, 2 * 60 * 1000);
}
