'use client';

import { useEffect, useState } from 'react';

export function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded shadow">
      {message}
    </div>
  );
}

export function useToast() {
  const [msg, setMsg] = useState<string>('');
  function show(message: string) { setMsg(message); }
  function hide() { setMsg(''); }
  const node = msg ? <Toast message={msg} onClose={hide} /> : null;
  return { show, node } as const;
}


