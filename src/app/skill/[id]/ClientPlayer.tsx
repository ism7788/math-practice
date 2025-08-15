'use client';

import type { Item } from './player';
import Player from './player';

export default function ClientPlayer(props: { items: Item[]; title: string }) {
  // No dynamic() — just render the client Player directly.
  return <Player {...props} />;
}
