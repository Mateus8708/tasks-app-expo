import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
      <Text style={styles.text}>{item.text}</Text>
      <View style={styles.icons}>
        <TouchableOpacity onPress={onEdit} style={styles.iconButton}>
          <Feather name="edit" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.iconButton}>
          <AntDesign name="delete" size={20} color="#fff" />
        </TouchableOpacity>
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
  text: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  icons: {
    flexDirection: 'row',
    gap: 12,
    marginLeft: 10,
  },
  iconButton: {
    padding: 6,
  },
});

export default TaskItem;
