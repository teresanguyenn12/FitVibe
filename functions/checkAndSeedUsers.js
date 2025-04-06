const admin = require("firebase-admin");
const serviceAccount = require("/Users/myan/Desktop/fitvibe/functions/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const seedUserData = async (uid) => {
  const userRef = db.collection("users").doc(uid);
  const doc = await userRef.get();

  if (doc.exists && doc.data().xp !== undefined) {
    console.log(`Already seeded: ${uid}`);
    return;
  }

  await userRef.set(
    {
      xp: 100, // Initial XP for new users
    },
    { merge: true }
  );

  console.log(`Seeded user with XP: ${uid}`);
};

const seedNewUsers = async () => {
  let nextPageToken;
  do {
    const result = await admin.auth().listUsers(1000, nextPageToken);
    for (const user of result.users) {
      await seedUserData(user.uid);
    }
    nextPageToken = result.pageToken;
  } while (nextPageToken);

  console.log("Done checking for new users.");
};

seedNewUsers();
