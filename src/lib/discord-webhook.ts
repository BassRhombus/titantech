const FILE_TYPE_COLORS: Record<string, number> = {
  'Game.ini': 0x00cfff,
  'Commands.ini': 0xd94fcb,
  'Rules.txt': 0x4caf50,
  'MOTD.txt': 0xff9800,
};

const FILE_TYPE_GENERATORS: Record<string, string> = {
  'Game.ini': 'Game.ini Generator',
  'Commands.ini': 'Commands.ini Generator',
  'Rules.txt': 'Rules/MOTD Generator',
  'MOTD.txt': 'Rules/MOTD Generator',
  'GameUserSettings.ini': 'Mod Manager',
};

export async function sendGeneratorWebhook(
  fileType: string,
  changedSettingsCount: number,
  timestamp: string | number
): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return false;

  const color = FILE_TYPE_COLORS[fileType] || 0x0a51c2;
  const generatorName = FILE_TYPE_GENERATORS[fileType] || 'TitanTech Generator';
  const isTextFile = fileType.includes('.txt');
  const ts = new Date(timestamp);

  const payload = {
    embeds: [
      {
        title: `${fileType} Generated`,
        description: `A user has generated a ${fileType} file using the TitanTech generator.`,
        color,
        fields: [
          {
            name: isTextFile ? 'Lines' : 'Settings Changed',
            value: isTextFile ? `${changedSettingsCount} lines` : `${changedSettingsCount} setting(s) modified`,
            inline: true,
          },
          {
            name: 'Generated At',
            value: ts.toLocaleString(),
            inline: true,
          },
          {
            name: 'Generator',
            value: generatorName,
            inline: false,
          },
        ],
        footer: { text: 'TitanTech' },
        timestamp: ts.toISOString(),
      },
    ],
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.status === 200 || res.status === 204;
  } catch {
    console.error('Failed to send Discord webhook');
    return false;
  }
}

export async function sendEventWebhook(event: {
  title: string;
  description: string;
  dateTime: string;
  category: string;
  serverName?: string | null;
  creatorName: string;
}): Promise<boolean> {
  const webhookUrl = process.env.DISCORD_EVENTS_WEBHOOK_URL;
  if (!webhookUrl) return false;

  const payload = {
    embeds: [
      {
        title: `New Event: ${event.title}`,
        description: event.description.substring(0, 200) + (event.description.length > 200 ? '...' : ''),
        color: 0x0a51c2,
        fields: [
          { name: 'Date', value: new Date(event.dateTime).toLocaleString(), inline: true },
          { name: 'Category', value: event.category, inline: true },
          { name: 'Server', value: event.serverName || 'Any', inline: true },
          { name: 'Created By', value: event.creatorName, inline: false },
        ],
        footer: { text: 'TitanTech Events' },
        timestamp: new Date().toISOString(),
      },
    ],
  };

  try {
    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.status === 200 || res.status === 204;
  } catch {
    console.error('Failed to send events Discord webhook');
    return false;
  }
}
