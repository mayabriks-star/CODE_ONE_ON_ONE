// Decides what the app can do based on which keys are present.
// Keeps every component free of `import.meta.env` checks.

import { KEYS } from '../config/map-config.js'

export const hasGoogleKey = () => KEYS.google.trim().length > 0

// Photoreal (Google 3D Tiles) is the only map mode; it needs a Google key.
export const canUsePhotoreal = () => hasGoogleKey()
