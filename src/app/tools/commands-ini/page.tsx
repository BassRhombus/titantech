'use client';

import { useState, useMemo, useRef } from 'react';
import {
  Terminal, Plus, Download, Upload, Copy, Trash2, Edit, Search, ChevronDown,
  ChevronUp, Key, Users, RotateCcw, Palette,
} from 'lucide-react';
import { permissionsList, allPermissionIds } from '@/data/permissions-list';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { ProfileManager } from '@/components/generators/ProfileManager';
import { useCallback } from 'react';

interface RoleColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface Role {
  name: string;
  chatColor: RoleColor;
  overrideAdminChatColor: boolean;
  reservedSlot: boolean;
  hierarchy: number;
  creatorModeAccess: boolean;
  allowSpectatorAccess: boolean;
  permissions: string[];
}

interface PlayerRole {
  agid: string;
  role: string;
}

const TEMPLATES: Record<string, Partial<Role>> = {
  admin: {
    name: 'Admin',
    chatColor: { r: 255, g: 0, b: 0, a: 1 },
    overrideAdminChatColor: true,
    reservedSlot: true,
    creatorModeAccess: true,
    allowSpectatorAccess: true,
    permissions: [...allPermissionIds],
  },
  moderator: {
    name: 'Moderator',
    chatColor: { r: 0, g: 150, b: 255, a: 1 },
    overrideAdminChatColor: true,
    reservedSlot: true,
    creatorModeAccess: false,
    allowSpectatorAccess: true,
    permissions: ['announce', 'ban', 'kick', 'servermute', 'serverunmute', 'playerinfo', 'heal', 'teleport', 'clearbodies'],
  },
  vip: {
    name: 'VIP',
    chatColor: { r: 255, g: 215, b: 0, a: 1 },
    overrideAdminChatColor: true,
    reservedSlot: true,
    creatorModeAccess: false,
    allowSpectatorAccess: false,
    permissions: [],
  },
};

function rgbToHex(r: number, g: number, b: number) {
  const h = (n: number) => n.toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

function hexToRgb(hex: string) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) } : null;
}

export default function CommandsIniPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [playerRoles, setPlayerRoles] = useState<PlayerRole[]>([]);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingPlayerIndex, setEditingPlayerIndex] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [permSearch, setPermSearch] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Role form state
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState<RoleColor>({ r: 255, g: 255, b: 255, a: 1 });
  const [formOverrideChat, setFormOverrideChat] = useState(true);
  const [formReserved, setFormReserved] = useState(false);
  const [formHierarchy, setFormHierarchy] = useState(1);
  const [formCreatorMode, setFormCreatorMode] = useState(false);
  const [formSpectator, setFormSpectator] = useState(false);
  const [formPerms, setFormPerms] = useState<Set<string>>(new Set());

  // Player form state
  const [playerAgid, setPlayerAgid] = useState('');
  const [playerRole, setPlayerRole] = useState('');

  function openRoleModal(index: number | null = null) {
    setEditingIndex(index);
    setPermSearch('');
    if (index !== null && roles[index]) {
      const r = roles[index];
      setFormName(r.name);
      setFormColor(r.chatColor);
      setFormOverrideChat(r.overrideAdminChatColor);
      setFormReserved(r.reservedSlot);
      setFormHierarchy(r.hierarchy);
      setFormCreatorMode(r.creatorModeAccess);
      setFormSpectator(r.allowSpectatorAccess);
      setFormPerms(new Set(r.permissions));
    } else {
      const nextH = roles.length > 0 ? Math.max(...roles.map((r) => r.hierarchy)) + 1 : 1;
      setFormName('');
      setFormColor({ r: 255, g: 255, b: 255, a: 1 });
      setFormOverrideChat(true);
      setFormReserved(false);
      setFormHierarchy(nextH);
      setFormCreatorMode(false);
      setFormSpectator(false);
      setFormPerms(new Set());
    }
    setShowRoleModal(true);
  }

  function loadTemplate(type: string) {
    const t = TEMPLATES[type];
    if (!t) return;
    const nextH = roles.length > 0 ? Math.max(...roles.map((r) => r.hierarchy)) + 1 : 1;
    setFormName(t.name || '');
    setFormColor(t.chatColor || { r: 255, g: 255, b: 255, a: 1 });
    setFormOverrideChat(t.overrideAdminChatColor ?? true);
    setFormReserved(t.reservedSlot ?? false);
    setFormHierarchy(nextH);
    setFormCreatorMode(t.creatorModeAccess ?? false);
    setFormSpectator(t.allowSpectatorAccess ?? false);
    setFormPerms(new Set(t.permissions || []));
  }

  function saveRole() {
    if (!formName.trim()) return;
    const role: Role = {
      name: formName.trim(),
      chatColor: formColor,
      overrideAdminChatColor: formOverrideChat,
      reservedSlot: formReserved,
      hierarchy: Math.max(1, formHierarchy),
      creatorModeAccess: formCreatorMode,
      allowSpectatorAccess: formSpectator,
      permissions: Array.from(formPerms),
    };
    if (editingIndex !== null) {
      setRoles((prev) => prev.map((r, i) => (i === editingIndex ? role : r)));
    } else {
      setRoles((prev) => [...prev, role]);
    }
    setShowRoleModal(false);
  }

  function deleteRole(index: number) {
    if (!confirm(`Delete role "${roles[index].name}"?`)) return;
    setRoles((prev) => prev.filter((_, i) => i !== index));
  }

  function openPlayerModal(index: number | null = null) {
    setEditingPlayerIndex(index);
    if (index !== null && playerRoles[index]) {
      setPlayerAgid(playerRoles[index].agid);
      setPlayerRole(playerRoles[index].role);
    } else {
      setPlayerAgid('');
      setPlayerRole('');
    }
    setShowPlayerModal(true);
  }

  function savePlayer() {
    if (!/^\d{3}-\d{3}-\d{3}$/.test(playerAgid)) {
      alert('Invalid AGID format. Use XXX-XXX-XXX');
      return;
    }
    if (!playerRole) {
      alert('Please select a role');
      return;
    }
    const p = { agid: playerAgid, role: playerRole };
    if (editingPlayerIndex !== null) {
      setPlayerRoles((prev) => prev.map((pr, i) => (i === editingPlayerIndex ? p : pr)));
    } else {
      setPlayerRoles((prev) => [...prev, p]);
    }
    setShowPlayerModal(false);
  }

  function generateConfigString(): string {
    if (roles.length === 0 && playerRoles.length === 0) {
      return '; No roles created yet\n; Add roles using the "Add New Role" button';
    }
    let output = '';
    roles
      .slice()
      .sort((a, b) => b.hierarchy - a.hierarchy)
      .forEach((role) => {
        output += `[Role:${role.name}]\n`;
        output += `ChatColor=(R=${role.chatColor.r},G=${role.chatColor.g},B=${role.chatColor.b},A=${role.chatColor.a})\n`;
        output += `OverrideAdminChatColor=${role.overrideAdminChatColor ? 'True' : 'False'}\n`;
        if (role.reservedSlot) output += `ReservedSlot=True\n`;
        output += `Hierarchy=${role.hierarchy}\n`;
        if (role.creatorModeAccess) output += `CreatorModeAccess=True\n`;
        if (role.allowSpectatorAccess) output += `AllowSpectatorAccess=True\n`;
        role.permissions.forEach((p) => {
          output += `+Permission=${p}\n`;
        });
        output += '\n';
      });
    if (playerRoles.length > 0) {
      output += '[PlayerRoles]\n';
      playerRoles.forEach((p) => {
        output += `${p.agid}=${p.role}\n`;
      });
    }
    return output.trim();
  }

  async function handleDownload() {
    const content = generateConfigString();
    try {
      await fetch('/api/webhooks/generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileType: 'Commands.ini',
          changedSettingsCount: roles.length,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch {}
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Commands.ini';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleCopy() {
    navigator.clipboard.writeText(generateConfigString());
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => parseCommandsIni(ev.target?.result as string);
    reader.readAsText(file);
    e.target.value = '';
  }

  function parseCommandsIni(content: string) {
    const newRoles: Role[] = [];
    const newPlayers: PlayerRole[] = [];
    const lines = content.split('\n');
    let current: Role | null = null;
    let inPlayerRoles = false;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith(';')) continue;

      if (line === '[PlayerRoles]') {
        if (current) newRoles.push(current);
        current = null;
        inPlayerRoles = true;
        continue;
      }
      if (inPlayerRoles) {
        const m = line.match(/^(\d{3}-\d{3}-\d{3})=(.+)$/);
        if (m) newPlayers.push({ agid: m[1], role: m[2] });
        continue;
      }
      const roleMatch = line.match(/^\[Role:(.+)\]$/);
      if (roleMatch) {
        if (current) newRoles.push(current);
        current = {
          name: roleMatch[1],
          chatColor: { r: 255, g: 255, b: 255, a: 1 },
          overrideAdminChatColor: false,
          reservedSlot: false,
          hierarchy: 0,
          creatorModeAccess: false,
          allowSpectatorAccess: false,
          permissions: [],
        };
        continue;
      }
      if (!current) continue;

      const colorM = line.match(/ChatColor=\(R=(\d+),G=(\d+),B=(\d+),A=([\d.]+)\)/);
      if (colorM) {
        current.chatColor = { r: +colorM[1], g: +colorM[2], b: +colorM[3], a: 1 };
      } else if (line.startsWith('OverrideAdminChatColor=')) {
        current.overrideAdminChatColor = line.includes('True');
      } else if (line.startsWith('ReservedSlot=')) {
        current.reservedSlot = line.includes('True');
      } else if (line.startsWith('CreatorModeAccess=')) {
        current.creatorModeAccess = line.includes('True');
      } else if (line.startsWith('AllowSpectatorAccess=')) {
        current.allowSpectatorAccess = line.includes('True');
      } else if (line.startsWith('Hierarchy=')) {
        current.hierarchy = parseInt(line.split('=')[1]) || 0;
      } else if (line.startsWith('+Permission=')) {
        current.permissions.push(line.split('=')[1]);
      }
    }
    if (current) newRoles.push(current);
    setRoles(newRoles);
    setPlayerRoles(newPlayers);
  }

  function handleReset() {
    if (!confirm('Reset all roles and player assignments?')) return;
    setRoles([]);
    setPlayerRoles([]);
  }

  const getProfileData = useCallback(() => ({
    roles,
    playerRoles,
  }), [roles, playerRoles]);

  const loadProfileData = useCallback((data: Record<string, unknown>) => {
    if (Array.isArray(data.roles)) setRoles(data.roles as Role[]);
    if (Array.isArray(data.playerRoles)) setPlayerRoles(data.playerRoles as PlayerRole[]);
  }, []);

  const sortedRoles = useMemo(
    () => roles.slice().sort((a, b) => b.hierarchy - a.hierarchy),
    [roles]
  );

  const filteredPerms = useMemo(() => {
    const result: Record<string, typeof permissionsList[string]> = {};
    for (const [cat, perms] of Object.entries(permissionsList)) {
      const f = permSearch
        ? perms.filter(
            (p) =>
              p.name.toLowerCase().includes(permSearch.toLowerCase()) ||
              p.description.toLowerCase().includes(permSearch.toLowerCase())
          )
        : perms;
      if (f.length > 0) result[cat] = f;
    }
    return result;
  }, [permSearch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-primary-light mb-2">
          <Terminal size={28} />
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold mb-2">Commands.ini Generator</h1>
        <p className="text-text-secondary">
          Create server roles with permissions, colors, and player assignments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roles & Players */}
        <div className="lg:col-span-2 space-y-6">
          {/* Roles Section */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
                <Key size={20} className="text-primary-light" />
                Roles ({roles.length})
              </h2>
              <button onClick={() => openRoleModal()} className="btn-primary flex items-center gap-1.5 text-sm">
                <Plus size={16} /> Add Role
              </button>
            </div>

            {sortedRoles.length > 0 ? (
              <div className="space-y-3">
                {sortedRoles.map((role) => {
                  const origIndex = roles.indexOf(role);
                  return (
                    <div key={origIndex} className="flex items-center gap-3 p-3 rounded-lg bg-surface/50">
                      <div
                        className="w-5 h-5 rounded-full shrink-0 border border-divider"
                        style={{ backgroundColor: `rgb(${role.chatColor.r},${role.chatColor.g},${role.chatColor.b})` }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text-primary text-sm">{role.name}</p>
                        <div className="flex items-center gap-2 flex-wrap mt-0.5">
                          <span className="text-xs text-text-secondary">H:{role.hierarchy}</span>
                          <span className="text-xs text-text-secondary">{role.permissions.length} perms</span>
                          {role.reservedSlot && <span className="text-[10px] bg-primary/10 text-primary-light px-1.5 py-0.5 rounded">Slot</span>}
                          {role.creatorModeAccess && <span className="text-[10px] bg-accent/10 text-accent-light px-1.5 py-0.5 rounded">Creator</span>}
                        </div>
                      </div>
                      <button onClick={() => openRoleModal(origIndex)} className="p-1.5 text-text-secondary hover:text-text-primary transition-colors">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => deleteRole(origIndex)} className="p-1.5 text-text-secondary hover:text-error transition-colors">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-text-secondary text-sm text-center py-8">No roles created yet. Click &quot;Add Role&quot; to get started.</p>
            )}
          </div>

          {/* Player Assignments */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-semibold text-lg flex items-center gap-2">
                <Users size={20} className="text-secondary-light" />
                Player Roles ({playerRoles.length})
              </h2>
              <button
                onClick={() => openPlayerModal()}
                disabled={roles.length === 0}
                className="btn-primary flex items-center gap-1.5 text-sm disabled:opacity-50"
              >
                <Plus size={16} /> Add Player
              </button>
            </div>

            {playerRoles.length > 0 ? (
              <div className="space-y-2">
                {playerRoles.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface/50">
                    <div>
                      <code className="text-sm font-mono text-text-primary">{p.agid}</code>
                      <span className="text-xs text-text-secondary ml-2">→ {p.role}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openPlayerModal(i)} className="p-1.5 text-text-secondary hover:text-text-primary transition-colors">
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => setPlayerRoles((prev) => prev.filter((_, j) => j !== i))}
                        className="p-1.5 text-text-secondary hover:text-error transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary text-sm text-center py-6">
                {roles.length === 0 ? 'Create roles first, then assign players.' : 'No players assigned yet.'}
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Actions */}
          <div className="card p-4 space-y-3">
            <h3 className="font-heading font-semibold text-sm">Actions</h3>
            <button onClick={handleDownload} disabled={roles.length === 0} className="btn-primary w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50">
              <Download size={16} /> Download Commands.ini
            </button>
            <button onClick={handleCopy} disabled={roles.length === 0} className="btn-outline w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50">
              <Copy size={16} /> Copy to Clipboard
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="btn-outline w-full flex items-center justify-center gap-2 text-sm">
              <Upload size={16} /> Upload INI
            </button>
            <button onClick={handleReset} className="btn-outline w-full flex items-center justify-center gap-2 text-sm text-error border-red-500/30 hover:bg-red-500/10">
              <RotateCcw size={16} /> Reset All
            </button>
            <input ref={fileInputRef} type="file" accept=".ini,.txt" onChange={handleUpload} className="hidden" />
          </div>

          {/* Profiles */}
          <ProfileManager
            generatorType="commands-ini"
            getCurrentData={getProfileData}
            onLoadData={loadProfileData}
          />

          {/* Templates */}
          <div className="card p-4 space-y-3">
            <h3 className="font-heading font-semibold text-sm">Quick Templates</h3>
            <p className="text-xs text-text-secondary">Load a template into the role form:</p>
            <div className="flex flex-wrap gap-2">
              {['admin', 'moderator', 'vip'].map((t) => (
                <button
                  key={t}
                  onClick={() => { openRoleModal(); setTimeout(() => loadTemplate(t), 0); }}
                  className="px-3 py-1.5 rounded-lg bg-surface text-text-secondary hover:text-text-primary text-xs capitalize transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="card overflow-hidden">
            <button onClick={() => setShowPreview(!showPreview)} className="w-full p-4 flex items-center justify-between text-left">
              <h3 className="font-heading font-semibold text-sm">Config Preview</h3>
              {showPreview ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showPreview && (
              <div className="px-4 pb-4">
                <pre className="bg-background rounded-lg p-3 text-xs font-mono text-text-secondary overflow-auto max-h-96 whitespace-pre-wrap">
                  {generateConfigString()}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Role Modal */}
      <Modal open={showRoleModal} onClose={() => setShowRoleModal(false)} title={editingIndex !== null ? 'Edit Role' : 'Add New Role'}>
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Role Name *</label>
            <input value={formName} onChange={(e) => setFormName(e.target.value)} className="input-field w-full" placeholder="e.g. Admin" />
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5 flex items-center gap-2">
              <Palette size={14} /> Chat Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={rgbToHex(formColor.r, formColor.g, formColor.b)}
                onChange={(e) => {
                  const rgb = hexToRgb(e.target.value);
                  if (rgb) setFormColor({ ...rgb, a: 1 });
                }}
                className="w-10 h-10 rounded cursor-pointer border border-divider"
              />
              <div className="flex gap-2">
                {(['r', 'g', 'b'] as const).map((c) => (
                  <div key={c} className="flex flex-col items-center">
                    <label className="text-[10px] text-text-secondary uppercase">{c}</label>
                    <input
                      type="number"
                      min={0}
                      max={255}
                      value={formColor[c]}
                      onChange={(e) => setFormColor((prev) => ({ ...prev, [c]: Math.min(255, Math.max(0, +e.target.value)) }))}
                      className="input-field w-16 text-center text-sm"
                    />
                  </div>
                ))}
              </div>
              <div className="w-8 h-8 rounded border border-divider" style={{ backgroundColor: `rgb(${formColor.r},${formColor.g},${formColor.b})` }} />
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={formOverrideChat} onChange={(e) => setFormOverrideChat(e.target.checked)} className="rounded border-divider" />
              Override Admin Chat
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={formReserved} onChange={(e) => setFormReserved(e.target.checked)} className="rounded border-divider" />
              Reserved Slot
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={formCreatorMode} onChange={(e) => setFormCreatorMode(e.target.checked)} className="rounded border-divider" />
              Creator Mode
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={formSpectator} onChange={(e) => setFormSpectator(e.target.checked)} className="rounded border-divider" />
              Spectator Access
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Hierarchy</label>
            <input type="number" min={1} value={formHierarchy} onChange={(e) => setFormHierarchy(+e.target.value)} className="input-field w-24" />
          </div>

          {/* Permissions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-text-primary">Permissions ({formPerms.size})</label>
              <div className="flex gap-2">
                <button onClick={() => setFormPerms(new Set(allPermissionIds))} className="text-xs text-primary-light hover:text-primary">All</button>
                <button onClick={() => setFormPerms(new Set())} className="text-xs text-text-secondary hover:text-text-primary">None</button>
              </div>
            </div>
            <div className="relative mb-2">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                value={permSearch}
                onChange={(e) => setPermSearch(e.target.value)}
                placeholder="Search permissions..."
                className="input-field pl-8 w-full text-sm"
              />
            </div>
            <div className="max-h-64 overflow-y-auto space-y-3 border border-divider rounded-lg p-3">
              {Object.entries(filteredPerms).map(([cat, perms]) => (
                <div key={cat}>
                  <label className="flex items-center gap-2 text-xs font-semibold text-text-primary mb-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={perms.every((p) => formPerms.has(p.id))}
                      onChange={(e) => {
                        setFormPerms((prev) => {
                          const next = new Set(prev);
                          perms.forEach((p) => { if (e.target.checked) next.add(p.id); else next.delete(p.id); });
                          return next;
                        });
                      }}
                      className="rounded border-divider"
                    />
                    {cat}
                  </label>
                  <div className="ml-5 space-y-0.5">
                    {perms.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 text-xs text-text-secondary cursor-pointer py-0.5">
                        <input
                          type="checkbox"
                          checked={formPerms.has(p.id)}
                          onChange={(e) => {
                            setFormPerms((prev) => {
                              const next = new Set(prev);
                              if (e.target.checked) next.add(p.id); else next.delete(p.id);
                              return next;
                            });
                          }}
                          className="rounded border-divider"
                        />
                        <span><strong>{p.name}</strong> — {p.description}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowRoleModal(false)} className="btn-outline">Cancel</button>
            <button onClick={saveRole} disabled={!formName.trim()} className="btn-primary disabled:opacity-50">Save Role</button>
          </div>
        </div>
      </Modal>

      {/* Player Modal */}
      <Modal open={showPlayerModal} onClose={() => setShowPlayerModal(false)} title={editingPlayerIndex !== null ? 'Edit Player' : 'Add Player'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Player AGID *</label>
            <input
              value={playerAgid}
              onChange={(e) => setPlayerAgid(e.target.value)}
              placeholder="XXX-XXX-XXX"
              className="input-field w-full font-mono"
            />
            <p className="text-xs text-text-secondary mt-1">Format: 013-142-944</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Role *</label>
            <select value={playerRole} onChange={(e) => setPlayerRole(e.target.value)} className="input-field w-full">
              <option value="">Select a role...</option>
              {roles.map((r, i) => (
                <option key={i} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowPlayerModal(false)} className="btn-outline">Cancel</button>
            <button onClick={savePlayer} className="btn-primary">Save</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
