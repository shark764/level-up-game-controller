const prefix = '__device_';
const gamePrefix = '_game_event';

export const NEW_GAME = `${prefix}::${gamePrefix}::_new-game`;
export const GAME_ADDED = `${prefix}::${gamePrefix}::_game-added`;
export const ADD_PLAYER = `${prefix}::${gamePrefix}::_add-player`;
export const PLAYER_ADDED = `${prefix}::${gamePrefix}::_player-added`;
export const TARGET_HIT = `${prefix}::${gamePrefix}::_target-hit`;
export const END_GAME = `${prefix}::${gamePrefix}::_end-game`;
export const GAME_ENDED = `${prefix}::${gamePrefix}::_game-ended`;
