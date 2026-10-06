# Leif — kit de génération (images & voix)

> Les visuels de Leif sont générés par **OpenAI gpt-image** (pas par Claude), la voix par **ElevenLabs Voice Design**.
> Ce document explique la démarche en français ; les prompts sont en anglais (meilleurs résultats).
> Source exécutée par le script : [`scripts/leif/prompts.mjs`](../../../scripts/leif/prompts.mjs) — **toute modification doit être reportée dans les deux fichiers.**
> Le nom « Leif » est provisoire (cf. SPEC §2) : si le nom change, mettre à jour `CHARACTER` dans `prompts.mjs` et la section 1 ci‑dessous.

## 0. Utilisation du script

Prérequis : Node 24, une clé OpenAI avec accès à `gpt-image-1` (organisation vérifiée).

```bash
# Prévisualiser les prompts finaux sans clé ni appel API
node scripts/leif/generate-images.mjs directions --dry-run

# Tour 1 : 6 directions artistiques (2 variations chacune)
OPENAI_API_KEY=sk-... node scripts/leif/generate-images.mjs directions --n 2

# Une fois la direction choisie : tout le reste avec l'image retenue en référence
OPENAI_API_KEY=sk-... node scripts/leif/generate-images.mjs reference   --ref docs/inauguration/leif/out/directions/d2-game-cinematic-....png
OPENAI_API_KEY=sk-... node scripts/leif/generate-images.mjs expressions --ref docs/inauguration/leif/out/reference/head-neutral-....png
OPENAI_API_KEY=sk-... node scripts/leif/generate-images.mjs fullbody    --ref <front-a-pose.png> --ref <choisie.png>
OPENAI_API_KEY=sk-... node scripts/leif/generate-images.mjs card        --ref <choisie.png>

# Relancer un seul plan
OPENAI_API_KEY=sk-... node scripts/leif/generate-images.mjs expressions --only expr-amused --ref <head-neutral.png>
```

| Option | Rôle |
|---|---|
| `--ref <png>` | Bascule sur l'endpoint **edits** avec l'image de référence (répétable). Indispensable après le tour 1. |
| `--only id,id` | Ne génère que ces plans. |
| `--n` | Variations par plan (1–10, défaut 1). |
| `--quality` | `low` \| `medium` \| `high` \| `auto` (défaut `high` ; `low` pour itérer vite et pas cher). |
| `--fidelity` | `input_fidelity` des edits : `high` (défaut, préserve le visage) ou `low`. |
| `--dry-run` | Affiche les prompts, n'appelle rien. |

Variables : `OPENAI_API_KEY` (obligatoire hors dry‑run), `OPENAI_IMAGE_MODEL` (défaut `gpt-image-1`).

Sorties : `docs/inauguration/leif/out/<set>/<id>-<horodatage>.png` + `manifest.json` (prompt exact, modèle, références, date) — voir [`out/README.md`](out/README.md). Les fichiers lourds vont sur le Drive Drakkar.

## 1. Bible du personnage

**Qui est Leif.** L'hôte de l'inauguration : un majordome de grand hôtel croisé avec un capitaine de drakkar. Distingué, chaleureux, posé, humour pince‑sans‑rire très dosé. Il incarne Drakkar : premium, sobre, sûr de lui sans arrogance.

**Règles visuelles.**
- Viking **en costume moderne parfaitement taillé** — encre `#16181d`, chemise blanche, cravate fine encre.
- Corail Drakkar `#FF4A48` **une seule fois** : la pochette. Jamais en aplat, jamais sur le visage.
- Barbe et cheveux soignés, petites tresses tenues par des anneaux d'argent brossé ; tempes grisonnantes, 45–50 ans.
- Détails nordiques **discrets** : épingle de cravate et boutons de manchette en proue de drakkar stylisée.
- Rendu : **3D stylisée, finition film d'animation haut de gamme / cinématique de jeu premium**. Ni cartoon, ni enfantin, ni photoréaliste « uncanny ».
- **Interdits** : casque à cornes, fourrure, armure, armes, muscles exagérés, texte, logos.

Blocs communs ajoutés à chaque prompt (dans cet ordre : `CHARACTER` + `STYLE` + plan + `AVOID`) :

```text
CHARACTER
Leif, a distinguished Viking gentleman in his late forties, acting as the host of a premium tech consultancy's office inauguration. Tall, broad-shouldered, upright and calm posture; weathered yet well-groomed face, warm intelligent grey-blue eyes, the hint of a wry smile. Full, neatly groomed ash-blond beard with two small braids bound by plain brushed-silver rings; hair swept back with a tidy side braid, temples slightly greying. Wears an impeccably tailored modern suit in deep ink charcoal (#16181d), crisp white shirt, slim ink tie, and a small coral-red (#FF4A48) pocket square — the only touch of colour. Subtle Nordic details: brushed-silver tie pin and cufflinks with a minimalist longship-prow motif.

STYLE
Stylized 3D character with the finish of a high-end animated feature film or a premium video-game cinematic: physically based materials, fine fabric weave, soft cinematic studio lighting, subtle subsurface scattering on skin, refined, slightly stylized but anatomically credible adult proportions, clean readable silhouette. Sober, premium, corporate mood.

AVOID
Avoid: horned helmet, fur cape, armour, weapons, axes, shields, cartoon or chibi proportions, childish look, photorealistic uncanny skin, exaggerated muscles, text, logos, watermarks.
```

## 2. Tour 1 — six directions artistiques (`directions`)

Même personnage, même cadrage (plein pied, 1024×1536) : on compare **le style**, pas la pose. Lancer avec `--n 2` pour juger la stabilité de chaque direction.

| id | Direction | Pourquoi la tester |
|---|---|---|
| `d1-feature-film` | Film d'animation, chaleureux | Le plus « aimable », risque d'être trop doux. |
| `d2-game-cinematic` | Cinématique de jeu semi‑réaliste | Le plus premium ; vérifier qu'il ne bascule pas dans l'uncanny. |
| `d3-sculpted-porcelain` | Objet de galerie, porcelaine mate | Très « marque », se prête bien au print. |
| `d4-illustrated-editorial` | Illustration éditoriale 2.5D | Alternative si la 3D déçoit ; idéale pour le carton. |
| `d5-faceted-realtime` | Facettes low‑poly élégantes | La plus simple à passer en 3D temps réel (pipeline A). |
| `d6-noir-stage` | Scène noire, liseré corail | Ambiance borne jour J sur fond noir. |

```text
d1-feature-film
Art direction: premium animated feature film, soft painterly texturing, gentle warm key light and cool rim light, expressive but restrained face. Full body, standing, slight three-quarter view, hands loosely clasped in front, neutral dark-grey studio backdrop.

d2-game-cinematic
Art direction: semi-realistic AAA game cinematic, detailed skin pores and beard strands, dramatic but elegant three-point lighting, shallow depth of field. Full body, standing, slight three-quarter view, one hand adjusting a cufflink, dark ink backdrop.

d3-sculpted-porcelain
Art direction: sculpted collectible-art look, matte porcelain-like skin and fabric with very fine surface detail, restrained palette of ink, bone white and a single coral accent, museum lighting. Full body, standing, slight three-quarter view, calm welcoming pose, seamless warm-grey backdrop.

d4-illustrated-editorial
Art direction: high-end 2.5D editorial illustration with painted 3D volumes, crisp graphic shapes and subtle brush texture, magazine-cover quality. Full body, standing, slight three-quarter view, one hand in trouser pocket, plain off-white backdrop with soft shadow.

d5-faceted-realtime
Art direction: elegant faceted low-poly stylization with smooth gradients on each plane, clean geometry suitable for a real-time 3D engine, ink and silver palette with coral accent. Full body, standing, slight three-quarter view, welcoming open-palm gesture, dark graphite backdrop.

d6-noir-stage
Art direction: theatrical noir stage portrait, figure emerging from pure black, strong cool rim light and a thin coral-red rim light on one side, polished cinematic finish. Full body, standing, facing camera, hands clasped, pure black background (#000000).
```

**Grille de choix** (cf. SPEC §2) : qualité marque, lisibilité du visage (lip‑sync), silhouette sur fond noir, faisabilité image‑to‑3D, cohérence entre variations.

## 3. Tour 2 — planche de référence (`reference`, avec `--ref`)

Objectif : des entrées propres pour les deux pipelines d'animation.
- **Pipeline A (image‑to‑3D → rig → Three.js)** : vues en **A‑pose** sur fond neutre plat, éclairage uniforme, caméra quasi orthographique. Donner d'abord `front-a-pose` à l'outil image‑to‑3D, puis la planche multi‑vues si l'outil l'accepte.
- **Pipeline B (avatar parlant depuis une image)** : `head-neutral`, bouche fermée, regard caméra, barbe dégageant la bouche.

```text
A_POSE (réutilisé)
Relaxed A-pose: arms about 30 degrees away from the body, palms facing the thighs, feet shoulder-width apart, neutral closed-mouth expression.

NEUTRAL_REFERENCE (réutilisé)
Plain flat light-grey background (#d9dadd), even soft lighting without harsh shadows, orthographic-like camera at chest height, full figure visible from head to toe, no props.

turnaround-sheet (1536x1024)
Character turnaround reference sheet of exactly the same character as the input image: four full-body views side by side at identical scale — front, three-quarter, side profile, back. {A_POSE} {NEUTRAL_REFERENCE} No labels, no text.

front-a-pose (1024x1536)
Exactly the same character as the input image, seen strictly from the front. {A_POSE} {NEUTRAL_REFERENCE}

three-quarter-a-pose (1024x1536)
Exactly the same character as the input image, three-quarter front view turned 45 degrees to his left. {A_POSE} {NEUTRAL_REFERENCE}

profile-a-pose (1024x1536)
Exactly the same character as the input image, strict side profile facing left. {A_POSE} {NEUTRAL_REFERENCE}

back-a-pose (1024x1536)
Exactly the same character as the input image, seen strictly from the back, showing hair braid and suit cut. {A_POSE} {NEUTRAL_REFERENCE}

head-neutral (1024x1024)
Exactly the same character as the input image. {HEAD_SHOT} Looking straight into the lens, neutral relaxed expression, lips gently closed, eyes fully open, beard not covering the mouth.
```

## 4. Expressions (`expressions`, avec `--ref head-neutral`)

Même cadrage tête‑épaules pour toutes : elles servent de poses clés (pipeline B) et de cibles de blendshapes (pipeline A), et d'images de repli par état de `LeifAvatar` (`idle` → neutral, `listening`, `thinking`, `speaking`).

```text
HEAD_SHOT (réutilisé)
Head-and-shoulders close-up, centred, facing the camera, plain mid-grey background (#8a909b), soft even key light, high facial detail, no hands in frame.

expr-neutral    Calm neutral expression, attentive gaze into the lens.
expr-smile      Warm, genuine closed-mouth smile, eyes slightly creased.
expr-listening  Listening attentively, head tilted a few degrees, eyebrows slightly raised, lips relaxed.
expr-thinking   Thoughtful, gaze drifting up and to the side, one eyebrow subtly lowered.
expr-amused     Dry, understated amusement: half smile on one side, knowing look, one eyebrow raised.
expr-speaking   Mid-sentence, mouth naturally open as if pronouncing an "a" vowel, engaged friendly eyes.
```

(Chaque ligne est préfixée par `Exactly the same character as the input image. {HEAD_SHOT}`.)

## 5. Plein pied sur noir — écrans du jour J (`fullbody`)

Fond `#000000` opaque : sur les écrans/bornes, le noir disparaît et Leif « flotte » dans la salle. Garder de la marge en haut et les pieds visibles.

```text
kiosk-idle (1024x1536, opaque)
Exactly the same character as the input image, full body head to toe, standing facing the camera, hands loosely clasped in front, subtle cool rim light separating him from a pure black background (#000000), feet grounded with a faint floor reflection, generous headroom.

kiosk-welcome (1024x1536, opaque)
Exactly the same character as the input image, full body head to toe, welcoming open-palm gesture with the right hand, slight bow of the head, pure black background (#000000), cool rim light with a thin coral-red accent rim on one side.

kiosk-presenting (1024x1536, opaque)
Exactly the same character as the input image, full body head to toe, three-quarter view, presenting something off-frame with an elegant open hand, confident half smile, pure black background (#000000), cinematic rim light.
```

## 6. Carton d'invitation (`card`)

Buste avec réserve blanche pour la typographie, plus une version détourée (fond transparent) pour l'imprimeur. Pour l'impression, prévoir un upscale (×2/×4) avant envoi.

```text
card-bust-white (1536x1024, opaque)
Exactly the same character as the input image, waist-up bust, slight three-quarter turn, looking at the viewer with a warm wry smile, placed in the left third of the frame with generous empty paper-white space (#ffffff) on the right for typography, soft studio light, print quality.

card-bust-transparent (1024x1536, transparent)
Exactly the same character as the input image, waist-up bust, slight three-quarter turn, looking at the viewer with a warm wry smile, isolated on a transparent background with clean edges around hair and beard, soft studio light, print quality.
```

## 7. Conseils de cohérence

1. **Une image maîtresse.** Après le tour 1, choisir UNE image et la passer en `--ref` à toutes les générations suivantes (endpoint *edits*, `input_fidelity=high`). Ne jamais régénérer « from scratch » une fois le personnage figé.
2. **Chaîner les références.** Expressions → `--ref head-neutral` ; plein pied → `--ref front-a-pose --ref <image maîtresse>` (plusieurs refs = visage + tenue).
3. **Ne changer qu'une chose à la fois** dans le prompt de plan ; les blocs `CHARACTER` / `STYLE` / `AVOID` ne bougent pas.
4. **Vérifier les invariants** à chaque image : pochette corail (et seulement elle), anneaux d'argent dans la barbe, costume encre, pas de casque. Rejeter toute dérive plutôt que la corriger en aval.
5. **Itérer en `--quality low`**, finaliser en `high`. Garder le `manifest.json` : il trace le prompt exact de chaque image retenue.
6. Le corail exact `#FF4A48` n'est jamais garanti par le modèle : corriger la teinte de la pochette en retouche si besoin.

## 8. Voix — brief ElevenLabs Voice Design

**Description à coller dans Voice Design (anglais, meilleurs résultats) :**

```text
A French male voice, native Parisian French with no regional accent, aged 45 to 55. Deep, warm and resonant baritone with a calm, unhurried pace and precise diction. Sounds like the head concierge of a grand hotel who once captained a ship: reassuring gravitas, quiet confidence, elegant and courteous, with a subtle dry wit audible in a slight smile. Close-miked studio quality, no reverb, no background noise, no breathiness, never theatrical or booming.
```

**Paramètres conseillés** : genre masculin, âge « middle aged », accent français ; stabilité ~45–55 % (expressif sans dériver), similarité ~75 %, *style exaggeration* bas (0–15 %). Générer 3–5 voix, garder la plus chaleureuse sur les phrases tests ci‑dessous, puis l'enregistrer comme voix de bibliothèque (son `voice_id` va dans la config de l'API).

**Phrases tests (dans la voix de Leif — vouvoiement, phrases courtes) :**

1. « Bonsoir, et bienvenue. Je suis Leif. Ce soir, mon seul rôle est de veiller à ce que vous passiez un excellent moment. »
2. « Vous parlez de chiffres ? Je vous arrête tout de suite : je suis bien meilleur pour les prénoms. Laissez‑moi plutôt vous présenter Claire, qui adore ce genre de questions. »
3. « Un instant, je réfléchis… Les Vikings traversaient les océans sans GPS. Je peux bien trouver une idée pour votre métier en soixante secondes. »

Vérifier à l'écoute : chaleur sans mièvrerie, ironie perceptible mais légère, aucune emphase « bande‑annonce », prononciation propre de « Drakkar » (ajouter un dictionnaire de prononciation si besoin).
