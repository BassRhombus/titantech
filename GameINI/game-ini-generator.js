// Curve Overrides storage
let curveOverrides = [];

// Path of Titans dinosaur species list
const dinosaurSpecies = [
    "Achillobator", "Albertaceratops", "Alioramus", "Allosaurus", "Amargasaurus",
    "Anodontosaurus", "Barsboldia", "Camptosaurus", "Ceratosaurus", "Concavenator",
    "Daspletosaurus", "Default", "Deinocheirus", "Deinonychus", "Eotriceratops",
    "Eurhinosaurus", "Generic", "Hatzegopteryx", "Iguanodon", "Kaiwhekea",
    "Kentrosaurus", "Lambeosaurus", "Latenivenatrix", "Megalania", "Metriacanthosaurus",
    "Miragaia", "Pachycephalosaurus", "Pycnonemosaurus", "Rhamphorhynchus", "Sarcosuchus",
    "Spinosaurus", "Stegosaurus", "Struthiomimus", "Styracosaurus", "Suchomimus",
    "Thalassodromeus", "Tyrannosaurus", "Tyrannotitan"
];

// Configuration data structure
const configData = {
    IGameSession: {
        "General Server Settings": [
            { name: "ServerName", type: "text", default: "My_Server", description: "Specifies the public name of the server. Note: To have a space in your server name, you must use underscores _ as spaces." },
            { name: "ServerMap", type: "text", default: "Island", description: "Specifies the map to load for the server." },
            { name: "ServerPassword", type: "text", default: "", description: "Sets a password to enter the server." },
            { name: "ServerAdmins", type: "multiline", default: "", description: "Specifies the Admin IDs for the server. Enter one ID per line. Each will generate as a separate ServerAdmin= line. This is only recommended for Server Owners and trusted admins (gives access to all commands) use Commands.ini for all other roles" },
            { name: "MaxPlayers", type: "number", default: "100", description: "Sets the max number of players on a server." },
            { name: "ReservedSlots", type: "number", default: "20", description: "Specifies the number of reserved slots allowed on your server." },
            { name: "bServerNameTags", type: "boolean", default: "false", description: "Enables or disables the ability for ALL players on the server to see player nametags. Defaults to false." },
            { name: "ServerFootprintLifetime", type: "number", default: "60", description: "Specifies the maximum time (in seconds) footprints will remain behind dinosaurs. Setting this to 0 will disable footprints entirely. Defaults to 60 seconds." },
            { name: "ServerDiscord", type: "text", default: "", description: "Specifies the connected community Discord server. This must be only the letters/numbers after the discord.gg part of the server invite link. Example: https://discord.gg/gsh should only use gsh Be sure to use a permanent invite link, or else it will expire." },
            { name: "bServerFallDamage", type: "boolean", default: "true", description: "Enables or disables fall damage for all users on the server." },
            { name: "AllowedCharacters", type: "multiline", default: "", description: "Disables all dinosaurs except the listed dinosaurs. Enter one dinosaur name per line. Each will generate as a separate AllowedCharacter= line." },
            { name: "DisallowedCharacters", type: "multiline", default: "", description: "Enables all dinosaurs except the listed dinosaurs. Enter one dinosaur name per line. Each will generate as a separate DisallowedCharacter= line." },
            { name: "bServerAllowAnselMultiplayerPausing", type: "boolean", default: "false", description: "Allows players to be able to use Nvidia Ansel on the server to take screenshots. Be mindful of allowing this, as players can technically use it to pause their game to investigate the location of hiding players or gain other gamplay advantages. Defaults to false." },
            { name: "ServerAnselCameraConstraintDistance", type: "number", default: "500", description: "The distance, in centimeters, the player can move their Nvidia Ansel camera away from their dinosaur in order to take screenshots. It's suggested to keep this a bit limited to avoid unfair gameplay advantages. Defaults to 500 (5 meters)." }
        ],
        "Water & Environmental Systems": [
            { name: "bServerWaterQualitySystem", type: "boolean", default: "true", description: "Enables or disables the water quality system." },
            { name: "bOverrideWaterRegeneration", type: "boolean", default: "false", description: "Enabled or disables overriding water regeneration. If set to false, it will use the default values." },
            { name: "bEnableWaterRegeneration", type: "boolean", default: "true", description: "Sets whether water will naturally regenerate over time. If this is disabled, please ensure you have water restoration quests on the map you are hosting, otherwise you will eventually run out of water." },
            { name: "WaterRegenerationRateMultiplierUpdate", type: "number", default: "180", description: "The water regeneration rate multiplier update." },
            { name: "WaterRegenerationRate", type: "number", default: "60", description: "Amount of time in seconds before water applies a regeneration amount. Setting this value too low makes the server update water more frequently and can cause lag." },
            { name: "WaterRegenerationValue", type: "number", default: "10", description: "Amount of water regenerated every cycle. This scales depending on how large the body of water is." },
            { name: "WaterRainRegenerationIncrement", type: "number", default: "20.0", description: "Multiplier that increases the amount of water restored when it rains." },
            { name: "bServerHungerThirstInCaves", type: "boolean", default: "false", description: "Enables or disables Hunger and Thirst in Home Caves. If disabled, Dinosaurs will not lose hunger or thirst in Home Caves and will take no damage if they have no food or water." }
        ],
        "Quest System Settings": [
            { name: "OverrideGroupQuestCleanup", type: "boolean", default: "false", description: "Needs Description & Testing" },
            { name: "GroupQuestCleanup", type: "number", default: "300.0", description: "Needs Description & Testing" },
            { name: "QuestContributionCleanup", type: "number", default: "600.0", description: "Needs Description & Testing" },
            { name: "bOverrideQuestContributionCleanup", type: "boolean", default: "false", description: "Needs Description & Testing" },
            { name: "bEnableWaterRestoreQuests", type: "boolean", default: "true", description: "Needs Description & Testing" },
            { name: "bEnableWaystoneQuests", type: "boolean", default: "true", description: "Needs Description & Testing" },
            { name: "bEnableDeliverQuests", type: "boolean", default: "true", description: "Needs Description & Testing" },
            { name: "bEnableGroupMeetQuests", type: "boolean", default: "true", description: "Needs Description & Testing" },
            { name: "bEnableExploreQuests", type: "boolean", default: "true", description: "Needs Description & Testing" },
            { name: "bEnableHuntingQuests", type: "boolean", default: "true", description: "Needs Description & Testing" },
            { name: "bLogDisabledQuests", type: "boolean", default: "false", description: "Needs Description & Testing" },
            { name: "bEnableMaxUnclaimedRewards", type: "boolean", default: "true", description: "Needs Description & Testing" },
            { name: "MaxUnclaimedRewards", type: "number", default: "10", description: "Needs Description & Testing" },
            { name: "bLoseUnclaimedQuestsOnDeath", type: "boolean", default: "true", description: "Needs Description & Testing" },
            { name: "bPOIDiscoveryRewards", type: "boolean", default: "true", description: "Needs Description & Testing" },
            { name: "bOverrideMaxCompleteQuestsInLocation", type: "boolean", default: "false", description: "Enables or disables the ability to change the MaxCompleteQuestsInLocation. Defaults to false. If set to true you must also set MaxCompleteQuestsInLocation (below)." },
            { name: "MaxCompleteQuestsInLocation", type: "number", default: "3", description: "Determines how many quests must be completed within a POI before it is 'completed'." },
            { name: "QuestGrowthMultiplier", type: "number", default: "1", description: "Allows you to adjust the rate of growth earned by players when they complete quests. If you want to disable growth from quests, set this value to 0." },
            { name: "QuestMarksMultiplier", type: "number", default: "1.0", description: "Specifies the multiplier used when rewarding marks for quest completion." },
            { name: "bTrophyQuests", type: "boolean", default: "true", description: "Enable or disable Trophy Quests on the server. Defaults to true" },
            { name: "bOverrideTrophyQuestCooldown", type: "boolean", default: "false", description: "Flags whether you want to override the TrophyQuestCooldown. If set to true you must also then specify the TrophyQuestCooldown (below). Default to false." },
            { name: "TrophyQuestCooldown", type: "number", default: "1800", description: "Time (in seconds) between a player being able to handin another Trophy quest. Defaults to 1800 (30 minutes)." },
            { name: "bOverrideLocalQuestCooldown", type: "boolean", default: "false", description: "Specifies whether to change the time it takes for a Local Quest to be given to a player. Defaults to false. If set to true you must then set LocalQuestCooldown (below)." },
            { name: "LocalQuestCooldown", type: "number", default: "3600.0", description: "Time (in seconds) between a player being able to recieve a new Local Quest. Defaults to 3600 (1 hour)." },
            { name: "bOverrideLocationQuestCooldown", type: "boolean", default: "false", description: "Specifies whether to change the time it takes for a Location Quest to be given to a player. Defaults to false. If set to true you must then set LocationQuestCooldown (below)." },
            { name: "LocationQuestCooldown", type: "number", default: "3600.0", description: "Time (in seconds) between a player being able to recieve a new Location Quest. Defaults to 3600 (1 hour)." },
            { name: "MaxGroupQuests", type: "number", default: "2", description: "Specifies the maximum number of group quests that can be assigned to a group at a time. Defaults to 2." },
            { name: "bServerLocalWorldQuests", type: "boolean", default: "true", description: "Enables or disables Local World Quests on your server." },
            { name: "ServerMinTimeBetweenExplorationQuest", type: "number", default: "30", description: "Specifies the minumum time (in minutes) between a player receiving a new Exploration quest. Defaults to 30 minutes." },
            { name: "bLoseQuestsOnDeath", type: "boolean", default: "true", description: "Specifies whether quests will automatically fail when a player dies." }
        ],
        "Waystone Settings": [
            { name: "bServerWaystones", type: "boolean", default: "true", description: "Enables or disables Waystones on your server." },
            { name: "bServerAllowInGameWaystone", type: "boolean", default: "true", description: "Enables or disables waystones. Setting this as false requires players to use the old method of using the Waystone by retuning to the Character Menu screen." },
            { name: "bServerWaystoneCooldownRemoval", type: "boolean", default: "true", description: "Enables or disables the ability for players to spend marks to insta-cooldown Waystones." },
            { name: "OverrideWaystoneCooldown", type: "number", default: "-1", description: "Overrides the cooldown timer for Waystones in seconds. -1 will use the default cooldown timer." }
        ],
        "Chat & Communication": [
            { name: "bServerAllowChat", type: "boolean", default: "true", description: "Enables or disables text chat for the entire server." },
            { name: "bServerGlobalChat", type: "boolean", default: "true", description: "Enables or disables the global chat channel on the server." },
            { name: "bServerChatWhispers", type: "boolean", default: "true", description: "Needs Description & Testing" }
        ],
        "Fishing": [
            { name: "bServerFish", type: "boolean", default: "true", description: "Enables or disables fish spawning." }
        ],
        "Map & Navigation": [
            { name: "bServerAllowMap", type: "boolean", default: "true", description: "Enables or disables the full map for the entire server. Defaults to true." },
            { name: "bServerAllowMinimap", type: "boolean", default: "true", description: "Enables or disables the minimap for the entire server. Defaults to true." },
            { name: "bServerAllow3DMapMarkers", type: "boolean", default: "true", description: "Enables or disables the markers on the full map, and floating quest markers in the world. Defaults to true." },
            { name: "bServerAllowMapPOINames", type: "boolean", default: "true", description: "Needs Description & Testing" },
            { name: "bServerShowMapIconPopularLocation", type: "boolean", default: "false", description: "Enables Popular Locations, highlighting areas of the map with a high player density. Default is 10." },
            { name: "ServerMapIconPopularLocationPlayerCount", type: "number", default: "10", description: "Allows you to set the number of users required in an area before it's highlighted on the map. Defaults to 10." }
        ],
        "Whitelist & Permissions": [
            { name: "bEnforceWhitelist", type: "boolean", default: "false", description: "Enables or disables the whitelist system. If enabled, only players on the whitelist can join the server." },
            { name: "bServerPaidUsersOnly", type: "boolean", default: "false", description: "Specifies if the server allows free-to-play users to join." }
        ],
        "Growth & Survival": [
            { name: "bServerGrowth", type: "boolean", default: "true", description: "Enables/Disables Growth on your server. If disabled, all dinosaurs will spawn as Adults, and all existing characters will be bumped up to Adult." },
            { name: "MinGrowthAfterDeath", type: "number", default: "0.5", description: "The minimum growth a player can be rolled back to if they die. Defaults to 0.5" },
            { name: "GlobalPassiveGrowthPerMinute", type: "number", default: "0", description: "Adds additional passive growth per second to all dinosaurs. Remember, full growth = 1 so a good value for this might be 0.005, which means a player would take 200 minutes (3.3 hours) to reach adulthood. Growth amount currently applies equally across all dinosaurs. Setting this to 0 disables passive growth." },
            { name: "ChangeSubspeciesGrowthPenaltyPercent", type: "number", default: "25", description: "Specifies the growth penalty percent for changing subspecies. Note that bLoseGrowthPastGrowthStages=true may have to be active for anything 25 and above." },
            { name: "bLoseGrowthPastGrowthStages", type: "boolean", default: "true", description: "Allows players to lose growth past Juvenile/Adolescent/Sub-Adult/Adult growth states when they die." },
            { name: "CombatDeathGrowthPenaltyPercent", type: "number", default: "10", description: "Percent of growth a player will lose when they die from combat." },
            { name: "FallDeathGrowthPenaltyPercent", type: "number", default: "2", description: "Percent of growth a player will lose when they die from fall damage." },
            { name: "SurvivalDeathGrowthPenaltyPercent", type: "number", default: "5", description: "Percent of growth a player will lose when they die from starving/thirst/drowning." },
            { name: "HatchlingCaveExitGrowth", type: "number", default: "0.25", description: "Specifies the growth a player will have when they exit the Hatchling Caves. 0 denotes a hatchling and is the default value." },
            { name: "bUseTutorialCustomGrowthMultiplier", type: "boolean", default: "false", description: "If true, the tutorial will use the TutorialCustomGrowthMultiplier value to determine the growth rate of the player. If false, the tutorial will use the default growth rate." },
            { name: "TutorialCustomGrowthMultiplier", type: "number", default: "1.0", description: "The growth multiplier used in the tutorial if bUseTutorialCustomGrowthMultiplier is set to true." },
            { name: "bServerWellRestedBuff", type: "boolean", default: "true", description: "Enables or disables the Well Rested buff. Defaults to true." }
        ],
        "Nesting & Family System": [
            { name: "bServerNesting", type: "boolean", default: "true", description: "If true, nesting will be enabled on the server." },
            { name: "bServerNestingDecorations", type: "boolean", default: "true", description: "Needs Description & Testing" },
            { name: "bNestingDecorations", type: "boolean", default: "true", description: "If true, decorations can be placed around nests." },
            { name: "bServerHatchlingCaveEggs", type: "boolean", default: "true", description: "If true, eggs will be placed in the Hatchling Caves." },
            { name: "bServerSameSpeciesAdoptionRestriction", type: "boolean", default: "false", description: "If true, only the same species can be adopted. Otherwise, only the same diet type can be adopted." },
            { name: "MinNestingGrowth", type: "number", default: "0.75", description: "The minimum growth a player must be in order to place a nest." },
            { name: "MaxNestImmunityBuffGrowth", type: "number", default: "0.25", description: "The maximum growth a hatchling will become immune to all damage for a short time after spawning at their parent's nest. Set this to 0 to completely disable the hatchling spawn immunity." },
            { name: "MaxNestRespawnGrowth", type: "number", default: "0.5", description: "The maximum growth a hatchling will respawn at their parent's nest. Once they grow past this value, they will respawn at a random point on the map like a regular adult dinosaur." },
            { name: "MaxNestFreeRespawnGrowth", type: "number", default: "0.25", description: "The maximum growth a hatchling will respawn at their parent's nest without consuming a baby slot. Once they grow past this point, they will consume an egg slot for each respawn." },
            { name: "MinNestRespawnCondition", type: "number", default: "0.5", description: "The minimum health a nest must have for a hatchling to be able to respawn at it. If the nest is too damaged, the hatchling will not be able to respawn there and will instead spawn at a random point on the map like a regular adult dinosaur." },
            { name: "MinNestHealthForDecorations", type: "number", default: "0.5", description: "The minimum health a nest must have to place decorations around it." },
            { name: "MinNestBabySlotFoodWater", type: "number", default: "0.0", description: "The minimum food and water a nest must have inside it to begin generating baby slots. Leave this at 0 to ignore the food/water requirements." },
            { name: "MinNestBabySlotResources", type: "number", default: "0.5", description: "The minimum resource percentage in each category a nest must have to generate baby slots." },
            { name: "MinNestHealthToEditAbilities", type: "number", default: "0.75", description: "The minimum health a nest must have to be able to edit abilities while sleeping nearby it." },
            { name: "MaxAdoptionGrowth", type: "number", default: "0.5", description: "The max growth of a potential adoption candidate. If they are older than this age, they will not be adoptable." },
            { name: "MaxEatFromNestGrowth", type: "number", default: "0.5", description: "The max growth of a hatchling that can eat from a nest. If they are older than this age, they will not be able to eat from the nest." },
            { name: "MaxDependentChildGrowth", type: "number", default: "0.5", description: "The max growth a child can be to be consider a dependent of its parent. Used to determine a few things such as if a nest should use solo or dependent inactivity timers." },
            { name: "NestInactiveDespawnTimeSolo", type: "number", default: "120", description: "The amount of seconds until a nest will despawn without the owner online." },
            { name: "NestInactiveDespawnTimeDependents", type: "number", default: "120", description: "The amount of seconds until a nest will despawn, without the owner's offspring online." },
            { name: "NestDisrepairDespawnTime", type: "number", default: "7200", description: "The amount of seconds a nest with 0 health will be destroyed permanently." },
            { name: "NestLowHealthThreshold", type: "number", default: "0.2", description: "The nest health percentage when it will display a warning toast to the owner." },
            { name: "NestBabySlotGenerationTime", type: "number", default: "300", description: "The amount of seconds it will take for a baby slot to generate while all baby slot conditions are met." },
            { name: "NestInvitationExpiryTime", type: "number", default: "15", description: "The amount of seconds until a nest invitation will expire." },
            { name: "NestAcceptedInvitationExpiryTime", type: "number", default: "300", description: "The amount of seconds until an accepted nest invitation will no longer be valid to use. This will be used on the character creation screen as the player is creating their new hatchling character." },
            { name: "FamilyBuffRange", type: "number", default: "5000", description: "The distance from family members that the family buff will be applied. Set this to 0 to disable this buff." },
            { name: "NestResourceMultiplier", type: "number", default: "1.0", description: "The multiplier on the amount of resources required to construct a nest. If set to 0, nests will not require resources and can be built instantly without them." },
            { name: "NestResourcelessConstructionSpeed", type: "number", default: "5.0", description: "The amount of health contributed to a nest when NestResourceMultiplier is zero." },
            { name: "bNestsInvulnerable", type: "boolean", default: "false", description: "If true, nests cannot be destroyed by other players." },
            { name: "NestObstructionRadius", type: "number", default: "500", description: "The radius in centimeters other nests cannot be placed near an existing nest. The default is 5 meters here." },
            { name: "bSpawnParentNestOnLogin", type: "boolean", default: "false", description: "If true, the parent's nest will spawn when a child that is still young logs in. This can be useful to avoid players being orphaned if their parents log out." },
            { name: "NestTutorialGrowthRateMultiplier", type: "number", default: "10.0", description: "Needs Description & Testing" },
            { name: "MaxNestHeight", type: "number", default: "50000.0", description: "Needs Description & Testing" },
            { name: "NestSaveIntervalSeconds", type: "number", default: "900", description: "Needs Description & Testing" },
            { name: "MinimumNestDistanceFromHomeRock", type: "number", default: "5000", description: "The minimum distance a nest must be from a Home Cave. This is to prevent nests from being placed too close to the Home Cave." },
            { name: "bServerEditAbilitiesAtNest", type: "boolean", default: "true", description: "If true, players can only edit abilities at their nest or home cave (if enabled). Setting BOTH bServerEditAbilitiesInHomeCaves=false AND bServerEditAbilitiesAtNest=false will allow players to edit their abilities anywhere." },
            { name: "MinNestBuffHealthPercent", type: "number", default: "0.5", description: "The minimum health percentage a nest must have to apply the nest buff to the player." }
        ],
        "Death & Respawn": [
            { name: "bPermaDeath", type: "boolean", default: "false", description: "Activates permanent death on the server. Deceased characters will show up as corpses on the Character Selection Menu. Defaults to false. NOTE: This feature is not finished and may break character data for your server. Use at your own risk." },
            { name: "bDeathInfo", type: "boolean", default: "false", description: "Displays a textbox on the Character Select Screen that provides info about your dead character when bPermaDeath is enabled." },
            { name: "bDeathInfoKilledBy", type: "boolean", default: "false", description: "Needs Description & Testing" },
            { name: "CombatDeathMarksPenaltyPercent", type: "number", default: "25", description: "Percent of total marks a player will lose when they die from combat." },
            { name: "FallDeathMarksPenaltyPercent", type: "number", default: "5", description: "Percent of total marks a player will lose when they die from fall damage." },
            { name: "SurvivalDeathMarksPenaltyPercent", type: "number", default: "10", description: "Percent of total marks a player will lose when they die from starving/thirst/drowning." },
            { name: "RevengeKillDistance", type: "number", default: "100000", description: "(100000 = 1km) Will only work when a Database is set to remote, for hived servers. It is planned to work for all servers in the future. Specifies the radius of the Anti-Revenge Kill distance." },
            { name: "bServerAntiRevengeKill", type: "boolean", default: "true", description: "Will only work when a Database is set to remote, for hived servers. It is planned to work for all servers in the future. When set to true, when a player is killed, any of their other characters within a certain radius are flagged with a 10 minute timer, which prevents those specific characters from logging back in right away. Characters that are further away are unaffected by the login timer." }
        ],
        "Home Cave": [
            { name: "bServerHomeCaves", type: "boolean", default: "true", description: "Enables or disables home caves on your server." },
            { name: "bServerHomecaveCampingDebuff", type: "boolean", default: "true", description: "Enables or disables the Home Cave Camping debuff on your server." },
            { name: "bOverrideHomecaveCampingDistance", type: "boolean", default: "false", description: "Flags whether you want to override the Home Cave Camping debuff. If set to true you must also then specify the HomecaveCampingDistance (below). Defaults to false." },
            { name: "HomecaveCampingDistance", type: "number", default: "20000", description: "Radius (in centimeters) around Home Cave Entrances that will apply the Home Cave Camping debuff. Defaults to 20000, which is 200 meters." },
            { name: "bOverrideHomecaveCampingDelay", type: "boolean", default: "false", description: "Flags whether there is a delay between a player entering the HomecaveCampingDistance radius, and actually having the debuff applied to them. Typically this should be at least a few minutes to avoid players instantly getting debuffed when they walk near a Home Cave." },
            { name: "HomecaveCampingDelay", type: "number", default: "180", description: "Time (in seconds) the Home Cave Camping debuff will delay before being applied to a player if they are within the HomecaveCampingDistance. Defaults to 180 (3 minutes)." },
            { name: "bServerEditAbilitiesInHomeCaves", type: "boolean", default: "true", description: "If true, players can only edit abilities in their home caves. If false, players can edit their abilities anywhere. Recommended to be set to true if you also enable home caves on your server." }
        ],
        "Critters & Burrows": [
            { name: "bServerCritters", type: "boolean", default: "true", description: "Enables or disables critters spawning. Defaults to true." },
            { name: "bCritterBurrows", type: "boolean", default: "true", description: "Enables or disables critter burrows. Defaults to true." },
            { name: "ServerMaxCritters", type: "number", default: "100", description: "The maximum number of critters that can spawn at once. Defaults to 100 critters allowed at once." },
            { name: "ServerCritterDensityMultiplier", type: "number", default: "0.75", description: "The density of critters that will spawn. Represents the ratio of critters to spawn versus how many spawn groups there are. Defaults to 0.75." },
            { name: "AllowedCritters", type: "multiline", default: "", description: "Disables all critters except the listed critters. Enter one critter name per line. Each will generate as a separate AllowedCritter= line." },
            { name: "DisallowedCritters", type: "multiline", default: "", description: "Enables all critters except the listed critters. Enter one critter name per line. Each will generate as a separate DisallowedCritter= line." }
        ],
        "Player Lifecycle & Security": [
            { name: "bServerEditAbilitiesWhileSleeping", type: "boolean", default: "false", description: "If true, players can edit their abilities only while sleeping. If false, players can edit their abilities while standing. If this is set to true AND bServerEditAbilitiesInHomeCaves=true, players can edit their abilities in their home caves OR while sleeping." },
            { name: "bServerHatchlingCaves", type: "boolean", default: "true", description: "Enables/Disables the tutorial Hatchling Caves. If this is enabled, players will spawn in a tutorial area at 0 growth, and completing quests will bring them to 0.25 growth by the time they exit. If this is disabled, players will spawn in the world at 0.25 growth and completely skip the tutorial. The growth can be modified with HatchlingCaveExitGrowth." },
            { name: "bServerAllowReplayRecording", type: "boolean", default: "false", description: "Specifies if players can record a replay. Defaults to false." },
            { name: "ServerDeadBodyTime", type: "number", default: "0", description: "Specifies how long a dead body will persist for in seconds. A value of 0 means it will persist forever." },
            { name: "ServerRespawnTime", type: "number", default: "45", description: "Amount of time (in minutes) a player must be alive before they can use the /respawn command to kill their dinosaur and respawn. It's suggested to keep this number relatively high to avoid players piling up corpses on your server and causing issues. Defaults to 45 minutes." },
            { name: "ServerLogoutTime", type: "number", default: "60", description: "The amount of time required to be on the logout menu before a player safe logs. Set to 0 if you want instant logouts." },
            { name: "AFKDisconnectTime", type: "number", default: "600", description: "Specifies the amount of time in seconds before a player will be automatically disconnected from the server if they are idle/AFK. Useful to prevent idle players from filling your server. If set to 0, no players will ever be kicked for being idle." },
            { name: "SpeedhackDetection", type: "number", default: "1", description: "Setting for action taken when speed hacks are detected. 0 = none, 1 = log, 2 = kick, 3 = ban. From settings 1-3, a PlayerHack webhook will also be sent." },
            { name: "SpeedhackThreshold", type: "number", default: "10", description: "The amount of speedhack detections that will be allowed per minute before the SpeedhackDetection action is taken. A value of 0 will disable detection. This value helps to minimize false positives due to packet loss or lag." }
        ],
        "Character Management": [
            { name: "MaxCharactersPerPlayer", type: "number", default: "30", description: "Specifies the maximum number of characters a user can have in total. Alderon currently has it capped at 50." },
            { name: "MaxCharactersPerSpecies", type: "number", default: "1", description: "Specified the maximum number of characters a user can have per species." },
            { name: "MaxClientPingMs", type: "number", default: "0", description: "Specifies the maximum ms ping before auto-disconnecting the player. 0 will disable this option. Use to prevent high-ping players causing issues for your server." },
            { name: "MaxClientPingDuration", type: "number", default: "0", description: "Specifies the duration of time in seconds the player's ms ping must be above the MaxClientPingMs before being disconnected." },
            { name: "bServerCombatTimerAppliesToGroup", type: "boolean", default: "true", description: "Specifies whether players that are grouped up all share the same combat timer. If set to false, players will only receive the combat timer if they personally attack/are attacked. Defaults to true." },
            { name: "bServerAllowChangeSubspecies", type: "boolean", default: "true", description: "Allows players to change their subspecies. Defaults to true." }
        ],
        "Weather System": [
            { name: "bOverrideWeather", type: "boolean", default: "false", description: "Please see Weather Control documentation" },
            { name: "bRandomizeOverrideWeather", type: "boolean", default: "true", description: "Please see Weather Control documentation" }
        ],
        "Curve Overrides": []
    },
    IGameMode: {
        "Game Mode Settings": [
            { name: "DefaultCreatorModeSave", type: "text", default: "", description: "Specifies the default creator mode save file to load when the server starts. This is the name used to save the creator mode file. If the file does not exist, it will not load. (Currently has some limitations with loading saved modded items)" },
            { name: "ServerStartingTime", type: "number", default: "1380", description: "Specifies the time of day the server begins at after a restart. Time is scaled between 0-2300. Example:100 = 1:00 AM, 1200 = 12:00 PM, and 1800 = 6:00 PM signifies 12:00 PM, and 1800 denotes 6:00 PM." },
            { name: "bServerDynamicTimeOfDay", type: "number", default: "1", description: "Specifies if the server uses a fixed (0) or dynamic (1) time of day. Fixed will use the ServerStartingTime." },
            { name: "bServerRestrictCarnivoreGrouping", type: "boolean", default: "false", description: "Specifies if the server restricts carnivore grouping to the same species. (Revision 13324)" },
            { name: "bServerRestrictHerbivoreGrouping", type: "boolean", default: "false", description: "Specifies if the server restricts herbivore grouping to the same species. (Revision 16231)" },
            { name: "ServerDayLength", type: "number", default: "60", description: "This feature sets the duration (minutes) for a complete day cycle." },
            { name: "ServerNightLength", type: "number", default: "30", description: "Specified the length (in minutes) of a full night cycle. (Revision 29073)" },
            { name: "MaxGroupSize", type: "number", default: "10", description: "This feature establishes the limit for the number of slots available for player groups." },
            { name: "MaxGroupLeaderCommunicationDistance", type: "number", default: "50000", description: "Sets the distance (in meters) for players to be able to see their other group members." },
            { name: "FurthestSpawnInclusionRadius", type: "number", default: "250000", description: "Max radius for randomly picking a spawn point from the furthest spawn location from other players. Defaults to 250000 (2.5km)." }
        ]
    },
    SourceRCON: {
        "SourceRCON Settings": [
            { name: "bEnabled", type: "boolean", default: "true", description: "Enables or disables SourceRCON functionality. NOTE: GSH Customers only need bEnabled=true. When unchecked, the entire SourceRCON section will be excluded from the output." },
            { name: "bLogging", type: "boolean", default: "true", description: "Enables or disables logging for SourceRCON connections and commands." },
            { name: "Password", type: "text", default: "password", description: "The password required to connect to SourceRCON. Change this to a secure password!" },
            { name: "Port", type: "number", default: "0", description: "The port SourceRCON will listen on. 0 will use a random available port." },
            { name: "IP", type: "text", default: "0.0.0.0", description: "The IP address SourceRCON will bind to. 0.0.0.0 binds to all available interfaces." },
            { name: "MaxFailedAttempts", type: "number", default: "5", description: "Maximum number of failed authentication attempts before banning an IP." },
            { name: "Timeout", type: "number", default: "60", description: "Connection timeout in seconds." },
            { name: "PageTimeout", type: "number", default: "5", description: "Page timeout in seconds." },
            { name: "MaxConnectionsPerIP", type: "number", default: "3", description: "Maximum number of simultaneous connections allowed per IP address." }
        ]
    }
};

// Track original values
const originalValues = {};

// Initialize the form
function initializeForm() {
    const form = document.getElementById('configForm');
    form.innerHTML = '';

    // Store original values for change detection
    Object.keys(configData).forEach(sectionKey => {
        const section = configData[sectionKey];
        Object.keys(section).forEach(categoryKey => {
            const category = section[categoryKey];
            category.forEach(item => {
                originalValues[item.name] = item.default;
            });
        });
    });

    // Create sections for IGameSession
    Object.keys(configData.IGameSession).forEach(categoryName => {
        // Skip Curve Overrides as it has its own custom section
        if (categoryName === 'Curve Overrides') return;
        createCategory('IGameSession', categoryName, configData.IGameSession[categoryName]);
    });

    // Create sections for IGameMode
    Object.keys(configData.IGameMode).forEach(categoryName => {
        createCategory('IGameMode', categoryName, configData.IGameMode[categoryName]);
    });

    // Create sections for SourceRCON
    Object.keys(configData.SourceRCON).forEach(categoryName => {
        createCategory('SourceRCON', categoryName, configData.SourceRCON[categoryName]);
    });

    // Create Curve Overrides section
    createCurveOverridesSection();

    // Create tab navigation
    createTabs();
}

function createTabs() {
    const tabNavigation = document.getElementById('tabNavigation');
    const tabs = [
        { id: 'general', label: 'General', categories: ['General Server Settings'] },
        { id: 'water', label: 'Water & Environment', categories: ['Water & Environmental Systems'] },
        { id: 'quests', label: 'Quests', categories: ['Quest System Settings'] },
        { id: 'waystones', label: 'Waystones', categories: ['Waystone Settings'] },
        { id: 'chat', label: 'Chat & Map', categories: ['Chat & Communication', 'Map & Navigation'] },
        { id: 'growth', label: 'Growth & Survival', categories: ['Growth & Survival', 'Whitelist & Permissions'] },
        { id: 'nesting', label: 'Nesting', categories: ['Nesting & Family System'] },
        { id: 'death', label: 'Death & Respawn', categories: ['Death & Respawn'] },
        { id: 'caves', label: 'Home Caves', categories: ['Home Cave'] },
        { id: 'critters', label: 'Critters & Fish', categories: ['Critters & Burrows', 'Fishing'] },
        { id: 'player', label: 'Player & Security', categories: ['Player Lifecycle & Security', 'Character Management'] },
        { id: 'weather', label: 'Weather', categories: ['Weather System'] },
        { id: 'IGameMode', label: 'Game Mode', categories: ['Game Mode Settings'] },
        { id: 'SourceRCON', label: 'SourceRCON', categories: ['SourceRCON Settings'] },
        { id: 'webhooks', label: 'Webhooks', categories: ['Webhooks'] },
        { id: 'curveOverrides', label: 'Curve Overrides', categories: ['Curve Overrides'] }
    ];

    tabs.forEach((tab, index) => {
        const button = document.createElement('button');
        button.className = 'tab-button';
        button.textContent = tab.label;

        button.onclick = () => switchTab(tab.id, tab.categories);

        if (index === 0) {
            button.classList.add('active');
        }

        tabNavigation.appendChild(button);
    });

    // Show first tab by default
    switchTab('general', ['General Server Settings']);
}

function createCurveOverridesSection() {
    const form = document.getElementById('configForm');

    // Create Webhooks section
    const webhooksSection = document.createElement('div');
    webhooksSection.className = 'section';
    webhooksSection.dataset.category = 'Webhooks';
    webhooksSection.style.display = 'none';

    const webhooksHeading = document.createElement('h2');
    webhooksHeading.textContent = 'Server Webhooks';
    webhooksSection.appendChild(webhooksHeading);

    const webhooksDescription = document.createElement('div');
    webhooksDescription.className = 'description';
    webhooksDescription.textContent = 'Configure webhook URLs for server events. Leave blank to disable specific webhooks.';
    webhooksDescription.style.marginBottom = '20px';
    webhooksSection.appendChild(webhooksDescription);

    const webhooksForm = document.createElement('div');
    webhooksForm.style.background = 'rgba(0, 0, 0, 0.3)';
    webhooksForm.style.padding = '20px';
    webhooksForm.style.borderRadius = '8px';
    webhooksForm.style.marginBottom = '20px';

    // Enabled toggle
    const enabledGroup = document.createElement('div');
    enabledGroup.style.marginBottom = '20px';
    enabledGroup.style.padding = '15px';
    enabledGroup.style.background = 'rgba(0, 207, 255, 0.05)';
    enabledGroup.style.borderRadius = '6px';
    enabledGroup.style.border = '1px solid rgba(0, 207, 255, 0.2)';

    const enabledLabel = document.createElement('label');
    enabledLabel.style.display = 'flex';
    enabledLabel.style.alignItems = 'center';
    enabledLabel.style.gap = '10px';
    enabledLabel.style.cursor = 'pointer';

    const enabledCheckbox = document.createElement('input');
    enabledCheckbox.type = 'checkbox';
    enabledCheckbox.id = 'webhookEnabled';
    enabledCheckbox.style.width = '20px';
    enabledCheckbox.style.height = '20px';
    enabledCheckbox.style.cursor = 'pointer';

    const enabledText = document.createElement('span');
    enabledText.textContent = 'Enable Webhooks';
    enabledText.style.color = '#e0e0e0';
    enabledText.style.fontWeight = 'bold';

    enabledLabel.appendChild(enabledCheckbox);
    enabledLabel.appendChild(enabledText);
    enabledGroup.appendChild(enabledLabel);
    webhooksForm.appendChild(enabledGroup);

    // Format selection
    const formatGroup = document.createElement('div');
    formatGroup.style.marginBottom = '20px';

    const formatLabel = document.createElement('label');
    formatLabel.textContent = 'Webhook Format';
    formatLabel.style.display = 'block';
    formatLabel.style.marginBottom = '8px';
    formatLabel.style.color = '#00CFFF';
    formatLabel.style.fontWeight = 'bold';
    formatGroup.appendChild(formatLabel);

    const formatDesc = document.createElement('div');
    formatDesc.textContent = 'Select General or Discord format for webhook payloads';
    formatDesc.style.fontSize = '0.85em';
    formatDesc.style.color = '#999';
    formatDesc.style.marginBottom = '8px';
    formatGroup.appendChild(formatDesc);

    const formatSelect = document.createElement('select');
    formatSelect.id = 'webhookFormat';
    formatSelect.style.width = '100%';
    formatSelect.style.padding = '10px';
    formatSelect.style.background = '#252525';
    formatSelect.style.border = '1px solid #333';
    formatSelect.style.color = '#e0e0e0';
    formatSelect.style.borderRadius = '6px';

    const generalOption = document.createElement('option');
    generalOption.value = 'General';
    generalOption.textContent = 'General';
    formatSelect.appendChild(generalOption);

    const discordOption = document.createElement('option');
    discordOption.value = 'Discord';
    discordOption.textContent = 'Discord';
    formatSelect.appendChild(discordOption);

    formatGroup.appendChild(formatSelect);
    webhooksForm.appendChild(formatGroup);

    // Webhook URL fields - complete list
    const webhookFields = [
        { id: 'PlayerReport', label: 'Player Report', description: 'Triggered when a player reports another player' },
        { id: 'PlayerChat', label: 'Player Chat', description: 'Triggered when a player sends a chat message' },
        { id: 'PlayerDamagedPlayer', label: 'Player Damaged Player', description: 'Triggered when a player damages another player' },
        { id: 'PlayerHack', label: 'Player Hack', description: 'Triggered when a potential hack is detected' },
        { id: 'PlayerJoinedGroup', label: 'Player Joined Group', description: 'Triggered when a player joins a group' },
        { id: 'PlayerLeftGroup', label: 'Player Left Group', description: 'Triggered when a player leaves a group' },
        { id: 'PlayerLogin', label: 'Player Login', description: 'Triggered when a player logs in' },
        { id: 'PlayerLogout', label: 'Player Logout', description: 'Triggered when a player logs out' },
        { id: 'PlayerLeave', label: 'Player Leave', description: 'Triggered when a player leaves the server' },
        { id: 'PlayerKilled', label: 'Player Killed', description: 'Triggered when a player is killed' },
        { id: 'PlayerQuestComplete', label: 'Player Quest Complete', description: 'Triggered when a player completes a quest' },
        { id: 'PlayerQuestFailed', label: 'Player Quest Failed', description: 'Triggered when a player fails a quest' },
        { id: 'PlayerRespawn', label: 'Player Respawn', description: 'Triggered when a player respawns' },
        { id: 'PlayerWaystone', label: 'Player Waystone', description: 'Triggered when a player uses a waystone' },
        { id: 'PlayerProfanity', label: 'Player Profanity', description: 'Triggered when profanity is detected' },
        { id: 'ServerRestart', label: 'Server Restart', description: 'Triggered when the server restarts' },
        { id: 'ServerRestartCountdown', label: 'Server Restart Countdown', description: 'Triggered during server restart countdown' },
        { id: 'ServerModerate', label: 'Server Moderate', description: 'Triggered for server moderation events' },
        { id: 'AdminCommand', label: 'Admin Command', description: 'Triggered when an admin command is executed' },
        { id: 'AdminSpectate', label: 'Admin Spectate', description: 'Triggered when an admin spectates a player' },
        { id: 'BadAverageTick', label: 'Bad Average Tick', description: 'Triggered when server tick rate is poor' },
        { id: 'ServerError', label: 'Server Error', description: 'Triggered when a server error occurs' },
        { id: 'PlayerPurchase', label: 'Player Purchase', description: 'Triggered when a player makes a purchase' },
        { id: 'CreateNest', label: 'Create Nest', description: 'Triggered when a nest is created' },
        { id: 'DestroyNest', label: 'Destroy Nest', description: 'Triggered when a nest is destroyed' },
        { id: 'NestInvite', label: 'Nest Invite', description: 'Triggered when a player is invited to a nest' },
        { id: 'PlayerJoinNest', label: 'Player Join Nest', description: 'Triggered when a player joins a nest' },
        { id: 'UpdateNest', label: 'Update Nest', description: 'Triggered when a nest is updated' },
        { id: 'ServerStart', label: 'Server Start', description: 'Triggered when the server starts' }
    ];

    webhookFields.forEach(field => {
        const fieldGroup = document.createElement('div');
        fieldGroup.style.marginBottom = '20px';

        const fieldLabel = document.createElement('label');
        fieldLabel.textContent = field.label;
        fieldLabel.style.display = 'block';
        fieldLabel.style.marginBottom = '5px';
        fieldLabel.style.color = '#00CFFF';
        fieldLabel.style.fontWeight = 'bold';
        fieldGroup.appendChild(fieldLabel);

        const fieldDesc = document.createElement('div');
        fieldDesc.textContent = field.description;
        fieldDesc.style.fontSize = '0.85em';
        fieldDesc.style.color = '#999';
        fieldDesc.style.marginBottom = '8px';
        fieldGroup.appendChild(fieldDesc);

        const fieldInput = document.createElement('input');
        fieldInput.type = 'url';
        fieldInput.id = `webhook${field.id}`;
        fieldInput.placeholder = `https://webhook.example.com/${field.id.toLowerCase()}/...`;
        fieldInput.style.width = '100%';
        fieldInput.style.padding = '10px';
        fieldInput.style.background = '#252525';
        fieldInput.style.border = '1px solid #333';
        fieldInput.style.color = '#e0e0e0';
        fieldInput.style.borderRadius = '6px';
        fieldInput.style.fontFamily = "'Courier New', monospace";
        fieldInput.style.fontSize = '0.9em';
        fieldInput.addEventListener('input', generateConfig);
        fieldGroup.appendChild(fieldInput);

        webhooksForm.appendChild(fieldGroup);
    });

    webhooksSection.appendChild(webhooksForm);
    form.appendChild(webhooksSection);

    // Add event listeners for webhook controls
    enabledCheckbox.addEventListener('change', generateConfig);
    formatSelect.addEventListener('change', generateConfig);

    const section = document.createElement('div');
    section.className = 'section';
    section.dataset.category = 'Curve Overrides';
    section.style.display = 'none';

    const heading = document.createElement('h2');
    heading.textContent = 'Curve Overrides';
    section.appendChild(heading);

    const description = document.createElement('div');
    description.className = 'description';
    description.textContent = 'Browse and add curve overrides from the database to modify creature stats and behaviors.';
    description.style.marginBottom = '20px';
    section.appendChild(description);

    // Category selection
    const categoryForm = document.createElement('div');
    categoryForm.style.background = 'rgba(0, 0, 0, 0.3)';
    categoryForm.style.padding = '20px';
    categoryForm.style.borderRadius = '8px';
    categoryForm.style.marginBottom = '20px';

    const categoryLabel = document.createElement('label');
    categoryLabel.textContent = 'Select Category';
    categoryLabel.style.display = 'block';
    categoryLabel.style.marginBottom = '8px';
    categoryLabel.style.color = '#e0e0e0';
    categoryForm.appendChild(categoryLabel);

    const categorySelect = document.createElement('select');
    categorySelect.id = 'curveOverrideCategory';
    categorySelect.style.width = '100%';
    categorySelect.style.padding = '10px';
    categorySelect.style.marginBottom = '15px';
    categorySelect.style.background = '#252525';
    categorySelect.style.border = '1px solid #333';
    categorySelect.style.color = '#e0e0e0';
    categorySelect.style.borderRadius = '6px';

    const defaultCategoryOption = document.createElement('option');
    defaultCategoryOption.value = '';
    defaultCategoryOption.textContent = 'Loading categories...';
    categorySelect.appendChild(defaultCategoryOption);
    categoryForm.appendChild(categorySelect);

    // Author selection (only for Mod category)
    const authorLabel = document.createElement('label');
    authorLabel.textContent = 'Select Author';
    authorLabel.id = 'curveOverrideAuthorLabel';
    authorLabel.style.display = 'none';
    authorLabel.style.marginBottom = '8px';
    authorLabel.style.color = '#e0e0e0';
    categoryForm.appendChild(authorLabel);

    const authorSelect = document.createElement('select');
    authorSelect.id = 'curveOverrideAuthor';
    authorSelect.style.width = '100%';
    authorSelect.style.padding = '10px';
    authorSelect.style.marginBottom = '15px';
    authorSelect.style.background = '#252525';
    authorSelect.style.border = '1px solid #333';
    authorSelect.style.color = '#e0e0e0';
    authorSelect.style.borderRadius = '6px';
    authorSelect.style.display = 'none';
    authorSelect.disabled = true;

    const defaultAuthorOption = document.createElement('option');
    defaultAuthorOption.value = '';
    defaultAuthorOption.textContent = 'Select an author...';
    authorSelect.appendChild(defaultAuthorOption);
    categoryForm.appendChild(authorSelect);

    // Creature selection
    const creatureLabel = document.createElement('label');
    creatureLabel.textContent = 'Select Creature';
    creatureLabel.style.display = 'block';
    creatureLabel.style.marginBottom = '8px';
    creatureLabel.style.color = '#e0e0e0';
    categoryForm.appendChild(creatureLabel);

    const creatureSelect = document.createElement('select');
    creatureSelect.id = 'curveOverrideCreature';
    creatureSelect.style.width = '100%';
    creatureSelect.style.padding = '10px';
    creatureSelect.style.marginBottom = '15px';
    creatureSelect.style.background = '#252525';
    creatureSelect.style.border = '1px solid #333';
    creatureSelect.style.color = '#e0e0e0';
    creatureSelect.style.borderRadius = '6px';
    creatureSelect.disabled = true;

    const defaultCreatureOption = document.createElement('option');
    defaultCreatureOption.value = '';
    defaultCreatureOption.textContent = 'Select a category first...';
    creatureSelect.appendChild(defaultCreatureOption);
    categoryForm.appendChild(creatureSelect);

    // Section selection
    const sectionLabel = document.createElement('label');
    sectionLabel.textContent = 'Select Section';
    sectionLabel.style.display = 'block';
    sectionLabel.style.marginBottom = '8px';
    sectionLabel.style.color = '#e0e0e0';
    categoryForm.appendChild(sectionLabel);

    const sectionSelect = document.createElement('select');
    sectionSelect.id = 'curveOverrideSection';
    sectionSelect.style.width = '100%';
    sectionSelect.style.padding = '10px';
    sectionSelect.style.marginBottom = '15px';
    sectionSelect.style.background = '#252525';
    sectionSelect.style.border = '1px solid #333';
    sectionSelect.style.color = '#e0e0e0';
    sectionSelect.style.borderRadius = '6px';
    sectionSelect.disabled = true;

    const defaultSectionOption = document.createElement('option');
    defaultSectionOption.value = '';
    defaultSectionOption.textContent = 'Select a creature first...';
    sectionSelect.appendChild(defaultSectionOption);
    categoryForm.appendChild(sectionSelect);

    // Curve selection
    const curveLabel = document.createElement('label');
    curveLabel.textContent = 'Select Curve';
    curveLabel.style.display = 'block';
    curveLabel.style.marginBottom = '8px';
    curveLabel.style.color = '#e0e0e0';
    categoryForm.appendChild(curveLabel);

    const curveSelect = document.createElement('select');
    curveSelect.id = 'curveOverrideCurve';
    curveSelect.style.width = '100%';
    curveSelect.style.padding = '10px';
    curveSelect.style.marginBottom = '15px';
    curveSelect.style.background = '#252525';
    curveSelect.style.border = '1px solid #333';
    curveSelect.style.color = '#e0e0e0';
    curveSelect.style.borderRadius = '6px';
    curveSelect.disabled = true;

    const defaultCurveOption = document.createElement('option');
    defaultCurveOption.value = '';
    defaultCurveOption.textContent = 'Select a section first...';
    curveSelect.appendChild(defaultCurveOption);
    categoryForm.appendChild(curveSelect);

    // Value display and edit
    const valuesContainer = document.createElement('div');
    valuesContainer.id = 'curveValuesContainer';
    valuesContainer.style.marginBottom = '15px';
    valuesContainer.style.display = 'none';
    categoryForm.appendChild(valuesContainer);

    // Add button
    const addButton = document.createElement('button');
    addButton.id = 'addCurveOverrideBtn';
    addButton.textContent = 'Add to Configuration';
    addButton.style.padding = '10px 20px';
    addButton.style.background = '#4CAF50';
    addButton.style.color = 'white';
    addButton.style.border = 'none';
    addButton.style.borderRadius = '6px';
    addButton.style.cursor = 'pointer';
    addButton.disabled = true;
    addButton.onclick = addCurveOverrideFromAPI;
    categoryForm.appendChild(addButton);

    section.appendChild(categoryForm);

    // Container for added curve overrides
    const overridesContainer = document.createElement('div');
    overridesContainer.id = 'curveOverridesList';
    section.appendChild(overridesContainer);

    form.appendChild(section);

    // Load categories and set up event listeners
    loadCurveOverrideCategories();
    setupCurveOverrideListeners();
}

// Store loaded curve override data
let curveOverrideData = [];
let selectedCurveData = null;

// Load categories from API
async function loadCurveOverrideCategories() {
    try {
        const response = await fetch('/api/v1/co');
        const data = await response.json();

        const categorySelect = document.getElementById('curveOverrideCategory');
        categorySelect.innerHTML = '';

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a category...';
        categorySelect.appendChild(defaultOption);

        if (data.categories && Array.isArray(data.categories)) {
            data.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading curve override categories:', error);
        alert('Failed to load categories. Please try again later.');
    }
}

// Set up event listeners for curve override dropdowns
function setupCurveOverrideListeners() {
    const categorySelect = document.getElementById('curveOverrideCategory');
    const authorLabel = document.getElementById('curveOverrideAuthorLabel');
    const authorSelect = document.getElementById('curveOverrideAuthor');
    const creatureSelect = document.getElementById('curveOverrideCreature');
    const sectionSelect = document.getElementById('curveOverrideSection');
    const curveSelect = document.getElementById('curveOverrideCurve');

    categorySelect.addEventListener('change', async function() {
        const category = this.value;

        // Reset dependent dropdowns and clear author selection
        window.selectedAuthor = null;
        authorLabel.style.display = 'none';
        authorSelect.style.display = 'none';
        const defaultAuthorOpt = document.createElement('option');
        defaultAuthorOpt.value = '';
        defaultAuthorOpt.textContent = 'Select an author...';
        authorSelect.innerHTML = '';
        authorSelect.appendChild(defaultAuthorOpt);
        authorSelect.disabled = true;

        creatureSelect.innerHTML = '<option value="">Loading creatures...</option>';
        creatureSelect.disabled = true;
        sectionSelect.innerHTML = '<option value="">Select a creature first...</option>';
        sectionSelect.disabled = true;
        curveSelect.innerHTML = '<option value="">Select a section first...</option>';
        curveSelect.disabled = true;
        document.getElementById('curveValuesContainer').style.display = 'none';
        document.getElementById('addCurveOverrideBtn').disabled = true;

        if (!category) {
            creatureSelect.innerHTML = '<option value="">Select a category first...</option>';
            return;
        }

        try {
            const categoryLower = category.toLowerCase();
            const response = await fetch(`/api/v1/co/${categoryLower}`);
            const data = await response.json();

            // Store category for later use (lowercase for API calls)
            window.selectedCategory = categoryLower;

            // If category is "Mod", show author dropdown
            if (category.toLowerCase() === 'mod' && data.creators) {
                authorLabel.style.display = 'block';
                authorSelect.style.display = 'block';
                authorSelect.disabled = false;

                data.creators.forEach(creator => {
                    const option = document.createElement('option');
                    option.value = creator.name;
                    option.textContent = creator.name;
                    authorSelect.appendChild(option);
                });

                creatureSelect.innerHTML = '<option value="">Select an author first...</option>';
            } else {
                // For non-Mod categories, load creatures directly
                window.creaturesData = data.creatures || [];

                creatureSelect.innerHTML = '';
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Select a creature...';
                creatureSelect.appendChild(defaultOption);

                window.creaturesData.forEach(creature => {
                    const option = document.createElement('option');
                    option.value = creature.name;
                    option.textContent = creature.name;
                    option.dataset.creatureData = JSON.stringify(creature);
                    creatureSelect.appendChild(option);
                });

                creatureSelect.disabled = false;
            }
        } catch (error) {
            console.error('Error loading creatures:', error);
            alert('Failed to load creatures. Please try again.');
            creatureSelect.innerHTML = '<option value="">Error loading creatures</option>';
        }
    });

    // Author selection handler (for Mod category)
    authorSelect.addEventListener('change', async function() {
        const author = this.value;

        // Reset dependent dropdowns
        creatureSelect.innerHTML = '<option value="">Loading creatures...</option>';
        creatureSelect.disabled = true;
        sectionSelect.innerHTML = '<option value="">Select a creature first...</option>';
        sectionSelect.disabled = true;
        curveSelect.innerHTML = '<option value="">Select a section first...</option>';
        curveSelect.disabled = true;
        document.getElementById('curveValuesContainer').style.display = 'none';
        document.getElementById('addCurveOverrideBtn').disabled = true;

        if (!author) {
            creatureSelect.innerHTML = '<option value="">Select an author first...</option>';
            return;
        }

        try {
            // Fetch creatures for the selected author
            const response = await fetch(`/api/v1/co/${window.selectedCategory}/${author}`);
            const data = await response.json();

            window.creaturesData = data.creatures || [];
            window.selectedAuthor = author;

            creatureSelect.innerHTML = '';
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select a creature...';
            creatureSelect.appendChild(defaultOption);

            window.creaturesData.forEach(creature => {
                const option = document.createElement('option');
                option.value = creature.name;
                option.textContent = creature.name;
                option.dataset.creatureData = JSON.stringify(creature);
                creatureSelect.appendChild(option);
            });

            creatureSelect.disabled = false;
        } catch (error) {
            console.error('Error loading creatures for author:', error);
            alert('Failed to load creatures. Please try again.');
            creatureSelect.innerHTML = '<option value="">Error loading creatures</option>';
        }
    });

    creatureSelect.addEventListener('change', function() {
        const creature = this.value;
        const selectedOption = this.options[this.selectedIndex];

        // Reset dependent dropdowns
        sectionSelect.innerHTML = '<option value="">Select a section...</option>';
        sectionSelect.disabled = true;
        curveSelect.innerHTML = '<option value="">Select a section first...</option>';
        curveSelect.disabled = true;
        document.getElementById('curveValuesContainer').style.display = 'none';
        document.getElementById('addCurveOverrideBtn').disabled = true;

        if (!creature || !selectedOption.dataset.creatureData) {
            sectionSelect.innerHTML = '<option value="">Select a creature first...</option>';
            return;
        }

        const creatureData = JSON.parse(selectedOption.dataset.creatureData);
        window.selectedCreature = creature;

        sectionSelect.innerHTML = '';
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select a section...';
        sectionSelect.appendChild(defaultOption);

        creatureData.sections.forEach(section => {
            // Skip "Multiplier" section if category is "Critters"
            if (window.selectedCategory === 'critters' && section === 'Multiplier') {
                return;
            }

            const option = document.createElement('option');
            option.value = section;
            option.textContent = section;
            sectionSelect.appendChild(option);
        });

        sectionSelect.disabled = false;
    });

    sectionSelect.addEventListener('change', async function() {
        const section = this.value;

        // Reset dependent dropdown
        curveSelect.innerHTML = '<option value="">Loading curves...</option>';
        curveSelect.disabled = true;
        document.getElementById('curveValuesContainer').style.display = 'none';
        document.getElementById('addCurveOverrideBtn').disabled = true;

        if (!section) {
            curveSelect.innerHTML = '<option value="">Select a section first...</option>';
            return;
        }

        try {
            // Fetch all curves for the selected category/creature
            // For Mod category, include author in the path
            let apiPath = `/api/v1/co/${window.selectedCategory}`;
            if (window.selectedAuthor) {
                apiPath += `/${window.selectedAuthor}`;
            }
            apiPath += `/${window.selectedCreature}`;

            const response = await fetch(apiPath);
            const data = await response.json();

            // Get curves for the selected section
            const sectionData = data.sections[section];
            if (!sectionData) {
                curveSelect.innerHTML = '<option value="">No curves found</option>';
                return;
            }

            // Convert section data to array of curve objects
            curveOverrideData = Object.entries(sectionData).map(([curveName, values]) => ({
                curveName: curveName,
                creature: data.name,
                category: data.category,
                section: section,
                keys: values.map((value, index) => ({
                    time: [0.0, 0.25, 0.5, 0.75, 1.0][index],
                    value: value
                })),
                curvePath: `/Game/Dinosaurs/${data.name}.${curveName}`
            }));

            curveSelect.innerHTML = '';
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select a curve...';
            curveSelect.appendChild(defaultOption);

            curveOverrideData.forEach((curveData, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = curveData.curveName;
                option.dataset.curveData = JSON.stringify(curveData);
                curveSelect.appendChild(option);
            });

            curveSelect.disabled = false;
        } catch (error) {
            console.error('Error loading curves:', error);
            alert('Failed to load curves. Please try again.');
            curveSelect.innerHTML = '<option value="">Error loading curves</option>';
        }
    });

    curveSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];

        if (!selectedOption.dataset.curveData) {
            document.getElementById('curveValuesContainer').style.display = 'none';
            document.getElementById('addCurveOverrideBtn').disabled = true;
            return;
        }

        selectedCurveData = JSON.parse(selectedOption.dataset.curveData);
        displayCurveValues(selectedCurveData);
        document.getElementById('addCurveOverrideBtn').disabled = false;
    });
}

// Display curve values
function displayCurveValues(curveData) {
    const container = document.getElementById('curveValuesContainer');
    container.innerHTML = '';
    container.style.display = 'block';

    const label = document.createElement('label');
    label.textContent = 'Curve Values';
    label.style.display = 'block';
    label.style.marginBottom = '8px';
    label.style.color = '#e0e0e0';
    container.appendChild(label);

    const valuesGrid = document.createElement('div');
    valuesGrid.style.display = 'grid';
    valuesGrid.style.gridTemplateColumns = 'repeat(5, 1fr)';
    valuesGrid.style.gap = '10px';

    const timeValues = ['0.0', '0.25', '0.5', '0.75', '1.0'];

    curveData.keys.forEach((key, index) => {
        const valueInput = document.createElement('input');
        valueInput.type = 'number';
        valueInput.step = '0.00001';
        valueInput.id = `curveEditValue${index}`;
        valueInput.value = key.value;
        valueInput.placeholder = `Time ${timeValues[index]}`;
        valueInput.style.padding = '10px';
        valueInput.style.background = '#252525';
        valueInput.style.border = '1px solid #333';
        valueInput.style.color = '#e0e0e0';
        valueInput.style.borderRadius = '6px';
        valueInput.style.MozAppearance = 'textfield'; // Firefox
        valueInput.style.appearance = 'textfield';
        valuesGrid.appendChild(valueInput);
    });

    container.appendChild(valuesGrid);
}

// Add curve override from API
function addCurveOverrideFromAPI() {
    if (!selectedCurveData) {
        alert('Please select a curve first');
        return;
    }

    const values = [];
    for (let i = 0; i < 5; i++) {
        const input = document.getElementById(`curveEditValue${i}`);
        if (input) {
            values.push(parseFloat(input.value));
        }
    }

    const override = {
        dinosaur: selectedCurveData.creature,
        curve: selectedCurveData.curveName,
        curvePath: selectedCurveData.curvePath,
        values: values
    };

    curveOverrides.push(override);
    renderCurveOverrides();
    generateConfig();

    // Show success message
    alert(`Added ${selectedCurveData.creature} - ${selectedCurveData.curveName} to configuration!`);
}

function removeCurveOverride(index) {
    const override = curveOverrides[index];
    const confirmMessage = `Are you sure you want to remove this curve override?\n\n${override.dinosaur}.${override.curve}`;

    if (confirm(confirmMessage)) {
        curveOverrides.splice(index, 1);
        renderCurveOverrides();
        generateConfig();
    }
}

function editCurveOverride(index) {
    // Hide the values display and show the edit form
    const valuesDisplay = document.getElementById(`curveValues_${index}`);
    const editForm = document.getElementById(`editForm_${index}`);

    if (valuesDisplay && editForm) {
        valuesDisplay.style.display = 'none';
        editForm.style.display = 'block';
    }
}

function saveCurveOverride(index) {
    // Get the new values from the input fields
    const newValues = [];
    for (let i = 0; i < 5; i++) {
        const input = document.getElementById(`editValue_${index}_${i}`);
        if (input) {
            newValues.push(parseFloat(input.value));
        }
    }

    // Update the curve override
    if (curveOverrides[index]) {
        curveOverrides[index].values = newValues;
        renderCurveOverrides();
        generateConfig();
    }
}

function cancelEditCurveOverride(index) {
    // Hide the edit form and show the values display
    const valuesDisplay = document.getElementById(`curveValues_${index}`);
    const editForm = document.getElementById(`editForm_${index}`);

    if (valuesDisplay && editForm) {
        editForm.style.display = 'none';
        valuesDisplay.style.display = 'block';
    }
}

function renderCurveOverrides() {
    const container = document.getElementById('curveOverridesList');
    container.innerHTML = '';

    if (curveOverrides.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.textContent = 'No curve overrides added yet.';
        emptyMessage.style.color = '#999';
        emptyMessage.style.fontStyle = 'italic';
        emptyMessage.style.padding = '20px';
        container.appendChild(emptyMessage);
        return;
    }

    // Group overrides by dinosaur/critter
    const groupedOverrides = {};
    curveOverrides.forEach((override, index) => {
        if (!groupedOverrides[override.dinosaur]) {
            groupedOverrides[override.dinosaur] = [];
        }
        groupedOverrides[override.dinosaur].push({ ...override, originalIndex: index });
    });

    // Sort dinosaur names alphabetically
    const sortedDinosaurs = Object.keys(groupedOverrides).sort();

    // Create collapsible sections for each dinosaur
    sortedDinosaurs.forEach(dinosaur => {
        const dinoSection = document.createElement('div');
        dinoSection.style.marginBottom = '15px';
        dinoSection.style.background = 'rgba(0, 0, 0, 0.3)';
        dinoSection.style.borderRadius = '8px';
        dinoSection.style.overflow = 'hidden';
        dinoSection.style.border = '1px solid #333';

        // Header
        const header = document.createElement('div');
        header.style.padding = '12px 15px';
        header.style.background = 'rgba(0, 207, 255, 0.1)';
        header.style.cursor = 'pointer';
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.transition = 'background 0.2s';

        header.onmouseenter = () => header.style.background = 'rgba(0, 207, 255, 0.2)';
        header.onmouseleave = () => header.style.background = 'rgba(0, 207, 255, 0.1)';

        const headerLeft = document.createElement('div');
        headerLeft.style.display = 'flex';
        headerLeft.style.alignItems = 'center';
        headerLeft.style.gap = '10px';

        const chevron = document.createElement('i');
        chevron.className = 'fas fa-chevron-down';
        chevron.style.color = '#00CFFF';
        chevron.style.transition = 'transform 0.3s';
        headerLeft.appendChild(chevron);

        const headerTitle = document.createElement('strong');
        headerTitle.textContent = dinosaur;
        headerTitle.style.color = '#00CFFF';
        headerLeft.appendChild(headerTitle);

        const count = document.createElement('span');
        count.textContent = `(${groupedOverrides[dinosaur].length} curves)`;
        count.style.color = '#999';
        count.style.fontSize = '0.9em';
        count.style.marginLeft = '10px';
        headerLeft.appendChild(count);

        header.appendChild(headerLeft);

        // Content (collapsible)
        const content = document.createElement('div');
        content.style.maxHeight = '0';
        content.style.overflow = 'hidden';
        content.style.transition = 'max-height 0.3s ease';

        const contentInner = document.createElement('div');
        contentInner.style.padding = '10px 15px';

        // Group curves by category (Combat, Core, Multipliers)
        const categorizedCurves = { Combat: [], Core: [], Multipliers: [] };
        groupedOverrides[dinosaur].forEach(override => {
            // Determine category based on curve name pattern
            const curveParts = override.curve.split('.');
            const firstPart = curveParts[0]?.toLowerCase() || '';

            let category = 'Core'; // Default
            if (firstPart === 'multiplier' || override.curve.toLowerCase().includes('multiplier')) {
                category = 'Multipliers';
            } else if (firstPart === 'combat' || override.curve.toLowerCase().includes('combat') ||
                       override.curve.toLowerCase().includes('damage') || override.curve.toLowerCase().includes('attack')) {
                category = 'Combat';
            }

            categorizedCurves[category].push(override);
        });

        // Order: Combat, Core, Multipliers
        const sortedCategories = ['Combat', 'Core', 'Multipliers'].filter(cat => categorizedCurves[cat].length > 0);

        sortedCategories.forEach(category => {
            // Category sub-header (collapsible)
            const categorySection = document.createElement('div');
            categorySection.style.marginTop = '10px';
            categorySection.style.marginBottom = '5px';

            const categoryHeader = document.createElement('div');
            categoryHeader.style.padding = '8px 10px';
            categoryHeader.style.background = 'rgba(0, 207, 255, 0.05)';
            categoryHeader.style.borderRadius = '4px';
            categoryHeader.style.borderLeft = '3px solid #00CFFF';
            categoryHeader.style.cursor = 'pointer';
            categoryHeader.style.display = 'flex';
            categoryHeader.style.alignItems = 'center';
            categoryHeader.style.gap = '8px';
            categoryHeader.style.transition = 'background 0.2s';

            categoryHeader.onmouseenter = () => categoryHeader.style.background = 'rgba(0, 207, 255, 0.1)';
            categoryHeader.onmouseleave = () => categoryHeader.style.background = 'rgba(0, 207, 255, 0.05)';

            const categoryChevron = document.createElement('i');
            categoryChevron.className = 'fas fa-chevron-right';
            categoryChevron.style.color = '#00CFFF';
            categoryChevron.style.fontSize = '0.8em';
            categoryChevron.style.transition = 'transform 0.3s';

            const categoryTitle = document.createElement('strong');
            categoryTitle.textContent = `${category} (${categorizedCurves[category].length})`;
            categoryTitle.style.color = '#00CFFF';
            categoryTitle.style.fontSize = '0.9em';

            categoryHeader.appendChild(categoryChevron);
            categoryHeader.appendChild(categoryTitle);
            categorySection.appendChild(categoryHeader);

            // Category content (collapsible)
            const categoryContent = document.createElement('div');
            categoryContent.style.maxHeight = '0';
            categoryContent.style.overflow = 'hidden';
            categoryContent.style.transition = 'max-height 0.3s ease';

            const categoryContentInner = document.createElement('div');
            categoryContentInner.style.paddingTop = '5px';

            // Curves in this category
            categorizedCurves[category].forEach(override => {
                const overrideItem = document.createElement('div');
                overrideItem.style.marginBottom = '10px';
                overrideItem.style.marginLeft = '10px';
                overrideItem.style.padding = '10px';
                overrideItem.style.background = 'rgba(0, 0, 0, 0.2)';
                overrideItem.style.borderRadius = '6px';
                overrideItem.style.border = '1px solid #444';

                const curveHeader = document.createElement('div');
                curveHeader.style.display = 'flex';
                curveHeader.style.justifyContent = 'space-between';
                curveHeader.style.alignItems = 'center';
                curveHeader.style.marginBottom = '8px';

                const curveName = document.createElement('div');
                // Show only the part after the category
                const curveNameParts = override.curve.split('.');
                const displayName = curveNameParts.slice(1).join('.');
                curveName.textContent = displayName || override.curve;
                curveName.style.color = '#e0e0e0';
                curveName.style.fontWeight = 'bold';
                curveHeader.appendChild(curveName);

                const buttonGroup = document.createElement('div');
                buttonGroup.style.display = 'flex';
                buttonGroup.style.gap = '8px';

                const editBtn = document.createElement('button');
                editBtn.textContent = 'Edit';
                editBtn.style.padding = '5px 12px';
                editBtn.style.background = '#2196F3';
                editBtn.style.color = 'white';
                editBtn.style.border = 'none';
                editBtn.style.borderRadius = '4px';
                editBtn.style.cursor = 'pointer';
                editBtn.style.fontSize = '0.85em';
                editBtn.onclick = () => editCurveOverride(override.originalIndex);
                buttonGroup.appendChild(editBtn);

                const removeBtn = document.createElement('button');
                removeBtn.textContent = 'Remove';
                removeBtn.style.padding = '5px 12px';
                removeBtn.style.background = '#f44336';
                removeBtn.style.color = 'white';
                removeBtn.style.border = 'none';
                removeBtn.style.borderRadius = '4px';
                removeBtn.style.cursor = 'pointer';
                removeBtn.style.fontSize = '0.85em';
                removeBtn.onclick = () => removeCurveOverride(override.originalIndex);
                buttonGroup.appendChild(removeBtn);

                curveHeader.appendChild(buttonGroup);

                overrideItem.appendChild(curveHeader);

                const valuesText = document.createElement('div');
                valuesText.id = `curveValues_${override.originalIndex}`;
                valuesText.textContent = `Values: ${override.values.join(', ')}`;
                valuesText.style.color = '#aaa';
                valuesText.style.fontFamily = "'Courier New', monospace";
                valuesText.style.fontSize = '0.9em';
                overrideItem.appendChild(valuesText);

                // Edit form (hidden by default)
                const editForm = document.createElement('div');
                editForm.id = `editForm_${override.originalIndex}`;
                editForm.style.display = 'none';
                editForm.style.marginTop = '10px';

                const editLabel = document.createElement('label');
                editLabel.textContent = 'Edit Values:';
                editLabel.style.display = 'block';
                editLabel.style.marginBottom = '8px';
                editLabel.style.color = '#e0e0e0';
                editLabel.style.fontSize = '0.9em';
                editForm.appendChild(editLabel);

                const editGrid = document.createElement('div');
                editGrid.style.display = 'grid';
                editGrid.style.gridTemplateColumns = 'repeat(5, 1fr)';
                editGrid.style.gap = '8px';
                editGrid.style.marginBottom = '10px';

                const timeValues = ['0.0', '0.25', '0.5', '0.75', '1.0'];
                override.values.forEach((value, valueIndex) => {
                    const input = document.createElement('input');
                    input.type = 'number';
                    input.step = '0.00001';
                    input.id = `editValue_${override.originalIndex}_${valueIndex}`;
                    input.value = value;
                    input.placeholder = `Time ${timeValues[valueIndex]}`;
                    input.style.padding = '8px';
                    input.style.background = '#252525';
                    input.style.border = '1px solid #333';
                    input.style.color = '#e0e0e0';
                    input.style.borderRadius = '4px';
                    input.style.fontSize = '0.85em';
                    input.style.MozAppearance = 'textfield';
                    input.style.appearance = 'textfield';
                    editGrid.appendChild(input);
                });

                editForm.appendChild(editGrid);

                const editButtonGroup = document.createElement('div');
                editButtonGroup.style.display = 'flex';
                editButtonGroup.style.gap = '8px';

                const saveBtn = document.createElement('button');
                saveBtn.textContent = 'Save';
                saveBtn.style.padding = '5px 12px';
                saveBtn.style.background = '#4CAF50';
                saveBtn.style.color = 'white';
                saveBtn.style.border = 'none';
                saveBtn.style.borderRadius = '4px';
                saveBtn.style.cursor = 'pointer';
                saveBtn.style.fontSize = '0.85em';
                saveBtn.onclick = () => saveCurveOverride(override.originalIndex);
                editButtonGroup.appendChild(saveBtn);

                const cancelBtn = document.createElement('button');
                cancelBtn.textContent = 'Cancel';
                cancelBtn.style.padding = '5px 12px';
                cancelBtn.style.background = '#757575';
                cancelBtn.style.color = 'white';
                cancelBtn.style.border = 'none';
                cancelBtn.style.borderRadius = '4px';
                cancelBtn.style.cursor = 'pointer';
                cancelBtn.style.fontSize = '0.85em';
                cancelBtn.onclick = () => cancelEditCurveOverride(override.originalIndex);
                editButtonGroup.appendChild(cancelBtn);

                editForm.appendChild(editButtonGroup);
                overrideItem.appendChild(editForm);

                categoryContentInner.appendChild(overrideItem);
            });

            categoryContent.appendChild(categoryContentInner);

            // Toggle functionality for category
            let isCategoryExpanded = false;
            categoryHeader.onclick = (e) => {
                e.stopPropagation(); // Prevent triggering parent dinosaur collapse
                isCategoryExpanded = !isCategoryExpanded;
                if (isCategoryExpanded) {
                    categoryContent.style.maxHeight = '5000px'; // Large enough for any content
                    categoryChevron.style.transform = 'rotate(90deg)';
                    // Update parent container height to accommodate expanded content
                    setTimeout(() => {
                        if (content.style.maxHeight !== '0' && content.style.maxHeight !== '') {
                            content.style.maxHeight = '10000px'; // Large enough for all categories
                        }
                    }, 10);
                } else {
                    categoryContent.style.maxHeight = '0';
                    categoryChevron.style.transform = 'rotate(0deg)';
                    // Update parent container height
                    setTimeout(() => {
                        if (content.style.maxHeight !== '0' && content.style.maxHeight !== '') {
                            content.style.maxHeight = '10000px';
                        }
                    }, 10);
                }
            };

            categorySection.appendChild(categoryContent);
            contentInner.appendChild(categorySection);
        });

        content.appendChild(contentInner);

        // Toggle functionality
        let isExpanded = false;
        header.onclick = () => {
            isExpanded = !isExpanded;
            if (isExpanded) {
                content.style.maxHeight = '10000px'; // Large enough for all content
                chevron.style.transform = 'rotate(180deg)';
            } else {
                content.style.maxHeight = '0';
                chevron.style.transform = 'rotate(0deg)';
            }
        };

        dinoSection.appendChild(header);
        dinoSection.appendChild(content);
        container.appendChild(dinoSection);
    });
}

function switchTab(tabId, categories) {
    // Hide all sections
    const allSections = document.querySelectorAll('.section');
    allSections.forEach(section => {
        section.style.display = 'none';
    });

    // Remove active class from all buttons
    const allButtons = document.querySelectorAll('.tab-button');
    allButtons.forEach(btn => btn.classList.remove('active'));

    // Show sections that match the categories
    allSections.forEach(section => {
        const categoryName = section.dataset.category;
        if (categories && categories.includes(categoryName)) {
            section.style.display = 'block';
        }
    });

    // Add active class to selected button
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(btn => {
        if (btn.textContent === getTabLabel(tabId)) {
            btn.classList.add('active');
        }
    });
}

function getTabLabel(tabId) {
    const labels = {
        'general': 'General',
        'water': 'Water & Environment',
        'quests': 'Quests',
        'waystones': 'Waystones',
        'chat': 'Chat & Map',
        'growth': 'Growth & Survival',
        'nesting': 'Nesting',
        'death': 'Death & Respawn',
        'caves': 'Home Caves',
        'critters': 'Critters & Fish',
        'player': 'Player & Security',
        'weather': 'Weather',
        'IGameMode': 'Game Mode',
        'SourceRCON': 'SourceRCON',
        'webhooks': 'Webhooks',
        'curveOverrides': 'Curve Overrides'
    };
    return labels[tabId] || tabId;
}

function createCategory(sectionKey, categoryName, items) {
    const form = document.getElementById('configForm');

    const section = document.createElement('div');
    section.className = 'section';
    section.dataset.category = categoryName;
    section.style.display = 'none'; // Hidden by default, tabs will show them

    const heading = document.createElement('h2');
    heading.textContent = categoryName;
    section.appendChild(heading);

    items.forEach(item => {
        const configItem = document.createElement('div');
        configItem.className = 'config-item';
        configItem.dataset.configName = item.name.toLowerCase();

        const label = document.createElement('label');
        label.textContent = item.name;
        configItem.appendChild(label);

        const description = document.createElement('div');
        description.className = 'description';
        description.textContent = item.description;
        configItem.appendChild(description);

        // Add GSH note for bEnabled in SourceRCON
        if (sectionKey === 'SourceRCON' && item.name === 'bEnabled') {
            const gshNote = document.createElement('div');
            gshNote.className = 'gsh-note';
            gshNote.innerHTML = '<strong>GSH Customers:</strong> Only need bEnabled=true';
            configItem.appendChild(gshNote);
        }

        if (item.type === 'boolean') {
            const wrapper = document.createElement('div');
            wrapper.className = 'switch-wrapper';

            const switchLabel = document.createElement('label');
            switchLabel.className = 'switch';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = item.name;
            checkbox.checked = item.default === 'true';
            checkbox.dataset.default = item.default;
            checkbox.addEventListener('change', function() {
                checkIfChanged(configItem, checkbox, item.type, item.default);
                generateConfig();
                // Update the label text
                const labelText = wrapper.querySelector('.switch-label');
                if (labelText) {
                    labelText.textContent = checkbox.checked ? 'Enabled' : 'Disabled';
                }
            });

            const slider = document.createElement('span');
            slider.className = 'slider';

            switchLabel.appendChild(checkbox);
            switchLabel.appendChild(slider);
            wrapper.appendChild(switchLabel);

            const labelText = document.createElement('span');
            labelText.className = 'switch-label';
            labelText.textContent = item.default === 'true' ? 'Enabled' : 'Disabled';
            wrapper.appendChild(labelText);

            configItem.appendChild(wrapper);
        } else if (item.type === 'number') {
            const input = document.createElement('input');
            input.type = 'number';
            input.id = item.name;
            input.value = item.default;
            input.step = item.default.includes('.') ? '0.1' : '1';
            input.dataset.default = item.default;
            input.addEventListener('input', function() {
                checkIfChanged(configItem, input, item.type, item.default);
                generateConfig();
            });
            configItem.appendChild(input);
        } else if (item.type === 'multiline') {
            const textarea = document.createElement('textarea');
            textarea.id = item.name;
            textarea.value = item.default;
            textarea.dataset.default = item.default;
            textarea.placeholder = 'Enter one per line...';
            textarea.rows = 5;
            textarea.style.width = '100%';
            textarea.style.resize = 'vertical';
            textarea.addEventListener('input', function() {
                checkIfChanged(configItem, textarea, item.type, item.default);
                generateConfig();
            });
            configItem.appendChild(textarea);
        } else {
            const input = document.createElement('input');
            input.type = 'text';
            input.id = item.name;
            input.value = item.default;
            input.dataset.default = item.default;
            input.placeholder = item.default || 'Enter value...';
            input.addEventListener('input', function() {
                checkIfChanged(configItem, input, item.type, item.default);
                generateConfig();
            });
            configItem.appendChild(input);
        }

        section.appendChild(configItem);
    });

    form.appendChild(section);
}

function toggleSectionFields(section, enabled) {
    const configItems = section.querySelectorAll('.config-item');
    configItems.forEach((item, index) => {
        // Skip the first item (the toggle itself)
        if (index === 0) return;

        const inputs = item.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.disabled = !enabled;
        });

        if (enabled) {
            item.style.opacity = '1';
        } else {
            item.style.opacity = '0.5';
        }
    });
}

function checkIfChanged(configItem, element, type, defaultValue) {
    let currentValue;
    if (type === 'boolean') {
        currentValue = element.checked ? 'true' : 'false';
    } else {
        currentValue = element.value;
    }

    // Check if value has changed from default
    if (currentValue !== defaultValue) {
        configItem.classList.add('changed');
    } else {
        configItem.classList.remove('changed');
    }

    // Update changed count
    updateChangedCount();
}

function updateChangedCount() {
    const changedItems = document.querySelectorAll('.config-item.changed');
    const count = changedItems.length;
    const countElement = document.getElementById('changedCount');
    if (countElement) {
        countElement.textContent = count;
    }
}

function generateConfig() {
    const changedSettings = {
        IGameSession: [],
        IGameMode: [],
        SourceRCON: []
    };

    // Check if SourceRCON bEnabled is checked
    let sourceRconEnabled = false;
    const bEnabledElement = document.getElementById('bEnabled');
    if (bEnabledElement) {
        sourceRconEnabled = bEnabledElement.checked;
    }

    // Check IGameSession settings
    Object.keys(configData.IGameSession).forEach(categoryKey => {
        const category = configData.IGameSession[categoryKey];
        if (category.length === 0) return; // Skip empty categories like Curve Overrides

        category.forEach(item => {
            const element = document.getElementById(item.name);
            if (element) {
                let currentValue;
                if (item.type === 'boolean') {
                    currentValue = element.checked ? 'true' : 'false';
                } else {
                    currentValue = element.value;
                }

                // Special case: bEnforceWhitelist only appears when set to true
                if (item.name === 'bEnforceWhitelist') {
                    if (currentValue === 'true') {
                        changedSettings.IGameSession.push(`${item.name}=${currentValue}`);
                    }
                }
                // Only add if value changed from default
                else if (currentValue !== item.default) {
                    // Handle multiline fields (AllowedCharacters, DisallowedCharacters, etc.)
                    if (item.type === 'multiline' && currentValue.trim() !== '') {
                        const lines = currentValue.split('\n').filter(line => line.trim() !== '');
                        // Special case: ServerAdmins keeps the 's' at the end
                        const outputName = item.name === 'ServerAdmins' ? item.name : (item.name.endsWith('s') ? item.name.slice(0, -1) : item.name);
                        lines.forEach(line => {
                            changedSettings.IGameSession.push(`${outputName}=${line.trim()}`);
                        });
                    } else if (item.type !== 'multiline') {
                        changedSettings.IGameSession.push(`${item.name}=${currentValue}`);
                    }
                }
            }
        });
    });

    // Add curve overrides to IGameSession
    curveOverrides.forEach(override => {
        // Extract just the curve name without /Game/Dinosaurs/ prefix
        // Format: PWDimetrodon.Multiplier.HealthRecovery.Standing
        const curveName = override.curve;

        // Format values as simple comma-separated list without trailing zeros
        const values = override.values.map(value => parseFloat(value.toFixed(5)).toString()).join(',');

        changedSettings.IGameSession.push(`CurveOverrides=(CurveName="${override.dinosaur}.${curveName}",Values=(${values}))`);
    });

    // Check IGameMode settings
    Object.keys(configData.IGameMode).forEach(categoryKey => {
        const category = configData.IGameMode[categoryKey];
        category.forEach(item => {
            const element = document.getElementById(item.name);
            if (element) {
                let currentValue;
                if (item.type === 'boolean') {
                    currentValue = element.checked ? 'true' : 'false';
                } else {
                    currentValue = element.value;
                }

                // Only add if value changed from default
                if (currentValue !== item.default) {
                    // Handle multiline fields
                    if (item.type === 'multiline' && currentValue.trim() !== '') {
                        const lines = currentValue.split('\n').filter(line => line.trim() !== '');
                        // Special case: ServerAdmins keeps the 's' at the end
                        const outputName = item.name === 'ServerAdmins' ? item.name : (item.name.endsWith('s') ? item.name.slice(0, -1) : item.name);
                        lines.forEach(line => {
                            changedSettings.IGameMode.push(`${outputName}=${line.trim()}`);
                        });
                    } else if (item.type !== 'multiline') {
                        changedSettings.IGameMode.push(`${item.name}=${currentValue}`);
                    }
                }
            }
        });
    });

    // Check SourceRCON settings (only if bEnabled is checked)
    if (sourceRconEnabled) {
        // Always add bEnabled=true if it's checked
        changedSettings.SourceRCON.push('bEnabled=true');

        Object.keys(configData.SourceRCON).forEach(categoryKey => {
            const category = configData.SourceRCON[categoryKey];
            category.forEach(item => {
                // Skip bEnabled since we already added it
                if (item.name === 'bEnabled') return;

                const element = document.getElementById(item.name);
                if (element) {
                    let currentValue;
                    if (item.type === 'boolean') {
                        currentValue = element.checked ? 'true' : 'false';
                    } else {
                        currentValue = element.value;
                    }

                    // Only add changed settings to SourceRCON section
                    if (currentValue !== item.default) {
                        if (item.type === 'text' && currentValue !== '') {
                            changedSettings.SourceRCON.push(`${item.name}="${currentValue}"`);
                        } else if (item.type !== 'text') {
                            changedSettings.SourceRCON.push(`${item.name}=${currentValue}`);
                        }
                    }
                }
            });
        });
    }

    // Generate output
    let output = '';

    if (changedSettings.IGameSession.length > 0) {
        output += '[/Script/PathOfTitans.IGameSession]\n';
        output += changedSettings.IGameSession.join('\n');
        output += '\n';
    } else {
        output += '[/Script/PathOfTitans.IGameSession]\n';
        output += '; No changes made\n';
    }

    output += '\n';

    if (changedSettings.IGameMode.length > 0) {
        output += '[/Script/PathOfTitans.IGameMode]\n';
        output += changedSettings.IGameMode.join('\n');
    } else {
        output += '[/Script/PathOfTitans.IGameMode]\n';
        output += '; No changes made';
    }

    // Add SourceRCON section if enabled
    if (sourceRconEnabled && changedSettings.SourceRCON.length > 0) {
        output += '\n\n[SourceRCON]\n';
        output += changedSettings.SourceRCON.join('\n');
    }

    // Add ServerWebhooks section if enabled
    const webhookEnabled = document.getElementById('webhookEnabled');
    if (webhookEnabled && webhookEnabled.checked) {
        const webhookFormat = document.getElementById('webhookFormat').value;

        // Add metadata comment
        output += '\n\n;METADATA=(Diff=true, UseCommands=true)\n';
        output += '[ServerWebhooks]\n';
        output += 'bEnabled=true\n';
        output += `Format="${webhookFormat}"\n`;

        // List of all webhook fields
        const webhookFieldIds = [
            'PlayerReport', 'PlayerChat', 'PlayerDamagedPlayer', 'PlayerHack',
            'PlayerJoinedGroup', 'PlayerLeftGroup', 'PlayerLogin', 'PlayerLogout',
            'PlayerLeave', 'PlayerKilled', 'PlayerQuestComplete', 'PlayerQuestFailed',
            'PlayerRespawn', 'PlayerWaystone', 'PlayerProfanity', 'ServerRestart',
            'ServerRestartCountdown', 'ServerModerate', 'AdminCommand', 'AdminSpectate',
            'BadAverageTick', 'ServerError', 'PlayerPurchase', 'CreateNest',
            'DestroyNest', 'NestInvite', 'PlayerJoinNest', 'UpdateNest', 'ServerStart'
        ];

        // Add webhook URLs
        webhookFieldIds.forEach(fieldId => {
            const input = document.getElementById(`webhook${fieldId}`);
            if (input && input.value.trim()) {
                let url = input.value.trim();
                // Remove existing quotes if present, then add them back
                url = url.replace(/^["']|["']$/g, '');
                output += `${fieldId}="${url}"\n`;
            }
        });
    }

    document.getElementById('outputPreview').textContent = output;
}

function copyToClipboard() {
    const output = document.getElementById('outputPreview').textContent;
    navigator.clipboard.writeText(output).then(() => {
        alert('Configuration copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
    });
}

async function downloadConfig() {
    const output = document.getElementById('outputPreview').textContent;

    // Count the number of changed settings
    const lines = output.split('\n');
    const changedSettingsCount = lines.filter(line =>
        line.trim() &&
        !line.startsWith('[') &&
        !line.startsWith(';') &&
        line.includes('=')
    ).length;

    // Send webhook notification
    try {
        await fetch('/api/webhook/game-ini-generated', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileType: 'Game.ini',
                changedSettingsCount: changedSettingsCount,
                timestamp: new Date().toISOString()
            })
        });
    } catch (error) {
        console.error('Failed to send webhook notification:', error);
        // Don't block the download if webhook fails
    }

    // Download the file
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Game.ini';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function resetForm() {
    if (confirm('Are you sure you want to reset all settings to their defaults?')) {
        Object.keys(configData).forEach(sectionKey => {
            const section = configData[sectionKey];
            Object.keys(section).forEach(categoryKey => {
                const category = section[categoryKey];
                category.forEach(item => {
                    const element = document.getElementById(item.name);
                    if (element) {
                        if (item.type === 'boolean') {
                            element.checked = item.default === 'true';
                        } else {
                            element.value = item.default;
                        }
                        // Remove changed class from parent config-item
                        const configItem = element.closest('.config-item');
                        if (configItem) {
                            configItem.classList.remove('changed');
                        }
                    }
                });
            });
        });

        generateConfig();
    }
}

function uploadConfig(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        parseAndLoadIni(content);
    };
    reader.readAsText(file);
}

function parseAndLoadIni(content) {
    // Reset form first
    Object.keys(configData).forEach(sectionKey => {
        const section = configData[sectionKey];
        Object.keys(section).forEach(categoryKey => {
            const category = section[categoryKey];
            category.forEach(item => {
                const element = document.getElementById(item.name);
                if (element) {
                    if (item.type === 'boolean') {
                        element.checked = item.default === 'true';
                    } else {
                        element.value = item.default;
                    }
                }
            });
        });
    });

    // Reset curve overrides
    curveOverrides = [];

    // Reset webhook fields
    const webhookEnabledCheckbox = document.getElementById('webhookEnabled');
    if (webhookEnabledCheckbox) {
        webhookEnabledCheckbox.checked = false;
    }
    const webhookFormatSelect = document.getElementById('webhookFormat');
    if (webhookFormatSelect) {
        webhookFormatSelect.value = 'General';
    }

    const lines = content.split('\n');
    let currentSection = null;
    const multilineValues = {}; // Track multiline values like AllowedCharacter

    lines.forEach(line => {
        line = line.trim();

        // Skip empty lines and comments (but not METADATA)
        if (!line || (line.startsWith(';') && !line.includes('METADATA'))) return;

        // Check for section headers
        if (line.startsWith('[') && line.endsWith(']')) {
            currentSection = line.slice(1, -1);
            return;
        }

        // Parse key=value pairs
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            let key = match[1].trim();
            let value = match[2].trim();

            // Handle ServerWebhooks section
            if (currentSection === 'ServerWebhooks') {
                if (key === 'bEnabled' && value.toLowerCase() === 'true') {
                    const webhookEnabledCheckbox = document.getElementById('webhookEnabled');
                    if (webhookEnabledCheckbox) {
                        webhookEnabledCheckbox.checked = true;
                    }
                } else if (key === 'Format') {
                    // Remove quotes if present
                    const formatValue = value.replace(/['"]/g, '');
                    const webhookFormatSelect = document.getElementById('webhookFormat');
                    if (webhookFormatSelect) {
                        webhookFormatSelect.value = formatValue;
                    }
                } else {
                    // It's a webhook URL field
                    const webhookInput = document.getElementById(`webhook${key}`);
                    if (webhookInput) {
                        // Remove quotes if present
                        webhookInput.value = value.replace(/['"]/g, '');
                    }
                }
                return;
            }

            // Handle CurveOverrides
            if (key === 'CurveOverrides') {
                // Parse new format: CurveOverrides=(CurveName="PWDimetrodon.Multiplier.HealthRecovery.Standing",Values=(1,2,3,4,5))
                const curveNameMatch = value.match(/CurveName="([^.]+)\.([^"]+)"/);
                const valuesMatch = value.match(/Values=\(([^)]+)\)/);

                if (curveNameMatch && valuesMatch) {
                    const dinosaur = curveNameMatch[1];
                    const curve = curveNameMatch[2];
                    const valuesString = valuesMatch[1];

                    // Parse comma-separated values
                    const values = valuesString.split(',').map(v => parseFloat(v.trim()));

                    if (values.length === 5) {
                        curveOverrides.push({
                            dinosaur: dinosaur,
                            curve: curve,
                            values: values
                        });
                    }
                }
                return;
            }

            // Remove quotes from values
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }

            // Handle multiline entries (AllowedCharacter, DisallowedCharacter, ServerAdmin/ServerAdmins, etc.)
            if (key.endsWith('Character') || key.endsWith('Critter') || key === 'ServerAdmin' || key === 'ServerAdmins') {
                // For ServerAdmins, use as-is; for ServerAdmin, convert to ServerAdmins
                const pluralKey = key === 'ServerAdmins' ? 'ServerAdmins' : (key + 's');
                if (!multilineValues[pluralKey]) {
                    multilineValues[pluralKey] = [];
                }
                multilineValues[pluralKey].push(value);
                return;
            }

            // Find and set the element
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value.toLowerCase() === 'true' || value === '1';
                } else if (element.type === 'number') {
                    element.value = value;
                } else {
                    element.value = value;
                }

                // Trigger change detection
                const configItem = element.closest('.config-item');
                if (configItem) {
                    const item = findConfigItem(key);
                    if (item) {
                        checkIfChanged(configItem, element, item.type, item.default);
                    }
                }
            }
        }
    });

    // Set multiline values
    Object.keys(multilineValues).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            element.value = multilineValues[key].join('\n');
            const configItem = element.closest('.config-item');
            if (configItem) {
                const item = findConfigItem(key);
                if (item) {
                    checkIfChanged(configItem, element, item.type, item.default);
                }
            }
        }
    });

    // Render curve overrides
    renderCurveOverrides();

    generateConfig();
    alert('Game.ini file loaded successfully!');
}

function findConfigItem(name) {
    for (const sectionKey in configData) {
        const section = configData[sectionKey];
        for (const categoryKey in section) {
            const category = section[categoryKey];
            const item = category.find(i => i.name === name);
            if (item) return item;
        }
    }
    return null;
}

// Search functionality
document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const sections = document.querySelectorAll('.section');

    if (searchTerm === '') {
        // Reset: hide items and restore to first tab
        sections.forEach(section => {
            section.classList.remove('hidden');
            const items = section.querySelectorAll('.config-item');
            items.forEach(item => item.classList.remove('hidden'));
        });
        switchTab('general', ['General Server Settings']);
        return;
    }

    // Show all sections when searching
    sections.forEach(section => {
        section.style.display = 'block';
        const configItems = section.querySelectorAll('.config-item');
        let hasVisibleItems = false;

        configItems.forEach(item => {
            const configName = item.dataset.configName;
            const description = item.querySelector('.description').textContent.toLowerCase();
            const label = item.querySelector('label').textContent.toLowerCase();

            if (configName.includes(searchTerm) ||
                description.includes(searchTerm) ||
                label.includes(searchTerm)) {
                item.classList.remove('hidden');
                hasVisibleItems = true;
            } else {
                item.classList.add('hidden');
            }
        });

        // Hide section if no items are visible
        if (hasVisibleItems) {
            section.classList.remove('hidden');
        } else {
            section.classList.add('hidden');
        }
    });
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    generateConfig();
});
