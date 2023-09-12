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
  const imageBuffer = req.file.buffer;

  // You can convert the Buffer to base64 if needed.
  const base64Image = imageBuffer.toString("base64");

  // Test code to read image from local file system 🟢
  // // Read the image file as binary data.
  // const imageFile = fs.readFileSync("./test-image.jpg");

  // // Convert the image file to a base64-encoded string.
  // const base64Image = Buffer.from(imageFile).toString("base64");
  // res.send({ data: JSON.stringify(base64Image) });

  let request = {
    image: { content: base64Image }, // Specify the base64-encoded image content.
    features: [{ type: "LABEL_DETECTION" }], // Include the features you need.
  };

  // call google cloud vision api
  client
    .annotateImage(request)
    .then((results) => {
      const labels = results[0].labelAnnotations;
      // filter out labels with score more than 0.9
      const filteredLabels = labels.filter((label) => label.score > 0.8);
      // extract description from each label
      const descriptions = filteredLabels.map((label) => label.description);
      res.send(descriptions);
    })
    .catch((err) => {
      console.error("ERROR:", err);
      res.send(err);
    });
});

app.listen(4000, () => console.log("Server started on port 4000"));
