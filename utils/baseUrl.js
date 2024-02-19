const baseUrl =
  process.env.NODE_ENV !== "production"
    ? "http://localhost:3000"
    : "https://socialpulse2-734cc2ffad19.herokuapp.com";

module.exports = baseUrl;
