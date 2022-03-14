const authorModel = require("../models/authorModel");
const blogModel = require("../models/blogModel");
const router = require("../routes/route");
//-------------------------------------------------------------------//
// create Blog
const createBlog = async function (req, res) {
  try {
    let requestBlog = req.body;
    let authorId = req.body.authorId;
    let author = await authorModel.findById({ _id: authorId });
    if (author.length != 0) {
      let savedData = await blogModel.create(requestBlog);
      res.status(201).send({ status: true, msg: savedData });
    }
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};
module.exports.createBlog = createBlog;

//--------------------------------------------------------------------//
//get Blog
const getBlog = async function (req, res) {
  try {
    let authorId = req.query.authorId;
    let category = req.query.category;
    let tags = req.query.tags;
    let subCategory = req.query.subcategory;
    let filter = {
      $and: [
        { isDeleted: { $exists: false } },
        { ispublished: { $exists: false } },
      ],
      $or: [
        { authorId: authorId },
        { category: category },
        { tags: tags },
        { subcategory: subCategory },
      ],
    };

    let blog = await blogModel.find(filter); //it wil filter the given condition in filter
    if (blog.length != 0) {
      res.status(200).send({ status: true, msg: blog });
    } else {
      res.status(404).send({ status: false, msg: "no document Found" });
    }
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};
module.exports.getBlog = getBlog;

//------------------------------------------------------------------------------//
//get blog by param
// Filter blogs list by applying filters. Query param can have any combination of below filters.

// By author Id
// By category
// List of blogs that have a specific tag
// List of blogs that have a specific subcategory example of a query url: blogs?filtername=filtervalue&f2=fv2
// const blogByParams = async function (req, res) {
//     try{
//         let authorId =req.query.authorId
//         let category =req.query.category
//         let tags =req.query.tags
//         let subCategory =req.query.subcategory
//   let filter = {
//     $or: [
//       { authorId: authorId},
//       { category:  category},
//       { tags: tags},
//       { subcategory:subCategory }
//     ],
//   };
//       let data= await blogModel.find(filter)
//       res.status(200).send({status:true,msg:data})
// }catch(error){
//     res.status(500).send({ status: false, message: error.message });
// }

// };
// module.exports.blogByParams =blogByParams
//---------------------------------------------------------------------------------------------//
//updated blog
const updatedBlog = async function (req, res) {
  try {
    let blogId = req.params.blogId;
    let requestBody = req.body;
    const { title, body, tags, subcategory } = requestBody; // updating content
    if (blogId != blogId) {
      return res.status(400).send({ status: false, msg: "BlogId is Invalid" });
    }

    if (tags.length === 0) {
      return res
        .status(400)
        .send({ status: false, msg: "tags is required for updation" });
    }
    if (subcategory.length === 0) {
      return res
        .status(400)
        .send({ status: false, msg: "subcategory is required for updation" });
    }
    if (title.length === 0) {
      return res
        .status(400)
        .send({ status: false, msg: "title is required for updation" });
    }
    if (body.length === 0) {
      return res
        .status(400)
        .send({ status: false, msg: "body is required for updation" });
    }
    let blog = await blogModel.findOne({ _id: blogId });
    if (!blog) {
      return res.status(400).send({ status: false, msg: "no such Blog Found" });
    }
    let updateTitle = req.body.title;              //taking from body to update
    let updateBody = req.body.body;
    let updatetags = req.body.tags;
    let updatesubCategory = req.body.subcategory;
    let updatepublished = req.body.isPublished;
    const updatedContent = await blogModel.findOneAndUpdate(
      { _id: blogId },
      {
        title: updateTitle,
        body: updateBody,
        tags: updatetags,
        subcategory: updatesubCategory,
        isPublished: updatepublished,
      },
      { new: true }
    );
    if (updatedContent.isPublished == true) {
      updatedContent.publishedAt = new Date();
    }
    return res.status(200).send({ status: true, msg: updatedContent });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};
module.exports.updatedBlog = updatedBlog;

//---------------------------------------------------------------------------//
//delete blog element
//Check if the blogId exists( and is not deleted). If it does, mark it deleted and return an HTTP status 200 without any response body.
//If the blog document doesn't exist then return an HTTP status of 404 with a body like this



const deletedBlog=async function(req,res){
    try {
        let blogId =req.params.blogId
        let data =await blogModel.findById(blogId)
        if(data.isDeleted == false){
            let deleted = await blogModel.findOneAndUpdate({_id:blogId},{isDeleted:true,deleteAt:Date()},{new:true})
            return res.status(200).send({status:true,msg:deleted})
        }

        
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}
module.exports.deletedBlog =deletedBlog ;

//------------------------------------------------------------------------------------------------------------------------//
//delete block by params
const deletedBlogByParams=async(req,res)=>{
    try {
        let 
        
    } catch (error) {
        res.status(500).send({ status: false, message: error.message });
    }
}

