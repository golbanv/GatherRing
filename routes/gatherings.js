const express = require("express");
const router = express.Router();
const GatheringsDb = require("../models/gatherings");
const middleware = require("../middleware/index");

router.get("/", function(req, res) {
  GatheringsDb.find({}, function(err, allGatherings) {
    if (err) {
      console.log(err);
    } else {
      res.render("gatherings/index", {
        gatherings: allGatherings,
        currentUser: req.user
      });
    }
  });
});

router.post("/", middleware.isLoggedIn, function(req, res) {
  let name = req.body.name;
  let image = req.body.image;
  let desc = req.body.description;
  let author = {
    id: req.user._id,
    username: req.user.username
  };
  let newGatherings = {
    name: name,
    image: image,
    description: desc,
    author: author
  };
  GatheringsDb.create(newGatherings, function(err, newlyGathering) {
    if (err) {
      console.log(err);
    } else {
      console.log(newlyGathering);
      req.flash("success", "Successfully added GatheRing");
      res.redirect("/gatherings");
    }
  });
});

router.get("/new", middleware.isLoggedIn, function(req, res) {
  res.render("gatherings/new");
});

router.get("/:id", function(req, res) {
  GatheringsDb.findById(req.params.id)
    .populate("comments")
    .exec(function(err, foundGathering) {
      if (err || !foundGathering) {
        req.flash("error", "Gathering not found");
        res.redirect("back");
      } else {
        console.log(foundGathering);

        res.render("gatherings/show", { gathering: foundGathering });
      }
    });
});

router.get("/:id/edit", middleware.checkGatheringOwnership, function(req, res) {
  GatheringsDb.findById(req.params.id, function(err, foundGathering) {
    res.render("gatherings/edit", { gathering: foundGathering });
  });
});

router.put("/:id", middleware.checkGatheringOwnership, function(req, res) {
  GatheringsDb.findByIdAndUpdate(req.params.id, req.body.gathering, function(
    err,
    updatedGathering
  ) {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/gatherings/" + req.params.id);
    }
  });
});

router.delete("/:id", middleware.checkGatheringOwnership, function(req, res) {
  GatheringsDb.findByIdAndDelete(req.params.id, function(err) {
    if (err) {
      res.redirect("/gatherings");
    } else {
      req.flash("success", "GatgeRing deleted");
      res.redirect("/gatherings");
    }
  });
});

module.exports = router;
