// express server to receive an image and call google cloud api and send back labels as response

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const multer = require("multer");
const upload = multer();
const vision = require("@google-cloud/vision");
const client = new vision.ImageAnnotatorClient();
const fs = require("fs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/upload", upload.single("image"), (req, res) => {
  // let base64Image = req.body.image;

  // Read the image file as binary data.
  const imageFile = fs.readFileSync("./test-image.jpg");

  // Convert the image file to a base64-encoded string.
  const base64Image = Buffer.from(imageFile).toString("base64");

  let request = {
    image: { content: base64Image }, // Specify the base64-encoded image content.
    features: [{ type: "LABEL_DETECTION" }], // Include the features you need.
  };
  client
    .annotateImage(request)
    .then((results) => {
      const labels = results[0].labelAnnotations;
      res.send(labels);
    })
    .catch((err) => {
      console.error("ERROR:", err);
      res.send(err);
    });
});

app.listen(3000, () => console.log("Server started on port 3000"));
