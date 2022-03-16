const authorModel = require("../models/authorModel");
const blogModel = require("../models/blogModel");
const router = require("../routes/route");
const token = require("../middleware/middleware");
const jwt = require("jsonwebtoken");
//-------------------------------------------------------------------//
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

//--------------------------------------------------------------------//
//get Blog
//By author Id
// By category
// List of blogs that have a specific tag
// List of blogs that have a specific subcategory example of a query url: blogs?filtername=filtervalue&f2=fv2
const getBlog = async function (req, res) {
  try {
    let request = req.query;
    console.log(request);
    let filters = Object.entries(request);
    console.log(filters);
    let finalFilter = [];

    for (let i = 0; i < filters.length; i++) {
      let element = filters[i];
      let obj = {};
      obj[element[0]] = element[1];
      finalFilter.push(obj);
    }

    if (request) {
      let blog = await blogModel.find({
        $and: [
          { isDeleted: false },
          { isPublished: true },
          { $or: finalFilter },
        ],
      });
      if (blog.length == 0) {
        return res.status(400).send({ status: false, msg: "no blog found" });
      } else {
        res.status(200).send({ status: true, data: blog });
      }
    } else {
      let blog = await blogModel.find({ $and: condition });
      if (blog.length == 0) {
        return res
          .status(404)
          .send({ status: false, msg: "no such blog found" });
      } else {
        res.status(500).send({ status: true, data: blog });
      }
    }
  } catch (error) {
    res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};

module.exports.getBlog = getBlog;

//---------------------------------------------------------------------------------------------//
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

    let token = req.headers["x-auth-token"];
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

//---------------------------------------------------------------------------//
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
    let token = req.headers["x-auth-token"];
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

//------------------------------------------------------------------------------------------------------------------------//
//delete block by params
// DELETE /blogs?queryParams
// Delete blog documents by category, authorid, tag name, subcategory name, unpublished
// If the blog document doesn't exist then return an HTTP status of 404 with a body like this
const deletedBlogByParams = async (req, res) => {
  try {
    let query = req.query;
    let filters = Object.entries(query);

    let finalFilter = [];

    for (let i = 0; i < filters.length; i++) {
      let element = filters[i];
      let obj = {};
      obj[element[0]] = element[1];
      finalFilter.push(obj);
    }

    const findBlogs = await blogModel.find({
      $and: [
        { isDeleted: false },
        { isPublished: false },
        { $and: finalFilter },
      ],
    });
    if (findBlogs.length === 0) {
      res.status(404).send({
        status: false,
        message: "No  blogs found",
      });
      return;
    }
    console.log(findBlogs);

    let token = req.headers["x-auth-token"];
    let decodedToken = jwt.verify(token, "functionup");

    if (findBlogs[0].authorId.valueOf() == decodedToken.authorId) {
      await blogModel.updateMany(
        {
          _id: findBlogs[0]._id,
        },
        {
          $set: {
            isDeleted: true,
            deleteAt: new Date(),
          },
        }
      );

      return res.status(200).send({
        status: true,
        message: "Blog deleted successfully",
      });
    } else {
      res.status(403).send({
        status: false,
        msg: "you are not authorised",
      });
    }
  } catch (error) {
    res.status(500).send({
      status: false,
      message: error.message,
    });
  }
};
module.exports.deletedBlogByParams = deletedBlogByParams;
