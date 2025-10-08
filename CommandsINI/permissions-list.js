// All available permissions for Path of Titans Commands.ini
// Organized by category for easier management

const permissionsList = {
    "Server Management": [
        { id: "restart", name: "restart", description: "Restart the server" },
        { id: "serverinfo", name: "serverinfo", description: "View server information" },
        { id: "reloadbans", name: "reloadbans", description: "Reload the ban list" },
        { id: "reloadmotd", name: "reloadmotd", description: "Reload the message of the day" },
        { id: "reloadmutes", name: "reloadmutes", description: "Reload the mute list" },
        { id: "reloadrules", name: "reloadrules", description: "Reload server rules" },
        { id: "reloadwhitelist", name: "reloadwhitelist", description: "Reload the whitelist" }
    ],
    "Player Moderation": [
        { id: "ban", name: "ban", description: "Ban a player from the server" },
        { id: "kick", name: "kick", description: "Kick a player from the server" },
        { id: "servermute", name: "servermute", description: "Mute a player" },
        { id: "serverunmute", name: "serverunmute", description: "Unmute a player" },
        { id: "delwhitelist", name: "delwhitelist", description: "Remove player from whitelist" },
        { id: "playerinfo", name: "playerinfo", description: "View player information" },
        { id: "promote", name: "promote", description: "Promote a player to a role" }
    ],
    "Admin Tools": [
        { id: "godmode", name: "godmode", description: "Enable god mode (invincibility)" },
        { id: "teleport", name: "teleport", description: "Teleport to a player or location" },
        { id: "teleportall", name: "teleportall", description: "Teleport all players to a location" },
        { id: "heal", name: "heal", description: "Heal a player" },
        { id: "healall", name: "healall", description: "Heal all players" },
        { id: "gotonest", name: "gotonest", description: "Teleport to a nest" }
    ],
    "Announcements & Communication": [
        { id: "announce", name: "announce", description: "Send a server-wide announcement" },
        { id: "systemmessage", name: "systemmessage", description: "Send a system message to a player" },
        { id: "systemmessageall", name: "systemmessageall", description: "Send a system message to all players" }
    ],
    "Quest Management": [
        { id: "givequest", name: "givequest", description: "Give a quest to a player" },
        { id: "completequest", name: "completequest", description: "Complete a quest for a player" },
        { id: "editquests", name: "editquests", description: "Edit quest configuration" },
        { id: "listquests", name: "listquests", description: "List all available quests" },
        { id: "listpoi", name: "listpoi", description: "List all points of interest" }
    ],
    "Attribute Management": [
        { id: "get attribute", name: "get attribute", description: "Get a player's attribute value" },
        { id: "set attribute", name: "set attribute", description: "Set a player's attribute value" },
        { id: "set attribute all", name: "set attribute all", description: "Set an attribute for all players" },
        { id: "modify attribute", name: "modify attribute", description: "Modify a player's attribute" }
    ],
    "Marks & Growth": [
        { id: "setmarks", name: "setmarks", description: "Set a player's marks" },
        { id: "setmarksall", name: "setmarksall", description: "Set marks for all players" },
        { id: "reward growth", name: "reward growth", description: "Reward growth to a player" },
        { id: "reward well rested", name: "reward well rested", description: "Give well rested buff to a player" },
        { id: "skipshed", name: "skipshed", description: "Skip a player's shed cycle" }
    ],
    "Environment Control": [
        { id: "weather", name: "weather", description: "Change the weather" },
        { id: "time of day", name: "time of day", description: "Change the time of day" },
        { id: "waterquality", name: "waterquality", description: "Adjust water quality" },
        { id: "listwaters", name: "listwaters", description: "List all water sources" },
        { id: "spawncritters", name: "spawncritters", description: "Spawn critters in the world" }
    ],
    "Waystone Management": [
        { id: "listwaystones", name: "listwaystones", description: "List all waystones" },
        { id: "waystonecooldown", name: "waystonecooldown", description: "Manage waystone cooldowns" }
    ],
    "Nest Management": [
        { id: "getnestresource", name: "getnestresource", description: "Get nest resource information" },
        { id: "setnestresource", name: "setnestresource", description: "Set nest resources" },
        { id: "setnesthealth", name: "setnesthealth", description: "Set nest health" },
        { id: "setnestslots", name: "setnestslots", description: "Set nest slots" },
        { id: "replenishnest", name: "replenishnest", description: "Replenish nest resources" }
    ],
    "Creator Mode": [
        { id: "listcreatormode", name: "listcreatormode", description: "List creator mode objects" },
        { id: "loadcreatormode", name: "loadcreatormode", description: "Load creator mode save" },
        { id: "savecreatormode", name: "savecreatormode", description: "Save creator mode state" },
        { id: "clearcreatorobjects", name: "clearcreatorobjects", description: "Clear creator mode objects" },
        { id: "resetcreatormode", name: "resetcreatormode", description: "Reset creator mode" },
        { id: "replenishcreatormode", name: "replenishcreatormode", description: "Replenish creator mode resources" }
    ],
    "World Cleanup": [
        { id: "clearbodies", name: "clearbodies", description: "Clear dead bodies from the world" },
        { id: "clearcooldowns", name: "clearcooldowns", description: "Clear player cooldowns" },
        { id: "cleareffects", name: "cleareffects", description: "Clear player effects/buffs" }
    ],
    "Role & Access Management": [
        { id: "listroles", name: "listroles", description: "List all server roles" }
    ],
    "Combat & Health": [
        { id: "setpermawound", name: "setpermawound", description: "Set permanent wound on a player" },
        { id: "setwound", name: "setwound", description: "Set wound on a player" }
    ],
    "Data Management": [
        { id: "load", name: "load", description: "Load saved data" }
    ]
};

// Flatten all permissions into a single array for easy iteration
const allPermissions = Object.values(permissionsList).flat();

// Get all permission IDs as an array
const allPermissionIds = allPermissions.map(p => p.id);
