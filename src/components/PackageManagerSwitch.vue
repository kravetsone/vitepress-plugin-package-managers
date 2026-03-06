<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import {
  defaultPkgManagers,
  type PackageManager,
} from "../commands.ts";
import { icons } from "../icons.ts";

const STORAGE_KEY = "vitepress-pkg-manager";
const SYNC_EVENT = "vitepress-pkg-manager-sync";

const props = withDefaults(
  defineProps<{
    pkgManagers?: PackageManager[];
  }>(),
  {}
);

const managers = props.pkgManagers ?? defaultPkgManagers;
const active = ref<PackageManager>(managers[0]!);
const open = ref(false);

function select(pm: PackageManager) {
  active.value = pm;
  open.value = false;
  try {
    localStorage.setItem(STORAGE_KEY, pm);
  } catch {}
  window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: pm }));
}

function onSync(e: Event) {
  const pm = (e as CustomEvent<PackageManager>).detail;
  if (managers.includes(pm)) active.value = pm;
}

function onStorage(e: StorageEvent) {
  if (e.key !== STORAGE_KEY || !e.newValue) return;
  const pm = e.newValue as PackageManager;
  if (managers.includes(pm)) active.value = pm;
}

function onClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (!target.closest(".vp-pm-switch")) open.value = false;
}

onMounted(() => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as PackageManager | null;
    if (stored && managers.includes(stored)) active.value = stored;
  } catch {}
  window.addEventListener(SYNC_EVENT, onSync);
  window.addEventListener("storage", onStorage);
  document.addEventListener("click", onClickOutside);
});

onUnmounted(() => {
  window.removeEventListener(SYNC_EVENT, onSync);
  window.removeEventListener("storage", onStorage);
  document.removeEventListener("click", onClickOutside);
});
</script>

<template>
  <div class="vp-pm-switch" :class="{ open }">
    <button class="vp-pm-switch-btn" @click="open = !open" :aria-expanded="open">
      <span v-if="icons[active]" class="vp-pm-icon" v-html="icons[active]"></span>
      {{ active }}
      <svg class="vp-pm-chevron" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </button>
    <div v-show="open" class="vp-pm-switch-menu">
      <button
        v-for="pm in managers"
        :key="pm"
        class="vp-pm-switch-item"
        :class="{ active: active === pm }"
        @click="select(pm)"
      >
        <span v-if="icons[pm]" class="vp-pm-icon" v-html="icons[pm]"></span>
        {{ pm }}
      </button>
    </div>
  </div>
</template>

<style>
.vp-pm-switch {
  position: relative;
  display: inline-flex;
  margin-left: 16px;
  padding-left: 16px;
  border-left: 1px solid var(--vp-c-divider);
}

.vp-pm-switch-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  height: 36px;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  cursor: pointer;
  transition: color 0.25s, border-color 0.25s;
}

.vp-pm-switch-btn:hover {
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-brand-1);
}

.vp-pm-chevron {
  transition: transform 0.25s;
}

.vp-pm-switch.open .vp-pm-chevron {
  transform: rotate(180deg);
}

.vp-pm-switch-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 100%;
  padding: 4px;
  background: var(--vp-c-bg-elv);
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  box-shadow: var(--vp-shadow-3);
  z-index: 30;
}

.vp-pm-switch-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--vp-c-text-2);
  text-align: left;
  border: none;
  border-radius: 4px;
  background: none;
  cursor: pointer;
  transition: color 0.25s, background-color 0.25s;
}

.vp-pm-switch-item:hover {
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg-soft);
}

.vp-pm-switch-item.active {
  color: var(--vp-c-brand-1);
}

.vp-pm-icon {
  display: inline-flex;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.vp-pm-icon svg {
  width: 100%;
  height: 100%;
}
</style>
