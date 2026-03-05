'use client';

import { CalendarDays, ClipboardCheck } from 'lucide-react';
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
    <div className="space-y-4">
      {/* Monday planning */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-(--coach-border) p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--coach-green-light) text-(--coach-green)">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div>
            <p className="text-foreground text-sm font-medium">Monday Planning</p>
            <p className="text-xs text-(--coach-warm-gray)">Weekly planning invitation</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={preferences.emails.planning.time}
            onValueChange={(v) => updatePlanning('time', v)}
            disabled={!preferences.emails.planning.enabled}
          >
            <SelectTrigger className="h-8 w-[110px] text-xs">
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
      <div className="flex items-center justify-between gap-4 rounded-xl border border-(--coach-border) p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-(--coach-orange-light) text-(--coach-orange)">
            <ClipboardCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-foreground text-sm font-medium">Friday Review</p>
            <p className="text-xs text-(--coach-warm-gray)">Weekly review invitation</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={preferences.emails.review.time}
            onValueChange={(v) => updateReview('time', v)}
            disabled={!preferences.emails.review.enabled}
          >
            <SelectTrigger className="h-8 w-[110px] text-xs">
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
