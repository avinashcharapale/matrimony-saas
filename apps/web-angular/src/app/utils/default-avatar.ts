function toDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

const MALE_AVATAR = toDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="#c8d6e5"/><circle cx="150" cy="110" r="50" fill="#8395a7"/><ellipse cx="150" cy="230" rx="70" ry="80" fill="#8395a7"/><circle cx="135" cy="105" r="4" fill="#fff"/><circle cx="165" cy="105" r="4" fill="#fff"/><path d="M138 125 Q150 135 162 125" stroke="#fff" fill="none" stroke-width="2.5" stroke-linecap="round"/></svg>`);

const FEMALE_AVATAR = toDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="#f8e8ee"/><circle cx="150" cy="110" r="50" fill="#c44569"/><ellipse cx="150" cy="230" rx="70" ry="80" fill="#c44569"/><path d="M100 95 Q150 60 200 95 Q200 70 150 55 Q100 70 100 95Z" fill="#c44569"/><circle cx="135" cy="105" r="4" fill="#fff"/><circle cx="165" cy="105" r="4" fill="#fff"/><path d="M140 125 Q150 133 160 125" stroke="#fff" fill="none" stroke-width="2.5" stroke-linecap="round"/></svg>`);

const INITIAL_AVATAR_BG = ['#e8d5b7', '#b7d5e8', '#d5e8b7', '#e8b7d5', '#b7e8d5', '#d5b7e8'];

export function getDefaultAvatar(name?: string | null, genderId?: number | null): string {
  if (genderId === 2) return FEMALE_AVATAR;
  if (genderId === 1) return MALE_AVATAR;

  const initial = (name || '?').charAt(0).toUpperCase();
  const colorIdx = initial.charCodeAt(0) % INITIAL_AVATAR_BG.length;
  const bg = INITIAL_AVATAR_BG[colorIdx];

  return toDataUri(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="${bg}"/><text x="150" y="170" text-anchor="middle" font-size="120" font-family="Georgia,serif" fill="#5a4a3a" font-weight="600">${initial}</text></svg>`);
}

function isValidPhotoUrl(url?: string | null): boolean {
  return !!url && (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:'));
}

export function resolvePhotoUrl(
  fileUrl: string | null | undefined,
  name?: string | null,
  genderId?: number | null,
): string {
  if (isValidPhotoUrl(fileUrl)) return fileUrl!;
  return getDefaultAvatar(name, genderId);
}
