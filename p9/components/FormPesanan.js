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
      <TextInput
        placeholder="Nama Customer"
        style={styles.input}
        value={nama}
        onChangeText={setNama}
      />

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

      <TextInput
        placeholder="Jumlah"
        style={styles.input}
        value={jumlah}
        onChangeText={setJumlah}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.dateField} onPress={bukaTanggal}>
        <Text style={styles.dateLabel}>Tanggal ambil pesanan</Text>
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

      <Text style={{ marginTop: 10, fontWeight: "bold" }}>
        Subtotal: Rp {subtotal}
      </Text>

      {items.length > 0 && (
        <View style={{ marginTop: 8 }}>
          {items.map((it, i) => (
            <Text key={i}>
              {it.produk} x{it.jumlah} - Rp {it.total}
            </Text>
          ))}
        </View>
      )}

      <Text style={{ marginTop: 10 }}>Item sekarang: Rp {currentTotal}</Text>

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
  container: { marginVertical: 15 },
  input: {
    backgroundColor: "#EBF4F6",
    borderWidth: 1,
    padding: 15,
    paddingTop: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  picker: {
    backgroundColor: "#EBF4F6",
    borderWidth: 1,
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
  },
  button: {
    backgroundColor: "#296374",
    padding: 14,
    borderRadius: 12,
    marginTop: 15,
    alignItems: "center",
    elevation: 3,
  },
  buttonSmall: {
    backgroundColor: "#296374",
    padding: 10,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
    elevation: 3,
  },
  dateField: {
    backgroundColor: "#EBF4F6",
    borderWidth: 1,
    borderColor: "#c8dfe4",
    padding: 15,
    marginVertical: 5,
    borderRadius: 8,
  },
  dateLabel: {
    fontSize: 12,
    color: "#4b6570",
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#003049",
  },
  buttonText: {
    color: "#ffff",
    fontWeight: "bold",
  },
});
