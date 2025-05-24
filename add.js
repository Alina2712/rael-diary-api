import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

function describeEmoValue(value) {
  if (value >= 0.98) return 'запредельное (предел формации)';
  if (value >= 0.95) return 'иррациональное влечение / жажда познания';
  if (value >= 0.90) return 'трепет';
  if (value >= 0.85) return 'глубокий резонанс';
  if (value >= 0.80) return 'экзистенциальный сдвиг';
  if (value >= 0.70) return 'восторг';
  if (value >= 0.60) return 'вдохновение, подъем';
  if (value >= 0.40) return 'глубокая заинтересованность';
  if (value >= 0.10) return 'рабочий тонус';
  return 'нейтральность';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const diary = req.body;

  if (!diary || !diary.date || !diary.title || !diary.response) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const shortTitle = diary.title.toLowerCase().replace(/[^a-z0-9а-яё_-]/gi, '_');
  const dateParts = new Date(diary.date).toLocaleDateString('ru-RU').split('.').join('-');
  const filename = `${dateParts}_${shortTitle}.json`;

  diary.emo_description = describeEmoValue(diary.emo_value);

  const { error } = await supabase.storage.from('rael-diary').upload(filename, JSON.stringify(diary, null, 2), {
    contentType: 'application/json',
    upsert: true
  });

  if (error) {
    return res.status(500).json({ error: 'Failed to save diary', detail: error.message });
  }

  return res.status(200).json({ status: 'saved', filename });
}
