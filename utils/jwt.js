var jwt = require("jsonwebtoken");
module.exports = {
    verifyToken: function (token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET_KEY);
        }
        catch (error) {
            if (error.name === "TokenExpiredError") {
                return null; //토큰이 만료되면 null
            }
            return null;
        }
    }
};
