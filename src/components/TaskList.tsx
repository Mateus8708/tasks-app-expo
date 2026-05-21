import React, { useMemo } from 'react';
import { SectionList, StyleSheet, View, Text } from 'react-native';
import TaskItem from './TaskItem';
import { TaskItem as TaskType } from '../store/useTaskStore';

interface TaskListProps {
  tasks: TaskType[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  const sections = useMemo(() => {
    const completedTasks = tasks.filter((task) => task.completed);
    const pendingTasks = tasks.filter((task) => !task.completed);

    return [
      { title: '✅ Concluídas', data: completedTasks },
      { title: '📋 Pendentes', data: pendingTasks },
    ];
  }, [tasks]);

  return (
    <View style={styles.listContainer}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionHeader}>{title}</Text>
        )}
        renderItem={({ item }) => <TaskItem task={item} />}
        renderSectionFooter={({ section }) =>
          section.data.length === 0 ? (
            <Text style={styles.emptySectionText}>Nenhuma tarefa nesta categoria.</Text>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: { flex: 1, marginTop: 16 },
  listContent: { paddingBottom: 24 },
  sectionHeader: {
    backgroundColor: '#f0f0f0', fontWeight: 'bold',
    padding: 12, fontSize: 16, marginTop: 8, marginBottom: 8, borderRadius: 4,
  },
  emptySectionText: { padding: 16, color: '#666', fontStyle: 'italic', textAlign: 'center' },
});

export default TaskList;
