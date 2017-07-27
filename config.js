var config = {
    email: {
        user: process.env.MN_EMAIL_USER,
        password: process.env.MN_EMAIL_PASSWORD,
        host: "smtp.gmail.com",
        tls: {ciphers: "SSLv3"}
    }
};

module.exports.config = config;