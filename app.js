const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
let GatheringsDb = require("./models/gatherings");
const seedDB = require("./seeds");
const Comment = require("./models/comment");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const methodOverride = require("method-override");
const flash = require("connect-flash");

const commentRoutes = require("./routes/comments");
const gatheringRoutes = require("./routes/gatherings");
const indexRoutes = require("./routes/index");

const app = express();
const port = process.env.PORT || 4000;

mongoose
  .connect(
    "mongodb+srv://golbanv:971540237sat@cluster0-foyg5.mongodb.net/test?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useUnifiedTopology: true
    }
  )
  .then(() => {
    console.log("Connected to db!!!");
  })
  .catch(err => {
    console.log("ERROR:", err.message);
  });

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// seedDB();

app.use(
  require("express-session")({
    secret: "Lilusya samaya luchshaya kosha!",
    resave: false,
    saveUninitialized: false
  })
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use("/", indexRoutes);
app.use("/gatherings", gatheringRoutes);
app.use("/gatherings/:id/comments", commentRoutes);

app.listen(port, function() {
  console.log("Listening on port " + port + " GatherRing!");
});
