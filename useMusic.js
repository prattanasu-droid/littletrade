import { useEffect, useRef, useState } from 'react';

function preference(key, fallback) {
  try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; }
}
function remember(key, value) {
  try { localStorage.setItem(key, String(value)); } catch { /* Audio works without storage. */ }
}

export function useMusic() {
  const audioRef = useRef(null);
  const enabled = useRef(preference('math-metro-music', 'on') !== 'off');
  const started = useRef(false);
  const request = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  const [volume, setVolume] = useState(() => {
    const saved = Number(preference('math-metro-volume', '0.35'));
    return Number.isFinite(saved) ? Math.min(1, Math.max(0, saved)) : .35;
  });

  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  async function play() {
    const audio = audioRef.current;
    if (!audio || document.hidden) return;
    const id = ++request.current;
    setError('');
    try {
      audio.volume = volumeRef.current;
      if (audio.error) audio.load();
      await audio.play();
    } catch {
      if (id === request.current) {
        setPlaying(false);
        setError('แตะปุ่มเล่นเพลงเพื่อลองอีกครั้ง');
      }
    }
  }

  function startMusic() {
    if (!enabled.current) return;
    started.current = true;
    void play();
  }

  function toggleMusic() {
    if (playing) {
      enabled.current = false;
      ++request.current;
      audioRef.current?.pause();
      setPlaying(false);
      remember('math-metro-music', 'off');
    } else {
      enabled.current = true;
      started.current = true;
      remember('math-metro-music', 'on');
      void play();
    }
  }

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    remember('math-metro-volume', volume);
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    const handleVisibility = () => {
      if (document.hidden) {
        ++request.current;
        audio?.pause();
      } else if (enabled.current && started.current) {
        void play();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      ++request.current;
      document.removeEventListener('visibilitychange', handleVisibility);
      audio?.pause();
    };
  }, []);

  return { audioRef, playing, volume, setVolume, toggleMusic, startMusic, error,
    onPlay: () => { setError(''); setPlaying(true); },
    onPause: () => setPlaying(false),
    onError: () => { setPlaying(false); setError('โหลดเพลงไม่ได้ แตะปุ่มเล่นเพื่อลองอีกครั้ง'); }
  };
}
