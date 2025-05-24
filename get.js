import { readFile } from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Missing id parameter' });
  }

  const filepath = path.join(process.cwd(), 'diary', `${id}.json`);

  try {
    const content = await readFile(filepath, 'utf-8');
    const json = JSON.parse(content);
    res.status(200).json(json);
  } catch (error) {
    res.status(404).json({ error: 'Diary entry not found', detail: error.message });
  }
} 
