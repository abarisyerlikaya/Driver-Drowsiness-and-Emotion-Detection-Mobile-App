import { Camera } from "expo-camera";
import { cameraWithTensors } from "@tensorflow/tfjs-react-native";

const TensorCamera = cameraWithTensors(Camera);
const RESIZE_HEIGHT = 480;
const RESIZE_WIDTH = 480;

const playlists = {
  neutral: [{ name: "Top 100", value: "PL4fGSI1pDJn6puJdseH2Rt9sMvt9E2M4i" }],
  drowsy: [{ name: "Biggest Dance Anthems", value: "RDCLAK5uy_nE25QmHW2mSEyfGan1RwORJyb0MzZqOpI" }],
  angry: [{ name: "Relaxing Songs", value: "RDCLAK5uy_np_soSTj6w3-N7Dh_xmdDpQINJ8LsVpa8" }],
  happy: [{ name: "Happy Pop Songs", value: "RDCLAK5uy_mfdqvCAl8wodlx2P2_Ai2gNkiRDAufkkI" }],
  sad: [{ name: "Ultimate Love Songs", value: "RDCLAK5uy_kW-moSFMAFOKAIVYn9IDrZKWEJA3cP9UU" }],
};

const ytProps = {
  height: 0,
  forceAndroidAutoplay: true,
  webViewStyle: { opacity: 0 },
  initialPlayerParams: { loop: true },
};

const tfProps = {
  type: Camera.Constants.Type.front,
  ratio: "1:1",
  cameraTextureHeight: 1440,
  cameraTextureWidth: 1440,
  resizeHeight: RESIZE_HEIGHT,
  resizeWidth: RESIZE_WIDTH,
  resizeDepth: 3,
  autorender: true,
};

export { TensorCamera, RESIZE_HEIGHT, RESIZE_WIDTH, playlists, tfProps, ytProps };
