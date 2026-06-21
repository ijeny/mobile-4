import React, { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import { appColors } from "../theme/colors";

export default function FormPesanan({ onTambah, products = [] }) {
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
  <View style={styles.container}>
    <Text style={styles.label}>Nama Customer</Text>
    <TextInput
      placeholder="Masukkan nama customer"
      placeholderTextColor={appColors.secondaryText}
      style={styles.input}
      value={nama}
      onChangeText={setNama}
    />

    <Text style={styles.label}>Pilih Produk</Text>
    <View style={styles.pickerWrapper}>
      <Picker
        selectedValue={produk}
        style={styles.picker}
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

    <Text style={styles.label}>Jumlah</Text>
    <TextInput
      placeholder="Masukkan jumlah"
      placeholderTextColor={appColors.secondaryText}
      style={styles.input}
      value={jumlah}
      onChangeText={setJumlah}
      keyboardType="numeric"
    />

    <Text style={styles.label}>Tanggal Ambil Pesanan</Text>
    <TouchableOpacity style={styles.dateField} onPress={bukaTanggal}>
      <Text style={styles.dateValue}>{formatTanggal(tanggal)}</Text>
    </TouchableOpacity>

    {showDatePicker && (
      <DateTimePicker
        value={tanggal}
        mode="date"
        display={Platform.OS === "android" ? "calendar" : "spinner"}
        onChange={onChangeTanggal}
      />
    )}

    <Text style={styles.subtotalText}>Subtotal: Rp {subtotal}</Text>

    {items.length > 0 && (
      <View style={styles.itemList}>
        {items.map((it, i) => (
          <Text key={i} style={styles.itemText}>
            {it.produk} x{it.jumlah} - Rp {it.total}
          </Text>
        ))}
      </View>
    )}

    <Text style={styles.currentItemText}>Item sekarang: Rp {currentTotal}</Text>

    <TouchableOpacity style={styles.buttonSmall} onPress={tambahItem}>
      <Text style={styles.buttonText}>Tambah Pesanan</Text>
    </TouchableOpacity>

    <TouchableOpacity style={styles.button} onPress={handleTambah}>
      <Text style={styles.buttonText}>Konfirmasi</Text>
    </TouchableOpacity>
  </View>
);
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
    marginbottom: 30,
  },
  input: {
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.border,
    color: appColors.primaryText,
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
  },
  pickerWrapper: {
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 10,
    marginVertical: 5,
    overflow: "hidden",
  },
  picker: {
    color: appColors.primaryText,
  },
  dateField: {
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.border,
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
  },
  dateLabel: {
    fontSize: 12,
    color: appColors.secondaryText,
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: "600",
    color: appColors.primaryText,
  },
  subtotalText: {
    marginTop: 10,
    fontWeight: "bold",
    color: appColors.primaryText,
  },
  itemList: {
    marginTop: 8,
    backgroundColor: appColors.surface,
    borderWidth: 1,
    borderColor: appColors.border,
    borderRadius: 10,
    padding: 12,
  },
  itemText: {
    color: appColors.primaryText,
    marginBottom: 4,
  },
  currentItemText: {
    marginTop: 10,
    color: appColors.secondaryText,
  },
  buttonSmall: {
    backgroundColor: appColors.success,
    padding: 12,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
  },
  button: {
    backgroundColor: appColors.primary,
    padding: 14,
    borderRadius: 12,
    marginTop: 15,
    alignItems: "center",
  },
  buttonText: {
    color: appColors.white,
    fontWeight: "bold",
  },
});
