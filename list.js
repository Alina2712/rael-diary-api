import { readdir, readFile } from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  const diaryPath = path.join(process.cwd(), 'diary');
  const { tag, emo_marker, emo_value_min = 0, keyword } = req.query;

  try {
    const files = await readdir(diaryPath);
    const entries = [];

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const content = await readFile(path.join(diaryPath, file), 'utf-8');
      const json = JSON.parse(content);

      const hasTag = tag ? json.tags?.includes(tag) : true;
      const hasEmo = emo_marker ? json.emo_marker === emo_marker : true;
      const meetsValue = json.emo_value >= parseFloat(emo_value_min || 0);
      const hasKeyword = keyword
        ? (json.response.long + json.response.short + json.question).toLowerCase().includes(keyword.toLowerCase())
        : true;

      if (hasTag && hasEmo && meetsValue && hasKeyword) {
        entries.push({
          id: file.replace('.json', ''),
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

