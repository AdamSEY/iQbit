const { createProxyMiddleware } = require("http-proxy-middleware");

const qbittorrentHost = "http://192.168.1.111:8081";

module.exports = function (app) {
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
