import { useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createProfileRepository } from '../domain/profile/profileRepository';
import { demoUser } from '../domain/profile/profileData';

export default function useProfileData() {
  const repository = useRef(null);
  if (!repository.current) repository.current = createProfileRepository(AsyncStorage, demoUser.id);
  const [data, setData] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const latestSave = useRef(0);

  useEffect(() => {
    let active = true;
    setLoadError(false);
    repository.current.load().then(value => {
      if (active) setData(value);
    }).catch(() => { if (active) setLoadError(true); });
    return () => { active = false; };
  }, [attempt]);

  useEffect(() => {
    if (!data) return;
    let active = true;
    const version = ++latestSave.current;
    repository.current.save(data).then(() => {
      if (active && version === latestSave.current) setSaveError(false);
    }).catch(() => {
      if (active && version === latestSave.current) setSaveError(true);
    });
    return () => { active = false; };
  }, [data]);

  function retrySave() {
    // Nova referência permite repetir a gravação sem alterar os dados.
    setData(current => ({ ...current }));
  }

  return { data, setData, loadError, saveError, retryLoad: () => setAttempt(value => value + 1), retrySave };
}
