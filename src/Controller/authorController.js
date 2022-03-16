const authorModel=require("../models/authorModel")
const jwt =require("jsonwebtoken")

//creating author by validating it is present or not
const createAuthor=async function (req,res){
    try {
      let requestBody = req.body;
      let email = req.body.email                                                //requesting email from body
      let password = req.body.password
      let fname = req.body.fname
      let lname = req.body.lname
      let title = req.body.title

      let emailCheck = await authorModel.findOne({ email })

      if (emailCheck) {
          return res.status(400).send({ status: false, msgsage: `${email} email address is already registered`, });
      }

      if (!email) {
          return res.status(400).send({ status: false, msgsage: "please enter email" });
      }

      if (!password) {
          return res.status(400).send({ status: false, msgsage: "please enter password" });
      }

      if (!fname) {
          return res.status(400).send({ status: false, msgsage: "please enter First name" });
      }

      if (!lname) {
          return res.status(400).send({ status: false, msgsage: "please enter Last name" });
      }

      if (title != 'Miss' || title != 'Mr' || title != 'Mrs') {
          return res.status(400).send({ status: false, msgsage: "please enter the valid title" });
      }

      const regex = /^([a-zA-Z0-9\.-]+)@([a-zA-Z0-9-]+).([a-z]+)$/;    //using regex we will verify the email is valid or not

      if (regex.test(email)) {
          let savedData = await authorModel.create(requestBody)
          res.status(201).send({ status: true, msg: savedData })
      }
      else {
          res.status(400).send({ msg: "Enter Vaild Email" })
      }
        


    } catch (error) {
        res.status(500).send({status:false,msgsage:error.msgsage})
        
    }
}
module.exports.createAuthor=createAuthor
const loginUser = async function (req, res) {
    let userName = req.body.email;
    let password = req.body.password;
    if(!userName){
      res.status(400).send({status:false,msg:"please enter email"})
    }

    if(!password){
      res.status(400).send({status:false,msg:"please enter password"})
    }
  
    let user = await authorModel.findOne({ emailId: userName, password: password });
    console.log(user)
    if (!user)
      return res.send({
        status: false,
        msg: "username or the password is not corerct",
      });
  
    let token = jwt.sign(
      {
        authorId: user._id,
        batch: "thorium",
       
      },
      "functionup"
    );
    res.send({ status: true, data: token });
  };
  module.exports.loginUser=loginUser