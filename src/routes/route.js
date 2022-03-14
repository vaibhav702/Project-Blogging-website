const express = require("express");
const router = express.Router();
const authorController = require("../Controller/authorController");
const blogController = require("../controller/blogController");

//------------------------------------------------------------------//
//Create an Author

router.post("/createAuthor", authorController.createAuthor);

//----------------------------------------------------------------------------------//
// create an Blog Api

router.post("/createBlog", blogController.createBlog);
router.get("/getBlog",blogController.getBlog)
// router.get("/getBlogByParams",blogController.blogByParams)
router.put("/updateBlog/:blogId",blogController.updatedBlog)
router.put("/deleteBlog/:blogId",blogController.deletedBlog)
router.put("/deleteBlog",blogController.deletedBlogByParams)
module.exports = router;
