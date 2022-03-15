const authorModel = require("../models/authorModel");
const blogModel = require("../models/blogModel");
const router = require("../routes/route");
//-------------------------------------------------------------------//
// create Blog
const createBlog = async function (req, res) {
  try {
    let requestBlog = req.body;
    if (!requestBlog) {
      return res.status(400).send({
        status: false,
        msg: "Please provide the data",
      });
    }
    let authorId = req.body.authorId;
    let author = await authorModel.findById({
      _id: authorId,
    });
    if (author.length != 0) {
      let savedData = await blogModel.create(requestBlog);
      res.status(201).send({
        status: true,
        msg: savedData,
      });
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
    const filter = {
      isDeleted: false,
      isPublished: true,
    };
    const data = req.query;
    if (Object.keys(data).length == 0)
      //get aray of values
      res.status(400).send({
        status: false,
        msg: "Data must be present",
      });
    const authorId = req.query.authorId;
    const category = req.query.category;

    const tags = req.query.tags;
    const subcategory = req.query.subcategory;
    if (authorId) {
      filter["authorId"] = authorId;
    }
    if (category) {
      filter["category"] = category.trim();
    }
    if (tags) {
      const tag = tags.split(" ").map((tag) => tag.trim());
      var newTag = tag.filter((e) => e);
      filter["tags"] = {
        $all: newTag,
      };
    }

    if (subcategory) {
      const subcat = subcategory.split(" ").map((subcat) => subcat.trim());
      var newSub = subcat.filter((e) => e);
      filter["subcategory"] = {
        $all: newSub,
      };
    }

    let blog = await blogModel.find(filter); //it wil filter the given condition in filter
    if (blog.length != 0) {
      res.status(200).send({
        status: true,
        msg: blog,
      });
    } else {
      res.status(404).send({
        status: false,
        msg: "no document Found",
      });
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
    let requestBody = req.body;
    const { title, body, tags, subcategory } = requestBody; // updating content
    if (blogId != blogId) {
      return res.status(400).send({
        status: false,
        msg: "BlogId is Invalid",
      });
    }

    if (tags.length === 0) {
      return res.status(400).send({
        status: false,
        msg: "tags is required for updation",
      });
    }
    if (subcategory.length === 0) {
      return res.status(400).send({
        status: false,
        msg: "subcategory is required for updation",
      });
    }
    if (title.length === 0) {
      return res.status(400).send({
        status: false,
        msg: "title is required for updation",
      });
    }
    if (body.length === 0) {
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
    let updateTitle = req.body.title; //taking from body to update
    let updateBody = req.body.body;
    let updatetags = req.body.tags;
    let updatesubCategory = req.body.subcategory;
    let updatepublished = req.body.isPublished;
    const updatedContent = await blogModel.findOneAndUpdate(
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
    let authorIdForAuthorisation = req.query.authorId;
    let blogId = req.params.blogId;
    if (!blogId) {
      res.status(400).send({
        status: false,
        msg: "Please enter blog Id",
      });
    }
    let data = await blogModel.findById(blogId);
    console.log(data)
    let author = data.authorId
    console.log(author)
    if (author.toStiring() != authorIdForAuthorisation) {     //convert id to string
      res.status(403).send({
        status: false,
        msg: "you are not a valid author",
      });
    }
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
    } else {
      res.status(404).send({
        status: false,
        msg: "document does not exist",
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
    let authorIdForAuthorisation = req.params.authorId; //use for validation
    const filter = {
      isDeleted: false,
      deleteAt: null,
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

    var tag = tags
      .split(" ") //it convert into string
      .map((tag) => tag.trim());
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
    console.log(findBlogs);
    if (findBlogs[0].authorId != authorIdForAuthorisation) {
      res.status(403).send({
        status: false,
        msg: "you are not authorised",
      });
    }
    if (findBlogs.length === 0) {
      res.status(404).send({
        status: false,
        message: "No  blogs found",
      });
      return;
    }

    await blogModel.updateMany(
      {
        _id: findBlogs[0]._id,
      }, //we take id from 0th index
      {
        $set: {
          isDeleted: true,
          deleteAt: new Date(),
        },
      } //change the values
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
};
module.exports.deletedBlogByParams = deletedBlogByParams;
