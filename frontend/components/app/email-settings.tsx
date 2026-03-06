'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { TIME_SLOTS, formatTime } from '@/lib/types';
import type { UserPreferences } from '@/lib/types';

interface EmailSettingsProps {
  preferences: UserPreferences;
  onChange: (preferences: UserPreferences) => void;
}

export function EmailSettings({ preferences, onChange }: EmailSettingsProps) {
  const updatePlanning = (field: 'enabled' | 'time', value: boolean | string) => {
    onChange({
      ...preferences,
      emails: {
        ...preferences.emails,
        planning: { ...preferences.emails.planning, [field]: value },
      },
    });
  };

  const updateReview = (field: 'enabled' | 'time', value: boolean | string) => {
    onChange({
      ...preferences,
      emails: {
        ...preferences.emails,
        review: { ...preferences.emails.review, [field]: value },
      },
    });
  };

  return (
    <div className="space-y-3">
      {/* Monday planning */}
      <div className="flex items-center justify-between gap-4 rounded border border-(--coach-border) bg-black/[0.03] p-3.5">
        <div>
          <p className="text-foreground text-[13px]">Monday Planning</p>
          <p className="text-[10px] font-light text-(--coach-muted)">Weekly planning invitation</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={preferences.emails.planning.time}
            onValueChange={(v) => updatePlanning('time', v)}
            disabled={!preferences.emails.planning.enabled}
          >
            <SelectTrigger className="border-border h-7 w-[90px] rounded bg-white/50 text-[11px] font-light">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.map((t) => (
                <SelectItem key={t} value={t}>
                  {formatTime(t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Switch
            checked={preferences.emails.planning.enabled}
            onCheckedChange={(v) => updatePlanning('enabled', v)}
          />
        </div>
      </div>

      {/* Friday review */}
      <div className="flex items-center justify-between gap-4 rounded border border-(--coach-border) bg-black/[0.03] p-3.5">
        <div>
          <p className="text-foreground text-[13px]">Friday Review</p>
          <p className="text-[10px] font-light text-(--coach-muted)">Weekly review invitation</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={preferences.emails.review.time}
            onValueChange={(v) => updateReview('time', v)}
            disabled={!preferences.emails.review.enabled}
          >
            <SelectTrigger className="border-border h-7 w-[90px] rounded bg-white/50 text-[11px] font-light">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIME_SLOTS.map((t) => (
                <SelectItem key={t} value={t}>
                  {formatTime(t)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Switch
            checked={preferences.emails.review.enabled}
            onCheckedChange={(v) => updateReview('enabled', v)}
          />
        </div>
      </div>
    </div>
  );
}
