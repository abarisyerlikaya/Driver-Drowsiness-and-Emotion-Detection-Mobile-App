import { Camera } from "expo-camera";

const getPermission = async () => (await Camera.requestPermissionsAsync()).status;

const rgbToGray = (x, rFactor, gFactor, bFactor) => {
  if (!x) return null;
  try {
    const r = x.slice([0, 0, 0], [x.shape[0], x.shape[1], 1]);
    const g = x.slice([0, 0, 1], [x.shape[0], x.shape[1], 1]);
    const b = x.slice([0, 0, 2], [x.shape[0], x.shape[1], 1]);
    return r.mul(rFactor).add(g.mul(gFactor)).add(b.mul(bFactor)).reshape([-1]);
  } catch (err) {
    return null;
  }
};

const timeToString = time => {
  const ms = Math.floor(time * 1000);
  const min = Math.floor(ms / 60000).toString();
  const seconds = Math.floor((ms - min * 60000) / 1000).toString();
  return `${min.padStart(2, "0")}:${seconds.padStart(2, "0")}`;
};

export { getPermission, rgbToGray, timeToString };
