import React from 'react';
import { SectionList, View, Text, StyleSheet } from 'react-native';
import TaskItem from './TaskItem';
import { TaskItem as TaskItemType } from '../utils/handle-api';

interface TaskListProps {
  tasks: TaskItemType[];
  onEdit: (item: TaskItemType) => void;
  onDelete: (id: string) => void;
}

interface TaskSection {
  title: string;
  data: TaskItemType[];
}

const formatSections = (tasks: TaskItemType[]): TaskSection[] => {
  const sortedTasks = [...tasks].sort((a, b) =>
    a.text.localeCompare(b.text, 'pt-BR', { sensitivity: 'base' }),
  );

  const sectionsMap = new Map<string, TaskItemType[]>();

  sortedTasks.forEach((item) => {
    const letter = item.text?.trim().charAt(0).toUpperCase() || '#';
    const sectionKey = /[A-Z]/i.test(letter) ? letter : '#';

    if (!sectionsMap.has(sectionKey)) {
      sectionsMap.set(sectionKey, []);
    }
    sectionsMap.get(sectionKey)!.push(item);
  });

  return Array.from(sectionsMap.entries()).map(([title, data]) => ({ title, data }));
};

const TaskList: React.FC<TaskListProps> = ({ tasks, onEdit, onDelete }) => {
  const sections = formatSections(tasks);

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item._id}
      contentContainerStyle={styles.listContent}
      renderSectionHeader={({ section: { title } }) => (
        <View style={styles.sectionHeaderContainer}>
          <Text style={styles.sectionHeaderText}>{title}</Text>
        </View>
      )}
      renderItem={({ item }) => (
        <TaskItem
          item={item}
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item._id)}
        />
      )}
      ListEmptyComponent={() => (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Nenhuma tarefa ainda. Adicione a primeira!</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 24,
  },
  sectionHeaderContainer: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  sectionHeaderText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  emptyContainer: {
    paddingTop: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#888',
    fontSize: 16,
  },
});

export default TaskList;
