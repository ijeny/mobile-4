import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../../src/utils/supabase";

type Note = {
  id: number;
  title: string;
  content: string;
  created_at?: string;
};

export default function HomeScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.log("Gagal mengambil data:", error.message);
      Alert.alert("Error", "Gagal mengambil data notes");
    } else {
      setNotes(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

const addNote = async () => {
  if (!title.trim() || !content.trim()) {
    Alert.alert("Peringatan", "Judul dan isi catatan harus diisi");
    return;
  }

  const { data, error } = await supabase
    .from("notes")
    .insert([
      {
        title: title.trim(),
        content: content.trim(),
      },
    ])
    .select();

  console.log("HASIL INSERT:", { data, error });

  if (error) {
    console.log("ERROR INSERT FULL:", JSON.stringify(error, null, 2));
    Alert.alert("Error Insert", error.message || "Gagal menambah catatan");
    return;
  }

  Alert.alert("Berhasil", "Catatan berhasil ditambahkan");
  setTitle("");
  setContent("");
  fetchNotes();
};

  const updateNote = async () => {
    if (editId === null) return;

    if (!title.trim() || !content.trim()) {
      Alert.alert("Peringatan", "Judul dan isi catatan harus diisi");
      return;
    }

    const { error } = await supabase
      .from("notes")
      .update({
        title: title.trim(),
        content: content.trim(),
      })
      .eq("id", editId);

    if (error) {
      console.log("Gagal update data:", error.message);
      Alert.alert("Error", "Gagal mengubah catatan");
      return;
    }

    Alert.alert("Berhasil", "Catatan berhasil diupdate");
    setEditId(null);
    setTitle("");
    setContent("");
    fetchNotes();
  };

  const deleteNote = async (id: number) => {
    Alert.alert("Konfirmasi", "Yakin ingin menghapus catatan ini?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Hapus",
        style: "destructive",
        onPress: async () => {
          const { error } = await supabase.from("notes").delete().eq("id", id);

          if (error) {
            console.log("Gagal hapus data:", error.message);
            Alert.alert("Error", "Gagal menghapus catatan");
            return;
          }

          fetchNotes();
        },
      },
    ]);
  };

  const resetForm = () => {
    setEditId(null);
    setTitle("");
    setContent("");
  };

  const startEdit = (note: Note) => {
    setEditId(note.id);
    setTitle(note.title);
    setContent(note.content);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Aplikasi Notes Supabase</Text>

      <View style={styles.formCard}>
        <TextInput
          style={styles.input}
          placeholder="Masukkan judul catatan"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Masukkan isi catatan"
          value={content}
          onChangeText={setContent}
          multiline
        />

        {editId ? (
          <View style={styles.rowButton}>
            <TouchableOpacity
              style={[styles.rowActionButton, styles.updateButton]}
              onPress={updateNote}
            >
              <Text style={styles.buttonText}>Update Catatan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.rowActionButton, styles.cancelButton]}
              onPress={resetForm}
            >
              <Text style={styles.buttonText}>Batal</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.mainButton} onPress={addNote}>
            <Text style={styles.buttonText}>Tambah Catatan</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.subHeading}>Daftar Catatan</Text>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id.toString()}
        refreshing={loading}
        onRefresh={fetchNotes}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Belum ada catatan.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.noteTitle}>{item.title}</Text>
            <Text style={styles.noteContent}>{item.content}</Text>

            {item.created_at ? (
              <Text style={styles.noteDate}>
                {new Date(item.created_at).toLocaleString("id-ID")}
              </Text>
            ) : null}

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.smallButton, styles.editButton]}
                onPress={() => startEdit(item)}
              >
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.smallButton, styles.deleteButton]}
                onPress={() => deleteNote(item.id)}
              >
                <Text style={styles.buttonText}>Hapus</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f7fb",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 18,
    color: "#1f2937",
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  subHeading: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
    color: "#1f2937",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
    fontSize: 14,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },

  // tombol utama tambah
  mainButton: {
    backgroundColor: "#2e86de",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },

  // tombol update + batal saat mode edit
  rowButton: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  rowActionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  updateButton: {
    backgroundColor: "#27ae60",
  },
  cancelButton: {
    backgroundColor: "#7f8c8d",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  listContent: {
    paddingBottom: 100,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 24,
    color: "#6b7280",
    fontSize: 14,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  noteTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  noteContent: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 8,
    lineHeight: 20,
  },
  noteDate: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 12,
  },

  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  smallButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#f39c12",
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
  },
});
