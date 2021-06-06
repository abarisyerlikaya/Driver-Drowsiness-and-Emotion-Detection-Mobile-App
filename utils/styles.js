import { StyleSheet } from "react-native";

const trackingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
  },
  camera: {
    aspectRatio: 1,
  },
  label: {
    textAlign: "center",
    fontSize: 16,
  },
  controlsContainer: {
    height: 64,
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
  },
  button: {
    width: 32,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#dddddd",
    marginHorizontal: 4,
    borderRadius: 20,
  },
  buttonText: {
    marginTop: 2,
    textAlign: "center",
    fontSize: 16,
  },
});

const welcomeStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 12,
  },
  buttonContainer: {
    flex: 4,
  },
  button: {
    margin: 10,
    height: 200,
    width: 200,
    backgroundColor: "#cccccc",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 400,
    borderWidth: 16,
    borderColor: "#c2c2c2",
  },
  buttonText: {
    fontSize: 20,
    color: "white",
  },
  description: {
    textAlign: "center",
    fontSize: 20,
    color: "#555555",
    padding: 3,
  },
  descriptionContainer: {
    flex: 2,
    paddingVertical: 40,
  },
});

export { trackingStyles, welcomeStyles };
