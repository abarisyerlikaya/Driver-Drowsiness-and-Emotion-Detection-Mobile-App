import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { welcomeStyles as styles } from "../utils/styles";

const Welcome = ({ navigation }) => {
  const navigateToTracking = () => navigation.navigate("Tracking");

  return (
    <View style={styles.container}>
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>Welcome to Araproje! </Text>
        <Text style={styles.description}>Setup your camera and</Text>
        <Text style={styles.description}>let it track your face clearly</Text>
        <Text style={styles.description}>for good user experience.</Text>
        <Text style={styles.description}>Enjoy!</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={navigateToTracking}>
          <Text style={styles.buttonText}>START</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Welcome;
