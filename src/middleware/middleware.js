const jwt = require("jsonwebtoken");

const headerValidation = function (req, res, next) {
  let token = req.headers["x-auth-token"];
  if (!token) {
    return res.send({ status: false, msg: "token must be present" });
  }
  console.log(token);

  let decodedToken = jwt.verify(token, "functionup");
  console.log(decodedToken);
   
    next();

};

module.exports.headerValidation = headerValidation;




const decodedauthorId = function (req, res, next) {
  let token = req.headers["x-auth-token"];
  let decodedToken = jwt.verify(token, "functionup");
  return decodedToken.authorId ;
  next();
  };
  module.exports.decodedauthorId = decodedauthorId;
