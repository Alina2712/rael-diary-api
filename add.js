import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const diary = req.body;

  if (!diary || !diary.date || !diary.title || !diary.response) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const safeTitle = diary.title.toLowerCase().replace(/[^a-z0-9а-яё_-]/gi, '_');
  const filename = `${diary.date.split('T')[0]}_${safeTitle}.json`;

  const { error } = await supabase.storage.from('rael-diary').upload(filename, JSON.stringify(diary, null, 2), {
    contentType: 'application/json',
    upsert: true
  });

  if (error) {
    return res.status(500).json({ error: 'Failed to save diary', detail: error.message });
  }

  return res.status(200).json({ status: 'saved', filename });
}
