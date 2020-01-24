const express = require("express");
const router = express.Router({ mergeParams: true });
const GatheringsDb = require("../models/gatherings");
const Comment = require("../models/comment");

router.get("/new", isLoggedIn, function(req, res) {
  GatheringsDb.findById(req.params.id, function(err, gathering) {
    if (err) {
      console.log(err);
    } else {
      res.render("comments/new", { gathering: gathering });
    }
  });
});

router.post("/", isLoggedIn, function(req, res) {
  GatheringsDb.findById(req.params.id, function(err, gathering) {
    if (err) {
      console.log(err);
      res.redirect("/gatherings");
    } else {
      Comment.create(req.body.comment, function(err, comment) {
        if (err) {
          console.log(err);
        } else {
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.save();
          gathering.comments.push(comment);
          gathering.save();
          res.redirect("/gatherings/" + gathering._id);
        }
      });
    }
  });
});

router.get("/:comment_id/edit", checkCommentOwnership, function(req, res) {
  Comment.findById(req.params.comment_id, function(err, foundComment) {
    if (err) {
      res.redirect("back");
    } else {
      res.render("comments/edit", {
        gathering_id: req.params.id,
        comment: foundComment
      });
    }
  });
});

router.put("/:comment_id", checkCommentOwnership, function(req, res) {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(
    err,
    updatedComment
  ) {
    if (err) {
      res.redirect("back");
    } else {
      res.redirect("/gatherings/" + req.params.id);
    }
  });
});

router.delete("/:comment_id", checkCommentOwnership, function(req, res) {
  Comment.findByIdAndRemove(req.params.comment_id, function(err) {
    if (err) {
      res.redirect("back");
    } else {
      res.redirect("/gatherings/" + req.params.id);
    }
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkCommentOwnership(req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
      if (err) {
        console.log(err);
        res.redirect("back");
      } else {
        if (foundComment.author.id.equals(req.user._id)) {
          next();
        } else {
          res.redirect("back");
        }
      }
    });
  } else {
    res.redirect("back");
  }
}

module.exports = router;
