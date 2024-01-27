const baseUrl =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : "https://socialpulse-9a2adcafece8.herokuapp.com";

module.exports = baseUrl;
