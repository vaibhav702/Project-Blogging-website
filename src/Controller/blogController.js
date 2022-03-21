const authorModel = require("../models/authorModel");
const blogModel = require("../models/blogModel");
const router = require("../routes/route");
const token = require("../middleware/middleware");
const jwt = require("jsonwebtoken");
//=//
const isValid =function(value){
  if(typeof value === 'undefined' || value === null) return false
  if(typeof value === 'string' || value.trim().length>0 ) return false
  return true;
  

}
const isValidRequestBody =function(requestBody){
  return Object.keys(requestBody).length>0
}
const isValidObjectId =function(objectId){
return mongoose.Types.ObjectId.isValid(objectId)
}
// create Blog
const createBlog = async function (req, res) {
  try {
    let requestBlog = req.body;
    let title = req.body.title;
    let authorId = req.body.authorId;
    let body = req.body.body;
    let category = req.body.category;

    if (!title) {
      return res
        .status(400)
        .send({ status: false, msg: "Please enter the title" });
    }
    if (!authorId) {
      return res
        .status(400)
        .send({ status: false, msg: "Please enter the autherid" });
    }
    if (!body) {
      return res
        .status(400)
        .send({ status: false, msg: "Please enter the body" });
    }
    if (!category) {
      return res
        .status(400)
        .send({ status: false, msg: "Please enter the category" });
    }
    let author = await authorModel.findById({ _id: authorId });

    if (author.length != 0) {
      let savedData = await blogModel.create(requestBlog);
      res.status(201).send({ status: true, msg: savedData });
    }
  } catch (error) {
    res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};
module.exports.createBlog = createBlog;

// get blog
const getBlog = async function (req, res) {
  try {
    const filterQuery = {
      isDeleted: false,
      deleteAt: null,
      isPublished: true,
    };
    const queryParams = req.query;

    if (isValidRequestBody(queryParams)) {
      const { authorId, category, tags, subcategory } = queryParams;

      if (isValid(authorId) && isValidObjectId(authorId)) {
        filterQuery["authorId"] - authorId;
      }

      if (isValid(category)) {
        filterQuery["category"] = category.trim();
      }

      if (isValid(tags)) {
        const tagsArr = tags
          .trim()
          .split(",")
          .map((tag) => tag.trim());

        filterQuery["tags"] = { $all: tagsArr };
      }

      if (isValid(subcategory)) {
        const subcatArr = subcategory
          .trim()
          .split(",")
          .map((subcat) => subcat.trim());
        filterQuery["subcategory"] = { $all: subcatArr };
      }
    }

    const blogs = await blogModel.find(filterQuery);

    if (Array.isArray(blogs) && blogs.length === 0) {
      res.status(404).send({ status: false, message: "No blogs found" });
      return;
    }

    res.status(200).send({ status: true, message: "Blogs list", data: blogs });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};
module.exports.getBlog = getBlog;
//=//
//updated blog
const updatedBlog = async function (req, res) {
  try {
    let blogId = req.params.blogId;
    let updateTitle = req.body.title;
    let updateBody = req.body.body;
    let updatetags = req.body.tags;
    let updatesubCategory = req.body.subcategory;
    let updatepublished = req.body.isPublished;

    if (!blogId) {
      return res.status(400).send({
        status: false,
        msg: "  please enter BlogId ",
      });
    }

    if (!updatetags) {
      return res.status(400).send({
        status: false,
        msg: "tags is required for updation",
      });
    }
    if (!updatesubCategory) {
      return res.status(400).send({
        status: false,
        msg: "subcategory is required for updation",
      });
    }
    if (!updateTitle) {
      return res.status(400).send({
        status: false,
        msg: "title is required for updation",
      });
    }
    if (!updateBody) {
      return res.status(400).send({
        status: false,
        msg: "body is required for updation",
      });
    }

    let blog = await blogModel.findOne({
      _id: blogId,
     
    });

    if (!blog) {
      return res.status(400).send({
        status: false,
        msg: "no such Blog Found",
      });
    }

    let token = req.headers["x=auth=token"];
    let decodedToken = jwt.verify(token, "functionup");

    if (blog.authorId.valueOf() == decodedToken.authorId) {
      let updatedContent = await blogModel.findOneAndUpdate(
        {
          _id: blogId,
        },
        {
          title: updateTitle,
          body: updateBody,
          tags: updatetags,
          subcategory: updatesubCategory,
          isPublished: updatepublished,
        },
        {
          new: true,
        }
      );
      if (updatedContent.isPublished == true) {
        updatedContent.publishedAt = new Date();
      }
      return res.status(200).send({
        status: true,
        msg: updatedContent,
      });
    } else {
      res.status(400).send({
        status: false,
        message: "invalid user",
      });
    }
  } catch (error) {
    res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};
module.exports.updatedBlog = updatedBlog;

//=//
//delete blog element
//Check if the blogId exists( and is not deleted). If it does, mark it deleted and return an HTTP status 200 without any response body.
//If the blog document doesn't exist then return an HTTP status of 404 with a body like this

const deletedBlog = async function (req, res) {
  try {
    let blogId = req.params.blogId;
    if (!blogId) {
      res.status(400).send({
        status: false,
        msg: "Please enter blog Id",
      });
    }
    let data = await blogModel.findById(blogId);

    if (data.isDeleted != false) {
      res.status(404).send({
        status: false,
        msg: "document does not exist",
      });
    }
    let token = req.headers["x=auth=token"];
    let decodedToken = jwt.verify(token, "functionup");

    if (data.authorId.valueOf() == decodedToken.authorId) {
      if (data.isDeleted == false) {
        let deleted = await blogModel.findOneAndUpdate(
          {
            _id: blogId,
          },
          {
            isDeleted: true,
            deleteAt: Date(),
          },
          {
            new: true,
          }
        );
        return res.status(200).send({
          status: true,
          msg: deleted,
        });
      }
    } else {
      res.status(403).send({
        status: false,
        msg: "you are not a valid author",
      });
    }
  } catch (error) {
    res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};
module.exports.deletedBlog = deletedBlog;

//=//
//delete block by params
// DELETE /blogs?queryParams
// Delete blog documents by category, authorid, tag name, subcategory name, unpublished
// If the blog document doesn't exist then return an HTTP status of 404 with a body like this

const deletedBlogByParams = async (req, res) => {
try {

  const filterQuery = { isDeleted: false, deleteAt: null }
  const queryParams = req.query
  const autherIdFromToken = req.authorId

  if (!isValidRequestBody(queryParams)) {

    return res
      .status(400)
      .send({ status: false, msg: "enter input " });
  }



  if (!isValidObjectId(autherIdFromToken)) {
    return res
      .status(400)
      .send({ status: false, msg: " invalid token id" });
  }

  const { authorId, category, tags, subcategory, isPublished } = queryParams

  if (isValid(authorId) && isValidObjectId(authorId)) {
    filterQuery["authorId"] = authorId
  }

  if (isValid(category)) {
    filterQuery["category"] = category.trim()
  }

  if (isValid(tags)) {
    const tagsArr = tags.trim().split(",").map(tag => tag.trim())
    filterQuery["tags"] = { $all: tagsArr }
  }

  if (isValid(subcategory)) {
    const subArr = tags.trim().split(",").map(cat => cat.trim())
    filterQuery["subcategory"] = { $all: subArr }
  }
  if (isValid(isPublished)) {
    filterQuery["isPublished"] = isPublished
  }


  const findBlogs = await blogModel.find(filterQuery)
  if (Array.isArray(findBlogs) && findBlogs.length === 0) {
    res.status(404).send({
      status: false, message: "No blogs found"
    })
    return
  }

  const ids = findBlogs.map(blog => {
    if (findBlogs.authorId.valueOf() == autherIdFromToken) return blog.id


  })


  if (ids.length === 0) {
    res.status(404).send({ status: false, message: "no blogs found" })
  }


  await blogModel.updateMany(
    {
      _id: { $in: ids }
    },
    {
      $set: {
        isDeleted: true,
        deleteAt: new Date(),
      }
    }
  );

  return res.status(200).send({
    status: true,
    message: "Blog deleted successfully",
  });

} catch (error) {
  res.status(500).send({
    status: false,
    message: error.message,
  });
}
}
module.exports.deletedBlogByParams = deletedBlogByParams;