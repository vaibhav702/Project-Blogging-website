const authorModel=require("../models/authorModel")

//creating author by validating it is present or not
const createAuthor=async function (req,res){
    try {
        let requestBody =req.body;
        let email =req.body.email                                       //requesting email from body
        
        const regex =/^([a-zA-Z0-9\.-]+)@([a-zA-Z0-9-]+).([a-z]+)$/;     //using regex we will verify the email is valid or not
        if(regex.test(email)){
        let savedData = await authorModel.create(requestBody)
        res.status(201).send({status:true,msg:savedData})
        }
        else{
            res.status(400).send({msg:"Enter Vaild Email"})
        }
        


    } catch (error) {
        res.status(500).send({status:false,message:error.message})
        
    }
}
module.exports.createAuthor=createAuthor
