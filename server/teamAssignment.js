import { getState } from './gameState.js';

/**
 * Assign new player to a team with fewest members.
 * On ties, assign randomly among tied teams.
 */
export function assignTeam() {
  const state = getState();
  const teamSizes = Object.entries(state.teams).map(([id, t]) => ({
    id: Number(id),
    size: t.playerIds.length,
  }));
  const minSize = Math.min(...teamSizes.map((t) => t.size));
  const candidates = teamSizes.filter((t) => t.size === minSize);
  const chosen = candidates[Math.floor(Math.random() * candidates.length)];
  return chosen.id;
}
