import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://fnwaivfwqcsxfvxfxies.supabase.co",  // ← SUPABASE_URL
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZud2FpdmZ3cWNzeGZ2eGZ4aWVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NzY1MjI3MywiZXhwIjoyMDYzMjI4MjczfQ.ZjOgb6OT-DMX0nXENfLta57NTbH_jVF5E6zi-NBIF5I"  // ← SUPABASE_KEY (service_role)
);

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing id parameter' });
  }

  const filename = `${id}.json`;

  const { data, error } = await supabase.storage.from('rael-diary').download(filename);

  if (error || !data) {
    return res.status(404).json({ error: 'Diary entry not found', detail: error?.message });
  }

  try {
    const content = await data.text();
    const json = JSON.parse(content);
    res.status(200).json(json);
  } catch (parseError) {
    res.status(500).json({ error: 'Failed to parse diary entry', detail: parseError.message });
  }
}
