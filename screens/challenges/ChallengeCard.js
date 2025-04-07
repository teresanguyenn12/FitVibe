// Standalone componet that displays the challenge preview (image, location, title...)
import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

const ChallengeCard = ({ challenge }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: challenge.image }} style={styles.image} />
      <Text style={styles.title}>{challenge.title}</Text>
      <Text style={styles.details}>{challenge.details}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 10,
    backgroundColor: '#222',
    borderRadius: 10,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    padding: 10,
  },
  details: {
    color: '#ccc',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
});

export default ChallengeCard;
