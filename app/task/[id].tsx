import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  SafeAreaView, Platform, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import Checkbox from 'expo-checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTaskStore } from '../../src/store/useTaskStore';
import { globalStyles } from '../../src/styles/global';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const task = useTaskStore((state) => state.tasks.find((t) => t._id === id));
  const updateTask = useTaskStore((state) => state.updateTask);

  const [text, setText] = useState('');
  const [completed, setCompleted] = useState(false);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setText(task.text);
      setCompleted(!!task.completed);
      setDueDate(task.dueDate ? new Date(task.dueDate) : null);
    }
  }, [task]);

  if (!task) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centered}>
          <Text style={styles.notFoundText}>Tarefa não encontrada.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    if (!text.trim()) return;
    setSaving(true);
    await updateTask(id, text, completed, dueDate ? dueDate.toISOString() : null);
    setSaving(false);
    router.back();
  };

  const onChangeDate = (_event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDueDate(selectedDate);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Editar Tarefa</Text>

        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          maxLength={50}
          placeholder="Nome da tarefa..."
        />

        <Text style={styles.label}>Data limite</Text>
        {Platform.OS === 'web' ? (
          // @ts-ignore
          <input
            type="date"
            value={dueDate ? dueDate.toISOString().split('T')[0] : ''}
            onChange={(e: any) => {
              const val = e.target.value;
              if (val) {
                const parts = val.split('-');
                setDueDate(new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
              } else {
                setDueDate(null);
              }
            }}
            style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', marginBottom: 16, width: '100%' }}
          />
        ) : (
          <View style={styles.dateRow}>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerBtn}>
              <Text>{dueDate ? dueDate.toLocaleDateString() : 'Selecionar Data'}</Text>
            </TouchableOpacity>
            {dueDate && (
              <TouchableOpacity onPress={() => setDueDate(null)} style={styles.clearDateBtn}>
                <Text style={styles.clearDateText}>Limpar</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {showDatePicker && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode="date"
            display="default"
            onChange={onChangeDate}
          />
        )}

        <View style={styles.checkboxRow}>
          <Text style={styles.label}>Concluída</Text>
          <Checkbox
            value={completed}
            onValueChange={setCompleted}
            color={completed ? '#000' : undefined}
            style={styles.checkbox}
          />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.saveBtn, (!text.trim() || saving) && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!text.trim() || saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.saveText}>Salvar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: globalStyles.backgroundColor },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFoundText: { fontSize: 16, color: '#666' },
  container: { flex: 1, padding: 24 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: '#ccc', borderRadius: 4,
    paddingVertical: 10, paddingHorizontal: 12, fontSize: 16, marginBottom: 20,
  },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  datePickerBtn: { borderWidth: 1, borderColor: '#ccc', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 4 },
  clearDateBtn: { paddingVertical: 8, paddingHorizontal: 12 },
  clearDateText: { color: '#ff4d4d', fontWeight: 'bold' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  checkbox: { marginLeft: 12 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 20 },
  cancelText: { color: '#666', fontSize: 16, fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#000', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 4 },
  saveBtnDisabled: { backgroundColor: '#ccc' },
  saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
