import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
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
