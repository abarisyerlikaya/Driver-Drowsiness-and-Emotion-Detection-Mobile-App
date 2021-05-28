import * as tf from "@tensorflow/tfjs";
import { cameraWithTensors } from "@tensorflow/tfjs-react-native";
import { Camera } from "expo-camera";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { endpoint, emotionPath } from "./config";

const TensorCamera = cameraWithTensors(Camera);
const RESIZE_HEIGHT = 640;
const RESIZE_WIDTH = 360;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  camera: { flex: 4 },
  label: { flex: 1 },
});

const App = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [isTfReady, setTfReady] = useState(false);
  const [rFactor, setRFactor] = useState(null);
  const [gFactor, setGFactor] = useState(null);
  const [bFactor, setBFactor] = useState(null);
  const [label, setLabel] = useState("");

  const getPermission = async () => {
    const { status } = await Camera.requestPermissionsAsync();
    setHasPermission(status === "granted");
  };

  const rgbToGray = x => {
    const r = x.slice([0, 0, 0], [x.shape[0], x.shape[1], 1]);
    const g = x.slice([0, 0, 1], [x.shape[0], x.shape[1], 1]);
    const b = x.slice([0, 0, 2], [x.shape[0], x.shape[1], 1]);
    return r.mul(rFactor).add(g.mul(gFactor)).add(b.mul(bFactor)).reshape([-1]);
  };

  useEffect(() => {
    (async () => {
      await tf.ready();
      setTfReady(true);
      setRFactor(tf.scalar(0.2989));
      setGFactor(tf.scalar(0.587));
      setBFactor(tf.scalar(0.114));
      getPermission();
    })();
  }, []);

  const handleCameraStream = (images, _updatePreview, _gl) => {
    const loop = async () => {
      let nextImageTensor = images.next().value;
      let grayTensor = tf.cast(rgbToGray(nextImageTensor), "int32");
      let data = grayTensor.arraySync();

      try {
        const request = {
          method: "POST",
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({ data }),
        };
        const response = await fetch(endpoint + emotionPath, request);
        setLabel((await response.json())["class"]);
      } catch (err) {
        console.log(err);
      }

      requestAnimationFrame(loop);
    };
    loop();
  };

  if (hasPermission === null || isTfReady === false) return <View />;
  if (hasPermission === false) return <Text>No access to camera</Text>;
  return (
    <View style={styles.container}>
      <TensorCamera
        style={styles.camera}
        type={Camera.Constants.Type.front}
        cameraTextureHeight={1200}
        cameraTextureWidth={1600}
        resizeHeight={RESIZE_HEIGHT}
        resizeWidth={RESIZE_WIDTH}
        resizeDepth={3}
        onReady={handleCameraStream}
        autorender={true}
      />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

export default App;
