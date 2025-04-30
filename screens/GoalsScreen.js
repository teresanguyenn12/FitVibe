import React, { useState, useEffect, useContext } from "react";
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, ScrollView, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import DateTimePicker from '@react-native-community/datetimepicker';
import { fetchGoals, addGoal, deleteGoal, toggleGoalCompletion, updateGoal } from "../api/todoApi";
import { useTheme } from '../contexts/ThemeContext';

const GoalsScreen = () => {
    const navigation = useNavigation();
    const [task, setTask] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState(new Date());
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("active");
    const [modalVisible, setModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [currentGoal, setCurrentGoal] = useState(null);
    const [displayFeatured, setDisplayFeatured] = useState(false);
    
    const { theme } = useTheme();

    // Fetch goals when component mounts
    useEffect(() => {
        loadGoals();
    }, []);

    // Function to load goals from Firebase
    const loadGoals = async () => {
        try {
            setLoading(true);
            const goalsData = await fetchGoals();
            setTasks(goalsData);
        } catch (err) {
            setError("Failed to load goals. Please try again.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Function to add a task
    const handleAddTask = async () => {
        if (task.trim().length > 0) {
            try {
                const newGoal = await addGoal({
                    text: task,
                    description: description,
                    dueDate: dueDate.toISOString(),
                    completed: false,
                    displayFeatured: false
                });
                setTasks([...tasks, newGoal]);
                clearForm();
                setModalVisible(false);
                setActiveTab("active");
            } catch (err) {
                setError("Failed to add goal. Please try again.");
                console.error(err);
            }
        }
    };

    // Function to clear the form
    const clearForm = () => {
        setTask("");
        setDescription("");
        setDueDate(new Date());
        setDisplayFeatured(false);
    };

    // Function to remove a task
    const handleRemoveTask = async (id) => {
        try {
            await deleteGoal(id);
            setTasks(tasks.filter((item) => item.id !== id));
        } catch (err) {
            setError("Failed to delete goal. Please try again.");
            console.error(err);
        }
    };

    // Function to toggle task completion
    const handleToggleCompletion = async (id, completed) => {
        try {
            await toggleGoalCompletion(id, completed);
            setTasks(tasks.map(item =>
                item.id === id ? { ...item, completed: !item.completed } : item
            ));
        } catch (err) {
            setError("Failed to update goal. Please try again.");
            console.error(err);
        }
    };

    // Function to open edit modal
    const openEditModal = (goal) => {
        setCurrentGoal(goal);
        setTask(goal.text);
        setDescription(goal.description || "");
        setDueDate(goal.dueDate ? new Date(goal.dueDate) : new Date());
        setDisplayFeatured(goal.displayFeatured || false);
        setEditModalVisible(true);
    };

    // Function to update a goal
    const handleUpdateGoal = async () => {
        if (task.trim().length > 0 && currentGoal) {
            try {
                const updatedGoalData = {
                    ...currentGoal,
                    text: task,
                    description: description,
                    dueDate: dueDate.toISOString(),
                    displayFeatured: currentGoal.completed ? displayFeatured : false
                };

                await updateGoal(currentGoal.id, updatedGoalData);

                setTasks(tasks.map(item =>
                    item.id === currentGoal.id ? updatedGoalData : item
                ));

                clearForm();
                setEditModalVisible(false);
                setCurrentGoal(null);
            } catch (err) {
                setError("Failed to update goal. Please try again.");
                console.error(err);
            }
        }
    };

    // Handle date change
    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || dueDate;
        setShowDatePicker(false);
        setDueDate(currentDate);
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "No due date";
        const date = new Date(dateString);
        return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Filter tasks based on active tab
    const filteredTasks = tasks.filter(task => {
        if (activeTab === "active") {
            return !task.completed;
        } else {
            return task.completed;
        }
    });

    // Count active and completed tasks
    const activeTasks = tasks.filter(task => !task.completed).length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const featuredTasks = tasks.filter(task => task.completed && task.displayFeatured).length;

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                {/* Back Button */}
                <TouchableOpacity 
                    style={[styles.backButton, { top: 50 }]} 
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={30} color={theme.text} />
                </TouchableOpacity>
                
                <Text style={[styles.title, { color: theme.text }]}>My Goals</Text>

                {/* Error message if any */}
                {error && <Text style={[styles.errorText, { color: 'red' }]}>{error}</Text>}

                {/* Add Goal Button */}
                <LinearGradient
                    colors={["#5A1A9B", "#1A4A80", "#8A1E50"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.addGoalButton}
                >
                    <TouchableOpacity onPress={() => setModalVisible(true)}>
                        <Text style={styles.addGoalButtonText}>
                            Create New Goal
                        </Text>
                    </TouchableOpacity>
                </LinearGradient>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeTab === "active" && styles.activeTab,
                            { backgroundColor: activeTab === "active" ? theme.primary : theme.card }
                        ]}
                        onPress={() => setActiveTab("active")}
                    >
                        <Text style={[
                            styles.tabText,
                            activeTab === "active" ? styles.activeTabText : { color: theme.subtext }
                        ]}>
                            Active ({activeTasks})
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.tab,
                            activeTab === "completed" && styles.activeTab,
                            { backgroundColor: activeTab === "completed" ? theme.primary : theme.card }
                        ]}
                        onPress={() => setActiveTab("completed")}
                    >
                        <Text style={[
                            styles.tabText,
                            activeTab === "completed" ? styles.activeTabText : { color: theme.subtext }
                        ]}>
                            Completed ({completedTasks})
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Task List */}
                <FlatList
                    data={filteredTasks}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.taskItem,
                                item.completed && item.displayFeatured && styles.featuredTaskItem,
                                { backgroundColor: theme.card }
                            ]}
                            onPress={() => openEditModal(item)}
                        >
                            <View style={styles.taskTopRow}>
                                <TouchableOpacity
                                    style={styles.taskCheckboxContainer}
                                    onPress={(e) => {
                                        e.stopPropagation();
                                        handleToggleCompletion(item.id, item.completed);
                                    }}
                                >
                                    <Ionicons
                                        name={item.completed ? "checkbox" : "square-outline"}
                                        size={24}
                                        color={item.completed ? theme.primary : theme.subtext}
                                        style={styles.checkbox}
                                    />
                                    <Text style={[
                                        styles.taskText,
                                        item.completed && styles.completedTask,
                                        { color: item.completed ? theme.subtext : theme.text }
                                    ]}>
                                        {item.text}
                                    </Text>
                                </TouchableOpacity>

                                <View style={styles.taskActions}>
                                    {item.completed && item.displayFeatured && (
                                        <Ionicons name="star" size={24} color="#FFD700" style={styles.starIcon} />
                                    )}
                                    <TouchableOpacity
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            handleRemoveTask(item.id);
                                        }}
                                    >
                                        <Ionicons name="trash-outline" size={24} color="red" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {item.description && (
                                <Text style={[styles.descriptionText, { color: theme.subtext }]}>
                                    {item.description.length > 50
                                        ? item.description.substring(0, 50) + "..."
                                        : item.description}
                                </Text>
                            )}

                            {item.dueDate && (
                                <View style={styles.dueDateContainer}>
                                    <Ionicons name="time-outline" size={18} color={theme.subtext} />
                                    <Text style={[styles.dueDateText, { color: theme.subtext }]}>
                                        {formatDate(item.dueDate)}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <Text style={[styles.emptyText, { color: theme.subtext }]}>
                            {activeTab === "active"
                                ? "You don't have any active goals. Add one to get started!"
                                : "You haven't completed any goals yet. Keep going!"}
                        </Text>
                    }
                />

                {/* Add Goal Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => setModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Create New Goal</Text>

                            <Text style={[styles.inputLabel, { color: theme.text }]}>Goal Name</Text>
                            <TextInput
                                style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text }]}
                                placeholder="Enter your goal..."
                                placeholderTextColor={theme.subtext}
                                value={task}
                                onChangeText={setTask}
                            />

                            <Text style={[styles.inputLabel, { color: theme.text }]}>Description</Text>
                            <TextInput
                                style={[styles.modalInput, styles.textArea, { backgroundColor: theme.background, color: theme.text }]}
                                placeholder="Add details about your goal..."
                                placeholderTextColor={theme.subtext}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                            />

                            <Text style={[styles.inputLabel, { color: theme.text }]}>Due Date</Text>
                            <TouchableOpacity
                                style={[styles.dateSelector, { backgroundColor: theme.background }]}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Ionicons name="calendar-outline" size={24} color={theme.subtext} />
                                <Text style={[styles.dateText, { color: theme.text }]}>{formatDate(dueDate.toISOString())}</Text>
                            </TouchableOpacity>

                            {showDatePicker && (
                                <DateTimePicker
                                    value={dueDate}
                                    mode="datetime"
                                    display={theme.mode === 'dark' ? 'spinner' : 'default'}
                                    onChange={onDateChange}
                                />
                            )}

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.border }]}
                                    onPress={() => {
                                        clearForm();
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text style={[styles.buttonText, { color: theme.text }]}>Cancel</Text>
                                </TouchableOpacity>

                                <LinearGradient
                                    colors={["#5A1A9B", "#1A4A80", "#8A1E50"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.gradientButton}
                                >
                                    <TouchableOpacity
                                        style={[styles.modalButton, { flex: 1, justifyContent: "center", alignItems: "center" }]}
                                        onPress={handleAddTask}
                                    >
                                        <Text style={styles.buttonText}>Create</Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Edit Goal Modal */}
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={editModalVisible}
                    onRequestClose={() => setEditModalVisible(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>Edit Goal</Text>

                            <Text style={[styles.inputLabel, { color: theme.text }]}>Goal Name</Text>
                            <TextInput
                                style={[styles.modalInput, { backgroundColor: theme.background, color: theme.text }]}
                                placeholder="Enter your goal..."
                                placeholderTextColor={theme.subtext}
                                value={task}
                                onChangeText={setTask}
                            />

                            <Text style={[styles.inputLabel, { color: theme.text }]}>Description</Text>
                            <TextInput
                                style={[styles.modalInput, styles.textArea, { backgroundColor: theme.background, color: theme.text }]}
                                placeholder="Add details about your goal..."
                                placeholderTextColor={theme.subtext}
                                value={description}
                                onChangeText={setDescription}
                                multiline
                                numberOfLines={4}
                            />

                            <Text style={[styles.inputLabel, { color: theme.text }]}>Due Date</Text>
                            <TouchableOpacity
                                style={[styles.dateSelector, { backgroundColor: theme.background }]}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Ionicons name="calendar-outline" size={24} color={theme.subtext} />
                                <Text style={[styles.dateText, { color: theme.text }]}>{formatDate(dueDate.toISOString())}</Text>
                            </TouchableOpacity>

                            {showDatePicker && (
                                <DateTimePicker
                                    value={dueDate}
                                    mode="datetime"
                                    display={theme.mode === 'dark' ? 'spinner' : 'default'}
                                    onChange={onDateChange}
                                />
                            )}

                            {currentGoal && currentGoal.completed && (
                                <TouchableOpacity
                                    style={[styles.featuredOption, { backgroundColor: 'rgba(255, 215, 0, 0.1)', borderColor: 'rgba(255, 215, 0, 0.3)' }]}
                                    onPress={() => setDisplayFeatured(!displayFeatured)}
                                >
                                    <Ionicons
                                        name={displayFeatured ? "star" : "star-outline"}
                                        size={24}
                                        color={displayFeatured ? "#FFD700" : theme.subtext}
                                    />
                                    <Text style={[styles.featuredText, { color: theme.text }]}>
                                        {displayFeatured ? "Featured in Completed Goals" : "Mark as Featured"}
                                    </Text>
                                </TouchableOpacity>
                            )}

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton, { backgroundColor: theme.border }]}
                                    onPress={() => {
                                        clearForm();
                                        setEditModalVisible(false);
                                        setCurrentGoal(null);
                                    }}
                                >
                                    <Text style={[styles.buttonText, { color: theme.text }]}>Cancel</Text>
                                </TouchableOpacity>

                                <LinearGradient
                                    colors={["#5A1A9B", "#1A4A80", "#8A1E50"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.gradientButton}
                                >
                                    <TouchableOpacity
                                        style={[styles.modalButton, { flex: 1, justifyContent: "center", alignItems: "center" }]}
                                        onPress={handleUpdateGoal}
                                    >
                                        <Text style={styles.buttonText}>Update</Text>
                                    </TouchableOpacity>
                                </LinearGradient>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 80,
        paddingHorizontal: 20,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    backButton: {
        position: "absolute",
        left: 10,
        zIndex: 1,
        padding: 10,
        paddingTop: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 20,
    },
    errorText: {
        textAlign: "center",
        marginBottom: 10,
    },
    addGoalButton: {
        borderRadius: 10,
        marginVertical: 15,
        padding: 12,
        alignItems: "center",
    },
    addGoalButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    tabContainer: {
        flexDirection: "row",
        marginBottom: 15,
    },
    tab: {
        flex: 1,
        padding: 12,
        alignItems: "center",
        borderRadius: 10,
        marginHorizontal: 5,
    },
    activeTab: {
        // This is now handled inline with theme.primary
    },
    tabText: {
        fontWeight: "600",
    },
    activeTabText: {
        color: "#fff",
    },
    taskItem: {
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
    },
    taskTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    taskCheckboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    checkbox: {
        marginRight: 10,
    },
    taskText: {
        fontSize: 16,
        flex: 1,
    },
    completedTask: {
        textDecorationLine: "line-through",
    },
    descriptionText: {
        marginTop: 8,
        marginLeft: 34,
        fontSize: 14,
    },
    dueDateContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 11,
        marginLeft: 34,
    },
    dueDateText: {
        fontSize: 14,
        marginLeft: 6,
    },
    emptyText: {
        textAlign: "center",
        marginTop: 40,
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        padding: 20,
    },
    modalContent: {
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        marginBottom: 5,
        marginTop: 10,
    },
    modalInput: {
        borderRadius: 10,
        padding: 12,
        fontSize: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    dateSelector: {
        borderRadius: 10,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    dateText: {
        marginLeft: 10,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    modalButton: {
        padding: 12,
        borderRadius: 10,
        flex: 0.48,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#3A3A3A',
    },
    gradientButton: {
        borderRadius: 10,
        flex: 0.48,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    featuredOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        marginTop: 15,
        marginBottom: 10,
        borderWidth: 1,
    },
    featuredText: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: '500',
    },
    taskActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starIcon: {
        marginRight: 10,
    }
});

export default GoalsScreen;