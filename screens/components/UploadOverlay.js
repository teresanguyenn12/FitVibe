import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Modal,
  Animated,
  Easing,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const screenHeight = Dimensions.get("window").height;

export default function UploadOverlay({ visible, progress, onFinish }) {
  const [internalVisible, setInternalVisible] = useState(false);
  const [barAnim] = useState(new Animated.Value(0));
  const [opacityAnim] = useState(new Animated.Value(0));
  const [checkVisible, setCheckVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setInternalVisible(true);
      setCheckVisible(false);
      barAnim.setValue(0); // reset progress bar
      opacityAnim.setValue(0); // reset success fade

      Animated.timing(barAnim, {
        toValue: progress,
        duration: 300,
        easing: Easing.linear,
        useNativeDriver: false,
      }).start(() => {
        if (progress >= 1) {
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.ease,
            useNativeDriver: true,
          }).start(() => {
            setCheckVisible(true);
            setTimeout(() => {
              setInternalVisible(false);
              if (onFinish) onFinish(); // callback to parent (e.g., navigate)
            }, 600);
          });
        }
      });
    } else {
      setInternalVisible(false);
    }

    return () => {
      barAnim.stopAnimation();
      opacityAnim.stopAnimation();
    };
  }, [visible, progress]);

  if (!internalVisible) return null;

  const barWidth = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 280],
  });

  return (
    <Modal transparent visible={true} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.text}>Uploading Post...</Text>
          <View style={styles.progressBarBackground}>
            <Animated.View style={[styles.progressBar, { width: barWidth }]} />
          </View>
          {checkVisible && (
            <Animated.View style={[styles.checkWrapper, { opacity: opacityAnim }]}>
              <Ionicons name="checkmark-circle" size={42} color="#4caf50" />
              <Text style={styles.successText}>Success!</Text>
            </Animated.View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "#1e1e1e",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    width: 320,
  },
  text: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
  },
  progressBarBackground: {
    width: 280,
    height: 10,
    backgroundColor: "#333",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 20,
  },
  progressBar: {
    height: 10,
    backgroundColor: "#8e2de2",
  },
  checkWrapper: {
    alignItems: "center",
    marginTop: 10,
  },
  successText: {
    color: "#4caf50",
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 5,
  },
});
