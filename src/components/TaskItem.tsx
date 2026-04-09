import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Feather, AntDesign } from '@expo/vector-icons';
import { TaskItem as TaskItemType } from '../utils/handle-api';

interface TaskItemProps {
  item: TaskItemType;
  onEdit: () => void;
  onDelete: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ item, onEdit, onDelete }) => {
  return (
    <View style={styles.todo}>
      <View style={styles.textContainer}>
        <Text style={[styles.text, item.completed && styles.textCompleted]}>
          {item.text}
        </Text>
        {item.dueDate ? (
          <Text style={styles.dueDate}>
            Vence em: {new Date(item.dueDate).toLocaleDateString('pt-BR')}
          </Text>
        ) : null}
      </View>

      <View style={styles.icons}>
        <Pressable
          onPress={onEdit}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.iconButtonPressed,
          ]}
        >
          <Feather name="edit" size={20} color="#fff" />
        </Pressable>

        <Pressable
          onPress={onDelete}
          style={({ pressed }) => [
            styles.iconButton,
            pressed && styles.iconButtonPressed,
          ]}
        >
          <AntDesign name="delete" size={20} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  todo: {
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  text: {
    color: '#fff',
    fontSize: 16,
  },
  textCompleted: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  dueDate: {
    color: '#fdcb6e',
    fontSize: 12,
    marginTop: 4,
  },
  icons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    padding: 6,
    elevation: 3,
  },
  iconButtonPressed: {
    transform: [{ scale: 0.98 }],
    elevation: 1,
  },
});

export default TaskItem;
