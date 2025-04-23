// screens/utils/imageHelpers.js
export const getChallengeImage = (category) => {
    switch ((category || "").toLowerCase()) {
      case "run":
        return require("../assets/SoloChallenge.png");
      case "walk":
        return require("../assets/WalkChallenge.png");
      case "yoga":
        return require("../assets/yoga-challenge.png");
      case "lifting":
        return require("../assets/LiftingChallenge.png");
      case "cycling":
        return require("../assets/CyclingConfirm.png");
      default:
        return require("../assets/SoloChallenge.png");
    }
  };
  