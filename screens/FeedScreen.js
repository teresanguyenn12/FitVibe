import React, { useEffect, useState, useCallback } from 'react';
import {
    View, Text, TextInput, FlatList, TouchableOpacity, Image,
    StyleSheet, SafeAreaView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../authProvider";

const FeedScreen = () => {
    const { user } = useAuth();
    const navigation = useNavigation();
    const [search, setSearch] = useState('');

    // Automatically refresh when the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            // loadPosts();
        }, [])
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.navigate("AddPostsScreen")} style={styles.addButton}>
                    <Ionicons name="duplicate-outline" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.title}>Posts</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate("MessagesScreen")}>
                    <Ionicons name="chatbubbles-outline" size={24} color="#fff" />
                    
                </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    placeholder="Search"
                    placeholderTextColor="#999"
                    style={styles.searchInput}
                    value={search}
                    onChangeText={setSearch}
                />
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
        padding: 15,
        justifyContent: 'space-between'
    },
    title: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold'
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#222',
        padding: 10,
        margin: 10,
        borderRadius: 10
    },
    searchIcon: {
        marginRight: 10
    },
    searchInput: {
        flex: 1,
        color: '#fff'
    },
    userItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#333'
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 15
    },
    userInfo: {
        flex: 1
    },
    name: {
        color: '#fff',
        fontSize: 16
    },
    handle: {
        color: '#888'
    },
});

export default FeedScreen;
