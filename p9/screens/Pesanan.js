import React, { useState } from "react";
import {
  View,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import ItemPesanan from "../components/ItemPesanan";

const parseDate = (d) => {
  if (!d) return 0;
  if (d instanceof Date) return d.getTime();
  if (typeof d === "number") return d;
  const s = String(d).trim();
  const parts = s.split(/[-\/\.]/);
  if (parts.length === 3) {
    const [p1, p2, p3] = parts.map(Number);
    if (p1 > 31) return new Date(p1, p2 - 1, p3).getTime();
    return new Date(p3, p2 - 1, p1).getTime();
  }
  const t = Date.parse(s);
  return isNaN(t) ? 0 : t;
};

const formatTanggal = (date) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);

export default function Pesanan({
  pesanan,
  tandaiSelesai,
  hapusPesanan,
  editPesanan,
  colors,
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editNama, setEditNama] = useState("");
  const [editTanggal, setEditTanggal] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const data = pesanan
    .filter((item) => item.status === "Menunggu")
    .slice()
    .sort((a, b) => parseDate(a.date) - parseDate(b.date));

  const bukaModalEdit = (order) => {
    setSelectedOrder(order);
    setEditNama(order.customer || "");
    setEditTanggal(order.date ? new Date(parseDate(order.date)) : new Date());
    setModalVisible(true);
  };

  const tutupModal = () => {
    setModalVisible(false);
    setSelectedOrder(null);
    setEditNama("");
    setEditTanggal(new Date());
    setShowDatePicker(false);
  };

  const onChangeTanggal = (event, selectedDate) => {
    if (Platform.OS === "android") {
      if (event?.type === "dismissed") {
        setShowDatePicker(false);
        return;
      }
      if (event?.type === "set" && selectedDate) {
        setEditTanggal(selectedDate);
        setShowDatePicker(false);
        return;
      }
      if (selectedDate) {
        setEditTanggal(selectedDate);
        setShowDatePicker(false);
      }
    } else if (selectedDate) {
      setEditTanggal(selectedDate);
    }
  };

  const handleSimpanEdit = async () => {
    if (!selectedOrder) return;

    if (!editNama.trim()) {
      Alert.alert("Nama customer tidak boleh kosong!");
      return;
    }

    await editPesanan(selectedOrder.id, {
      ...selectedOrder,
      customer: editNama.trim(),
      date: formatTanggal(editTanggal),
    });

    tutupModal();
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: colors.background }}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 12 }}>
            <ItemPesanan
              item={item}
              onHapus={() => hapusPesanan(item.id)}
              colors={colors}
            />

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={() => bukaModalEdit(item)}
              >
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionButton,
                  { backgroundColor: colors.secondary },
                ]}
                onPress={() => tandaiSelesai(item.id)}
              >
                <Text style={styles.actionText}>Tandai Selesai</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={tutupModal}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Edit Pesanan
            </Text>

            <Text style={[styles.label, { color: colors.text }]}>
              Nama Customer
            </Text>
            <TextInput
              value={editNama}
              onChangeText={setEditNama}
              placeholder="Nama customer"
              placeholderTextColor={colors.muted}
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
            />

            <Text style={[styles.label, { color: colors.text }]}>
              Tanggal Ambil
            </Text>
            <TouchableOpacity
              style={[
                styles.dateField,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: colors.text }}>
                {formatTanggal(editTanggal)}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={editTanggal}
                mode="date"
                display={Platform.OS === "android" ? "calendar" : "spinner"}
                onChange={onChangeTanggal}
              />
            )}

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.muted }]}
                onPress={tutupModal}
              >
                <Text style={styles.actionText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={handleSimpanEdit}
              >
                <Text style={styles.actionText}>Simpan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 20,
  },
  modalContainer: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  dateField: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
  },
  modalActionRow: {
    flexDirection: "row",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
});
