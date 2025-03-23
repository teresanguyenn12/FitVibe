import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, TextInput, FlatList, TouchableOpacity, Image,
    StyleSheet, SafeAreaView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../authProvider";

const AddPostsScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [users, setUsers] = useState([]);

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="close-outline" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>Add Post</Text>
                
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#111'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        padding: 15,
        position: 'relative',
       
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    
});

export default AddPostsScreen;

