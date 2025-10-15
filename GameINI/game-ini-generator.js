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
            { name: "bEnforceWhitelist", type: "boolean", default: "true", description: "Enables or disables the whitelist system. If enabled, only players on the whitelist can join the server." },
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
        { id: 'curveOverrides', label: 'Curve Overrides', categories: ['Curve Overrides'] }
    ];

    tabs.forEach((tab, index) => {
        const button = document.createElement('button');
        button.className = 'tab-button';
        button.textContent = tab.label;

        // Grey out Curve Overrides tab
        if (tab.id === 'curveOverrides') {
            button.style.opacity = '0.4';
            button.style.cursor = 'not-allowed';
            button.style.pointerEvents = 'none';
        } else {
            button.onclick = () => switchTab(tab.id, tab.categories);
        }

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

    const section = document.createElement('div');
    section.className = 'section';
    section.dataset.category = 'Curve Overrides';
    section.style.display = 'none';

    const heading = document.createElement('h2');
    heading.textContent = 'Curve Overrides';
    section.appendChild(heading);

    const description = document.createElement('div');
    description.className = 'description';
    description.textContent = 'Add custom curve overrides to modify dinosaur stats and behaviors. Time values are fixed at 0.0, 0.25, 0.5, 0.75, and 1.0 representing growth stages.';
    description.style.marginBottom = '20px';
    section.appendChild(description);

    // Add curve override form
    const addForm = document.createElement('div');
    addForm.className = 'curve-override-form';
    addForm.style.background = 'rgba(0, 0, 0, 0.3)';
    addForm.style.padding = '20px';
    addForm.style.borderRadius = '8px';
    addForm.style.marginBottom = '20px';

    // Dinosaur dropdown with search
    const dinoLabel = document.createElement('label');
    dinoLabel.textContent = 'Dinosaur Species';
    dinoLabel.style.display = 'block';
    dinoLabel.style.marginBottom = '8px';
    dinoLabel.style.color = '#e0e0e0';
    addForm.appendChild(dinoLabel);

    const dinoSelect = document.createElement('select');
    dinoSelect.id = 'curveOverrideDino';
    dinoSelect.style.width = '100%';
    dinoSelect.style.padding = '10px';
    dinoSelect.style.marginBottom = '15px';
    dinoSelect.style.background = '#252525';
    dinoSelect.style.border = '1px solid #333';
    dinoSelect.style.color = '#e0e0e0';
    dinoSelect.style.borderRadius = '6px';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a dinosaur...';
    dinoSelect.appendChild(defaultOption);

    dinosaurSpecies.forEach(dino => {
        const option = document.createElement('option');
        option.value = dino;
        option.textContent = dino;
        dinoSelect.appendChild(option);
    });
    addForm.appendChild(dinoSelect);

    // Curve name input
    const curveLabel = document.createElement('label');
    curveLabel.textContent = 'Curve Name (e.g., GrowthRate, BiteDamage, StaminaDrain)';
    curveLabel.style.display = 'block';
    curveLabel.style.marginBottom = '8px';
    curveLabel.style.color = '#e0e0e0';
    addForm.appendChild(curveLabel);

    const curveInput = document.createElement('input');
    curveInput.type = 'text';
    curveInput.id = 'curveOverrideName';
    curveInput.placeholder = 'Enter curve name...';
    curveInput.style.width = '100%';
    curveInput.style.padding = '10px';
    curveInput.style.marginBottom = '15px';
    curveInput.style.background = '#252525';
    curveInput.style.border = '1px solid #333';
    curveInput.style.color = '#e0e0e0';
    curveInput.style.borderRadius = '6px';
    addForm.appendChild(curveInput);

    // Value inputs container
    const valuesLabel = document.createElement('label');
    valuesLabel.textContent = 'Curve Values (Time: 0.0, 0.25, 0.5, 0.75, 1.0)';
    valuesLabel.style.display = 'block';
    valuesLabel.style.marginBottom = '8px';
    valuesLabel.style.color = '#e0e0e0';
    addForm.appendChild(valuesLabel);

    const valuesContainer = document.createElement('div');
    valuesContainer.style.display = 'grid';
    valuesContainer.style.gridTemplateColumns = 'repeat(5, 1fr)';
    valuesContainer.style.gap = '10px';
    valuesContainer.style.marginBottom = '15px';

    const timeValues = ['0.0', '0.25', '0.5', '0.75', '1.0'];
    timeValues.forEach((time, index) => {
        const valueInput = document.createElement('input');
        valueInput.type = 'number';
        valueInput.step = '0.01';
        valueInput.id = `curveValue${index}`;
        valueInput.placeholder = `Time ${time}`;
        valueInput.style.padding = '10px';
        valueInput.style.background = '#252525';
        valueInput.style.border = '1px solid #333';
        valueInput.style.color = '#e0e0e0';
        valueInput.style.borderRadius = '6px';
        valuesContainer.appendChild(valueInput);
    });
    addForm.appendChild(valuesContainer);

    // Add button
    const addButton = document.createElement('button');
    addButton.textContent = 'Add Curve Override';
    addButton.style.padding = '10px 20px';
    addButton.style.background = '#4CAF50';
    addButton.style.color = 'white';
    addButton.style.border = 'none';
    addButton.style.borderRadius = '6px';
    addButton.style.cursor = 'pointer';
    addButton.onclick = addCurveOverride;
    addForm.appendChild(addButton);

    section.appendChild(addForm);

    // Container for added curve overrides
    const overridesContainer = document.createElement('div');
    overridesContainer.id = 'curveOverridesList';
    section.appendChild(overridesContainer);

    form.appendChild(section);
}

function addCurveOverride() {
    const dino = document.getElementById('curveOverrideDino').value;
    const curveName = document.getElementById('curveOverrideName').value.trim();
    const values = [];

    for (let i = 0; i < 5; i++) {
        const value = document.getElementById(`curveValue${i}`).value;
        if (value === '') {
            alert('Please fill in all 5 curve values');
            return;
        }
        values.push(parseFloat(value));
    }

    if (!dino) {
        alert('Please select a dinosaur species');
        return;
    }

    if (!curveName) {
        alert('Please enter a curve name');
        return;
    }

    const override = {
        dinosaur: dino,
        curve: curveName,
        values: values
    };

    curveOverrides.push(override);
    renderCurveOverrides();

    // Clear form
    document.getElementById('curveOverrideDino').value = '';
    document.getElementById('curveOverrideName').value = '';
    for (let i = 0; i < 5; i++) {
        document.getElementById(`curveValue${i}`).value = '';
    }

    generateConfig();
}

function removeCurveOverride(index) {
    curveOverrides.splice(index, 1);
    renderCurveOverrides();
    generateConfig();
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

    curveOverrides.forEach((override, index) => {
        const overrideItem = document.createElement('div');
        overrideItem.className = 'config-item changed';
        overrideItem.style.marginBottom = '15px';

        const title = document.createElement('div');
        title.style.display = 'flex';
        title.style.justifyContent = 'space-between';
        title.style.alignItems = 'center';
        title.style.marginBottom = '10px';

        const titleText = document.createElement('strong');
        titleText.textContent = `${override.dinosaur} - ${override.curve}`;
        titleText.style.color = '#00CFFF';
        title.appendChild(titleText);

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.style.padding = '5px 15px';
        removeBtn.style.background = '#f44336';
        removeBtn.style.color = 'white';
        removeBtn.style.border = 'none';
        removeBtn.style.borderRadius = '4px';
        removeBtn.style.cursor = 'pointer';
        removeBtn.onclick = () => removeCurveOverride(index);
        title.appendChild(removeBtn);

        overrideItem.appendChild(title);

        const valuesText = document.createElement('div');
        valuesText.textContent = `Values: ${override.values.join(', ')}`;
        valuesText.style.color = '#e0e0e0';
        valuesText.style.fontFamily = "'Courier New', monospace";
        overrideItem.appendChild(valuesText);

        container.appendChild(overrideItem);
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

                // Only add if value changed from default
                if (currentValue !== item.default) {
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
        const curveName = `${override.dinosaur}.Core.${override.curve}`;
        const values = override.values.map(v => v.toFixed(5)).join(',');
        changedSettings.IGameSession.push(`CurveOverrides=(CurveName="${curveName}",Values=(${values}))`);
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

    const lines = content.split('\n');
    let currentSection = null;
    const multilineValues = {}; // Track multiline values like AllowedCharacter

    lines.forEach(line => {
        line = line.trim();

        // Skip empty lines and comments
        if (!line || line.startsWith(';')) return;

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

            // Handle CurveOverrides
            if (key === 'CurveOverrides') {
                // Parse: CurveOverrides=(Curve="/Game/Dinosaurs/Allosaurus.GrowthRate",Keys=((Time=0.0,Value=0.0),(Time=0.25,Value=0.3),...))
                const curveMatch = value.match(/Curve="\/Game\/Dinosaurs\/([^.]+)\.([^"]+)"/);
                const keysMatch = value.match(/Keys=\(\(([^)]+)\)\)/);

                if (curveMatch && keysMatch) {
                    const dinosaur = curveMatch[1];
                    const curve = curveMatch[2];
                    const keysString = keysMatch[1];

                    // Extract values from the keys
                    const valueMatches = keysString.matchAll(/Value=([\d.]+)/g);
                    const values = [];
                    for (const match of valueMatches) {
                        values.push(parseFloat(match[1]));
                    }

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
