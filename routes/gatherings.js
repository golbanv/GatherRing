const express = require("express");
const router = express.Router();
const GatheringsDb = require("../models/gatherings");

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

router.post("/", isLoggedIn, function(req, res) {
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
      res.redirect("/gatherings");
    }
  });
});

router.get("/new", isLoggedIn, function(req, res) {
  res.render("gatherings/new");
});

router.get("/:id", function(req, res) {
  GatheringsDb.findById(req.params.id)
    .populate("comments")
    .exec(function(err, foundGathering) {
      if (err) {
        console.log(err);
      } else {
        console.log(foundGathering);

        res.render("gatherings/show", { gathering: foundGathering });
      }
    });
});

router.get("/:id/edit", checkGatheringOwnership, function(req, res) {
  GatheringsDb.findById(req.params.id, function(err, foundGathering) {
    res.render("gatherings/edit", { gathering: foundGathering });
  });
});

router.put("/:id", checkGatheringOwnership, function(req, res) {
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

router.delete("/:id", checkGatheringOwnership, function(req, res) {
  GatheringsDb.findByIdAndDelete(req.params.id, function(err) {
    if (err) {
      res.redirect("/gatherings");
    } else {
      res.redirect("/gatherings");
    }
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}

function checkGatheringOwnership(req, res, next) {
  if (req.isAuthenticated()) {
    GatheringsDb.findById(req.params.id, function(err, foundGathering) {
      if (err) {
        console.log(err);
        res.redirect("back");
      } else {
        if (foundGathering.author.id.equals(req.user._id)) {
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
