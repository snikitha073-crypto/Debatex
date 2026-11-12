import luminaImg from '../assets/images/avatar_lumina_starlight_1794299596172.jpg';
import kaitoImg from '../assets/images/avatar_kaito_shadow_1794299595952.jpg';
import sakuraImg from '../assets/images/avatar_sakura_whisper_1794299595278.jpg';
import renImg from '../assets/images/avatar_ren_cyberpunk_1794299596346.jpg';
import chiyoImg from '../assets/images/avatar_chiyo_autumn_1794299597916.jpg';
import shinImg from '../assets/images/avatar_shin_wanderer_1794299599198.jpg';
import meiImg from '../assets/images/avatar_mei_constellation_1794299598875.jpg';
import haruImg from '../assets/images/avatar_haru_summer_1794299600342.jpg';
import aoiImg from '../assets/images/avatar_aoi_rain_1794299601577.jpg';
import tatsuyaImg from '../assets/images/avatar_tatsuya_phoenix_1794299607504.jpg';
import yukiImg from '../assets/images/avatar_yuki_winter_1794299603241.jpg';
import ryoImg from '../assets/images/avatar_ryo_midnight_1794299603903.jpg';

export interface UserAvatarOption {
  id: string;
  name: string;
  tagline: string;
  styleDescription: string;
  url: string;
}

// 12 unique illustrated anime avatars inspired by the aesthetic of the reference artwork.
// Each avatar has a distinct hairstyle, expression, outfit, color palette, and character design.
export const USER_AVATARS: UserAvatarOption[] = [
  {
    id: 'avatar-lumina',
    name: 'Lumina',
    tagline: 'Starlight & Soft Braids',
    styleDescription: 'Lavender-silver twin braids, crescent ornament, soft blush and twilight glow.',
    url: luminaImg,
  },
  {
    id: 'avatar-kaito',
    name: 'Kaito',
    tagline: 'Tousled Indigo & Tactical Collar',
    styleDescription: 'Messy dark indigo hair, intense amber gaze, and modern high-collar tactical shirt.',
    url: kaitoImg,
  },
  {
    id: 'avatar-sakura',
    name: 'Sakura',
    tagline: 'Blush Bob & Cozy Knitwear',
    styleDescription: 'Soft pink layered bob, gentle hazel eyes, floral hairpin, and warm oversized knitwear.',
    url: sakuraImg,
  },
  {
    id: 'avatar-ren',
    name: 'Ren',
    tagline: 'Cyan Eyes & Cyber Techwear',
    styleDescription: 'Tousled charcoal hair, glowing cyan cybernetic gaze, and sleek futuristic tech jacket.',
    url: renImg,
  },
  {
    id: 'avatar-chiyo',
    name: 'Chiyo',
    tagline: 'Auburn Waves & Beret',
    styleDescription: 'Long flowing auburn waves, thoughtful honey-gold eyes, black beret, and vintage coat.',
    url: chiyoImg,
  },
  {
    id: 'avatar-shin',
    name: 'Shin',
    tagline: 'Silver Spikes & Crimson Gaze',
    styleDescription: 'Textured silver-white spiky hair, sharp ruby eyes, and relaxed dark streetwear hoodie.',
    url: shinImg,
  },
  {
    id: 'avatar-mei',
    name: 'Mei',
    tagline: 'Midnight Hime & Constellations',
    styleDescription: 'Straight midnight-blue hair with bangs, piercing sapphire eyes, and starry night backdrop.',
    url: meiImg,
  },
  {
    id: 'avatar-haru',
    name: 'Haru',
    tagline: 'Sandy Layers & Golden Hour',
    styleDescription: 'Layered sandy-brown hair, friendly confident smirk, and warm emerald hazel eyes.',
    url: haruImg,
  },
  {
    id: 'avatar-aoi',
    name: 'Aoi',
    tagline: 'Teal Braid & Rain Slicker',
    styleDescription: 'Oceanic teal-blue hair in a side braid, sparkling cyan eyes, and modern rain jacket.',
    url: aoiImg,
  },
  {
    id: 'avatar-tatsuya',
    name: 'Tatsuya',
    tagline: 'Crimson Streak & High Turtleneck',
    styleDescription: 'Jet black hair with a vivid crimson streak, piercing golden eyes, and black turtleneck.',
    url: tatsuyaImg,
  },
  {
    id: 'avatar-yuki',
    name: 'Yuki',
    tagline: 'Ice-Blue Bun & Velvet Ribbon',
    styleDescription: 'Pale ice-blue hair tied in a loose bun, silvery eyes, velvet collar, and falling snow.',
    url: yukiImg,
  },
  {
    id: 'avatar-ryo',
    name: 'Ryo',
    tagline: 'Midnight Fringe & Studio Headphones',
    styleDescription: 'Deep black wavy fringe, calm dark eyes, and sleek studio headphones around his neck.',
    url: ryoImg,
  },
];

// Default uploaded avatars is completely empty by default.
// Reference images are STRICTLY isolated and NEVER added as avatars.
export const DEFAULT_UPLOADED_AVATARS: UserAvatarOption[] = [];

/**
 * Resolves an avatar identifier or URL into a displayable image URL.
 * Automatically handles built-in avatar IDs, user-uploaded avatars, and migrates legacy IDs.
 */
export function getUserAvatarUrl(avatar?: string | null, customList?: UserAvatarOption[]): string {
  if (!avatar || avatar.trim() === '') return '';

  // Filter out legacy default user ID or placeholder
  if (avatar === 'user-default-1' || avatar === 'default' || avatar.startsWith('user-default')) {
    return '';
  }

  // Filter out any accidental reference images from previous turns
  if (avatar.includes('image_66548694') || avatar.includes('image_be2e9847')) {
    return '';
  }

  // 1. Check custom uploaded avatars list if provided
  if (customList && customList.length > 0) {
    const customMatch = customList.find(
      (a) =>
        (a.id === avatar || a.url === avatar) &&
        !a.url.includes('image_66548694') &&
        !a.url.includes('image_be2e9847')
    );
    if (customMatch) return customMatch.url;
  }

  // 2. Check localStorage for user uploads
  try {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('debatex_uploaded_avatars');
      if (saved) {
        const parsed: UserAvatarOption[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const found = parsed.find(
            (a) =>
              (a.id === avatar || a.url === avatar) &&
              !a.url.includes('image_66548694') &&
              !a.url.includes('image_be2e9847')
          );
          if (found) return found.url;
        }
      }
    }
  } catch (e) {
    // ignore
  }

  // 3. Check built-in avatars
  const builtInMatch = USER_AVATARS.find((a) => a.id === avatar || a.url === avatar);
  if (builtInMatch) return builtInMatch.url;

  // 4. If legacy ID was stored, map to one of the 12 new avatars (excluding default user)
  if (avatar.startsWith('user-')) {
    const index = Math.abs(avatar.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % USER_AVATARS.length;
    return USER_AVATARS[index].url;
  }

  // 5. Handle base64 data URIs or external URLs for real user-uploaded avatars
  if (avatar.startsWith('data:image/') || avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar;
  }

  return '';
}
