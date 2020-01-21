const express = require("express");
app = express();
port = 4000;
bodyParser = require("body-parser");
mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/gathe_ring", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

let gatheringSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String
});

let GatheringsDb = mongoose.model("GatheringDb", gatheringSchema);

// GatheringsDb.create(
//   {
//     name: "Kato",
//     image: "https://ak8.picdn.net/shutterstock/videos/1015821628/thumb/1.jpg",
//     description: "berybery nice"
//   },
//   function(err, court) {
//     if (err) {
//       console.log(err);
//       console.log("Oh nooo");
//     } else {
//       console.log(court);
//       console.log("Yesss");
//     }
//   }
// );

let gatherings = [
  {
    name: "Basketaki",
    image:
      "https://images.unsplash.com/photo-1551543801-fb7bdeb9fc4a?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=668&q=80"
  },
  {
    name: "OAKA",
    image:
      "https://images.unsplash.com/photo-1563302905-a2a4d92aab2e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=668&q=80"
  },
  {
    name: "SEF",
    image:
      "https://images.unsplash.com/photo-1503762199232-1e1c0a94b0ef?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80"
  }
];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

app.get("/", function(req, res) {
  res.render("landing");
});

app.get("/gatherings", function(req, res) {
  GatheringsDb.find({}, function(err, allGatherings) {
    if (err) {
      console.log(err);
      console.log("Noooo");
    } else {
      res.render("index", { gatherings: allGatherings });
      console.log(allGatherings);
      console.log("Yessssssaaaa");
    }
  });
});

app.post("/gatherings", function(req, res) {
  let name = req.body.name;
  let image = req.body.image;
  let desc = req.body.description;
  let newGatherings = { name: name, image: image, description: desc };
  GatheringsDb.create(newGatherings, function(err, newlyGathering) {
    if (err) {
      console.log(err);
      console.log("Nope dude");
    } else {
      res.redirect("/gatherings");
      console.log("Yess, works");
    }
  });
});

app.get("/gatherings/new", function(req, res) {
  res.render("new");
});

app.get("/gatherings/:id", function(req, res) {
  GatheringsDb.findById(req.params.id, function(err, foundGathering) {
    if (err) {
      console.log(err);
    } else {
      res.render("show", { gathering: foundGathering });
    }
  });
});

app.get("*", function(req, res) {
  res.send("nothing there bro");
});

app.listen(port, function() {
  console.log("Listening on port " + port + " GatherRing!");
});
