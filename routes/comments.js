const express = require("express");
const router = express.Router({ mergeParams: true });
const GatheringsDb = require("../models/gatherings");
const Comment = require("../models/comment");
const middleware = require("../middleware/index");

router.get("/new", middleware.isLoggedIn, function(req, res) {
  GatheringsDb.findById(req.params.id, function(err, gathering) {
    if (err) {
      console.log(err);
    } else {
      res.render("comments/new", { gathering: gathering });
    }
  });
});

console.log(middleware.checkCommentOwnership);

router.post("/", middleware.isLoggedIn, function(req, res) {
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
          req.flash("success", "Successfully added comment");
          res.redirect("/gatherings/" + gathering._id);
        }
      });
    }
  });
});

router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(
  req,
  res
) {
  GatheringsDb.findById(req.params.id, function(err, foundGathering) {
    if (err || !foundGathering) {
      req.flash("error", "No GatheRing found");
      res.redirect("/gatherings");
    }
    Comment.findById(req.params.comment_id, function(err, foundComment) {
      if (err) {
        req.flash("error", "No Comment found");
        res.redirect("back");
      } else {
        res.render("comments/edit", {
          gathering_id: req.params.id,
          comment: foundComment
        });
      }
    });
  });
});

router.put("/:comment_id", middleware.checkCommentOwnership, function(
  req,
  res
) {
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

router.delete("/:comment_id", middleware.checkCommentOwnership, function(
  req,
  res
) {
  Comment.findByIdAndRemove(req.params.comment_id, function(err) {
    if (err) {
      res.redirect("back");
    } else {
      req.flash("success", "Comment deleted");
      res.redirect("/gatherings/" + req.params.id);
    }
  });
});

module.exports = router;
