Teleport Commands
Commands related to teleporting and bringing players to locations, POIs, and even other players.

Chat Command:	Example:	Permissions:	RCON Support:	Action:
/teleport (coordinates)	/teleport (x=-91112,Y=-176182,Z=13156)	+Permission=teleport	✔️	Teleports yourself to the specified coordinates. 'unsafe' Optional parameter, use to change from a safe teleport to an unsafe teleport
/teleport [user/AGID] (coordinates)	/teleport mike (x=-91112,Y=-176182,Z=13156)	+Permission=teleport	✔️	Teleports the user to the specified coordinates. 'unsafe' Optional parameter, use to change from a safe teleport to an unsafe teleport
/teleport [user/AGID] [user/AGID]	/teleport Mike Josh	+Permission=teleport	✔️	Teleports the first user to the second user. 'unsafe' Optional parameter, use to change from a safe teleport to an unsafe teleport
/teleport [POIname]	/teleport talonspoint	+Permission=teleport	✔️	Teleports yourself to a point within the specified POI. 'unsafe' Optional parameter, use to change from a safe teleport to an unsafe teleport
/teleport [user/AGID] [POIname]	/teleport mike talonspoint	+Permission=teleport	✔️	Teleports the user to a point within the specified POI. 'unsafe' Optional parameter, use to change from a safe teleport to an unsafe teleport
/bring [user/AGID]	/bring mike	+Permission=teleport	❌	Brings the user to your location. 'unsafe' Optional parameter, use to change from a safe teleport to an unsafe teleport
/goto [location]	/goto talonspoint	+Permission=teleport	❌	Teleports you to the target location. The location can be either a username, a POI, or coordinates. 'unsafe' Optional parameter, use to change from a safe teleport to an unsafe teleport
/teleportall [POIname]	/teleportall talonspoint	+Permission=teleportall	✔️	Teleports all users on the server to a point within the specified POI.
/teleportall (coordinates)	/teleportall (x=-91112,Y=-176182,Z=13156)	+Permission=teleportall	✔️	Teleports all users on the server to the specified coordinates.
/bringall	/bringall	+Permission=teleportall	❌	Teleports all players to your location.
Change Stats Commands
Commands related to changing player stats, such as hunger, thirst, stamina, and many more.

Chat Command:	Example:	Permissions:	RCON Support:	Action:
/setmarks [number]	/setmarks 900	+Permission=setmarks	✔️	Sets your marks to the specified number.
/setmarks [user/AGID] [number]	/setmarks mike 900	+Permission=setmarks	✔️	Sets a player's marks to the specified number.
/setmarksall [number]	/setmarksall 900	+Permission=setmarksall	✔️	Sets all users' marks to the specified amount.
/addmarks [user/AGID] [number]	/addmarks mike 200	+Permission=setmarks	✔️	Adds a number of marks to the player.
/addmarksall [number]	/addmarksall 200	+Permission=setmarks	✔️	Adds a number of marks to all the players in the server.
/removemarks [user/AGID] [number]	/removemarks that41guy 400	+Permission=setmarks	✔️	Removes a number of marks from the player.
/heal	/heal	+Permission=heal	❌	Heals yourself.
/heal [user/AGID]	/heal mike	+Permission=heal	✔️	Heals the specified player.
/healall	/healall	+Permission=healall	✔️	Heals everyone.
/godmode	/godmode	+Permission=godmode	❌	Apply godmode to yourself. Use this command again to toggle it on/off.
/godmode [user/AGID]	/godmode mike	+Permission=godmode	❌	Apply godmode to a user. Use this command again to toggle it on/off.
/[attribute] [number]	/hunger 100	+Permission=modify attribute	✔️	Sets your hunger to 100.
/modattr [user/AGID] [attribute] [value]	/modattr mike Stamina -100	+Permission=modify attribute	✔️	Modifies the user's attribute by the value specified. This is additive, rather than /setattr, which overrides the value.
/setattr [user/AGID] [attribute] [value]	/setattr mike Stamina 20	+Permission=set attribute	✔️	Sets the user's attribute to the value specified.
/setattrall [attribute] [value]	/setattrall Stamina 20	+Permission=set attribute all	✔️	Sets the attribute for all players.
/getattr [user/AGID] [attribute]	/getattr mike Stamina	+Permission=get attribute	✔️	Gets Value for specified Attribute.
/getallattr [user/AGID]	/getallattr mike	+Permission=get attribute	✔️	Lists all attribute names and their values.
/rewardgrowth [user/AGID] [value]	/rewardgrowth mike 0.1	+Permission=reward growth	❌	Rewards growth over time to the specified player.
/rewardwellrested [user/AGID] [value]	/rewardwellrested mike 0.1	+Permission=reward well rested	❌	Rewards Well Rested buff till the specified growth value is hit.
Character Commands
Character commands allow players and server admins to manage their characters.

DANGER

Character commands are ONLY supported for Local Databases at this moment. Support for Remote Databases will be added in the future updates.

Chat Command:	Example:	Permissions:	RCON Support:	Action:
/createcharacter [AlderonId] [CharacterName] [DinosaurType] [Growth] [Marks]	/createcharacter 123-456-789 Bloodclaw Allosaurus 1.0 3000	-	❌	Creates a character with the specified parameters. The example below creates a character with the Alderon ID 123-456-789, named Bloodclaw, as an Allosaurus with 1.0 growth and 3000 marks. (ONLY works with Local database currently)
Admin Commands
Admin commands allow players (with roles that have permissions) or admins to manage the server easily and efficiently.

DANGER

Please only give these permissions to a role/user that you can trust. You will be responsible for the consequence of misuse of these commands on your server.

Chat Command:	Example:	Permissions:	RCON Support:	Action:
/save	/save	+Permission=save	✔️	Forces a server save.
/load	/load	+Permission=load	✔️	Forces a server load.
/promote [user/AGID] [adminrole]	/promote mike dinomaster	+Permission=promote	✔️	Promotes the player to the specified admin role.
/demote [user/AGID]	/demote mike	+Permission=promote	✔️	Removes all admin roles of that player.
/kick [user/AGID] [kickreason]	/kick mike "Spamming the chat."	+Permission=kick	✔️	Kicks the user with a message. You can optionally leave the message blank. The messages must be surrounded in quotations.
/ban [user/AGID] [duration] [banreason] [userbanreason]	/ban mike 120 "Breaking rule number 12" "Don't break rule 12 next time!"	+Permission=ban	✔️	Bans the user with for an amount of seconds with an optional message. To ban forever, set the duration to 0. The first ban reason is the reason shown to admins. The second ban reason is shown to the user who was banned. The messages must be surrounded in quotations.
/banip [ip] [duration] [banreason] [userbanreason]	/banip 123.45.12.21 120 "Breaking rule number 12" "Don't break rule 12 next time!"	+Permission=banip	✔️	Bans the given IP address for an amount of seconds with an optional message. Similar to the normal ban command, you can set the duration to 0 to ban forever. The first ban reason is the reason shown to admins. The second ban reason is shown to the user who was banned. The messages must be surrounded in quotations.
/unban [user/AGID]	/unban mike	+Permission=unban	✔️	Unbans the specified player.
/restart [seconds]	/restart 120	+Permission=restart	✔️	Restarts the server after the specified number of seconds.
/cancelrestart	/cancelrestart	+Permission=restart	✔️	Cancels the server restart.
/announce [message]	/announce Everyone kill mike for bonus points!	+Permission=announce	✔️	Makes an announcement to everyone on the server.
/listpoi	/listpoi	+Permission=listpoi	✔️	Lists all the POIs on the current map.
/listquests	/listquests	+Permission=listquests	✔️	Lists all quests currently available.
/listroles	/listroles	+Permission=listroles	✔️	Lists all roles currently available.
/listwaters	/listwaters	+Permission=listwaters	✔️	Lists all bodies of water on the map.
/listwaystones	/listwaystones	+Permission=listwaystones	✔️	Lists all waystones on the map.
/Weather [type]	/weather clearsky	+Permission=weather	✔️	Sets the weather to the specified weather type. Types available are: ClearSky, Overcast, Fog, Cloudy, Rain, and Storm.
/TimeOfDay [time]	/timeofday night	+Permission=time of day	✔️	Sets the time of day. Available times are morning, night, day, and optionally you can specify a number for more precise time.
/Day	/night	+Permission=time of day	✔️	Shorthand for /timeofday night. Other shorthand time commands are /day and /morning.
/ClearBodies	/clearbodies	+Permission=clearbodies	✔️	Clears all dead bodies from the map.
/WaterQuality [tag] [0-100%]	/waterquality swampyreservoir 50	+Permission=waterquality	✔️	Sets the water body of the tag specified to a percentage quality.
/WaystoneCooldown [tag] [0-100%]	/waystonecooldown centralwaystone 50	+Permission=waystonecooldown	✔️	Sets the waystone of the tag specified to a percentage cooldown remaining.
/PlayerInfo [username/AGID]	/playerinfo 123-456-789	+Permission=playerinfo	✔️	Shows player info.
/ServerMute [username/AGID] [time] [admin reason] [user reason]	/servermute 123-456-789 20m reason for admin reason for player	+Permission=servermute	✔️	Mutes a player server-wide. Time is specified in minutes, hours, or days. e.g., 20m, 4h, or 1d. If 0 is given for time, it will be forever.
/ServerUnmute [username/AGID]	/serverunmute 123-456-789	+Permission=serverunmute	✔️	Removes a server-wide mute for a player.
/Whitelist [username/AGID]	/whitelist 123-456-789	+Permission=whitelist	✔️	Adds a player to the whitelist for the server.
/DelWhitelist [username/AGID]	/delwhitelist 123-456-789	+Permission=delwhitelist	✔️	Removes a player from the server whitelist.
/ReloadBans	/reloadbans	+Permission=reloadbans	✔️	Reloads server bans from the ban file.
/ReloadMutes	/reloadmutes	+Permission=reloadmutes	✔️	Reloads server mutes from the mutes file.
/ReloadWhitelist	/reloadwhitelist	+Permission=reloadwhitelist	✔️	Reloads server whitelist.
/ReloadRules	/reloadrules	+Permission=reloadrules	✔️	Reloads server rules.
/ReloadMOTD	/reloadmotd	+Permission=reloadmotd	✔️	Reloads the server's MOTD.
/ClearCreatorObjects	/clearcreatorobjects	+Permission=clearcreatorobjects	✔️	Removes and refunds all placed Creator Mode Objects on the server.
/LoadCreatorMode [SaveName]	/loadcreatormode rockworld	+Permission=loadcreatormode	✔️	Loads the saved Creator Mode data from the specified save slot.
/SaveCreatorMode [SaveName]	/savecreatormode rockworld	+Permission=savecreatormode	✔️	Saves the Creator Mode data to the specified save slot.
/ResetCreatorMode	/resetcreatormode	+Permission=resetcreatormode	✔️	Resets Creator Mode Objects to their default, removing placed objects and changing map objects to their original state.
/RemoveCreatorMode [SaveName]	/removecreatormode rockworld	+Permission=removecreatormode	✔️	Removes the Creator Move data from the specified save slot.
/ListCreatorMode	/listcreatormode	+Permission=listcreatormode	✔️	Lists the saved Creator Mode saves.
/ReplenishCreatorMode	/replenishcreatormode	+Permission=replenishcreatormode	✔️	Replenishes all items on the map, excluding water.
/SkipShed [Username]	/skipshed mike	+Permission=skipshed	✔️	Instantly completes yours or the specified player's shedding.
/GiveQuest [user/AGID] [questname]	/givequest mike Collect Mushrooms	+Permission=givequest	✔️	Assigns the specified quest to that player.
/CompleteQuest [user/AGID] [questname]	/completequest mike Collect Mushrooms	+Permission=completequest	❌	Completes the user's current quest or the specified quest if the name is provided.
/EditQuests [user/AGID]	/editquests mike	+Permission=editquests	❌	Edit the player's quests.
/SetWound [Username] [Category] [Value]	/setwound mike headleft 1	+Permission=setwound	❌	Sets a cosmetic wound.
/SetPermaWound [Username] [Category] [Value]	/setpermawound mike headleft 1	+Permission=setpermawound	❌	Sets a permanent cosmetic wound.
/ClearEffects	/cleareffects	+Permission=cleareffects	❌	Clear all effects on the current character.
/ClearCooldowns	/clearcooldowns	+Permission=clearcooldowns	❌	Clear all ability cooldowns on the current character.
/SystemMessage [user/AGID] [message]	/systemmessage mike Hello there	+Permission=systemmessage	✔️	Sends a message to the specified player in the System channel.
/SystemMessageAll [message]	/systemmessageall Hello there	+Permission=systemmessageall	✔️	Sends a message to all the players in the System channel.
/ServerInfo	/serverinfo	+Permission=serverinfo	✔️	Shows information about the server such as time of day, weather, guid, and the name.
/SpawnCritter [crittername] [amount]	/spawncritter Ocypode 25	+Permission=spawncritters	❌	Spawns critters with the provided name and amount. If ran without arguments, it shows a list of critters available. Critter names support incomplete names as long as it matches no more than 1 critter.
Nesting Commands
Commands related to nesting, constructing nests, and nest management.

Chat Command:	Example:	Permissions:	RCON Support:	Action:
/ReplenishNest	/ReplenishNest	+Permission=replenishnest	❌	Fills your nest with resources and baby slots.
/SetNestHealth [Percent]	/SetNestHealth 0.5	+Permission=setnesthealth	❌	Sets your nest's health to the specified percentage. Will adjust resources to match it.
/SetNestSlots [Slots]	/SetNestSlots 2	+Permission=setnestslots	❌	Sets your nest's baby slots to the specified amount.
/GetNestResource [Resource]	/GetNestResource Mud	+Permission=getnestresource	❌	Displays your nest's named resource value as a percentage.
/SetNestResource [Resource] [Percent]	/SetNestResource Food 0.7	+Permission=setnestresource	❌	Sets your nest's named resource to the specified percentage. Works with any named resource, food or water.
/GotoNest	/GotoNest	+Permission=gotonest	❌	Teleports you to your nest.