import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, SafeAreaView, Platform, StatusBar as RNStatusBar, Image, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import TaskList from './src/components/TaskList';
import { addTask, deleteTask, getAllTasks, updateTask, TaskItem } from './src/utils/handle-api';

export default function App() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [text, setText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [taskId, setTaskId] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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

  const updateMode = (_id: string, text: string) => {
    setIsUpdating(true);
    setText(text);
    setTaskId(_id);
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
      if (isUpdating) {
        await updateTask(taskId, text, setTasks, setText, setIsUpdating);
      } else {
        await addTask(text, setText, setTasks);
      }
      setErrorMessage('');
      setText('');
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

        <View style={styles.top}>
          <TextInput
            style={styles.input}
            placeholder="Adicione uma tarefa..."
            placeholderTextColor="#666"
            value={text}
            onChangeText={(val) => setText(val)}
            maxLength={120}
            keyboardType="default"
            returnKeyType="done"
          />

          <TouchableOpacity
            style={styles.addButton}
            onPress={handleSave}
          >
            <Text style={styles.addButtonText}>{isUpdating ? 'Atualizar' : 'Adicionar'}</Text>
          </TouchableOpacity>
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <View style={styles.deleteAllButton}>
          <Button title="Excluir todas as tarefas" onPress={deleteAllTasks} color="#d63031" />
        </View>

        <TaskList tasks={tasks} onEdit={(item) => updateMode(item._id, item.text)} onDelete={(id) => deleteTask(id, setTasks)} />
      </View>
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
  top: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    marginRight: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    fontSize: 16,
    backgroundColor: '#f8f8f8',
  },
  addButton: {
    backgroundColor: '#0984e3',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteAllButton: {
    marginTop: 14,
    marginBottom: 8,
  },
  errorText: {
    marginTop: 10,
    color: '#d63031',
    textAlign: 'center',
  },
});
