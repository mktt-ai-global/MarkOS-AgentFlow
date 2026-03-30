import { create } from "zustand";
import { PRESETS } from "../data/dashboard";

const BACKGROUND_PRESET_KEY = "af_bg_preset";
const BACKGROUND_CUSTOM_KEY = "af_bg_custom";
const OVERLAY_KEY = "af_overlay";
const PANEL_KEY = "af_panel";

type UiStore = {
  isBgPanelOpen: boolean;
  activePresetKey: string;
  customBackground: string | null;
  overlayValue: number;
  panelValue: number;
  hydrateFromStorage: () => void;
  openBackgroundPanel: () => void;
  closeBackgroundPanel: () => void;
  selectPreset: (key: string) => void;
  setCustomBackground: (dataUrl: string) => void;
  setOverlayValue: (value: number) => void;
  setPanelValue: (value: number) => void;
};

function persist(key: string, value: string | null): void {
  try {
    if (value === null) {
      localStorage.removeItem(key);
      return;
    }
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures.
  }
}

export const useUiStore = create<UiStore>((set) => ({
  isBgPanelOpen: false,
  activePresetKey: PRESETS[0].key,
  customBackground: null,
  overlayValue: 18,
  panelValue: 58,
  hydrateFromStorage: () => {
    try {
      const storedOverlay = localStorage.getItem(OVERLAY_KEY);
      const storedPanel = localStorage.getItem(PANEL_KEY);
      const storedCustomBackground = localStorage.getItem(BACKGROUND_CUSTOM_KEY);
      const storedPreset = localStorage.getItem(BACKGROUND_PRESET_KEY);

      set({
        overlayValue:
          storedOverlay && !Number.isNaN(Number(storedOverlay))
            ? Number(storedOverlay)
            : 18,
        panelValue:
          storedPanel && !Number.isNaN(Number(storedPanel))
            ? Number(storedPanel)
            : 58,
        customBackground: storedCustomBackground,
        activePresetKey:
          !storedCustomBackground &&
          storedPreset &&
          PRESETS.some((preset) => preset.key === storedPreset)
            ? storedPreset
            : PRESETS[0].key
      });
    } catch {
      set({
        overlayValue: 18,
        panelValue: 58,
        customBackground: null,
        activePresetKey: PRESETS[0].key
      });
    }
  },
  openBackgroundPanel: () => set({ isBgPanelOpen: true }),
  closeBackgroundPanel: () => set({ isBgPanelOpen: false }),
  selectPreset: (key) => {
    persist(BACKGROUND_PRESET_KEY, key);
    persist(BACKGROUND_CUSTOM_KEY, null);

    set({
      activePresetKey: key,
      customBackground: null
    });
  },
  setCustomBackground: (dataUrl) => {
    persist(BACKGROUND_CUSTOM_KEY, dataUrl);
    persist(BACKGROUND_PRESET_KEY, null);

    set({
      customBackground: dataUrl
    });
  },
  setOverlayValue: (value) => {
    persist(OVERLAY_KEY, String(value));
    set({ overlayValue: value });
  },
  setPanelValue: (value) => {
    persist(PANEL_KEY, String(value));
    set({ panelValue: value });
  }
}));
