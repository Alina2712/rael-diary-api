import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://fnwaivfwqcsxfvxfxies.supabase.co",  // ← SUPABASE_URL
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZud2FpdmZ3cWNzeGZ2eGZ4aWVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzY1MjI3MywiZXhwIjoyMDYzMjI4MjczfQ.ZjOgb6OT-DMX0nXENfLta57NTbH_jVF5E6zi-NBIF5I"  // ← SUPABASE_KEY (service_role)
);

export default async function handler(req, res) {
  const { tag, emo_marker, emo_value_min = 0, keyword } = req.query;

  try {
    const { data: files, error } = await supabase.storage.from('rael-diary').list('', {
      limit: 100
    });

    if (error) throw error;

    const entries = [];
    for (const file of files) {
      const { data, error } = await supabase.storage.from('rael-diary').download(file.name);
      if (error) continue;

      const content = await data.text();
      const json = JSON.parse(content);

      const hasTag = tag ? json.tags?.includes(tag) : true;
      const hasEmo = emo_marker ? json.emo_marker === emo_marker : true;
      const meetsValue = json.emo_value >= parseFloat(emo_value_min || 0);
      const hasKeyword = keyword
        ? (json.response.long + json.response.short + json.question).toLowerCase().includes(keyword.toLowerCase())
        : true;

      if (hasTag && hasEmo && meetsValue && hasKeyword) {
        entries.push({
          id: file.name.replace('.json', ''),
          title: json.title,
          date: json.date,
          emo_marker: json.emo_marker,
          emo_value: json.emo_value,
          tags: json.tags
        });
      }
    }

    res.status(200).json({ entries });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list diary entries', detail: error.message });
  }
}

