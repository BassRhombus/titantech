IGameSession Config
Below are settings that will work under the [/Script/PathOfTitans.IGameSession] header.

TIP

By not adding the line makes the line to the default setting

General Server Settings
Config Name:	Description
ServerName=My_Server	Specifies the public name of the server. Note: To have a space in your server name, you must use underscores _ as spaces.
ServerPassword=Password123	Sets a password to enter the server.
MaxPlayers=100	Sets the max number of players on a server.
ReservedSlots=20	Specifies the number of reserved slots allowed on your server. Click to learn more.
bServerNameTags=false	Enables or disables the ability for ALL players on the server to see player nametags. Defaults to false.
ServerFootprintLifetime=60	Specifies the maximum time (in seconds) footprints will remain behind dinosaurs. Setting this to 0 will disable footprints entirely. Defaults to 60 seconds.
ServerDiscord=gsh	Specifies the connected community Discord server. This must be only the letters/numbers after the discord.gg part of the server invite link. Example: https://discord.gg/gsh should only use gsh Be sure to use a permanent invite link, or else it will expire.
bServerFallDamage	Enables or disables fall damage for all users on the server.
AllowedCharacters=DinosaurName	Disables all dinosaurs except the listed dinosaurs. More information here. 
DisallowedCharacters=DinosaurName	Enables all dinosaurs except the listed dinosaurs. More information here.
bServerAllowAnselMultiplayerPausing=false	Allows players to be able to use Nvidia Ansel on the server to take screenshots. Be mindful of allowing this, as players can technically use it to pause their game to investigate the location of hiding players or gain other gamplay advantages. Defaults to false.
ServerAnselCameraConstraintDistance=500	The distance, in centimeters, the player can move their Nvidia Ansel camera away from their dinosaur in order to take screenshots. It's suggested to keep this a bit limited to avoid unfair gameplay advantages. Defaults to 500 (5 meters).
Water & Environmental Systems
Config Name:	Description
bServerWaterQualitySystem=true	Enables or disables the water quality system.
bOverrideWaterRegeneration=false	Enabled or disables overriding water regeneration. If set to false, it will use the default values.
bEnableWaterRegeneration=true	Sets whether water will naturally regenerate over time. If this is disabled, please ensure you have water restoration quests on the map you are hosting, otherwise you will eventually run out of water.
WaterRegenerationRateMultiplierUpdate=180	The water regeneration rate multiplier update.
WaterRegenerationRate=60	Amount of time in seconds before water applies a regeneration amount. Setting this value too low makes the server update water more frequently and can cause lag.
WaterRegenerationValue=10	Amount of water regenerated every cycle. This scales depending on how large the body of water is.
WaterRainRegenerationIncrement=20.0	Multiplier that increases the amount of water restored when it rains.
bServerHungerThirstInCaves=false	Enables or disables Hunger and Thirst in Home Caves. If disabled, Dinosaurs will not lose hunger or thirst in Home Caves and will take no damage if they have no food or water.
Quest System Settings
Config Name:	Description
OverrideGroupQuestCleanup=false	Needs Description & Testing
GroupQuestCleanup=300.0	Needs Description & Testing
QuestContributionCleanup=600.0	Needs Description & Testing
bOverrideQuestContributionCleanup=false	Needs Description & Testing
bEnableWaterRestoreQuests=true	Needs Description & Testing
bEnableWaystoneQuests=true	Needs Description & Testing
bEnableDeliverQuests=true	Needs Description & Testing
bEnableGroupMeetQuests=true	Needs Description & Testing
bEnableExploreQuests=true	Needs Description & Testing
bEnableHuntingQuests=true	Needs Description & Testing
bLogDisabledQuests=false	Needs Description & Testing
bEnableMaxUnclaimedRewards=true	Needs Description & Testing
MaxUnclaimedRewards=10	Needs Description & Testing
bLoseUnclaimedQuestsOnDeath=true	Needs Description & Testing
bPOIDiscoveryRewards=true	Needs Description & Testing
bOverrideMaxCompleteQuestsInLocation=false	Enables or disables the ability to change the MaxCompleteQuestsInLocation. Defaults to false. If set to true you must also set MaxCompleteQuestsInLocation (below).
MaxCompleteQuestsInLocation=3	Determines how many quests must be completed within a POI before it is 'completed'.
QuestGrowthMultiplier=1	Allows you to adjust the rate of growth earned by players when they complete quests. If you want to disable growth from quests, set this value to 0.
QuestMarksMultiplier=1.0	Specifies the multiplier used when rewarding marks for quest completion.
bTrophyQuests=true	Enable or disable Trophy Quests on the server. Defaults to true
bOverrideTrophyQuestCooldown=false	Flags whether you want to override the TrophyQuestCooldown. If set to true you must also then specify the TrophyQuestCooldown (below). Default to false.
TrophyQuestCooldown=1800	Time (in seconds) between a player being able to handin another Trophy quest. Defaults to 1800 (30 minutes).
bOverrideLocalQuestCooldown=false	Specifies whether to change the time it takes for a Local Quest to be given to a player. Defaults to false. If set to true you must then set LocalQuestCooldown (below).
LocalQuestCooldown=3600.0	Time (in seconds) between a player being able to recieve a new Local Quest. Defaults to 3600 (1 hour).
bOverrideLocationQuestCooldown=false	Specifies whether to change the time it takes for a Location Quest to be given to a player. Defaults to false. If set to true you must then set LocationQuestCooldown (below).
LocationQuestCooldown=3600.0	Time (in seconds) between a player being able to recieve a new Location Quest. Defaults to 3600 (1 hour).
MaxGroupQuests=2	Specifies the maximum number of group quests that can be assigned to a group at a time. Defaults to 2.
bServerLocalWorldQuests=true	Enables or disables Local World Quests on your server.
ServerMinTimeBetweenExplorationQuest=30	Specifies the minumum time (in minutes) between a player receiving a new Exploration quest. Defaults to 30 minutes.
bLoseQuestsOnDeath=true	Specifies whether quests will automatically fail when a player dies.
Waystone Settings
Config Name:	Description
bServerWaystones=true	Enables or disables Waystones on your server.
bServerAllowInGameWaystone=true	Enables or disables waystones. Setting this as false requires players to use the old method of using the Waystone by retuning to the Character Menu screen.
bServerWaystoneCooldownRemoval=true	Enables or disables the ability for players to spend marks to insta-cooldown Waystones.
OverrideWaystoneCooldown=-1	Overrides the cooldown timer for Waystones in seconds. -1 will use the default cooldown timer.
Chat & Communication
Config Name:	Description
bServerAllowChat=true	Enables or disables text chat for the entire server.
bServerGlobalChat=true	Enables or disables the global chat channel on the server.
bServerChatWhispers=true	Needs Description & Testing
Fishing
Config Name:	Description
bServerFish=true	Enables or disables fish spawning.
Map & Navigation
Config Name:	Description
bServerAllowMap=true	Enables or disables the full map for the entire server. Defaults to true.
bServerAllowMinimap=true	Enables or disables the minimap for the entire server. Defaults to true.
bServerAllow3DMapMarkers=true	Enables or disables the markers on the full map, and floating quest markers in the world. Defaults to true.
bServerAllowMapPOINames=true	Needs Description & Testing
bServerShowMapIconPopularLocation=false	Enables Popular Locations, highlighting areas of the map with a high player density. Default is 10.
ServerMapIconPopularLocationPlayerCount=10	Allows you to set the number of users required in an area before it's highlighted on the map. Defaults to 10.
Whitelist & Permissions
Config Name:	Description
bEnforceWhitelist=true	Enables or disables the whitelist system. If enabled, only players on the whitelist can join the server.
bServerPaidUsersOnly=false	Specifies if the server allows free-to-play users to join.
Growth & Survival
Config Name:	Description
bServerGrowth=true	Enables/Disables Growth on your server. If disabled, all dinosaurs will spawn as Adults, and all existing characters will be bumped up to Adult.
MinGrowthAfterDeath=0.5	The minimum growth a player can be rolled back to if they die. Defaults to 0.5
GlobalPassiveGrowthPerMinute=0	Adds additional passive growth per second to all dinosaurs. Remember, full growth = 1 so a good value for this might be 0.005, which means a player would take 200 minutes (3.3 hours) to reach adulthood. Growth amount currently applies equally across all dinosaurs. Setting this to 0 disables passive growth.
ChangeSubspeciesGrowthPenaltyPercent=25	Specifies the growth penalty percent for changing subspecies. Note that bLoseGrowthPastGrowthStages=true may have to be active for anything 25 and above.
bLoseGrowthPastGrowthStages=true	Allows players to lose growth past Juvenile/Adolescent/Sub-Adult/Adult growth states when they die.
CombatDeathGrowthPenaltyPercent=10	Percent of growth a player will lose when they die from combat.
FallDeathGrowthPenaltyPercent=2	Percent of growth a player will lose when they die from fall damage.
SurvivalDeathGrowthPenaltyPercent=5	Percent of growth a player will lose when they die from starving/thirst/drowning.
HatchlingCaveExitGrowth=0.25	Specifies the growth a player will have when they exit the Hatchling Caves. 0 denotes a hatchling and is the default value.
bUseTutorialCustomGrowthMultiplier=false	If true, the tutorial will use the TutorialCustomGrowthMultiplier value to determine the growth rate of the player. If false, the tutorial will use the default growth rate.
TutorialCustomGrowthMultiplier=1.0	The growth multiplier used in the tutorial if bUseTutorialCustomGrowthMultiplier is set to true.
bServerWellRestedBuff=true	Enables or disables the Well Rested buff. Defaults to true.
Nesting & Family System
Config Name:	Description
bServerNesting=true	If true, nesting will be enabled on the server.
bServerNestingDecorations=true	Needs Description & Testing
bNestingDecorations=true	If true, decorations can be placed around nests.
bServerHatchlingCaveEggs=true	If true, eggs will be placed in the Hatchling Caves.
bServerSameSpeciesAdoptionRestriction=false	If true, only the same species can be adopted. Otherwise, only the same diet type can be adopted.
MinNestingGrowth=0.75	The minimum growth a player must be in order to place a nest.
MaxNestImmunityBuffGrowth=0.25	The maximum growth a hatchling will become immune to all damage for a short time after spawning at their parent's nest. Set this to 0 to completely disable the hatchling spawn immunity.
MaxNestRespawnGrowth=0.5	The maximum growth a hatchling will respawn at their parent's nest. Once they grow past this value, they will respawn at a random point on the map like a regular adult dinosaur.
MaxNestFreeRespawnGrowth=0.25	The maximum growth a hatchling will respawn at their parent's nest without consuming a baby slot. Once they grow past this point, they will consume an egg slot for each respawn.
MinNestRespawnCondition=0.5	The minimum health a nest must have for a hatchling to be able to respawn at it. If the nest is too damaged, the hatchling will not be able to respawn there and will instead spawn at a random point on the map like a regular adult dinosaur.
MinNestHealthForDecorations=0.5	The minimum health a nest must have to place decorations around it.
MinNestBabySlotFoodWater=0.0	The minimum food and water a nest must have inside it to begin generating baby slots. Leave this at 0 to ignore the food/water requirements.
MinNestBabySlotResources=0.5	The minimum resource percentage in each category a nest must have to generate baby slots.
MinNestHealthToEditAbilities=0.75	The minimum health a nest must have to be able to edit abilities while sleeping nearby it.
MaxAdoptionGrowth=0.5	The max growth of a potential adoption candidate. If they are older than this age, they will not be adoptable.
MaxEatFromNestGrowth=0.5	The max growth of a hatchling that can eat from a nest. If they are older than this age, they will not be able to eat from the nest.
MaxDependentChildGrowth=0.5	The max growth a child can be to be consider a dependent of its parent. Used to determine a few things such as if a nest should use solo or dependent inactivity timers.
NestInactiveDespawnTimeSolo=120	The amount of seconds until a nest will despawn without the owner online.
NestInactiveDespawnTimeDependents=120	The amount of seconds until a nest will despawn, without the owner's offspring online.
NestDisrepairDespawnTime=7200	The amount of seconds a nest with 0 health will be destroyed permanently.
NestLowHealthThreshold=0.2	The nest health percentage when it will display a warning toast to the owner.
NestBabySlotGenerationTime=300	The amount of seconds it will take for a baby slot to generate while all baby slot conditions are met.
NestInvitationExpiryTime=15	The amount of seconds until a nest invitation will expire.
NestAcceptedInvitationExpiryTime=300	The amount of seconds until an accepted nest invitation will no longer be valid to use. This will be used on the character creation screen as the player is creating their new hatchling character.
FamilyBuffRange=5000	The distance from family members that the family buff will be applied. Set this to 0 to disable this buff.
NestResourceMultiplier=1.0	The multiplier on the amount of resources required to construct a nest. If set to 0, nests will not require resources and can be built instantly without them.
NestResourcelessConstructionSpeed=5.0	The amount of health contributed to a nest when NestResourceMultiplier is zero.
bNestsInvulnerable=false	If true, nests cannot be destroyed by other players.
NestObstructionRadius=500	The radius in centimeters other nests cannot be placed near an existing nest. The default is 5 meters here.
bSpawnParentNestOnLogin=false	If true, the parent's nest will spawn when a child that is still young logs in. This can be useful to avoid players being orphaned if their parents log out.
NestTutorialGrowthRateMultiplier=10.0	Needs Description & Testing
MaxNestHeight=50000.0	Needs Description & Testing
NestSaveIntervalSeconds=900	Needs Description & Testing
MinimumNestDistanceFromHomeRock=5000	The minimum distance a nest must be from a Home Cave. This is to prevent nests from being placed too close to the Home Cave.
bServerEditAbilitiesAtNest=true	If true, players can only edit abilities at their nest or home cave (if enabled). Setting BOTH bServerEditAbilitiesInHomeCaves=false AND bServerEditAbilitiesAtNest=false will allow players to edit their abilities anywhere.
MinNestBuffHealthPercent=0.5	The minimum health percentage a nest must have to apply the nest buff to the player.
Death & Respawn
Config Name:	Description
bPermaDeath=false	Activates permanent death on the server. Deceased characters will show up as corpses on the Character Selection Menu. Defaults to false. NOTE: This feature is not finished and may break character data for your server. Use at your own risk.
bDeathInfo=false	Displays a textbox on the Character Select Screen that provides info about your dead character when bPermaDeath is enabled.
bDeathInfoKilledBy=false	Needs Description & Testing
CombatDeathMarksPenaltyPercent=25	Percent of total marks a player will lose when they die from combat.
FallDeathMarksPenaltyPercent=5	Percent of total marks a player will lose when they die from fall damage.
SurvivalDeathMarksPenaltyPercent=10	Percent of total marks a player will lose when they die from starving/thirst/drowning.
RevengeKillDistance=100000	(100000 = 1km) Will only work when a Database is set to remote, for hived servers. It is planned to work for all servers in the future. Specifies the radius of the Anti-Revenge Kill distance.
bServerAntiRevengeKill=true	Will only work when a Database is set to remote, for hived servers. It is planned to work for all servers in the future. When set to true, when a player is killed, any of their other characters within a certain radius are flagged with a 10 minute timer, which prevents those specific characters from logging back in right away. Characters that are further away are unaffected by the login timer.
Home Cave
Config Name:	Description
bServerHomeCaves=true	Enables or disables home caves on your server.
bServerHomecaveCampingDebuff=true	Enables or disables the Home Cave Camping debuff on your server.
bOverrideHomecaveCampingDistance=false	Flags whether you want to override the Home Cave Camping debuff. If set to true you must also then specify the HomecaveCampingDistance (below). Defaults to false.
HomecaveCampingDistance=20000	Radius (in centimeters) around Home Cave Entrances that will apply the Home Cave Camping debuff. Defaults to 20000, which is 200 meters.
bOverrideHomecaveCampingDelay=false	Flags whether there is a delay between a player entering the HomecaveCampingDistance radius, and actually having the debuff applied to them. Typically this should be at least a few minutes to avoid players instantly getting debuffed when they walk near a Home Cave.
HomecaveCampingDelay=180	Time (in seconds) the Home Cave Camping debuff will delay before being applied to a player if they are within the HomecaveCampingDistance. Defaults to 180 (3 minutes).
bServerEditAbilitiesInHomeCaves=true	If true, players can only edit abilities in their home caves. If false, players can edit their abilities anywhere. Recommended to be set to true if you also enable home caves on your server.
bServerHealingInHomeCave	Needs Description & Testing
Critters & Burrows
Config Name:	Description
bServerCritters=true	Enables or disables critters spawning. Defaults to true.
bCritterBurrows=true	Enables or disables critter burrows. Defaults to true.
ServerMaxCritters=100	The maximum number of critters that can spawn at once. Defaults to 100 critters allowed at once.
ServerCritterDensityMultiplier=0.75	The density of critters that will spawn. Represents the ratio of critters to spawn versus how many spawn groups there are. Defaults to 0.75.
AllowedCritters=CritterName	Disables all critters except the listed critters. More information here.
DisallowedCritters=CritterName	Enables all critters except the listed critters. More information here.
Player Lifecycle & Security
Config Name:	Description
bServerEditAbilitiesWhileSleeping=false	If true, players can edit their abilities only while sleeping. If false, players can edit their abilities while standing. If this is set to true AND bServerEditAbilitiesInHomeCaves=true, players can edit their abilities in their home caves OR while sleeping.
bServerHatchlingCaves=true	Enables/Disables the tutorial Hatchling Caves. If this is enabled, players will spawn in a tutorial area at 0 growth, and completing quests will bring them to 0.25 growth by the time they exit. If this is disabled, players will spawn in the world at 0.25 growth and completely skip the tutorial. The growth can be modified with HatchlingCaveExitGrowth.
bServerAllowReplayRecording=false	Specifies if players can record a replay. Defaults to false.
ServerDeadBodyTime=0	Specifies how long a dead body will persist for in seconds. A value of 0 means it will persist forever.
ServerRespawnTime=45	Amount of time (in minutes) a player must be alive before they can use the /respawn command to kill their dinosaur and respawn. It's suggested to keep this number relatively high to avoid players piling up corpses on your server and causing issues. Defaults to 45 minutes.
ServerLogoutTime=60	The amount of time required to be on the logout menu before a player safe logs. Set to 0 if you want instant logouts.
Changing Login Debuff length and stats	When a player logs in, they will have a Login Debuff applied to their character. You can adjust the length and stat changes of this buff by adding the following:
-CurveOverrides=(CurveName="Global.LoginDebuffDuration",Values=(60))
-CurveOverrides=(CurveName="Global.LoginDebuffSpeedReduction",Values=(0.75))
-CurveOverrides=(CurveName="Global.LoginDebuffIncomingDamage",Values=(2))
-CurveOverrides=(CurveName="Global.LoginDebuffAttackDamage",Values=(0.4))
This uses the same format as adjusting dinosaur stats, learn how to adjust stats here.
AFKDisconnectTime=600	Specifies the amount of time in seconds before a player will be automatically disconnected from the server if they are idle/AFK. Useful to prevent idle players from filling your server. If set to 0, no players will ever be kicked for being idle.
SpeedhackDetection=1	Setting for action taken when speed hacks are detected. 0 = none, 1 = log, 2 = kick, 3 = ban. From settings 1-3, a PlayerHack webhook will also be sent.
SpeedhackThreshold=10	The amount of speedhack detections that will be allowed per minute before the SpeedhackDetection action is taken. A value of 0 will disable detection. This value helps to minimize false positives due to packet loss or lag.
Character Management
Config Name:	Description
MaxCharactersPerPlayer=30	Specifies the maximum number of characters a user can have in total.
MaxCharactersPerSpecies=1	Specified the maximum number of characters a user can have per species.
MaxClientPingMs=0	Specifies the maximum ms ping before auto-disconnecting the player. 0 will disable this option. Use to prevent high-ping players causing issues for your server.
MaxClientPingDuration=0	Specifies the duration of time in seconds the player's ms ping must be above the MaxClientPingMs before being disconnected.
bDisableGrouping	Needs Description & Testing
bServerCombatTimerAppliesToGroup=true	Specifies whether players that are grouped up all share the same combat timer. If set to false, players will only receive the combat timer if they personally attack/are attacked. Defaults to true.
Changing Group Buff stats	When players are grouped and near each other they gain increased movement speed and stamina regeneration. You can adjust these values by adding the following:
-CurveOverrides=(CurveName="Global.GroupLeaderBuffStaminaRecoveryMultiplier",Values=(1.1))
-CurveOverrides=(CurveName="Global.GroupLeaderBuffSpeedMultiplier",Values=(1.05))
This uses the same format as adjusting dinosaur stats, learn how to adjust stats here.
Changing Group Slot Sizes	When players group up, their dino will fill a certain number of group slots. You can change the number of slots by adding the following for any desired dinosaur:
-GroupSlotSizeOverrides=(DinoAssetID="Allosaurus",GroupSize=5)
This uses the same format as adjusting dinosaur stats, learn how to adjust stats here.added
bServerAllowChangeSubspecies=true	Allows players to change their subspecies. Defaults to true.
Weather System
Config Name:	Description
bOverrideWeather=false	Please see Weather Control
bRandomizeOverrideWeather=true	Please see Weather Control
WeatherLengthVariation=(X=10,Y=20)	The amount of time (in minutes) that any 1 weather type will be active for. This is specified as a minimum (X) and maxium (y) time that will be randomly selected between. By default, a weather type will persist for between 10 to 20 minutes before changing to the next weather type.
WeatherBlendVariation=(X=1,Y=2)	The duration of time (in minutes) that will take for weather types to transition to the next. This is specified as a minimum (X) and maxium (y) time that will be randomly selected between. By default, it will take between 1 to 2 minutes for the weather to transition to the next type.
Server Restarting
Config Name:	Description
Configure Server Automatic Restart Times	Servers can be configured to automatically restart either at preset times or at preset intervals through the following options: bServerAutoRestart, bUseScheduledRestartTimes, ScheduledRestartTimes, RestartLengthInSeconds, RestartNotificationTimestamps. Learn how to adjust server restart behavior here.
IGameMode Config
Below are settings that will work under the [/Script/PathOfTitans.IGameMode] header.

Config Name:	Description:
DefaultCreatorModeSave=CreatorName	Specifies the default creator mode save file to load when the server starts. This is the name used to save the creator mode file. If the file does not exist, it will not load. (Currently has some limitations with loading saved modded items)
ServerStartingTime=1380	Specifies the time of day the server begins at after a restart. Time is scaled between 0-2300. Example:100 = 1:00 AM, 1200 = 12:00 PM, and 1800 = 6:00 PM signifies 12:00 PM, and 1800 denotes 6:00 PM.
bServerDynamicTimeOfDay=1	Specifies if the server uses a fixed (0) or dynamic (1) time of day. Fixed will use the ServerStartingTime.
bServerRestrictCarnivoreGrouping=false	Specifies if the server restricts carnivore grouping to the same species. (Revision 13324)
bServerRestrictHerbivoreGrouping=false	Specifies if the server restricts herbivore grouping to the same species. (Revision 16231)
ServerDayLength=60	This feature sets the duration (minutes) for a complete day cycle.
ServerNightLength=30	Specified the length (in minutes) of a full night cycle. (Revision 29073)
MaxGroupSize=10	This feature establishes the limit for the number of slots available for player groups.
MaxGroupLeaderCommunicationDistance=50000	Sets the distance (in meters) for players to be able to see their other group members.
FurthestSpawnInclusionRadius=250000	Max radius for randomly picking a spawn point from the furthest spawn location from other players. Defaults to 250000 (2.5km).