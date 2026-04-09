import { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, SafeAreaView,
  Platform, StatusBar as RNStatusBar, Image, Pressable, Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Checkbox from 'expo-checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import TaskList from './src/components/TaskList';
import { addTask, deleteTask, getAllTasks, updateTask, TaskItem } from './src/utils/handle-api';

export default function App() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [text, setText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [taskId, setTaskId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        await getAllTasks(setTasks);
        setErrorMessage('');
      } catch (error) {
        setErrorMessage('Servidor indisponível no momento. Tente novamente.');
      }
    };

    loadTasks();
  }, []);

  const openNewTaskModal = () => {
    setIsUpdating(false);
    setText('');
    setCompleted(false);
    setDueDate(null);
    setModalVisible(true);
  };

  const updateMode = (_id: string, taskText: string, taskCompleted: boolean, taskDueDate: string | null) => {
    setIsUpdating(true);
    setText(taskText);
    setTaskId(_id);
    setCompleted(taskCompleted ?? false);
    setDueDate(taskDueDate ? new Date(taskDueDate) : null);
    setModalVisible(true);
  };

  const deleteAllTasks = async () => {
    if (tasks.length === 0) return;

    try {
      for (const item of tasks) {
        await deleteTask(item._id, setTasks);
      }
      setErrorMessage('');
    } catch {
      setErrorMessage('Não foi possível excluir todas as tarefas agora. Tente novamente.');
    }
  };

  const handleSave = async () => {
    try {
      const dueDateStr = dueDate ? dueDate.toISOString() : null;
      if (isUpdating) {
        await updateTask(taskId, text, completed, dueDateStr, setTasks, setText, setIsUpdating);
      } else {
        await addTask(text, completed, dueDateStr, setText, setTasks);
      }
      setErrorMessage('');
      setModalVisible(false);
    } catch {
      setErrorMessage('Falha de rede ao salvar. Repetindo em breve.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Image source={require('./assets/task-app-banner.png')} style={styles.headerImage} resizeMode="contain" />
        <Text style={styles.header}>Tarefas</Text>
        <Text style={styles.counter}>{tasks.length} tarefa(s)</Text>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <View style={styles.actionRow}>
          <Pressable
            style={({ pressed }) => [
              styles.newTaskButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={openNewTaskModal}
          >
            <Text style={styles.newTaskButtonText}>+ Nova Tarefa</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.deleteAllButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={deleteAllTasks}
          >
            <Text style={styles.deleteButtonText}>Excluir todas</Text>
          </Pressable>
        </View>

        <TaskList
          tasks={tasks}
          onEdit={(item) => updateMode(item._id, item.text, item.completed ?? false, item.dueDate ?? null)}
          onDelete={(id) => deleteTask(id, setTasks)}
        />
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{isUpdating ? 'Editar Tarefa' : 'Nova Tarefa'}</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Descrição da tarefa..."
              placeholderTextColor="#666"
              value={text}
              onChangeText={setText}
              maxLength={120}
              keyboardType="default"
              returnKeyType="done"
            />

            <View style={styles.checkboxRow}>
              <Checkbox
                value={completed}
                onValueChange={setCompleted}
                color={completed ? '#0984e3' : undefined}
              />
              <Text style={styles.checkboxLabel}>Marcar como Concluída</Text>
            </View>

            <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateButtonText}>
                {dueDate
                  ? `Vencimento: ${dueDate.toLocaleDateString('pt-BR')}`
                  : 'Definir data de vencimento'}
              </Text>
            </Pressable>

            {showDatePicker && (
              <DateTimePicker
                value={dueDate ?? new Date()}
                mode="date"
                display="default"
                onChange={(_event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDueDate(selectedDate);
                }}
              />
            )}

            <View style={styles.modalButtons}>
              <Pressable
                style={({ pressed }) => [styles.cancelButton, pressed && styles.buttonPressed]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.saveButton, pressed && styles.buttonPressed]}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>{isUpdating ? 'Atualizar' : 'Salvar'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    maxWidth: 600,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerImage: {
    width: '100%',
    height: 120,
    marginBottom: 12,
  },
  header: {
    marginTop: 2,
    textAlign: 'center',
    fontSize: 26,
    fontWeight: 'bold',
  },
  counter: {
    marginTop: 8,
    textAlign: 'center',
    color: '#555',
    fontSize: 16,
  },
  errorText: {
    marginTop: 10,
    color: '#d63031',
    textAlign: 'center',
  },
  actionRow: {
    marginTop: 16,
    marginBottom: 8,
    flexDirection: 'row',
    gap: 10,
  },
  newTaskButton: {
    flex: 1,
    backgroundColor: '#0984e3',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 4,
  },
  newTaskButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  deleteAllButton: {
    flex: 1,
    backgroundColor: '#d63031',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
    elevation: 1,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#222',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
    marginBottom: 16,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  checkboxLabel: {
    fontSize: 15,
    color: '#333',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#0984e3',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  dateButtonText: {
    color: '#0984e3',
    fontSize: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#636e72',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 3,
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#0984e3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
