import React from "react";
import cv from "@techstark/opencv-js";
// import { loadHaarFaceModels, detectHaarFace } from "./haarFaceDetection";

window.cv = cv;

class TestPage extends React.Component {
  constructor(props) {
    super(props);
    this.inputImgRef = React.createRef();
    // this.grayImgRef = React.createRef();
    // this.cannyEdgeRef = React.createRef();
    // this.haarFaceImgRef = React.createRef();
    this.houghline = React.createRef();
    this.state = {
      imgUrl: null,
    };
  }

  componentDidMount() {
    // loadHaarFaceModels();
  }

  /////////////////////////////////////////
  //
  // process image with opencv.js
  //
  /////////////////////////////////////////
  processImage(imgSrc) {
    const img = cv.imread(imgSrc);

    // to gray scale
    const imgGray = new cv.Mat();
    cv.cvtColor(img, imgGray, cv.COLOR_BGR2GRAY);
    // cv.imshow(this.grayImgRef.current, imgGray);

    // detect edges using Canny
    const edges = new cv.Mat();
    cv.Canny(imgGray, edges, 100, 100);
    // cv.imshow(this.cannyEdgeRef.current, edges);

    // detect faces using Haar-cascade Detection
    // const haarFaces = detectHaarFace(img);
    // cv.imshow(this.haarFaceImgRef.current, haarFaces);

    //hough lines
    // Use canny edge detection
    const res = new cv.Mat();
    cv.threshold(imgGray, res, 240, 240, cv.THRESH_BINARY)[1];
    cv.GaussianBlur(res, res, { width: 31, height: 31 }, 0);

    for (let index = 0; index < 3; index++) {
      const kernel = cv.matFromArray(
        3,
        3,
        cv.CV_32FC1,
        [1, 1, 1, 1, 1, 1, 1, 1, 1]
      );
      cv.dilate(res, res, kernel);
      cv.threshold(res, res, 25, 255, cv.THRESH_BINARY)[1];
    }

    for (let index = 0; index < 3; index++) {
      const kernel = cv.matFromArray(
        3,
        3,
        cv.CV_32FC1,
        [1, 1, 1, 1, 1, 1, 1, 1, 1]
      );
      cv.erode(res, res, kernel);
    }

    // Structuring Element
    const kernelius = cv.getStructuringElement(cv.MORPH_CROSS, {
      width: 3,
      height: 3,
    });

    // Create an empty output image to hold values
    let img1 = new res.clone();
    const thin = new cv.Mat();

    while (cv.countNonZero(img1) != 0) {
      // Erosion
      const erode = new cv.Mat();
      cv.erode(img1, erode, kernelius);
      // Opening on eroded image
      const opening = new cv.Mat();
      cv.morphologyEx(erode, opening, cv.MORPH_OPEN, kernelius);
      // Subtract these two
      const subset = erode - opening;
      // Union of all previous sets
      cv.bitwise_or(subset, thin, thin);
      //   img1 = erode;
    }

    cv.imshow(this.houghline.current, thin);

    // need to release them manually
    img.delete();
    imgGray.delete();
    edges.delete();
    res.delete();
    // haarFaces.delete();
  }

  render() {
    const { imgUrl } = this.state;
    return (
      <div>
        <div style={{ marginTop: "30px" }}>
          <span style={{ marginRight: "10px" }}>Select an image file:</span>
          <input
            type="file"
            name="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files[0]) {
                this.setState({
                  imgUrl: URL.createObjectURL(e.target.files[0]),
                });
              }
            }}
          />
        </div>

        {imgUrl && (
          <div className="images-container">
            <div className="image-card">
              <div style={{ margin: "10px" }}>↓↓↓ The original image ↓↓↓</div>
              <img
                alt="Original input"
                src={imgUrl}
                onLoad={(e) => {
                  this.processImage(e.target);
                }}
              />
            </div>

            {/* <div className="image-card">
              <div style={{ margin: "10px" }}>↓↓↓ The gray scale image ↓↓↓</div>
              <canvas ref={this.grayImgRef} />
            </div> */}

            {/* <div className="image-card">
              <div style={{ margin: "10px" }}>↓↓↓ Canny Edge Result ↓↓↓</div>
              <canvas ref={this.cannyEdgeRef} />
            </div> */}

            {/* <div className="image-card">
              <div style={{ margin: "10px" }}>
                ↓↓↓ Haar-cascade Face Detection Result ↓↓↓
              </div>
              <canvas ref={this.haarFaceImgRef} />
            </div> */}

            <div className="image-card">
              <div style={{ margin: "10px" }}>↓↓↓ Hough Lines Result ↓↓↓</div>
              <canvas ref={this.houghline} />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default TestPage;
