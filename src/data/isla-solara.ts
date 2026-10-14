/**
 * Isla Solara map page content.
 *
 * To add media: drop files into public/images/isla-solara/ or public/videos/isla-solara/
 * and add an entry to `images` or `videos` below. Everything else on the page is
 * driven from this file too, so config keys and commands can be edited here.
 */

export interface MapImage {
  /** Path under /public, e.g. "/images/isla-solara/bay.jpg" */
  src: string;
  alt: string;
  caption?: string;
}

export interface MapVideo {
  /** Path under /public, e.g. "/videos/isla-solara/flood.mp4" */
  src: string;
  title: string;
  /** Optional poster image shown before playback */
  poster?: string;
  caption?: string;
}

export interface ComparisonSet {
  title: string;
  subtitle?: string;
  images: MapImage[];
}

export interface ConfigKey {
  key: string;
  meaning: string;
  /** Game.ini section the key belongs to. Rendered as a divider row in the table. */
  section: string;
}

export interface MapCommand {
  command: string;
  description: string;
}

export interface PlayerKey {
  key: string;
  description: string;
}

export interface CommandGroup {
  title: string;
  commands: MapCommand[];
}

export const islaSolara = {
  name: 'Isla Solara',
  tagline:
    'A Path of Titans mod map with living tides, storm floods, lightning strikes, earthquakes, and server-controlled weather.',
  description:
    'Isla Solara is a TitanTech mod map built around water and weather. The sea rises and falls with the in-game day, storms can push a flood across the lowlands and hurl lightning at the ground, tremors shake the whole island, and admins can steer the weather mix from inside the game. Everything is tunable from Game.ini.',

  /** Optional hero image shown behind the title. Leave undefined for the gradient backdrop. */
  hero: '/images/isla-solara/beach-clear.jpg' as string | undefined,

  highlights: [
    {
      title: 'Living tides',
      description: 'Sea level swings with the game day. Set the range, how many tides per day, and when the highs land.',
    },
    {
      title: 'Storm floods',
      description: 'Storms roll a chance to flood. The water rises, holds at its peak, then drains back to the tide.',
    },
    {
      title: 'Lightning strikes',
      description: "During storms, bolts hit the ground near you: a flash, a crack of thunder, a shove, some damage and a daze. Don't stand in the open.",
    },
    {
      title: 'Earthquakes',
      description: 'Random tremors with a 10 second warning. The ground shakes and everyone is staggered and dazed until it passes.',
    },
    {
      title: 'Weather control',
      description: 'Admins weight the seven weather types from an in-game panel or a single command.',
    },
  ],

  images: [
    { src: '/images/isla-solara/island-overview.jpg', alt: 'Aerial view of the whole Isla Solara island', caption: 'The island from above' },
    { src: '/images/isla-solara/highlands.jpg', alt: 'Rolling highlands and inland valleys of Isla Solara', caption: 'Highlands and inland valleys' },
    { src: '/images/isla-solara/weather-mix-panel.jpg', alt: 'The in-game Isla Solara weather mix panel with seven sliders', caption: 'Weather mix panel (/callUDS)' },
    { src: '/images/isla-solara/snow-storm.jpg', alt: 'A dinosaur on a snow-covered beach during a blizzard', caption: 'Snow on the beach' },
    { src: '/images/isla-solara/beach-clear.jpg', alt: 'A dinosaur on a sunny beach lined with palm trees', caption: 'Clear skies on the beach' },
    { src: '/images/isla-solara/lightning-storm.jpg', alt: 'Lightning striking near the shore during a storm', caption: 'Storm rolling in' },
    { src: '/images/isla-solara/shell-beach.jpg', alt: 'A pterosaur perched on cliffs above Shell Beach', caption: 'Shell Beach from the cliffs' },
    { src: '/images/isla-solara/heron-marsh.jpg', alt: 'Swimming through the misty waters of Heron Marsh', caption: 'Heron Marsh at water level' },
    { src: '/images/isla-solara/heron-marsh-flight.jpg', alt: 'A pterosaur gliding over the Heron Marsh canopy', caption: 'Gliding over Heron Marsh' },
    { src: '/images/isla-solara/underwater-reef.jpg', alt: "Diving over the reef beneath Isla Solara's waters", caption: 'Beneath the surface' },
  ] as MapImage[],

  videos: [
    {
      src: '/videos/isla-solara/flood-demo.mp4',
      title: 'Storm flood in action',
      poster: '/images/isla-solara/lightning-storm.jpg',
      caption: 'The /flood start command: the water rises to the configured height, holds, then drains back to the tide.',
    },
  ] as MapVideo[],

  /** Labeled image sets that show the island under different conditions. */
  comparisons: [
    {
      title: 'Skies and weather',
      subtitle: 'The same island under different weather mixes and times of day.',
      images: [
        { src: '/images/isla-solara/clear-sky.jpg', alt: 'Blue sky with white cumulus clouds over Isla Solara', caption: 'Clear' },
        { src: '/images/isla-solara/sunset-sky.jpg', alt: 'Pink and purple haze over clouds at dusk', caption: 'Old Clouds' },
        { src: '/images/isla-solara/thunder-peak-overcast.jpg', alt: 'Heavy grey clouds rolling over Thunder Peak', caption: 'Overcast at Thunder Peak' },
        { src: '/images/isla-solara/aurora-green.jpg', alt: 'Green aurora curtains beneath the moon', caption: 'Aurora: green under the moon' },
        { src: '/images/isla-solara/aurora-pink.jpg', alt: 'Pink and blue aurora ribbons in a starry sky', caption: 'Aurora: pink and blue' },
      ],
    },
    {
      title: 'After dark',
      subtitle: 'Night on Isla Solara has its own light.',
      images: [
        { src: '/images/isla-solara/glowing-pond.jpg', alt: 'A bioluminescent pond with giant lily pads at night', caption: 'Bioluminescent lily pond' },
        { src: '/images/isla-solara/glowing-plant.jpg', alt: 'A pterosaur beside a glowing plant on the beach', caption: 'Glowing plant on the shore' },
        { src: '/images/isla-solara/night-feeding.jpg', alt: 'A pterosaur pulling a fish from a hollow log on a dark beach', caption: 'Fishing from a hollow log' },
      ],
    },
  ] as ComparisonSet[],

  configIntro:
    "Everything the mod reads from the server's Game.ini. Tides and floods live under one section, lightning and earthquakes under another, and world toggles under a third. Missing keys keep the map defaults, and the file is read once at server start.",

  gameIni: `[IslaSolara.Tides]
; --- tides ---
DefaultTide=auto          ; auto | high | low | <cm offset>  (0 = tides off)
TideRangeCm=250           ; swing each way from normal sea level
TidesPerDay=2             ; high tides per in-game day
TidePhaseDeg=0            ; shifts the schedule (90 moves highs to 0:00 and 12:00)

; --- flood event ---
FloodEnabled=true
FloodHeightCm=2000        ; peak above the tide; 2000 = 20 m (about half the island). Max 10000 (100 m)
FloodChancePercent=25     ; rolled each time a storm begins
FloodRiseSeconds=180
FloodHoldSeconds=480
FloodDrainSeconds=300
FloodWarnSeconds=60       ; warning announcement before the rise
FloodMinGapMinutes=120    ; minimum time between floods

[IslaSolara.Disasters]
; --- lightning strikes (storms only) ---
StrikesEnabled=true
StrikeIntervalSeconds=12  ; how often the server rolls during a storm
StrikeChancePercent=40    ; chance per roll
StrikeRadiusCm=2500       ; bolt lands within this distance of a random player
StrikeHitRadiusCm=600     ; dinos within this distance of the bolt are hit
StrikeDamage=150          ; health taken, applied in hits of about 33
StrikeKnockback=1200
StrikeDaze=true

; --- earthquakes ---
QuakeEnabled=true
QuakeMinMinutes=90        ; random gap between quakes
QuakeMaxMinutes=240
QuakeDurationSeconds=25
QuakeWarnSeconds=10
QuakeKnockback=600        ; stagger strength
QuakeShakeScale=1         ; camera shake strength
QuakeDaze=true

[IslaSolara.World]
SkyIsland=1               ; 1 = floating island shown (default), 0 = hidden for everyone`,

  configKeys: [
    // Tides
    { section: '[IslaSolara.Tides]', key: 'DefaultTide', meaning: 'auto follows the game day; high or low holds at the range limit; a number holds at that offset in cm. 0 switches tides off.' },
    { section: '[IslaSolara.Tides]', key: 'TideRangeCm', meaning: 'Swing each way from normal sea level, cm.' },
    { section: '[IslaSolara.Tides]', key: 'TidesPerDay', meaning: 'High tides per in-game day.' },
    { section: '[IslaSolara.Tides]', key: 'TidePhaseDeg', meaning: 'Shifts the schedule. 90 moves the highs from 3:00 and 15:00 to 0:00 and 12:00.' },
    { section: '[IslaSolara.Tides]', key: 'FloodEnabled', meaning: 'false disables storm floods. Admins can still start one with /flood start.' },
    { section: '[IslaSolara.Tides]', key: 'FloodHeightCm', meaning: 'Flood peak above the current tide, cm. 2000 is 20 m and covers about half the island. Maximum 10000 (100 m).' },
    { section: '[IslaSolara.Tides]', key: 'FloodChancePercent', meaning: 'Chance rolled each time a storm begins.' },
    { section: '[IslaSolara.Tides]', key: 'FloodRiseSeconds', meaning: 'Time from normal to peak.' },
    { section: '[IslaSolara.Tides]', key: 'FloodHoldSeconds', meaning: 'Time held at peak.' },
    { section: '[IslaSolara.Tides]', key: 'FloodDrainSeconds', meaning: 'Time back to normal.' },
    { section: '[IslaSolara.Tides]', key: 'FloodWarnSeconds', meaning: 'Delay between the warning announcement and the rise.' },
    { section: '[IslaSolara.Tides]', key: 'FloodMinGapMinutes', meaning: 'Minimum time between floods.' },
    // Lightning strikes
    { section: '[IslaSolara.Disasters]', key: 'StrikesEnabled', meaning: 'false disables lightning strikes during storms. Admins can still fire one with /strike now.' },
    { section: '[IslaSolara.Disasters]', key: 'StrikeIntervalSeconds', meaning: 'How often the server rolls for a strike while a storm is running.' },
    { section: '[IslaSolara.Disasters]', key: 'StrikeChancePercent', meaning: 'Chance per roll.' },
    { section: '[IslaSolara.Disasters]', key: 'StrikeRadiusCm', meaning: 'The bolt lands within this distance of a random player.' },
    { section: '[IslaSolara.Disasters]', key: 'StrikeHitRadiusCm', meaning: 'Dinos within this distance of the bolt are hit.' },
    { section: '[IslaSolara.Disasters]', key: 'StrikeDamage', meaning: 'Health taken from each dino hit, applied in hits of about 33.' },
    { section: '[IslaSolara.Disasters]', key: 'StrikeKnockback', meaning: 'Strength of the shove when a bolt hits.' },
    { section: '[IslaSolara.Disasters]', key: 'StrikeDaze', meaning: 'false turns off the daze after a hit.' },
    // Earthquakes
    { section: '[IslaSolara.Disasters]', key: 'QuakeEnabled', meaning: 'false disables random earthquakes. Admins can still start one with /quake now.' },
    { section: '[IslaSolara.Disasters]', key: 'QuakeMinMinutes', meaning: 'Shortest gap between quakes. The next one is rolled between the min and max.' },
    { section: '[IslaSolara.Disasters]', key: 'QuakeMaxMinutes', meaning: 'Longest gap between quakes.' },
    { section: '[IslaSolara.Disasters]', key: 'QuakeDurationSeconds', meaning: 'How long the shaking lasts.' },
    { section: '[IslaSolara.Disasters]', key: 'QuakeWarnSeconds', meaning: 'Warning before the ground starts to shake.' },
    { section: '[IslaSolara.Disasters]', key: 'QuakeKnockback', meaning: 'Stagger strength while the quake runs.' },
    { section: '[IslaSolara.Disasters]', key: 'QuakeShakeScale', meaning: 'Camera shake strength. 1 is the default; higher is stronger.' },
    { section: '[IslaSolara.Disasters]', key: 'QuakeDaze', meaning: 'false turns off the daze during a quake.' },
    // World
    { section: '[IslaSolara.World]', key: 'SkyIsland', meaning: '0 hides the floating island, its rocks, pool, food and plants for every player from server start, with no collision left behind. 1 or missing keeps it. /skyisland changes it live.' },
  ] as ConfigKey[],

  /** Commands.ini snippet that grants access to the admin commands. */
  permissionIntro:
    'All of the admin commands below need one permission in Commands.ini. Add the line to whichever role should be able to use them.',
  permissionIni: `[Role:Moderator]
+Permission=calluds`,

  commandGroups: [
    {
      title: 'Weather',
      commands: [
        { command: '/callUDS', description: 'Opens the weather mix panel: one slider per weather type, Apply and Close. Also shows the current tide line.' },
        { command: '/setweathermix <Clear> <Fog> <Overcast> <Cloudy> <Rain> <Storm> <Snow>', description: "Sets the seven weights directly, e.g. /setweathermix 60 5 10 20 20 10 0. Higher weight, more likely. The server re-rolls every 8 to 18 minutes and right after a change. While a mix is active the game's own weather cycle is paused. Rain and storms from the mix wet you like natural weather." },
        { command: '/setweathermix auto', description: "Hands weather back to the game's own cycle." },
      ],
    },
    {
      title: 'Tides',
      commands: [
        { command: '/tide', description: 'Status: current offset in cm, mode, range, tides per day.' },
        { command: '/tide auto', description: 'Follow the game day.' },
        { command: '/tide high', description: 'Hold the sea at the top of the range.' },
        { command: '/tide low', description: 'Hold it at the bottom.' },
        { command: '/tide hold <cm>', description: 'Hold at any offset, e.g. /tide hold 120, or /tide hold 0 to switch tides off.' },
        { command: '/tide range <cm>', description: 'Change the swing each way.' },
        { command: '/tide perday <n>', description: 'Tides per in-game day.' },
      ],
    },
    {
      title: 'Flood',
      commands: [
        { command: '/flood', description: 'Status: whether a flood is running, storm floods on or off, height, chance, rise, hold and drain times.' },
        { command: '/flood start', description: 'Start a flood now at the configured height.' },
        { command: '/flood start <cm>', description: 'Start one at a specific height, e.g. /flood start 400. Capped at 10000.' },
        { command: '/flood stop', description: 'End the current flood. The water glides back to the tide.' },
        { command: '/flood chance <percent>', description: 'Chance rolled each time a storm begins.' },
        { command: '/flood height <cm>', description: 'Default flood height. Capped at 10000.' },
        { command: '/flood rise <seconds>', description: 'How long the next flood takes to rise.' },
        { command: '/flood hold <seconds>', description: 'How long it stays at the peak.' },
        { command: '/flood drain <seconds>', description: 'How long it takes to drain. A flood already running keeps its own times.' },
      ],
    },
    {
      title: 'Sky island',
      commands: [
        { command: '/skyisland', description: 'Status: shown or hidden.' },
        { command: '/skyisland on', description: 'Show the floating island for everyone, within 5 seconds.' },
        { command: '/skyisland off', description: 'Hide it, and everything on it, for everyone. Players on it will fall.' },
      ],
    },
    {
      title: 'Lightning strikes',
      commands: [
        { command: '/strike', description: 'Status.' },
        { command: '/strike now', description: 'Fire a bolt right now, 8 m in front of you, storm or not.' },
        { command: '/strike on', description: 'Enable storm lightning strikes.' },
        { command: '/strike off', description: 'Disable them. /strike now still works.' },
        { command: '/strike chance <percent>', description: 'Chance per roll during a storm.' },
        { command: '/strike damage <hp>', description: 'Health taken from each dino hit.' },
        { command: '/strike interval <seconds>', description: 'How often the server rolls during a storm.' },
        { command: '/strike dazeon', description: 'Hits daze the dino.' },
        { command: '/strike dazeoff', description: 'Hits shove and damage only.' },
      ],
    },
    {
      title: 'Earthquakes',
      commands: [
        { command: '/quake', description: 'Status.' },
        { command: '/quake now', description: 'Start a quake right now, after the usual warning.' },
        { command: '/quake on', description: 'Enable random earthquakes.' },
        { command: '/quake off', description: 'Disable them. /quake now still works.' },
        { command: '/quake duration <seconds>', description: 'How long the shaking lasts.' },
        { command: '/quake min <minutes>', description: 'Shortest gap between random quakes.' },
        { command: '/quake max <minutes>', description: 'Longest gap between random quakes.' },
        { command: '/quake dazeon', description: 'Everyone is dazed until the quake passes.' },
        { command: '/quake dazeoff', description: 'Stagger only, no daze.' },
      ],
    },
  ] as CommandGroup[],

  /** Keys every player can use. No Commands.ini permission involved. */
  playerKeys: {
    intro: 'Two keys work for every player with no permission needed.',
    keys: [
      { key: 'L', description: 'Highlights food and corpses within 100 m in green for 10 seconds, through terrain.' },
      { key: 'K', description: 'Highlights what your active quests want, and quest pickups, in blue for 10 seconds.' },
    ] as PlayerKey[],
    note: 'Each key has its own one-minute cooldown. Players can rebind them in their own GameUserSettings.ini under [IslaSolara.Client]: FoodHighlightKey, FoodHighlightQuestKey, FoodHighlightRadiusCm, FoodHighlightSeconds, FoodHighlightCooldownSeconds.',
  },

  commandsNote:
    'Changes made with these commands last until the server restarts. Game.ini sets the defaults that apply on every boot.',
  testingTip:
    'A useful testing combo: /flood chance 100 then /setweathermix 0 0 0 0 0 100 0 forces a storm, and the next storm start triggers a flood. The same storm will start rolling for lightning strikes.',
};
