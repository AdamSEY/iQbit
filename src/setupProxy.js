const { createProxyMiddleware } = require("http-proxy-middleware");

const qbittorrentHost = "http://192.168.1.111:8081";

module.exports = function (app) {

    // rottentomatoes proxy to avoid CORS.

    app.use(
        "/napi/*",
        createProxyMiddleware({
            target: 'https://www.rottentomatoes.com/',
            changeOrigin: true,
            headers: {
                referer: qbittorrentHost,
                origin: qbittorrentHost,
            }
        }
    ));

  app.use(
    "/api",
    createProxyMiddleware({
      target: qbittorrentHost,
      changeOrigin: true,
      headers: {
        referer: qbittorrentHost,
        origin: qbittorrentHost,
      },
    })
  );
};
