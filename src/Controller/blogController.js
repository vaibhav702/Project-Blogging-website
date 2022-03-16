const authorModel = require("../models/authorModel");
const blogModel = require("../models/blogModel");
const router = require("../routes/route");
const token = require("../middleware/middleware");
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
    let input = req.query;
    console.log(input);
    let filters = Object.entries(input);
    console.log(filters);
    let filtersAsObject = [];

    for (let i = 0; i < filters.length; i++) {
      let element = filters[i];
      let obj = {};
      obj[element[0]] = element[1];
      filtersAsObject.push(obj);
    }
    console.log(filtersAsObject);
    let condition = [{ isDeleted: false }, { isPublished: true }];
    let finalFilters = condition.concat(filtersAsObject);
    console.log(finalFilters);
    if (input) {
      let blog = await blogModel.find({ $and: finalFilters });
      if (blog.lengteh == 0) {
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

    if (!tags) {
      return res.status(400).send({
        status: false,
        msg: "tags is required for updation",
      });
    }
    if (!subcategory) {
      return res.status(400).send({
        status: false,
        msg: "subcategory is required for updation",
      });
    }
    if (!title) {
      return res.status(400).send({
        status: false,
        msg: "title is required for updation",
      });
    }
    if (!body) {
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

    if (blog[0].authorId.valueOf() == decodedToken.authorId) {
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

    if (data[0].authorId.valueOf() == decodedToken.authorId) {
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
    const filter = {
      isDeleted: false,
    };

    const authorId = req.query.authorId; //use for find
    const category = req.query.category;
    var isPublished = req.query.isPublished;
    if (isPublished == "false") var isPublished = false;
    if (isPublished == "true") var isPublished = true;
    const tags = req.query.tags;
    const subcategory = req.query.subcategory;

    if (!authorId) {
      res.status(400).send({
        status: false,
        mes: " please enter autherid",
      });
    }
    if (!category) {
      res.status(400).send({
        status: false,
        mes: " please enter category",
      });
    }
    if (!isPublished) {
      res.status(400).send({
        status: false,
        mes: " please enter published",
      });
    }
    if (!tags) {
      res.status(400).send({
        status: false,
        mes: " please enter tags",
      });
    }
    if (!subcategory) {
      res.status(400).send({
        status: false,
        mes: " please enter subcategory",
      });
    }

    filter["authorId"] = authorId; // we will add key and value in filter
    filter["category"] = category;
    filter["isPublished"] = isPublished;

    var tag = tags.split(" ").map((tag) => tag.trim());
    var newTag = tag.filter((e) => e); //it will remove the empty string
    filter["tags"] = {
      $all: newTag,
    };

    var sub = subcategory.split(" ").map((subcat) => subcat.trim()); //space remove before the string after the string

    var subcat = sub.filter((e) => e);
    filter["subcategory"] = {
      $all: subcat,
    };

    const findBlogs = await blogModel.find(filter);
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
