<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import {
  getCommand,
  getSupportedPkgManagers,
  type PackageManager,
  type CommandType,
  type CommandOptions,
} from "../commands.ts";
import { icons } from "../icons.ts";

const STORAGE_KEY = "vitepress-pkg-manager";
const SYNC_EVENT = "vitepress-pkg-manager-sync";

const props = withDefaults(
  defineProps<{
    pkg?: string;
    type?: CommandType;
    dev?: boolean;
    args?: string;
    comment?: string;
    prefix?: string;
    jsr?: string;
    pkgManagers?: PackageManager[];
  }>(),
  {
    type: "add",
    dev: false,
  }
);

const managers = computed(() =>
  getSupportedPkgManagers(props.type, props.pkgManagers)
);

const active = ref<PackageManager>(managers.value[0]!);
const copied = ref(false);

function persist(pm: PackageManager) {
  try {
    localStorage.setItem(STORAGE_KEY, pm);
  } catch {}
}

function restore(): PackageManager | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as PackageManager | null;
    if (stored && managers.value.includes(stored)) return stored;
  } catch {}
  return null;
}

function select(pm: PackageManager) {
  active.value = pm;
  persist(pm);
  window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: pm }));
}

function onSync(e: Event) {
  const pm = (e as CustomEvent<PackageManager>).detail;
  if (managers.value.includes(pm)) {
    active.value = pm;
  }
}

function onStorage(e: StorageEvent) {
  if (e.key !== STORAGE_KEY || !e.newValue) return;
  const pm = e.newValue as PackageManager;
  if (managers.value.includes(pm)) {
    active.value = pm;
  }
}

onMounted(() => {
  const stored = restore();
  if (stored) active.value = stored;
  window.addEventListener(SYNC_EVENT, onSync);
  window.addEventListener("storage", onStorage);
});

onUnmounted(() => {
  window.removeEventListener(SYNC_EVENT, onSync);
  window.removeEventListener("storage", onStorage);
});

const commandOptions = computed<CommandOptions>(() => ({
  dev: props.dev,
  args: props.args,
  comment: props.comment,
  prefix: props.prefix,
  jsr: props.jsr,
}));

function getCommandText(pm: PackageManager): string {
  return getCommand(pm, props.type, props.pkg, commandOptions.value);
}

let copyTimeout: ReturnType<typeof setTimeout>;

async function copyCommand() {
  try {
    await navigator.clipboard.writeText(getCommandText(active.value));
    copied.value = true;
    clearTimeout(copyTimeout);
    copyTimeout = setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch {}
}
</script>

<template>
  <div class="vp-code-group vp-pm">
    <div class="tabs">
      <button
        v-for="pm in managers"
        :key="pm"
        role="tab"
        class="vp-pm-tab"
        :class="{ active: active === pm }"
        :aria-selected="active === pm"
        @click="select(pm)"
      >
        <span v-if="icons[pm]" class="vp-pm-icon" v-html="icons[pm]"></span>
        {{ pm }}
      </button>
    </div>
    <div v-for="pm in managers" :key="pm" class="language-sh vp-adaptive-theme" :class="{ active: active === pm }">
      <button
        class="copy"
        :class="{ copied }"
        title="Copy Code"
        @click="copyCommand"
      ></button>
      <span class="lang">sh</span>
      <pre><code>{{ getCommandText(pm) }}</code></pre>
    </div>
  </div>
</template>

<style>
.vp-pm .tabs {
  margin-right: 0;
  margin-left: 0;
}

.vp-pm .vp-pm-tab {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  border-bottom: 1px solid transparent;
  padding: 0 12px;
  line-height: 48px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-code-tab-text-color);
  white-space: nowrap;
  cursor: pointer;
  background: none;
  transition: color 0.25s;
}

.vp-pm .vp-pm-tab::after {
  position: absolute;
  right: 8px;
  bottom: -1px;
  left: 8px;
  z-index: 1;
  height: 2px;
  border-radius: 2px;
  content: '';
  background-color: transparent;
  transition: background-color 0.25s;
}

.vp-pm .vp-pm-tab:hover {
  color: var(--vp-code-tab-hover-text-color);
}

.vp-pm .vp-pm-tab.active {
  color: var(--vp-code-tab-active-text-color);
}

.vp-pm .vp-pm-tab.active::after {
  background-color: var(--vp-code-tab-active-bar-color);
}

.vp-pm-icon {
  display: inline-flex;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.vp-pm-icon svg {
  width: 100%;
  height: 100%;
}
</style>
