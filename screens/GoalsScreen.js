    import React, { useState, useEffect } from "react";
    import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, ScrollView, TouchableWithoutFeedback, Keyboard } from "react-native";
    import { useNavigation } from "@react-navigation/native";
    import { Ionicons } from "@expo/vector-icons";
    import { LinearGradient } from "expo-linear-gradient";
    import DateTimePicker from '@react-native-community/datetimepicker';
    import { fetchGoals, addGoal, deleteGoal, toggleGoalCompletion, updateGoal } from "../api/todoApi";

    const GoalsScreen = () => {
        const navigation = useNavigation();
        const [task, setTask] = useState("");
        const [description, setDescription] = useState("");
        const [dueDate, setDueDate] = useState(new Date());
        const [tasks, setTasks] = useState([]);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
        const [activeTab, setActiveTab] = useState("active"); // 'active' or 'completed'
        const [modalVisible, setModalVisible] = useState(false);
        const [editModalVisible, setEditModalVisible] = useState(false);
        const [showDatePicker, setShowDatePicker] = useState(false);
        const [currentGoal, setCurrentGoal] = useState(null);

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
                        completed: false
                    });
                    setTasks([...tasks, newGoal]);
                    clearForm();
                    setModalVisible(false);
                    // Switch to active tab when adding a new goal
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
                        dueDate: dueDate.toISOString()
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

        if (loading) {
            return (
                <View style={[styles.container, styles.centerContent]}>
                    <ActivityIndicator size="large" color="#5A1A9B" />
                </View>
            );
        }

        // Count active and completed tasks
        const activeTasks = tasks.filter(task => !task.completed).length;
        const completedTasks = tasks.filter(task => task.completed).length;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    {/* Back Button */}
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={30} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.title}>My Goals</Text>

                    {/* Error message if any */}
                    {error && <Text style={styles.errorText}>{error}</Text>}

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
                                activeTab === "active" && styles.activeTab
                            ]}
                            onPress={() => setActiveTab("active")}
                        >
                            <Text style={[
                                styles.tabText,
                                activeTab === "active" && styles.activeTabText
                            ]}>
                                Active ({activeTasks})
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.tab,
                                activeTab === "completed" && styles.activeTab
                            ]}
                            onPress={() => setActiveTab("completed")}
                        >
                            <Text style={[
                                styles.tabText,
                                activeTab === "completed" && styles.activeTabText
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
                                style={styles.taskItem}
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
                                            color={item.completed ? "#5A1A9B" : "#aaa"}
                                            style={styles.checkbox}
                                        />
                                        <Text style={[
                                            styles.taskText,
                                            item.completed && styles.completedTask
                                        ]}>
                                            {item.text}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            handleRemoveTask(item.id);
                                        }}
                                    >
                                        <Ionicons name="trash-outline" size={24} color="red" />
                                    </TouchableOpacity>
                                </View>
                        
                                {item.description && (
                                    <Text style={styles.descriptionText}>
                                        {item.description.length > 50 
                                            ? item.description.substring(0, 50) + "..." 
                                            : item.description}
                                    </Text>
                                )}
                        
                                {item.dueDate && (
                                    <View style={styles.dueDateContainer}>
                                        <Ionicons name="time-outline" size={18} color="#aaa" />
                                        <Text style={styles.dueDateText}>
                                            {formatDate(item.dueDate)}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>
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
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Create New Goal</Text>
                        
                                <Text style={styles.inputLabel}>Goal Name</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="Enter your goal..."
                                    placeholderTextColor="#aaa"
                                    value={task}
                                    onChangeText={setTask}
                                />
                        
                                <Text style={styles.inputLabel}>Description</Text>
                                <TextInput
                                    style={[styles.modalInput, styles.textArea]}
                                    placeholder="Add details about your goal..."
                                    placeholderTextColor="#aaa"
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={4}
                                />
                        
                                <Text style={styles.inputLabel}>Due Date</Text>
                                <TouchableOpacity 
                                    style={styles.dateSelector}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Ionicons name="calendar-outline" size={24} color="#aaa" />
                                    <Text style={styles.dateText}>{formatDate(dueDate.toISOString())}</Text>
                                </TouchableOpacity>
                        
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={dueDate}
                                        mode="datetime"
                                        display="default"
                                        onChange={onDateChange}
                                    />
                                )}
                        
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity 
                                        style={[styles.modalButton, styles.cancelButton]} 
                                        onPress={() => {
                                            clearForm();
                                            setModalVisible(false);
                                        }}
                                    >
                                        <Text style={styles.buttonText}>Cancel</Text>
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
                            <View style={styles.modalContent}>
                                <Text style={styles.modalTitle}>Edit Goal</Text>
                        
                                <Text style={styles.inputLabel}>Goal Name</Text>
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="Enter your goal..."
                                    placeholderTextColor="#aaa"
                                    value={task}
                                    onChangeText={setTask}
                                />
                        
                                <Text style={styles.inputLabel}>Description</Text>
                                <TextInput
                                    style={[styles.modalInput, styles.textArea]}
                                    placeholder="Add details about your goal..."
                                    placeholderTextColor="#aaa"
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={4}
                                />
                        
                                <Text style={styles.inputLabel}>Due Date</Text>
                                <TouchableOpacity 
                                    style={styles.dateSelector}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Ionicons name="calendar-outline" size={24} color="#aaa" />
                                    <Text style={styles.dateText}>{formatDate(dueDate.toISOString())}</Text>
                                </TouchableOpacity>
                        
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={dueDate}
                                        mode="datetime"
                                        display="default"
                                        onChange={onDateChange}
                                    />
                                )}
                        
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity 
                                        style={[styles.modalButton, styles.cancelButton]} 
                                        onPress={() => {
                                            clearForm();
                                            setEditModalVisible(false);
                                            setCurrentGoal(null);
                                        }}
                                    >
                                        <Text style={styles.buttonText}>Cancel</Text>
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
            backgroundColor: "#121212",
            paddingTop: 80,
            paddingHorizontal: 20,
        },
        centerContent: {
            justifyContent: 'center',
            alignItems: 'center',
        },
        backButton: {
            position: "absolute",
            top: 90,
            left: 20,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            padding: 10,
            borderRadius: 10,
            zIndex: 1, // Ensures it's above other elements
            alignItems: "center",
            justifyContent: "center",
        },
        title: {
            color: "#fff",
            fontSize: 24,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 20,
        },
        errorText: {
            color: "red",
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
            backgroundColor: "#1E1E1E",
            borderRadius: 10,
            marginHorizontal: 5,
        },
        activeTab: {
            backgroundColor: "#5A1A9B",
        },
        tabText: {
            color: "#aaa",
            fontWeight: "600",
        },
        activeTabText: {
            color: "#fff",
        },
        taskItem: {
            backgroundColor: "#1E1E1E",
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
            color: "#fff",
            fontSize: 16,
            flex: 1,
        },
        completedTask: {
            textDecorationLine: "line-through",
            color: "#aaa",
        },
        descriptionText: {
            color: "#aaa",
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
            color: "#aaa",
            fontSize: 14,
            marginLeft: 6,
        },
        emptyText: {
            color: "#aaa",
            textAlign: "center",
            marginTop: 40,
            fontSize: 16,
        },
        // Modal Styles
        modalContainer: {
            flex: 1,
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            padding: 20,
        },
        modalContent: {
            backgroundColor: '#1E1E1E',
            borderRadius: 15,
            padding: 20,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
        },
        modalTitle: {
            color: '#fff',
            fontSize: 22,
            fontWeight: 'bold',
            textAlign: 'center',
            marginBottom: 20,
        },
        inputLabel: {
            color: '#fff',
            fontSize: 16,
            marginBottom: 5,
            marginTop: 10,
        },
        modalInput: {
            backgroundColor: '#2A2A2A',
            borderRadius: 10,
            color: '#fff',
            padding: 12,
            fontSize: 16,
        },
        textArea: {
            height: 100,
            textAlignVertical: 'top',
        },
        dateSelector: {
            backgroundColor: '#2A2A2A',
            borderRadius: 10,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
        },
        dateText: {
            color: '#fff',
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
    });

    export default GoalsScreen;