const express = require("express");
const { route } = require("express/lib/application");
const router = express.Router();
const authorController = require("../Controller/authorController");
const blogController = require("../controller/blogController");
const middleWare =require("../middleware/middleware")

//------------------------------------------------------------------//
//Create an Author

router.post("/createAuthor", authorController.createAuthor);

//----------------------------------------------------------------------------------//
// create an Blog Api

router.post("/createBlog",middleWare.headerValidation, blogController.createBlog);
router.get("/getBlogByParams",middleWare.headerValidation,blogController.getBlog)

router.put("/updateBlog/:blogId",middleWare.headerValidation,blogController.updatedBlog)
router.put("/deleteBlog/:blogId",middleWare.headerValidation,blogController.deletedBlog)
router.put("/deleteBlog",middleWare.headerValidation,blogController.deletedBlogByParams)

router.post("/login",authorController.loginUser)
module.exports = router;
