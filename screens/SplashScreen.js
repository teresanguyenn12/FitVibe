import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const bgFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Grow the blob
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 1000,
        useNativeDriver: true,
        easing: Easing.out(Easing.exp),
      }),

      // 2. Spin and shrink to center
      Animated.parallel([
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.ease),
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.05,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),

      // 3. Show logo and fade in background
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(bgFadeAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: false,
        }),
      ]),
    ]).start();
  }, []);

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const bgGradient = bgFadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(0,0,0,1)', 'rgba(142,36,170,1)'], // dark → vibrant
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor: bgGradient }]}>
      <Animated.View
        style={[
          styles.cubeWrapper,
          {
            transform: [
              { scale: scaleAnim },
              { rotate: rotateInterpolate },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={['#8e24aa', '#5e35b1', '#1e88e5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientCube}
        />
      </Animated.View>

      <Animated.Text style={[styles.logoText, { opacity: logoOpacity }]}>
        FitVibe
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  cubeWrapper: {
    width: 100,
    height: 100,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradientCube: {
    flex: 1,
    borderRadius: 20,
  },
  logoText: {
    position: 'absolute',
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'TiltWarp-Regular',
  },
});
