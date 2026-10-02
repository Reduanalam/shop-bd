import { useEffect, useState } from "react";
import { fetchSettings } from "../services/settingService.js";

export default function AnnouncementBar() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchSettings()
      .then((res) => setSettings(res.data || res))
      .catch(() => {});
  }, []);

  if (!settings?.announcement?.enabled || !settings.announcement.text) return null;

  return (
    <div className="bg-primary-800 text-white text-xs sm:text-sm text-center py-1.5 px-4 truncate">
      {settings.announcement.text}
    </div>
  );
}
