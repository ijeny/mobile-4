import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Beranda from "./screens/Beranda";
import Pesanan from "./screens/Pesanan";
import Selesai from "./screens/Selesai";

const Tab = createBottomTabNavigator();
const STORAGE_KEY = "@uts_po_pesanan";

export default function App() {
  const [pesanan, setPesanan] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const loadPesanan = async () => {
      try {
        const savedPesanan = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedPesanan) {
          setPesanan(JSON.parse(savedPesanan));
        }
      } catch (error) {
        console.log("Gagal memuat pesanan dari AsyncStorage:", error);
      } finally {
        setIsHydrated(true);
      }
    };

    loadPesanan();
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const savePesanan = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(pesanan));
      } catch (error) {
        console.log("Gagal menyimpan pesanan ke AsyncStorage:", error);
      }
    };

    savePesanan();
  }, [pesanan, isHydrated]);

  const tambahPesanan = (dataBaru) => {
    setPesanan((prevPesanan) => [...prevPesanan, dataBaru]);
  };

  const tandaiSelesai = (id) => {
    setPesanan((prevPesanan) =>
      prevPesanan.map((item) =>
        item.id === id ? { ...item, status: "Selesai" } : item,
      ),
    );
  };

  const hapusPesanan = (id) => {
    setPesanan((prevPesanan) => prevPesanan.filter((item) => item.id !== id));
  };

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: "#0C2C55" },
          headerTintColor: "#fff",
          tabBarActiveTintColor: "#0C2C55",
          tabBarInactiveTintColor: "#629FAD",
        }}
      >
        <Tab.Screen
          name="Toko Mori J"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home" size={size} color={color} />
            ),
          }}
        >
          {(props) => <Beranda {...props} tambahPesanan={tambahPesanan} />}
        </Tab.Screen>

        <Tab.Screen
          name="Pesanan Masuk"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list" size={size} color={color} />
            ),
          }}
        >
          {(props) => (
            <Pesanan
              {...props}
              pesanan={pesanan}
              tandaiSelesai={tandaiSelesai}
              hapusPesanan={hapusPesanan}
            />
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Pesanan Selesai"
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="checkmark-circle" size={size} color={color} />
            ),
          }}
        >
          {(props) => (
            <Selesai {...props} pesanan={pesanan} hapusPesanan={hapusPesanan} />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}
