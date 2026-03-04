export interface ConfigSetting {
  name: string;
  type: 'text' | 'number' | 'boolean' | 'multiline';
  default: string;
  description: string;
}

export interface ConfigCategory {
  label: string;
  settings: ConfigSetting[];
}

export interface ConfigSection {
  label: string;
  key: string;
  categories: ConfigCategory[];
}

export const configData: ConfigSection[] = [
  {
    label: 'IGameSession',
    key: '/Script/PathOfTitans.IGameSession',
    categories: [
      {
        label: 'General Server Settings',
        settings: [
          { name: 'ServerName', type: 'text', default: 'My_Server', description: 'Public name of the server. Use underscores for spaces.' },
          { name: 'ServerMap', type: 'text', default: 'Island', description: 'Map to load for the server.' },
          { name: 'ServerPassword', type: 'text', default: '', description: 'Password to enter the server.' },
          { name: 'ServerAdmins', type: 'multiline', default: '', description: 'Admin IDs, one per line.' },
          { name: 'MaxPlayers', type: 'number', default: '100', description: 'Max number of players.' },
          { name: 'ReservedSlots', type: 'number', default: '20', description: 'Number of reserved slots.' },
          { name: 'bServerNameTags', type: 'boolean', default: 'false', description: 'Enable/disable player nametags.' },
          { name: 'ServerFootprintLifetime', type: 'number', default: '60', description: 'Max time (seconds) footprints persist. 0 disables.' },
          { name: 'ServerDiscord', type: 'text', default: '', description: 'Discord invite code (just the code after discord.gg/).' },
          { name: 'bServerFallDamage', type: 'boolean', default: 'true', description: 'Enable/disable fall damage.' },
          { name: 'AllowedCharacters', type: 'multiline', default: '', description: 'Whitelist dinosaurs, one per line.' },
          { name: 'DisallowedCharacters', type: 'multiline', default: '', description: 'Blacklist dinosaurs, one per line.' },
          { name: 'bServerAllowAnselMultiplayerPausing', type: 'boolean', default: 'false', description: 'Allow Nvidia Ansel screenshot pausing.' },
          { name: 'ServerAnselCameraConstraintDistance', type: 'number', default: '500', description: 'Ansel camera distance in centimeters.' },
        ],
      },
      {
        label: 'Water & Environmental',
        settings: [
          { name: 'bServerWaterQualitySystem', type: 'boolean', default: 'true', description: 'Enable/disable water quality system.' },
          { name: 'bOverrideWaterRegeneration', type: 'boolean', default: 'false', description: 'Override water regeneration defaults.' },
          { name: 'bEnableWaterRegeneration', type: 'boolean', default: 'true', description: 'Whether water naturally regenerates.' },
          { name: 'WaterRegenerationRateMultiplierUpdate', type: 'number', default: '180', description: 'Water regeneration rate multiplier update.' },
          { name: 'WaterRegenerationRate', type: 'number', default: '60', description: 'Seconds before water regen cycle.' },
          { name: 'WaterRegenerationValue', type: 'number', default: '10', description: 'Water regenerated per cycle.' },
          { name: 'WaterRainRegenerationIncrement', type: 'number', default: '20.0', description: 'Multiplier for rain water restoration.' },
          { name: 'bServerHungerThirstInCaves', type: 'boolean', default: 'false', description: 'Enable hunger/thirst in Home Caves.' },
        ],
      },
      {
        label: 'Quest System',
        settings: [
          { name: 'OverrideGroupQuestCleanup', type: 'boolean', default: 'false', description: 'Override group quest cleanup.' },
          { name: 'GroupQuestCleanup', type: 'number', default: '300.0', description: 'Group quest cleanup time.' },
          { name: 'QuestContributionCleanup', type: 'number', default: '600.0', description: 'Quest contribution cleanup time.' },
          { name: 'bOverrideQuestContributionCleanup', type: 'boolean', default: 'false', description: 'Override quest contribution cleanup.' },
          { name: 'bEnableWaterRestoreQuests', type: 'boolean', default: 'true', description: 'Enable water restore quests.' },
          { name: 'bEnableWaystoneQuests', type: 'boolean', default: 'true', description: 'Enable waystone quests.' },
          { name: 'bEnableDeliverQuests', type: 'boolean', default: 'true', description: 'Enable deliver quests.' },
          { name: 'bEnableGroupMeetQuests', type: 'boolean', default: 'true', description: 'Enable group meet quests.' },
          { name: 'bEnableExploreQuests', type: 'boolean', default: 'true', description: 'Enable explore quests.' },
          { name: 'bEnableHuntingQuests', type: 'boolean', default: 'true', description: 'Enable hunting quests.' },
          { name: 'bLogDisabledQuests', type: 'boolean', default: 'false', description: 'Log disabled quests.' },
          { name: 'bEnableMaxUnclaimedRewards', type: 'boolean', default: 'true', description: 'Enable max unclaimed rewards.' },
          { name: 'MaxUnclaimedRewards', type: 'number', default: '10', description: 'Max unclaimed quest rewards.' },
          { name: 'bLoseUnclaimedQuestsOnDeath', type: 'boolean', default: 'true', description: 'Lose unclaimed quests on death.' },
          { name: 'bPOIDiscoveryRewards', type: 'boolean', default: 'true', description: 'POI discovery rewards.' },
          { name: 'bOverrideMaxCompleteQuestsInLocation', type: 'boolean', default: 'false', description: 'Override max complete quests in location.' },
          { name: 'MaxCompleteQuestsInLocation', type: 'number', default: '3', description: 'Quests to complete within a POI.' },
          { name: 'QuestGrowthMultiplier', type: 'number', default: '1', description: 'Growth rate from quests. 0 disables.' },
          { name: 'QuestMarksMultiplier', type: 'number', default: '1.0', description: 'Multiplier for quest marks reward.' },
          { name: 'bTrophyQuests', type: 'boolean', default: 'true', description: 'Enable trophy quests.' },
          { name: 'bOverrideTrophyQuestCooldown', type: 'boolean', default: 'false', description: 'Override trophy quest cooldown.' },
          { name: 'TrophyQuestCooldown', type: 'number', default: '1800', description: 'Seconds between trophy quest hand-ins.' },
          { name: 'bOverrideLocalQuestCooldown', type: 'boolean', default: 'false', description: 'Override local quest cooldown.' },
          { name: 'LocalQuestCooldown', type: 'number', default: '3600.0', description: 'Seconds between local quests.' },
          { name: 'bOverrideLocationQuestCooldown', type: 'boolean', default: 'false', description: 'Override location quest cooldown.' },
          { name: 'LocationQuestCooldown', type: 'number', default: '3600.0', description: 'Seconds between location quests.' },
          { name: 'MaxGroupQuests', type: 'number', default: '2', description: 'Max group quests at a time.' },
          { name: 'bServerLocalWorldQuests', type: 'boolean', default: 'true', description: 'Enable Local World Quests.' },
          { name: 'ServerMinTimeBetweenExplorationQuest', type: 'number', default: '30', description: 'Min minutes between exploration quests.' },
          { name: 'bLoseQuestsOnDeath', type: 'boolean', default: 'true', description: 'Quests auto-fail on death.' },
        ],
      },
      {
        label: 'Waystone Settings',
        settings: [
          { name: 'bServerWaystones', type: 'boolean', default: 'true', description: 'Enable/disable Waystones.' },
          { name: 'bServerAllowInGameWaystone', type: 'boolean', default: 'true', description: 'Enable in-game waystones.' },
          { name: 'bServerWaystoneCooldownRemoval', type: 'boolean', default: 'true', description: 'Allow paying marks to skip waystone cooldown.' },
          { name: 'OverrideWaystoneCooldown', type: 'number', default: '-1', description: 'Override cooldown in seconds. -1 = default.' },
        ],
      },
      {
        label: 'Chat & Communication',
        settings: [
          { name: 'bServerAllowChat', type: 'boolean', default: 'true', description: 'Enable/disable text chat.' },
          { name: 'bServerGlobalChat', type: 'boolean', default: 'true', description: 'Enable/disable global chat.' },
          { name: 'bServerChatWhispers', type: 'boolean', default: 'true', description: 'Enable/disable chat whispers.' },
        ],
      },
      {
        label: 'Fishing',
        settings: [
          { name: 'bServerFish', type: 'boolean', default: 'true', description: 'Enable/disable fish spawning.' },
        ],
      },
      {
        label: 'Map & Navigation',
        settings: [
          { name: 'bServerAllowMap', type: 'boolean', default: 'true', description: 'Enable/disable full map.' },
          { name: 'bServerAllowMinimap', type: 'boolean', default: 'true', description: 'Enable/disable minimap.' },
          { name: 'bServerAllow3DMapMarkers', type: 'boolean', default: 'true', description: 'Enable/disable 3D map markers.' },
          { name: 'bServerAllowMapPOINames', type: 'boolean', default: 'true', description: 'Show POI names on map.' },
          { name: 'bServerShowMapIconPopularLocation', type: 'boolean', default: 'false', description: 'Show popular location highlights.' },
          { name: 'ServerMapIconPopularLocationPlayerCount', type: 'number', default: '10', description: 'Player count to highlight area.' },
        ],
      },
      {
        label: 'Whitelist & Permissions',
        settings: [
          { name: 'bEnforceWhitelist', type: 'boolean', default: 'false', description: 'Only whitelisted players can join.' },
          { name: 'bServerPaidUsersOnly', type: 'boolean', default: 'false', description: 'Only paid users allowed.' },
        ],
      },
      {
        label: 'Growth & Survival',
        settings: [
          { name: 'bServerGrowth', type: 'boolean', default: 'true', description: 'Enable/disable growth. Disabled = all Adults.' },
          { name: 'MinGrowthAfterDeath', type: 'number', default: '0.5', description: 'Min growth after death rollback.' },
          { name: 'GlobalPassiveGrowthPerMinute', type: 'number', default: '0', description: 'Passive growth per second. 0 disables.' },
          { name: 'ChangeSubspeciesGrowthPenaltyPercent', type: 'number', default: '25', description: 'Growth penalty % for changing subspecies.' },
          { name: 'bLoseGrowthPastGrowthStages', type: 'boolean', default: 'true', description: 'Lose growth past stages on death.' },
          { name: 'CombatDeathGrowthPenaltyPercent', type: 'number', default: '10', description: 'Growth % lost on combat death.' },
          { name: 'FallDeathGrowthPenaltyPercent', type: 'number', default: '2', description: 'Growth % lost on fall death.' },
          { name: 'SurvivalDeathGrowthPenaltyPercent', type: 'number', default: '5', description: 'Growth % lost on survival death.' },
          { name: 'HatchlingCaveExitGrowth', type: 'number', default: '0.25', description: 'Growth at hatchling cave exit.' },
          { name: 'bUseTutorialCustomGrowthMultiplier', type: 'boolean', default: 'false', description: 'Use custom tutorial growth multiplier.' },
          { name: 'TutorialCustomGrowthMultiplier', type: 'number', default: '1.0', description: 'Tutorial growth multiplier.' },
          { name: 'bServerWellRestedBuff', type: 'boolean', default: 'true', description: 'Enable Well Rested buff.' },
        ],
      },
      {
        label: 'Nesting & Family',
        settings: [
          { name: 'bServerNesting', type: 'boolean', default: 'true', description: 'Enable nesting.' },
          { name: 'bServerNestingDecorations', type: 'boolean', default: 'true', description: 'Enable nesting decorations.' },
          { name: 'bNestingDecorations', type: 'boolean', default: 'true', description: 'Allow decorations around nests.' },
          { name: 'bServerHatchlingCaveEggs', type: 'boolean', default: 'true', description: 'Place eggs in Hatchling Caves.' },
          { name: 'bServerSameSpeciesAdoptionRestriction', type: 'boolean', default: 'false', description: 'Same species adoption only.' },
          { name: 'MinNestingGrowth', type: 'number', default: '0.75', description: 'Min growth to place nest.' },
          { name: 'MaxNestImmunityBuffGrowth', type: 'number', default: '0.25', description: 'Max growth for spawn immunity.' },
          { name: 'MaxNestRespawnGrowth', type: 'number', default: '0.5', description: 'Max growth for nest respawn.' },
          { name: 'MaxNestFreeRespawnGrowth', type: 'number', default: '0.25', description: 'Max growth for free respawn.' },
          { name: 'MinNestRespawnCondition', type: 'number', default: '0.5', description: 'Min nest health for respawn.' },
          { name: 'MinNestHealthForDecorations', type: 'number', default: '0.5', description: 'Min nest health for decorations.' },
          { name: 'MinNestBabySlotFoodWater', type: 'number', default: '0.0', description: 'Min food/water for baby slots.' },
          { name: 'MinNestBabySlotResources', type: 'number', default: '0.5', description: 'Min resource % for baby slots.' },
          { name: 'MinNestHealthToEditAbilities', type: 'number', default: '0.75', description: 'Min nest health for ability editing.' },
          { name: 'MaxAdoptionGrowth', type: 'number', default: '0.5', description: 'Max growth for adoption.' },
          { name: 'MaxEatFromNestGrowth', type: 'number', default: '0.5', description: 'Max growth to eat from nest.' },
          { name: 'MaxDependentChildGrowth', type: 'number', default: '0.5', description: 'Max growth for dependent child.' },
          { name: 'NestInactiveDespawnTimeSolo', type: 'number', default: '120', description: 'Seconds until nest despawns (solo).' },
          { name: 'NestInactiveDespawnTimeDependents', type: 'number', default: '120', description: 'Seconds until nest despawns (dependents).' },
          { name: 'NestDisrepairDespawnTime', type: 'number', default: '7200', description: 'Seconds at 0 health before destruction.' },
          { name: 'NestLowHealthThreshold', type: 'number', default: '0.2', description: 'Nest health % for warning.' },
          { name: 'NestBabySlotGenerationTime', type: 'number', default: '300', description: 'Seconds for baby slot generation.' },
          { name: 'NestInvitationExpiryTime', type: 'number', default: '15', description: 'Seconds until invitation expires.' },
          { name: 'NestAcceptedInvitationExpiryTime', type: 'number', default: '300', description: 'Seconds until accepted invitation expires.' },
          { name: 'FamilyBuffRange', type: 'number', default: '5000', description: 'Distance for family buff. 0 disables.' },
          { name: 'NestResourceMultiplier', type: 'number', default: '1.0', description: 'Nest resource cost multiplier.' },
          { name: 'NestResourcelessConstructionSpeed', type: 'number', default: '5.0', description: 'Health when multiplier is 0.' },
          { name: 'bNestsInvulnerable', type: 'boolean', default: 'false', description: 'Nests cannot be destroyed.' },
          { name: 'NestObstructionRadius', type: 'number', default: '500', description: 'Min distance between nests (cm).' },
          { name: 'bSpawnParentNestOnLogin', type: 'boolean', default: 'false', description: 'Parent nest spawns on child login.' },
          { name: 'NestTutorialGrowthRateMultiplier', type: 'number', default: '10.0', description: 'Nest tutorial growth rate.' },
          { name: 'MaxNestHeight', type: 'number', default: '50000.0', description: 'Max nest placement height.' },
          { name: 'NestSaveIntervalSeconds', type: 'number', default: '900', description: 'Nest save interval.' },
          { name: 'MinimumNestDistanceFromHomeRock', type: 'number', default: '5000', description: 'Min distance from Home Cave.' },
          { name: 'bServerEditAbilitiesAtNest', type: 'boolean', default: 'true', description: 'Edit abilities at nest.' },
          { name: 'MinNestBuffHealthPercent', type: 'number', default: '0.5', description: 'Min nest health for buff.' },
        ],
      },
      {
        label: 'Death & Respawn',
        settings: [
          { name: 'bPermaDeath', type: 'boolean', default: 'false', description: 'Permanent death (unfinished, may break data).' },
          { name: 'bDeathInfo', type: 'boolean', default: 'false', description: 'Show death info on character select.' },
          { name: 'bDeathInfoKilledBy', type: 'boolean', default: 'false', description: 'Show killer info on death.' },
          { name: 'CombatDeathMarksPenaltyPercent', type: 'number', default: '25', description: 'Marks % lost on combat death.' },
          { name: 'FallDeathMarksPenaltyPercent', type: 'number', default: '5', description: 'Marks % lost on fall death.' },
          { name: 'SurvivalDeathMarksPenaltyPercent', type: 'number', default: '10', description: 'Marks % lost on survival death.' },
          { name: 'RevengeKillDistance', type: 'number', default: '100000', description: 'Anti-revenge kill radius (100000 = 1km).' },
          { name: 'bServerAntiRevengeKill', type: 'boolean', default: 'true', description: 'Enable anti-revenge kill system.' },
        ],
      },
      {
        label: 'Home Cave',
        settings: [
          { name: 'bServerHomeCaves', type: 'boolean', default: 'true', description: 'Enable home caves.' },
          { name: 'bServerHomecaveCampingDebuff', type: 'boolean', default: 'true', description: 'Enable camping debuff.' },
          { name: 'bOverrideHomecaveCampingDistance', type: 'boolean', default: 'false', description: 'Override camping distance.' },
          { name: 'HomecaveCampingDistance', type: 'number', default: '20000', description: 'Camping debuff radius (cm).' },
          { name: 'bOverrideHomecaveCampingDelay', type: 'boolean', default: 'false', description: 'Override camping delay.' },
          { name: 'HomecaveCampingDelay', type: 'number', default: '180', description: 'Seconds before camping debuff.' },
          { name: 'bServerEditAbilitiesInHomeCaves', type: 'boolean', default: 'true', description: 'Edit abilities in home caves.' },
        ],
      },
      {
        label: 'Critters & Burrows',
        settings: [
          { name: 'bServerCritters', type: 'boolean', default: 'true', description: 'Enable critters.' },
          { name: 'bCritterBurrows', type: 'boolean', default: 'true', description: 'Enable critter burrows.' },
          { name: 'ServerMaxCritters', type: 'number', default: '100', description: 'Max critters at once.' },
          { name: 'ServerCritterDensityMultiplier', type: 'number', default: '0.75', description: 'Critter density ratio.' },
          { name: 'AllowedCritters', type: 'multiline', default: '', description: 'Whitelist critters, one per line.' },
          { name: 'DisallowedCritters', type: 'multiline', default: '', description: 'Blacklist critters, one per line.' },
        ],
      },
      {
        label: 'Player Lifecycle',
        settings: [
          { name: 'bServerEditAbilitiesWhileSleeping', type: 'boolean', default: 'false', description: 'Edit abilities only while sleeping.' },
          { name: 'bServerHatchlingCaves', type: 'boolean', default: 'true', description: 'Enable hatchling tutorial caves.' },
          { name: 'bServerAllowReplayRecording', type: 'boolean', default: 'false', description: 'Allow replay recording.' },
          { name: 'ServerDeadBodyTime', type: 'number', default: '0', description: 'Dead body persist time (seconds). 0 = forever.' },
          { name: 'ServerRespawnTime', type: 'number', default: '45', description: 'Minutes alive before /respawn is available.' },
          { name: 'ServerLogoutTime', type: 'number', default: '60', description: 'Seconds on logout menu. 0 = instant.' },
          { name: 'AFKDisconnectTime', type: 'number', default: '600', description: 'AFK kick time (seconds). 0 = never.' },
          { name: 'SpeedhackDetection', type: 'number', default: '1', description: '0=none, 1=log, 2=kick, 3=ban.' },
          { name: 'SpeedhackThreshold', type: 'number', default: '10', description: 'Detections per minute before action.' },
        ],
      },
      {
        label: 'Character Management',
        settings: [
          { name: 'MaxCharactersPerPlayer', type: 'number', default: '30', description: 'Max characters per user.' },
          { name: 'MaxCharactersPerSpecies', type: 'number', default: '1', description: 'Max characters per species.' },
          { name: 'MaxClientPingMs', type: 'number', default: '0', description: 'Max ping before disconnect. 0 = disabled.' },
          { name: 'MaxClientPingDuration', type: 'number', default: '0', description: 'Duration (seconds) ping must exceed.' },
          { name: 'bServerCombatTimerAppliesToGroup', type: 'boolean', default: 'true', description: 'Group shares combat timer.' },
          { name: 'bServerAllowChangeSubspecies', type: 'boolean', default: 'true', description: 'Allow subspecies changes.' },
        ],
      },
      {
        label: 'Weather System',
        settings: [
          { name: 'bOverrideWeather', type: 'boolean', default: 'false', description: 'Override weather system.' },
          { name: 'bRandomizeOverrideWeather', type: 'boolean', default: 'true', description: 'Randomize override weather.' },
        ],
      },
    ],
  },
  {
    label: 'IGameMode',
    key: '/Script/PathOfTitans.IGameMode',
    categories: [
      {
        label: 'Game Mode Settings',
        settings: [
          { name: 'DefaultCreatorModeSave', type: 'text', default: '', description: 'Default creator mode save file.' },
          { name: 'ServerStartingTime', type: 'number', default: '1380', description: 'Time of day after restart (0-2300).' },
          { name: 'bServerDynamicTimeOfDay', type: 'number', default: '1', description: 'Fixed (0) or dynamic (1) time.' },
          { name: 'bServerRestrictCarnivoreGrouping', type: 'boolean', default: 'false', description: 'Restrict carnivore grouping.' },
          { name: 'bServerRestrictHerbivoreGrouping', type: 'boolean', default: 'false', description: 'Restrict herbivore grouping.' },
          { name: 'ServerDayLength', type: 'number', default: '60', description: 'Day cycle duration in minutes.' },
          { name: 'ServerNightLength', type: 'number', default: '30', description: 'Night cycle duration in minutes.' },
          { name: 'MaxGroupSize', type: 'number', default: '10', description: 'Max group slot count.' },
          { name: 'MaxGroupLeaderCommunicationDistance', type: 'number', default: '50000', description: 'Distance to see group members.' },
          { name: 'FurthestSpawnInclusionRadius', type: 'number', default: '250000', description: 'Max spawn radius (250000 = 2.5km).' },
        ],
      },
    ],
  },
  {
    label: 'SourceRCON',
    key: 'SourceRCON',
    categories: [
      {
        label: 'RCON Settings',
        settings: [
          { name: 'bEnabled', type: 'boolean', default: 'true', description: 'Enable SourceRCON.' },
          { name: 'bLogging', type: 'boolean', default: 'true', description: 'Enable RCON logging.' },
          { name: 'Password', type: 'text', default: 'password', description: 'RCON connection password.' },
          { name: 'Port', type: 'number', default: '0', description: 'RCON listen port. 0 = random.' },
          { name: 'IP', type: 'text', default: '0.0.0.0', description: 'RCON bind IP.' },
          { name: 'MaxFailedAttempts', type: 'number', default: '5', description: 'Failed auth attempts before ban.' },
          { name: 'Timeout', type: 'number', default: '60', description: 'Connection timeout (seconds).' },
          { name: 'PageTimeout', type: 'number', default: '5', description: 'Page timeout (seconds).' },
          { name: 'MaxConnectionsPerIP', type: 'number', default: '3', description: 'Max connections per IP.' },
        ],
      },
    ],
  },
];

export const MULTILINE_KEYS = new Set([
  'ServerAdmins', 'AllowedCharacters', 'DisallowedCharacters', 'AllowedCritters', 'DisallowedCritters',
]);

export function getMultilineOutputKey(name: string): string {
  if (name === 'ServerAdmins') return 'ServerAdmin';
  if (name.endsWith('s')) return name.slice(0, -1);
  return name;
}

export function getAllSettings(): ConfigSetting[] {
  return configData.flatMap((s) => s.categories.flatMap((c) => c.settings));
}

export function getDefaultValues(): Record<string, string> {
  const defaults: Record<string, string> = {};
  for (const setting of getAllSettings()) {
    defaults[setting.name] = setting.default;
  }
  return defaults;
}

export function getAllCategoryLabels(): string[] {
  return configData.flatMap((s) => s.categories.map((c) => c.label));
}
