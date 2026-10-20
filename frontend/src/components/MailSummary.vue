<script setup>
import { computed } from 'vue';
import { useGlobalState } from '../store';
import { utcToLocalDate } from '../utils';
import AiExtractInfo from './AiExtractInfo.vue';
import { useScopedI18n } from '@/i18n/app';

const { useUTCDate, isDark } = useGlobalState();
const { t } = useScopedI18n('components.MailContentRenderer');

const props = defineProps({
  mail: { type: Object, required: true },
  showEMailTo: { type: Boolean, default: true },
  enableMailReadStatus: { type: Boolean, default: false },
  previewLineClamp: { type: Number, default: 0 },
});

const receivedAt = computed(() => new Date(`${props.mail.created_at} UTC`));

// sender display: "Name <a@b.c>" -> name + address
const sender = computed(() => {
  const raw = (props.mail.source || '').trim();
  const m = raw.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (m) return { name: m[1].trim() || m[2], addr: m[2] };
  return { name: raw || '—', addr: '' };
});

const AVATAR_COLORS = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#db2777', '#7c3aed', '#dc2626', '#2563eb'];
const avatarColor = computed(() => {
  const s = sender.value.addr || sender.value.name;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
});
const initial = computed(() => (sender.value.name.replace(/[^\p{L}\p{N}]/gu, '')[0] || '?').toUpperCase());

const preview = computed(() => (props.mail.text || '').replace(/\s+/g, ' ').trim());

const c = computed(() => isDark.value ? {
  sender: '#a5b4fc', addr: '#8b93b8', toBg: 'rgba(16,185,129,.14)', to: '#6ee7b7',
  subject: '#f3f4f6', preview: '#9ca3af', date: '#9ca3af', dateBg: 'rgba(255,255,255,.06)',
} : {
  sender: '#4338ca', addr: '#6b7280', toBg: '#ecfdf5', to: '#047857',
  subject: '#111827', preview: '#6b7280', date: '#6b7280', dateBg: '#f3f4f6',
});
</script>

<template>
  <div class="ms">
    <div class="ms-avatar" :style="{ background: avatarColor }">{{ initial }}</div>
    <div class="ms-body">
      <div class="ms-row">
        <span v-if="enableMailReadStatus && mail.is_unread === 1" class="ms-unread" />
        <span class="ms-sender" :title="mail.source">{{ sender.name }}</span>
        <span v-if="sender.addr && sender.addr !== sender.name" class="ms-addr">{{ sender.addr }}</span>
        <span class="ms-date" :title="utcToLocalDate(mail.created_at, useUTCDate)">
          <n-time v-if="!Number.isNaN(receivedAt.getTime())" :time="receivedAt"
            :time-zone="useUTCDate ? 'UTC' : undefined" format="MM/dd HH:mm" />
          <template v-else>{{ utcToLocalDate(mail.created_at, useUTCDate) }}</template>
        </span>
      </div>
      <div class="ms-subject" :class="{ 'ms-subject-unread': enableMailReadStatus && mail.is_unread === 1 }"
        :title="`ID: ${mail.id}\n${mail.subject || ''}`">{{ mail.subject || '（无主题）' }}</div>
      <div v-if="preview && previewLineClamp > 0" class="ms-preview" :style="{ '-webkit-line-clamp': previewLineClamp }">
        {{ preview }}
      </div>
      <div v-if="showEMailTo" class="ms-to-row">
        <span class="ms-to">{{ t('to') }} {{ mail.address }}</span>
      </div>
      <AiExtractInfo :metadata="mail.metadata" compact />
    </div>
  </div>
</template>

<style scoped>
.ms {
  display: flex;
  gap: 12px;
  min-width: 0;
  width: 100%;
  text-align: left;
}

.ms-avatar {
  flex: 0 0 36px;
  height: 36px;
  border-radius: 50%;
  color: #fff;
  font-weight: 600;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.ms-body {
  flex: 1;
  min-width: 0;
}

.ms-row {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  line-height: 20px;
}

.ms-sender {
  font-weight: 600;
  font-size: 14px;
  color: v-bind('c.sender');
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 0 1 auto;
  min-width: 0;
}

.ms-addr {
  font-size: 12px;
  color: v-bind('c.addr');
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1 1 0;
  min-width: 0;
}

.ms-date {
  margin-left: auto;
  flex: 0 0 auto;
  font-size: 12px;
  color: v-bind('c.date');
  background: v-bind('c.dateBg');
  padding: 0 8px;
  border-radius: 999px;
  font-variant-numeric: tabular-nums;
}

.ms-subject {
  margin-top: 3px;
  font-size: 15px;
  font-weight: 600;
  color: v-bind('c.subject');
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ms-subject-unread {
  font-weight: 700;
}

.ms-preview {
  margin-top: 3px;
  font-size: 13px;
  line-height: 19px;
  color: v-bind('c.preview');
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  overflow-wrap: anywhere;
}

.ms-to-row {
  margin-top: 6px;
  min-width: 0;
}

.ms-to {
  display: inline-block;
  max-width: 100%;
  font-size: 12px;
  line-height: 18px;
  padding: 0 8px;
  border-radius: 6px;
  color: v-bind('c.to');
  background: v-bind('c.toBg');
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ms-unread {
  flex: 0 0 8px;
  height: 8px;
  border-radius: 50%;
  background: #3b82f6;
}

.ms :deep(.ai-extract-info) {
  margin: 4px 0 0;
}
</style>
