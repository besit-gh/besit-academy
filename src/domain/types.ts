export type Difficulty = 'starter' | 'basic' | 'confident' | 'advanced';
export type CompetencyId =
  | 'linux-basics' | 'terminal-navigation' | 'permissions' | 'troubleshooting'
  | 'network-diagnostics' | 'git-workflow' | 'scripting' | 'containers'
  | 'cicd' | 'infrastructure-as-code' | 'kubernetes-basics' | 'security-basics'
  | 'observability' | 'career-readiness';
export interface MissionStep { id: string; prompt: string; explanation: string; options: { id: string; label: string }[]; correctOptionId: string }
export interface Mission { id: string; title: string; department: string; summary: string; difficulty: Difficulty; xp: number; competency: CompetencyId; steps: MissionStep[] }
export interface PlayerProfile { callsign: string; level: number; xp: number; completedMissionIds: string[]; unlockedCompetencies: CompetencyId[]; achievementIds: string[]; favoriteMissionIds: string[]; updatedAt: string }
export interface GameEvent { id: string; type: 'mission_completed' | 'level_up' | 'achievement_unlocked' | 'profile_created'; message: string; createdAt: string }
export interface SaveFile { schemaVersion: 1; exportedAt: string; profile: PlayerProfile; events: GameEvent[] }
