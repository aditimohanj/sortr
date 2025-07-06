import { 
  users, 
  processingJobs, 
  settings, 
  type User, 
  type InsertUser, 
  type ProcessingJob, 
  type InsertProcessingJob, 
  type Settings, 
  type InsertSettings,
  type GenreResult,
  type CreatedPlaylist
} from "@shared/schema";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserBySpotifyId(spotifyId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Processing jobs
  getProcessingJob(userId: number): Promise<ProcessingJob | undefined>;
  createProcessingJob(job: InsertProcessingJob): Promise<ProcessingJob>;
  updateProcessingJob(userId: number, updates: Partial<ProcessingJob>): Promise<ProcessingJob | undefined>;
  deleteProcessingJob(userId: number): Promise<void>;

  // Settings
  getSettings(userId: number): Promise<Settings | undefined>;
  createSettings(settings: InsertSettings): Promise<Settings>;
  updateSettings(userId: number, updates: Partial<Settings>): Promise<Settings | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private processingJobs: Map<number, ProcessingJob>;
  private settings: Map<number, Settings>;
  private currentUserId: number;
  private currentJobId: number;
  private currentSettingsId: number;

  constructor() {
    this.users = new Map();
    this.processingJobs = new Map();
    this.settings = new Map();
    this.currentUserId = 1;
    this.currentJobId = 1;
    this.currentSettingsId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserBySpotifyId(spotifyId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.spotifyId === spotifyId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      email: insertUser.email || null,
      profileImage: insertUser.profileImage || null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getProcessingJob(userId: number): Promise<ProcessingJob | undefined> {
    return Array.from(this.processingJobs.values()).find(job => job.userId === userId);
  }

  async createProcessingJob(insertJob: InsertProcessingJob): Promise<ProcessingJob> {
    const id = this.currentJobId++;
    const job: ProcessingJob = { 
      ...insertJob, 
      id,
      progress: insertJob.progress ?? null,
      currentStep: insertJob.currentStep ?? null,
      totalSongs: insertJob.totalSongs ?? null,
      processedSongs: insertJob.processedSongs ?? null,
      genreResults: insertJob.genreResults ?? null,
      createdPlaylists: insertJob.createdPlaylists ?? null,
      errorMessage: insertJob.errorMessage ?? null,
      startedAt: insertJob.startedAt ?? null,
      completedAt: insertJob.completedAt ?? null
    };
    this.processingJobs.set(id, job);
    return job;
  }

  async updateProcessingJob(userId: number, updates: Partial<ProcessingJob>): Promise<ProcessingJob | undefined> {
    const job = Array.from(this.processingJobs.values()).find(j => j.userId === userId);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...updates };
    this.processingJobs.set(job.id, updatedJob);
    return updatedJob;
  }

  async deleteProcessingJob(userId: number): Promise<void> {
    const job = Array.from(this.processingJobs.values()).find(j => j.userId === userId);
    if (job) {
      this.processingJobs.delete(job.id);
    }
  }

  async getSettings(userId: number): Promise<Settings | undefined> {
    return Array.from(this.settings.values()).find(s => s.userId === userId);
  }

  async createSettings(insertSettings: InsertSettings): Promise<Settings> {
    const id = this.currentSettingsId++;
    const settings: Settings = { 
      ...insertSettings, 
      id,
      useAudioFeatures: insertSettings.useAudioFeatures ?? true,
      useArtistGenres: insertSettings.useArtistGenres ?? true,
      minSongsPerPlaylist: insertSettings.minSongsPerPlaylist ?? 10,
      makePlaylistsPublic: insertSettings.makePlaylistsPublic ?? false,
      addEmojis: insertSettings.addEmojis ?? true,
      playlistPrefix: insertSettings.playlistPrefix ?? ""
    };
    this.settings.set(id, settings);
    return settings;
  }

  async updateSettings(userId: number, updates: Partial<Settings>): Promise<Settings | undefined> {
    const settings = Array.from(this.settings.values()).find(s => s.userId === userId);
    if (!settings) return undefined;
    
    const updatedSettings = { ...settings, ...updates };
    this.settings.set(settings.id, updatedSettings);
    return updatedSettings;
  }
}

export const storage = new MemStorage();
