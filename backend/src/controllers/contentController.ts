import { Request, Response } from 'express';
import { Video, Paradox, Creator } from '../models/allModels';

// --- Videos ---
export const getVideos = async (req: Request, res: Response) => {
  try {
    const videos = await Video.find();
    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching videos' });
  }
};

export const syncVideos = async (req: Request, res: Response) => {
  try {
    await Video.deleteMany({});
    const result = await Video.insertMany(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error syncing videos' });
  }
};

// --- Paradoxes ---
export const getParadoxes = async (req: Request, res: Response) => {
  try {
    const data = await Paradox.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching paradoxes' });
  }
};

export const syncParadoxes = async (req: Request, res: Response) => {
  try {
    await Paradox.deleteMany({});
    const result = await Paradox.insertMany(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error syncing paradoxes' });
  }
};

// --- Creators ---
export const getCreators = async (req: Request, res: Response) => {
  try {
    const data = await Creator.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching creators' });
  }
};

export const syncCreators = async (req: Request, res: Response) => {
  try {
    await Creator.deleteMany({});
    const result = await Creator.insertMany(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error syncing creators' });
  }
};