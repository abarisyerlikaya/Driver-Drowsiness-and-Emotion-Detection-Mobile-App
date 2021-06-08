import { AntDesign } from "@expo/vector-icons";
import * as tf from "@tensorflow/tfjs";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import YoutubePlayer, { getYoutubeMeta } from "react-native-youtube-iframe";
import { classifierPath, endpoint } from "../config";
import { playlists, TensorCamera, tfProps, ytProps } from "../utils/constants";
import { getPermission, rgbToGray, timeToString } from "../utils/helpers";
import { trackingStyles as styles } from "../utils/styles";

const Tracking = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [isTfReady, setTfReady] = useState(false);
  const [factors, setFactors] = useState({ r: null, g: null, b: null });
  const [labelCounts, setLabelCounts] = useState({ drowsy: 0, neutral: 0, angry: 0, sad: 0, happy: 0 });
  const [isPlaying, setPlaying] = useState(true);
  const [playlist, setPlaylist] = useState(playlists.neutral[0]);
  const [elapsedTime, setElapsedTime] = useState("");
  const [duration, setDuration] = useState("");
  const [songTitle, setSongTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [label, setLabel] = useState("");
  const [shouldPlayDrowsy, setShouldPlayDrowsy] = useState(false);
  const ref = useRef();

  // Initialize
  useEffect(() => {
    (async () => {
      await tf.ready();
      setTfReady(true);
      setFactors({ r: tf.scalar(0.2989), g: tf.scalar(0.587), b: tf.scalar(0.114) });
      setHasPermission(await getPermission());
    })();
  }, []);

  // Show elapsed time
  useEffect(() => {
    const interval = setInterval(async () => {
      const currentTime = await ref.current.getCurrentTime();
      setElapsedTime(timeToString(currentTime));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Handle camera stream
  const handleCameraStream = images => {
    images.next();
    const last5Labels = [];
    let shouldBreak = false;

    const loop = async () => {
      let data = null;

      tf.tidy(() => {
        let nextImageTensor = images.next().value;
        let grayTensor = rgbToGray(nextImageTensor, factors.r, factors.g, factors.b);

        if (grayTensor) {
          grayTensor = tf.cast(grayTensor, "int32");
          data = grayTensor.arraySync().toString();
        } else shouldBreak = true;
      });

      if (shouldBreak) return;

      try {
        const request = { method: "POST", body: JSON.stringify({ data }) };
        const response = await (await fetch(endpoint + classifierPath, request)).json();

        if (response.class) {
          setLabel(response.class);
          if (response.class.length > 2) {
            last5Labels.push(response.class);
            if (last5Labels.length >= 5) last5Labels.shift();
            setLabelCounts(prevState => ({ ...prevState, [response.class]: prevState[response.class] + 1 }));
          }
        }

        // If 3 of last 5 labels are drowsy, play drowsy music right now
        const drowsyCountInLast5 = last5Labels.reduce((prev, next) => prev + (next === "drowsy"), 0);
        if (drowsyCountInLast5 >= 3) setShouldPlayDrowsy(true);
      } catch (err) {
        Alert.alert("An error occurred!");
      }
      requestAnimationFrame(loop);
    };

    loop();
  };

  // Play drowsy music trigger
  useEffect(() => {
    if (shouldPlayDrowsy) {
      if (playlist.name !== playlists.drowsy[0].name) {
        setPlaylist(playlists.drowsy[0]);
        setLabelCounts({ drowsy: 0, neutral: 0, angry: 0, sad: 0, happy: 0 });
        setTimeout(() => {
          togglePlaying();
          togglePlaying();
        }, 2000);
      }
      setShouldPlayDrowsy(false);
    }
  }, [shouldPlayDrowsy]);

  // On state change callback
  const onStateChange = async state => {
    // Get playing video info and show
    if (state === "playing") {
      const videoUrl = await ref.current.getVideoUrl();
      const duration = await ref.current.getDuration();
      const meta = await getYoutubeMeta(videoUrl.split("v=")[1]);
      setArtist(meta.author_name);
      setSongTitle(meta.title);
      setDuration(timeToString(duration));
    }

    // Select next playlist and start it
    else if (state === "ended") {
      let max = "neutral";
      if (labelCounts["angry"] > labelCounts[max]) max = "angry";
      if (labelCounts["happy"] > labelCounts[max]) max = "happy";
      if (labelCounts["sad"] > labelCounts[max]) max = "sad";

      // Change only if selected playlist is different from current playlist
      if (playlists[max][0].name !== playlist.name) {
        setPlaylist(playlists[max][0]);
        setLabelCounts({ drowsy: 0, neutral: 0, angry: 0, sad: 0, happy: 0 });
        setTimeout(() => {
          togglePlaying();
          togglePlaying();
        }, 2000);
      }
    }
  };

  // Play / pause function
  const togglePlaying = useCallback(async () => {
    setPlaying(prev => !prev);
  }, []);

  // Time <- currentTime + seconds
  const seekTo = async seconds => {
    const currentTime = await ref.current.getCurrentTime();
    ref.current.seekTo(currentTime + seconds, true);
  };

  // Skip current song and play next one
  const goToNextSong = async () => {
    const duration = await ref.current.getDuration();
    ref.current.seekTo(duration, true);
    setTimeout(() => {
      togglePlaying();
      togglePlaying();
    }, 100);
  };

  // Seek to 00:00
  const restartSong = () => {
    ref.current.seekTo(0, true);
    setTimeout(() => {
      togglePlaying();
      togglePlaying();
    }, 100);
  };

  // Log current state
  useEffect(() => {
    console.log(`Detected label: ${label}\nCurrent state: \n${JSON.stringify(labelCounts)}`);
  }, [labelCounts]);

  if (hasPermission === null || isTfReady === false) return <View />;
  if (hasPermission === false) return <Text>No access to camera!</Text>;
  return (
    <View style={styles.container}>
      <TensorCamera {...tfProps} style={styles.camera} onReady={handleCameraStream} />

      {/* <Text style={styles.label}>{label}</Text> */}

      <Text style={styles.label}>{playlist.name}</Text>

      <Text style={styles.label}>{songTitle}</Text>

      <Text style={styles.label}>{artist}</Text>

      <Text style={styles.label}>{elapsedTime && duration && `${elapsedTime} / ${duration}`}</Text>

      <YoutubePlayer {...ytProps} playList={playlist.value} ref={ref} play={isPlaying} onChangeState={onStateChange} />

      <View style={styles.controlsContainer}>
        <TouchableOpacity style={styles.button} onPress={restartSong}>
          <AntDesign name="stepbackward" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => seekTo(-10)}>
          <AntDesign name="banckward" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={togglePlaying}>
          <AntDesign name={isPlaying ? "pausecircle" : "play"} size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => seekTo(10)}>
          <AntDesign name="forward" size={24} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={goToNextSong}>
          <AntDesign name="stepforward" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Tracking;
