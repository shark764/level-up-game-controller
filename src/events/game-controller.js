const prefix = '__game_controller_';
const gamePrefix = '_game_event';

export const START_GAME = `${prefix}::${gamePrefix}::_start`;
export const GAME_STARTED = `${prefix}::${gamePrefix}::_started`;
export const ADD_PLAYER = `${prefix}::${gamePrefix}::_add-player`;
export const PLAYER_ADDED = `${prefix}::${gamePrefix}::_player-added`;
export const TARGET_HIT = `${prefix}::${gamePrefix}::_target-hit`;
export const FINISH_GAME = `${prefix}::${gamePrefix}::_finish`;
export const GAME_FINISHED = `${prefix}::${gamePrefix}::_finished`;
