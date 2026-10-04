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

export interface ConfigKey {
  key: string;
  meaning: string;
}

export interface MapCommand {
  command: string;
  description: string;
}

export interface CommandGroup {
  title: string;
  commands: MapCommand[];
}

export const islaSolara = {
  name: 'Isla Solara',
  tagline: 'A Path of Titans mod map with living tides, storm floods, and server-controlled weather.',
  description:
    'Isla Solara is a TitanTech mod map built around water. The sea rises and falls with the in-game day, storms can push a flood across the lowlands, and admins can steer the weather mix from inside the game. Everything is tunable from Game.ini.',

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

  configIntro:
    "Everything the mod reads from the server's Game.ini, all in one section. Missing keys keep the map defaults, and the file is read once at server start.",

  gameIni: `[IslaSolara.Tides]
; --- tides ---
DefaultTide=auto
TideRangeCm=250
TidesPerDay=2
TidePhaseDeg=0

; --- flood event ---
FloodEnabled=true
FloodHeightCm=1000
FloodChancePercent=25
FloodRiseSeconds=180
FloodHoldSeconds=480
FloodDrainSeconds=300
FloodWarnSeconds=60
FloodMinGapMinutes=120`,

  configKeys: [
    { key: 'DefaultTide', meaning: 'auto follows the game day; high or low holds at the range limit; a number holds at that offset in cm. 0 switches tides off.' },
    { key: 'TideRangeCm', meaning: 'Swing each way from normal sea level, cm.' },
    { key: 'TidesPerDay', meaning: 'High tides per in-game day.' },
    { key: 'TidePhaseDeg', meaning: 'Shifts the schedule. 90 moves the highs from 3:00 and 15:00 to 0:00 and 12:00.' },
    { key: 'FloodEnabled', meaning: 'false disables storm floods. Admins can still start one with /flood start.' },
    { key: 'FloodHeightCm', meaning: 'Flood peak above the current tide, cm.' },
    { key: 'FloodChancePercent', meaning: 'Chance rolled each time a storm begins.' },
    { key: 'FloodRiseSeconds', meaning: 'Time from normal to peak.' },
    { key: 'FloodHoldSeconds', meaning: 'Time held at peak.' },
    { key: 'FloodDrainSeconds', meaning: 'Time back to normal.' },
    { key: 'FloodWarnSeconds', meaning: 'Delay between the warning announcement and the rise.' },
    { key: 'FloodMinGapMinutes', meaning: 'Minimum time between floods.' },
  ] as ConfigKey[],

  /** Commands.ini snippet that grants access to the admin commands. */
  permissionIntro:
    'The admin commands need a permission in Commands.ini. Add the line below to whichever role should be able to use them.',
  permissionIni: `[Role:Moderator]
+Permission=calluds`,

  commandGroups: [
    {
      title: 'Weather',
      commands: [
        { command: '/callUDS', description: 'Opens the weather mix panel: one slider per weather type, Apply and Close. Also shows the current tide line.' },
        { command: '/setweathermix <Clear> <Fog> <Overcast> <Cloudy> <Rain> <Storm> <Snow>', description: 'Sets the seven weights directly, e.g. /setweathermix 60 5 10 20 20 10 0. Higher weight, more likely. The server re-rolls every 8 to 18 minutes and right after a change.' },
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
        { command: '/tide hold <cm>', description: 'Hold at any offset, e.g. /tide hold 120 or /tide hold 0 to switch tides off.' },
        { command: '/tide range <cm>', description: 'Change the swing each way.' },
        { command: '/tide perday <n>', description: 'Tides per in-game day.' },
      ],
    },
    {
      title: 'Flood',
      commands: [
        { command: '/flood', description: 'Status: whether a flood is running, storm floods on or off, height, chance.' },
        { command: '/flood start', description: 'Start a flood now at the configured height.' },
        { command: '/flood start <cm>', description: 'Start one at a specific height, e.g. /flood start 400.' },
        { command: '/flood stop', description: 'End the current flood. The water glides back to the tide.' },
        { command: '/flood chance <percent>', description: 'Chance rolled each time a storm begins.' },
        { command: '/flood height <cm>', description: 'Default flood height.' },
      ],
    },
  ] as CommandGroup[],

  commandsNote:
    'Changes made with these commands last until the server restarts. Game.ini sets the defaults that apply on every boot.',
  testingTip:
    'A useful testing combo: /flood chance 100 then /setweathermix 0 0 0 0 0 100 0 forces a storm, and the next storm start triggers a flood.',
};
