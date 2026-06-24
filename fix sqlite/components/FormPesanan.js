import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { appColors } from "../theme/colors";

export default function FormPesanan({
  onTambah,
  products = [],
  colors = appColors,
}) {
  const [nama, setNama] = useState("");
  const [produk, setProduk] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [tanggal, setTanggal] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [items, setItems] = useState([]);

  const hargaProduk = products.reduce((accumulator, item) => {
    accumulator[item.id] = { name: item.name, price: item.price };
    return accumulator;
  }, {});

  const formatTanggal = (date) =>
    new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);

  const onChangeTanggal = (event, selectedDate) => {
    if (Platform.OS === "android") {
      if (event?.type === "dismissed") {
        setShowDatePicker(false);
        return;
      }
      if (event?.type === "set" && selectedDate) {
        setTanggal(selectedDate);
        setShowDatePicker(false);
        return;
      }
      if (selectedDate) {
        setTanggal(selectedDate);
        setShowDatePicker(false);
      }
    } else if (selectedDate) {
      setTanggal(selectedDate);
    }
  };

  const bukaTanggal = () => setShowDatePicker(true);

  const handleTambah = () => {
    if (!nama.trim() || items.length === 0 || !tanggal) {
      alert("Nama, tanggal, dan minimal 1 produk harus diisi!");
      return;
    }

    const grandTotal = items.reduce((s, it) => s + (it.total || 0), 0);

    onTambah({
      id: Date.now().toString(),
      customer: nama,
      items,
      total: grandTotal,
      date: formatTanggal(tanggal),
      status: "Menunggu",
      isPO: true,
    });

    setNama("");
    setProduk("");
    setJumlah("");
    setTanggal(new Date());
    setItems([]);
  };

  const tambahItem = () => {
    const jumlahAngka = parseInt(jumlah, 10);

    if (
      !produk ||
      !jumlah ||
      Number.isNaN(jumlahAngka) ||
      jumlahAngka <= 0 ||
      !hargaProduk[produk]
    ) {
      alert("Pilih produk dan isi jumlah!");
      return;
    }

    const selectedProduct = hargaProduk[produk];

    const itemBaru = {
      produk: selectedProduct.name,
      jumlah: jumlahAngka,
      total: selectedProduct.price * jumlahAngka,
    };

    setItems([...items, itemBaru]);
    setProduk("");
    setJumlah("");
  };

  const subtotal = items.reduce((s, it) => s + (it.total || 0), 0);
  const currentTotal =
    produk && jumlah && !Number.isNaN(parseInt(jumlah, 10))
      ? (hargaProduk[produk]?.price || 0) * parseInt(jumlah, 10)
      : 0;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <Text style={[styles.label, { color: colors.text }]}>
            Nama Customer
          </Text>
          <TextInput
            placeholder="Masukkan nama customer"
            placeholderTextColor={colors.muted}
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={nama}
            onChangeText={setNama}
          />

          <Text style={[styles.label, { color: colors.text }]}>
            Pilih Produk
          </Text>
          <View
            style={[
              styles.pickerWrapper,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Picker
              selectedValue={produk}
              style={[styles.picker, { color: colors.text }]}
              onValueChange={setProduk}
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

          <Text style={[styles.label, { color: colors.text }]}>Jumlah</Text>
          <TextInput
            placeholder="Masukkan jumlah"
            placeholderTextColor={colors.muted}
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={jumlah}
            onChangeText={setJumlah}
            keyboardType="numeric"
          />

          <Text style={[styles.label, { color: colors.text }]}>
            Tanggal Ambil Pesanan
          </Text>
          <TouchableOpacity
            style={[
              styles.dateField,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
            onPress={bukaTanggal}
          >
            <Text style={[styles.dateValue, { color: colors.text }]}>
              {formatTanggal(tanggal)}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={tanggal}
              mode="date"
              display={Platform.OS === "android" ? "calendar" : "spinner"}
              onChange={onChangeTanggal}
            />
          )}

          <Text style={[styles.subtotalText, { color: colors.text }]}>
            Subtotal: Rp {subtotal}
          </Text>

          {items.length > 0 && (
            <View
              style={[
                styles.itemList,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              {items.map((it, i) => (
                <Text key={i} style={[styles.itemText, { color: colors.text }]}>
                  {it.produk} x{it.jumlah} - Rp {it.total}
                </Text>
              ))}
            </View>
          )}

          <Text style={[styles.currentItemText, { color: colors.muted }]}>
            Item sekarang: Rp {currentTotal}
          </Text>

          <TouchableOpacity
            style={[styles.buttonSmall, { backgroundColor: colors.success }]}
            onPress={tambahItem}
          >
            <Text style={styles.buttonText}>Tambah Pesanan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleTambah}
          >
            <Text style={styles.buttonText}>Konfirmasi</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    marginBottom: 30,
  },
  label: {
    marginTop: 8,
    marginBottom: 4,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 10,
    marginVertical: 5,
    overflow: "hidden",
  },
  picker: {},
  dateField: {
    borderWidth: 1,
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
  },
  dateLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  subtotalText: {
    marginTop: 10,
    fontWeight: "bold",
  },
  itemList: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  itemText: {
    marginBottom: 4,
  },
  currentItemText: {
    marginTop: 10,
  },
  buttonSmall: {
    padding: 12,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
  },
  button: {
    padding: 14,
    borderRadius: 12,
    marginTop: 15,
    alignItems: "center",
  },
  buttonText: {
    color: appColors.white,
    fontWeight: "bold",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
});
