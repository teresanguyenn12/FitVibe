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
  export const getLevelAndFitcoinByXP = (xp) => {
    if (xp >= 2500) return { level: "Master", fitcoin: 60 };
    if (xp >= 2000) return { level: "Titan", fitcoin: 50 };
    if (xp >= 1500) return { level: "Elite", fitcoin: 40 };
    if (xp >= 1000) return { level: "Warrior", fitcoin: 30 };
    if (xp >= 500) return { level: "Competitor", fitcoin: 20 };
    return { level: "Rookie", fitcoin: 10 };
  };
  