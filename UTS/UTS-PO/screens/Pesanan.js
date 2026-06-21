import React, { useMemo, useState } from "react";
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
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import ItemPesanan from "../components/ItemPesanan";
import { appColors } from "../theme/colors";

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
  products = [],
}) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [editNama, setEditNama] = useState("");
  const [editTanggal, setEditTanggal] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [editItems, setEditItems] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [editJumlah, setEditJumlah] = useState("");

  const data = pesanan
    .filter((item) => item.status === "Menunggu")
    .slice()
    .sort((a, b) => parseDate(a.date) - parseDate(b.date));

  const hargaProduk = useMemo(() => {
    return products.reduce((acc, item) => {
      acc[item.id] = {
        name: item.name,
        price: item.price,
      };
      return acc;
    }, {});
  }, [products]);

  const tutupModal = () => {
    setModalVisible(false);
    setSelectedOrder(null);
    setEditNama("");
    setEditTanggal(new Date());
    setShowDatePicker(false);
    setEditItems([]);
    setSelectedProductId("");
    setEditJumlah("");
  };

  const bukaModalEdit = (order) => {
    setSelectedOrder(order);
    setEditNama(order.customer || "");
    setEditTanggal(order.date ? new Date(parseDate(order.date)) : new Date());
    setEditItems(order.items ? [...order.items] : []);
    setSelectedProductId("");
    setEditJumlah("");
    setModalVisible(true);
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

  const handleTambahItemEdit = () => {
    const jumlahAngka = parseInt(editJumlah, 10);

    if (
      !selectedProductId ||
      !editJumlah ||
      Number.isNaN(jumlahAngka) ||
      jumlahAngka <= 0 ||
      !hargaProduk[selectedProductId]
    ) {
      Alert.alert("Peringatan", "Pilih produk dan isi jumlah yang valid.");
      return;
    }

    const produkDipilih = hargaProduk[selectedProductId];

    const itemBaru = {
      produk: produkDipilih.name,
      jumlah: jumlahAngka,
      total: produkDipilih.price * jumlahAngka,
    };

    setEditItems((prev) => [...prev, itemBaru]);
    setSelectedProductId("");
    setEditJumlah("");
  };

  const handleHapusItemEdit = (index) => {
    setEditItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUbahJumlahItem = (index, jumlahBaru) => {
    const jumlahAngka = parseInt(jumlahBaru, 10);

    if (Number.isNaN(jumlahAngka) || jumlahAngka <= 0) return;

    setEditItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const productMatch = products.find((p) => p.name === item.produk);
        const hargaSatuan = productMatch ? productMatch.price : 0;

        return {
          ...item,
          jumlah: jumlahAngka,
          total: hargaSatuan * jumlahAngka,
        };
      }),
    );
  };

  const handleSimpanEdit = () => {
    if (!selectedOrder) return;

    if (!editNama.trim()) {
      Alert.alert("Peringatan", "Nama customer tidak boleh kosong.");
      return;
    }

    if (editItems.length === 0) {
      Alert.alert("Peringatan", "Pesanan harus memiliki minimal 1 item.");
      return;
    }

    const totalBaru = editItems.reduce(
      (sum, item) => sum + (item.total || 0),
      0,
    );

    editPesanan(selectedOrder.id, {
      customer: editNama.trim(),
      date: formatTanggal(editTanggal),
      items: editItems,
      total: totalBaru,
    });

    tutupModal();
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.orderWrapper}>
            <ItemPesanan item={item} />

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => bukaModalEdit(item)}
              >
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => hapusPesanan(item.id)}
              >
                <Text style={styles.actionText}>Hapus Pesanan</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.doneButton]}
                onPress={() => tandaiSelesai(item.id)}
              >
                <Text style={styles.actionText}>Tandai Selesai</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyListText}>Belum ada pesanan masuk.</Text>
        }
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={tutupModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Edit Pesanan</Text>

              <Text style={styles.label}>Nama Customer</Text>
              <TextInput
                value={editNama}
                onChangeText={setEditNama}
                placeholder="Nama customer"
                placeholderTextColor={appColors.secondaryText}
                style={styles.input}
              />

              <Text style={styles.label}>Tanggal Ambil</Text>
              <TouchableOpacity
                style={styles.dateField}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateValue}>
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

              <Text style={[styles.label, { marginTop: 16 }]}>
                Tambah Produk ke Pesanan
              </Text>

              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedProductId}
                  style={styles.picker}
                  onValueChange={setSelectedProductId}
                >
                  <Picker.Item label="Pilih Produk" value="" />
                  {products.map((item) => (
                    <Picker.Item
                      key={item.id}
                      label={`${item.name} - Rp ${item.price}`}
                      value={item.id}
                    />
                  ))}
                </Picker>
              </View>

              <TextInput
                value={editJumlah}
                onChangeText={setEditJumlah}
                placeholder="Jumlah"
                placeholderTextColor={appColors.secondaryText}
                keyboardType="numeric"
                style={styles.input}
              />

              <TouchableOpacity
                style={styles.addItemButton}
                onPress={handleTambahItemEdit}
              >
                <Text style={styles.buttonText}>Tambah Item</Text>
              </TouchableOpacity>

              <Text style={[styles.label, { marginTop: 18 }]}>
                Daftar Item Pesanan
              </Text>

              {editItems.length === 0 ? (
                <Text style={styles.emptyText}>Belum ada item di pesanan.</Text>
              ) : (
                editItems.map((item, index) => (
                  <View key={index} style={styles.itemCard}>
                    <Text style={styles.itemTitle}>{item.produk}</Text>

                    <Text style={styles.itemSub}>Jumlah</Text>
                    <TextInput
                      value={String(item.jumlah)}
                      onChangeText={(text) => handleUbahJumlahItem(index, text)}
                      keyboardType="numeric"
                      style={styles.qtyInput}
                    />

                    <Text style={styles.itemTotal}>Rp {item.total}</Text>

                    <TouchableOpacity
                      style={styles.deleteItemButton}
                      onPress={() => handleHapusItemEdit(index)}
                    >
                      <Text style={styles.deleteItemText}>Hapus</Text>
                    </TouchableOpacity>
                  </View>
                ))
              )}

              <Text style={styles.totalText}>
                Total Baru: Rp{" "}
                {editItems.reduce((sum, item) => sum + (item.total || 0), 0)}
              </Text>

              <View style={styles.modalActionRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={tutupModal}
                >
                  <Text style={styles.buttonText}>Batal</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={handleSimpanEdit}
                >
                  <Text style={styles.buttonText}>Simpan</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: appColors.background,
  },
  orderWrapper: {
    marginBottom: 16,
  },
  emptyListText: {
    textAlign: "center",
    color: appColors.secondaryText,
    marginTop: 24,
  },

  actionRow: {
    gap: 10,
    marginTop: 8,
  },
  actionButton: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    backgroundColor: appColors.primary,
  },
  deleteButton: {
    backgroundColor: appColors.danger,
  },
  doneButton: {
    backgroundColor: appColors.success,
  },
  actionText: {
    color: appColors.white,
    fontWeight: "bold",
    fontSize: 15,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 20,
  },
  modalContainer: {
    backgroundColor: appColors.background,
    borderRadius: 16,
    padding: 20,
    maxHeight: "90%",
    borderWidth: 1,
    borderColor: appColors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: appColors.primaryText,
  },
  label: {
    marginBottom: 6,
    fontWeight: "600",
    color: appColors.primaryText,
  },
  input: {
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    color: appColors.primaryText,
  },
  pickerWrapper: {
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 10,
    marginBottom: 12,
    overflow: "hidden",
  },
  picker: {
    color: appColors.primaryText,
  },
  dateField: {
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 10,
    padding: 14,
  },
  dateValue: {
    color: appColors.primaryText,
  },
  addItemButton: {
    backgroundColor: appColors.success,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  itemCard: {
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  itemTitle: {
    fontWeight: "bold",
    color: appColors.primaryText,
    marginBottom: 6,
  },
  itemSub: {
    fontSize: 12,
    color: appColors.secondaryText,
    marginBottom: 4,
  },
  qtyInput: {
    backgroundColor: appColors.white,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    color: appColors.primaryText,
  },
  itemTotal: {
    marginBottom: 8,
    color: appColors.success,
    fontWeight: "600",
  },
  deleteItemButton: {
    backgroundColor: appColors.danger,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteItemText: {
    color: appColors.white,
    fontWeight: "bold",
  },

  totalText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "bold",
    color: appColors.primaryText,
  },
  emptyText: {
    color: appColors.secondaryText,
    marginBottom: 10,
  },

  modalActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#7A8A94",
  },
  saveButton: {
    backgroundColor: appColors.primary,
  },
  buttonText: {
    color: appColors.white,
    fontWeight: "bold",
  },
});
