export const getBadgeByXP = (xp) => {
    if (xp >= 2500) {
      return require("../assets/master.png"); // Prestige 5
    } else if (xp >= 2000) {
      return require("../assets/titan.png"); // Prestige 4
    } else if (xp >= 1500) {
      return require("../assets/elite.png"); // Prestige 3
    } else if (xp >= 1000) {
      return require("../assets/warrior.png"); // Prestige 2
    } else if (xp >= 500) {
      return require("../assets/competitor.png"); // Prestige 1
    } else {
      return require("../assets/rookie.png"); // Prestige 0
    }
  };
export const getTitleByXP = (xp) => {
    if (xp >= 2500) return "Master";
    else if (xp >= 2000) return "Titan";
    else if (xp >= 1500) return "Elite";
    else if (xp >= 1000) return "Warrior";
    else if (xp >= 500) return "Competitor";
    else return "Rookie";
};