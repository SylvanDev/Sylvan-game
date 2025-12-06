// src/hooks/useSylvanGameStore.ts
import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';

// Тип для данных игрока
interface PlayerData {
  landKey: string | null;
  isReclaimed: boolean;
  rewardClaimed: boolean;
}

// Ключ для хранения в localStorage
const STORAGE_KEY = 'sylvan_game_data';

// Начальное состояние для нового игрока
const initialPlayerData: PlayerData = {
  landKey: null,
  isReclaimed: false,
  rewardClaimed: false,
};

export const useSylvanGameStore = () => {
  const { publicKey } = useWallet();
  const [playerData, setPlayerData] = useState<PlayerData>(initialPlayerData);
  const [isInitialized, setIsInitialized] = useState(false);

  // Функция для чтения всех данных из хранилища
  const getFullStore = useCallback(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  }, []);

  // Функция для сохранения всех данных
  const saveFullStore = useCallback((data: any) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  // Загружаем данные игрока при подключении кошелька
  useEffect(() => {
    if (publicKey) {
      const store = getFullStore();
      const currentPlayerData = store[publicKey.toBase58()] || initialPlayerData;
      setPlayerData(currentPlayerData);
    } else {
      // Сбрасываем данные, если кошелек отключен
      setPlayerData(initialPlayerData);
    }
    setIsInitialized(true);
  }, [publicKey, getFullStore]);

  // Функция для покупки земли
  const buyLand = useCallback((landKey: string) => {
    if (!publicKey) return;
    const store = getFullStore();
    store[publicKey.toBase58()] = { ...initialPlayerData, landKey: landKey };
    saveFullStore(store);
    setPlayerData(store[publicKey.toBase58()]);
  }, [publicKey, getFullStore, saveFullStore]);

  // Функция для отметки земли как восстановленной
  const setLandReclaimed = useCallback(() => {
    if (!publicKey || !playerData.landKey) return;
    const store = getFullStore();
    store[publicKey.toBase58()].isReclaimed = true;
    saveFullStore(store);
    setPlayerData(store[publicKey.toBase58()]);
  }, [publicKey, playerData, getFullStore, saveFullStore]);

  // Функция для отметки награды как полученной
  const setRewardClaimed = useCallback(() => {
    if (!publicKey || !playerData.landKey) return;
     const store = getFullStore();
    store[publicKey.toBase58()].rewardClaimed = true;
    saveFullStore(store);
    setPlayerData(store[publicKey.toBase58()]);
  }, [publicKey, playerData, getFullStore, saveFullStore]);


  return {
    isInitialized,
    playerData,
    buyLand,
    setLandReclaimed,
    setRewardClaimed
  };
};