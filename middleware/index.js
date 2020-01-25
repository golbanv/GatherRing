const GatheringsDb = require("../models/gatherings");
const Comment = require("../models/comment");

let middlewareObj = {};

middlewareObj.checkGatheringOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    GatheringsDb.findById(req.params.id, function(err, foundGathering) {
      if (err || !foundGathering) {
        req.flash("error", "Gathering not found");
        res.redirect("back");
      } else {
        if (foundGathering.author.id.equals(req.user._id)) {
          next();
        } else {
          req.flash("error", "you don't have permission to do that");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "You need to be logged in to do that");
    res.redirect("back");
  }
};

middlewareObj.checkCommentOwnership = function(req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
      if (err || !foundComment) {
        req.flash("error", "Comment not found");
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
};

middlewareObj.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "You need to be logged in to do that");
  res.redirect("/login");
};

module.exports = middlewareObj;
